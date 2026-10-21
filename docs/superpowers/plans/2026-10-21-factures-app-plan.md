# Plan d'implémentation — Factures

Référence : [spec du 21.10.2026](../specs/2026-10-21-factures-app-design.md)
Projet : `/Users/thomas/factures-app` (nouveau dépôt git, indépendant de `site-web`)
Cible : LXC 112 `factures` — `192.168.1.67` — `factures.mayoraz-net.ch`

Chaque tâche se termine par une vérification réelle. Une phase n'est « finie » que si sa
vérification passe sur la cible réelle (LXC ou navigateur), pas seulement en local.

---

## Phase 0 — Préparation (30 min)

### T0.1 Créer le LXC 112 sur PVE

Depuis le Mac (SSH LAN `root@192.168.1.60` — NetBird peut être indisponible) :

```bash
pveam update && pveam available --section system | grep debian-13
pct create 112 local:vztmpl/debian-13-standard_*.tar.zst \
  --hostname factures --cores 2 --memory 1024 --swap 512 \
  --rootfs local-lvm:8 --unprivileged 1 --features nesting=1 \
  --net0 name=eth0,bridge=vmbr0,ip=192.168.1.67/24,gw=192.168.1.1 \
  --nameserver 192.168.1.62 --onboot 1 --start 1
pct exec 112 -- bash -c 'apt update && apt install -y curl ca-certificates'
```

Vérifications : `pct status 112` = running, `ping 192.168.1.67`, `ssh root@192.168.1.67`.
Ajouter la route NetBird (`/etc/systemd/network/eth0.network` bloc `[Route] Destination=100.70.0.0/16 Gateway=192.168.1.60`) + `networkctl reload`, comme les autres LXC.

### T0.2 Docker + durcissement de base

- Docker Engine + compose plugin (dépôt officiel), `daemon.json` (log rotation 10m × 3),
  `unattended-upgrades`, fuseau `Europe/Zurich`, `timedatectl set-ntp true`.
- Vérifier : `docker run --rm hello-world`, `docker compose version`.

### T0.3 Créer le dépôt applicatif

`/Users/thomas/factures-app` : `git init`, `.gitignore` (`node_modules`, `data`, `.env`,
`dist`, `test-results`), `README.md`, `package.json` (Astro 7, `@astrojs/node` standalone,
`better-sqlite3`, `pdfkit`, `swissqrbill`, `otplib`, `@simplewebauthn/server`,
`@simplewebauthn/browser`, `vitest`, `@playwright/test`, `typescript`).

Vérification : `npm run build` sur le squelette, `node -e "require('better-sqlite3')"`.

---

## Phase 1 — Socle, base et authentification

### T1.1 Couche base de données

`src/lib/db.ts` : ouverture `data/factures.db` (WAL, `foreign_keys=ON`, `busy_timeout=5000`),
migrations SQL dans `src/lib/migrations/*.sql` appliquées au démarrage (table
`schema_migrations`), helpers `one/all/run/tx`, `BEGIN IMMEDIATE` pour les écritures critiques.
Schéma complet de la spec (settings, clients, contracts, invoices, invoice_items, payments,
reminders, activity_log, counters, users, sessions, webauthn_credentials, auth_attempts).

Vérification : test Vitest qui migre une base mémoire, insère un client, relit, et vérifie
que les contraintes `UNIQUE`/`FOREIGN KEY` mordent.

### T1.2 Identité visuelle et layout

`src/layouts/AppLayout.astro` (nav latérale, header, flash messages), `src/styles/app.css`
(variables CSS clair/sombre, tables denses, formulaires, boutons, badges de statut,
responsive 360→1440, `@media print`). Aucune police ni asset externe.

Vérification : page de démonstration rendue, `astro check` = 0 erreur, capture 1440 et 390 px.

### T1.3 Authentification

- `src/lib/auth.ts` : `hashPassword`/`verifyPassword` (scrypt N=2^15 r=8 p=1, sel 16 o),
  TOTP (otplib, 30 s, 6 chiffres, ±1), codes de secours hachés SHA-256, sessions
  (jeton 32 o, cookie `factures_session`, hash en base, 12 h glissant / 7 j absolu),
  CSRF par session, `auth_attempts` + verrouillage 8 échecs/15 min.
- `src/lib/webauthn.ts` : enregistrement et authentification `@simplewebauthn/server`,
  `rpID`/`origin` depuis `APP_ORIGIN`, `userVerification: required`, ES256/RS256.
- Routes : `/setup` (protégé par `SETUP_TOKEN`, crée l'admin + identité + IBAN, affiche le mot
  de passe généré et le QR TOTP une seule fois), `/login` (mot de passe → TOTP ou passkey),
  `/logout`, middleware global qui exige une session hors `/login`, `/setup`, `/healthz`,
  `/api/cron/*`.

Vérification : tests unitaires hash/TOTP/CSRF ; parcours manuel setup → login TOTP ;
8 mauvais mots de passe → verrouillage ; accès direct à `/` sans cookie → redirection ;
POST sans jeton CSRF → 403 ; `Set-Cookie` porte `HttpOnly`/`Secure`/`SameSite=Lax`.

### T1.4 Clients

Liste (recherche nom/email/IDE, filtre actif/archivé), création, édition, fiche avec notes,
archivage. Validation serveur (champs adresse structurée obligatoires pour la facturation),
normalisation pays `CH`, `activity_log` sur chaque écriture.

Vérification : créer « Garage Darbellay Sàrl », éditer, archiver, rechercher ; refus d'un
client sans rue/numéro/NPA/ville avec message clair.

---

## Phase 2 — Factures et PDF QR

### T2.1 Numérotation et totaux

`src/lib/invoices.ts` : calcul des lignes en centimes (`quantity_milli`), sous-total, TVA
(0 par défaut), total ; `nextNumber(year)` en transaction `BEGIN IMMEDIATE` avec
`counters.last_value` + contrainte `UNIQUE(number)` ; reprise 2026 = 022 ; année nouvelle = 001 ;
`external_number` pour l'historique.

Vérification : tests — 200 émissions concurrentes (worker_threads ou boucle transactionnelle)
donnent 200 numéros uniques et consécutifs ; annulation ne réattribue pas ; 31.12 → 01.01.

### T2.2 Écran facture et transitions

`/invoices/new` (client, période, lignes dynamiques, total live, échéance = date + conditions),
`/invoices/[id]` (détail, actions émettre / encaisser / paiement partiel / annuler / dupliquer),
`/invoices` (filtres année, statut, client, échéance ; total filtré). Immuabilité des factures
émises côté serveur ; `activity_log` sur chaque transition.

Vérification : création d'un brouillon, modification, émission (numéro attribué), tentative de
modification d'une ligne émise → refus ; paiement partiel → statut `partial` et solde correct ;
annulation → numéro conservé, PDF marqué annulé.

### T2.3 Génération PDF + QR-facture

`src/lib/pdf/invoice.ts` : PDFKit A4, en-tête/identité, bloc client structuré, tableau,
totaux, conditions, pied de page ; `swissqrbill` en bas de page (210 × 105 mm), QR 46 × 46 mm,
référence `NON` + motif, ou référence QR si QR-IBAN configuré ; page dédiée si le contenu
dépasse 192 mm ; filigrane « BROUILLON » pour les brouillons ; archivage
`data/pdfs/AAAA/<numero>.pdf` + sha256.

Vérification : PDF > 10 Ko, 1 page A4, texte sélectionnable, QR **rasterisé et décodé**
(`jsQR`) → 31 champs comparés au payload attendu (montant, créancier, débiteur, référence) ;
une facture réelle passée dans le validateur SIX.

---

## Phase 3 — Abonnements, relances, tableau de bord

### T3.1 Contrats

CRUD contrats (client, libellé, montant, cadence, début/fin, prochaine échéance, auto_issue,
modèle de description), pause/reprise, « générer maintenant ».

Vérification : contrat annuel au 21.10 → prochaine échéance 21.10.2027 ; mensuel en fin de mois
(31 → 28/29 février) ; trimestriel ; « générer maintenant » crée un brouillon lié.

### T3.2 Jobs quotidiens

`scripts/jobs.mjs` : verrou fichier, calcul des retards, brouillons d'abonnement à J-7
(idempotent par `contract_id + period_start`), émission si `auto_issue`, rappels 15/30 j avec
PDF du solde, purge, sauvegarde `VACUUM INTO` + copie PDF (rétention 14 j), résumé Telegram
optionnel, code de sortie non nul en cas d'échec.

Vérification : exécution deux fois de suite → aucun doublon ; horloge simulée (paramètre
`--today`) pour tester J-7, J+15, J+30 ; backup présent et restaurable (`sqlite3 backup.db
'PRAGMA integrity_check'`).

### T3.3 Relances et tableau de bord

`/reminders` (file, PDF, marquer envoyé), `/` (encaissé YTD, en attente, en retard, prochains
abonnements, file de relances, 8 dernières factures), badges de statut partout.

Vérification : une facture échue apparaît en retard et en file de relance ; marquer envoyé
sort de la file ; les totaux du dashboard recoupent la somme des factures.

---

## Phase 4 — Import, réglages, sécurité, tests

### T4.1 Import de l'historique

`scripts/seed-history.mjs` idempotent : Garage Darbellay (2 factures + contrat 69 CHF/an +
notes de contexte), Charles Jenny (2026-021, 200 CHF), Cabinet Tivoli/Ivan (contrat forfait +
3 échéances en brouillon), tags `historique`, notes « à vérifier » sur les données non
confirmées.

Vérification : exécution deux fois → aucun doublon ; soldes et statuts visibles dans l'UI ;
numéros externes affichés à côté des numéros internes.

### T4.2 Réglages et export

`/settings` (identité, IBAN/QR-IBAN validés, conditions, délais de relance, séquence, pied de
page), `/settings/security` (mot de passe, TOTP, passkeys, sessions actives, régénération des
codes de secours), export ZIP (base + PDF + JSON), import refusé si la base n'est pas vide.

Vérification : changer l'IBAN invalide → refus avec message ; export téléchargé, dézippé,
base `integrity_check` OK ; révocation d'une session → cookie invalidé.

### T4.3 Sécurité et tests complets

- Vitest : totaux, numérotation, QR payload/checksum, cadences, relances, auth.
- Playwright : setup → login TOTP → client → facture → émission → PDF → paiement partiel →
  relance → export ; vérification des 403 CSRF/Origin.
- `astro check`, `npm run build`, `npm audit --omit=dev`.

Vérification : suites vertes, aucune erreur console navigateur, CSP sans `unsafe-inline`
(ou nonce si nécessaire).

---

## Phase 5 — Mise en production

### T5.1 Déploiement dans le LXC

- `git clone` du dépôt dans `/opt/factures`, `docker compose build`, `.env` (600) :
  `APP_ORIGIN=https://factures.mayoraz-net.ch`, `SESSION_SECRET`, `CRON_SECRET`,
  `SETUP_TOKEN`, `DATA_DIR=/data`, `TELEGRAM_*` optionnels.
- `docker compose up -d`, healthcheck `/healthz`, `restart: unless-stopped`.
- Cron LXC `15 6 * * * docker exec factures node scripts/jobs.mjs >> /opt/factures/data/jobs.log 2>&1`.

Vérification : `curl http://192.168.1.67:3000/healthz` = 200, conteneur healthy après reboot
du LXC, job exécuté manuellement puis par cron (log daté).

### T5.2 Exposition Caddy + Authelia + DNS

- Cloudflare : `factures` A → `132.243.200.40`, proxifié.
- Caddyfile VPS : bloc `factures.mayoraz-net.ch` avec `import comp`, en-têtes de sécurité,
  `import authelia`, `reverse_proxy 192.168.1.67:3000` ; `caddy validate` puis reload.
- Authelia : règle `factures.mayoraz-net.ch` en `two_factor` ; redémarrage conteneur.
- Uptime Kuma : sonde `https://factures.mayoraz-net.ch/healthz` (200) + notification existante.

Vérification : `curl -I https://factures.mayoraz-net.ch` → 302 vers Authelia ; login Authelia
puis app ; `/healthz` public 200 ; accès LAN direct 200 ; test depuis le VPS et depuis
l'extérieur (4G ou réseau tiers).

### T5.3 Passation

- `README.md` (installation, restauration, rotation des secrets, ajout d'un client type).
- Section dans `agy.md` (LXC 112, ports, cron, emplacements, sauvegardes, restauration testée)
  via `cat >>`, avec backup préalable.
- `DR-RUNBOOK.md` : restauration de la base et des PDF.
- Démonstration à Thomas : créer une facture réelle, télécharger le PDF, vérifier le QR au
  téléphone.

---

## Ordre d'exécution et points de contrôle

| Étape | Livrable | Point de contrôle |
|---|---|---|
| 1 | LXC 112 + Docker | SSH + `hello-world` + route NetBird |
| 2 | Squelette + base + auth | login TOTP réel, verrouillage vérifié |
| 3 | Clients | CRUD + validation |
| 4 | Factures + PDF QR | QR décodé + validateur SIX |
| 5 | Contrats + jobs + relances | idempotence + backup |
| 6 | Import + réglages + tests | suites vertes |
| 7 | Prod + Authelia + monitoring | accès public 2FA + healthcheck |

## Risques d'exécution

- **NetBird actuellement LoginFailed** : le déploiement utilise le LAN (`192.168.1.60`,
  `192.168.1.67`) ; l'exposition Caddy VPS → LAN exige la route NetBird du LXC 112 et un
  client NetBird rétabli côté VPS (lui n'est pas affecté).
- **Passkey derrière Cloudflare** : tester sur l'iPhone en conditions réelles ; sinon TOTP.
- **`better-sqlite3`** : nécessite un build natif dans l'image alpine → prévoir
  `python3 make g++` dans l'étape build, ou image `node:22-bookworm-slim`.
- **PDFKit + polices** : Helvetica intégrée couvre le français ; si un rendu typographique
  plus fin est demandé, embarquer une TTF (aucune dépendance réseau).
