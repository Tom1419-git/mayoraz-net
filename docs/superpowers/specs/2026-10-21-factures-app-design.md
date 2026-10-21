# Factures — application de facturation self-hostée

**Date :** 21 octobre 2026
**Auteur :** Thomas Mayoraz (avec Buffy)
**Statut :** design validé, en attente de revue de la spec

---

## 1. Objectif

Remplacer la génération manuelle de factures (Python ad hoc, HTML → PDF, Canva) par une
application web auto-hébergée qui gère clients, contrats/abonnements, factures, paiements,
relances et historique, et produit des **factures QR suisses conformes** (SPS / IG QR-bill 2.3,
adresses structurées obligatoires depuis le 22.11.2025).

L'app est mono-utilisateur (Thomas), accessible publiquement derrière Authelia, avec sa propre
authentification forte. Aucun client ne se connecte en v1.

### Critères de succès

1. Créer un client, un contrat et une facture en moins de 2 minutes, sans ligne de commande.
2. PDF A4 avec QR-facture au bas, QR décodé conforme (payload + checksum IBAN/référence).
3. Voir en un écran ce qui est encaissé, en attente et en retard, et par client.
4. Les abonnements (ex. Darbellay 69 CHF/an) génèrent leur brouillon de facture sans oubli.
5. L'historique existant est présent et consultable, sans réécrire les numéros déjà émis.
6. Aucun accès sans mot de passe + second facteur, même si Authelia est contourné.

### Hors périmètre v1

Portail client, envoi d'emails automatiques, comptabilité complète (bilan, dépenses),
multi-devises, facturation électronique (e-invoicing XML), application mobile.

---

## 2. Architecture

```
Internet → Cloudflare (DNS proxifié) → VPS Caddy :443
           ├─ forward-auth Authelia (LXC 104 :9091)
           └─ reverse_proxy 192.168.1.67:3000 (NetBird → LAN)
                                     │
                        LXC 112 « factures » (192.168.1.67)
                        └─ Docker : app Astro (Node 22, standalone)
                           ├─ :3000 HTTP
                           └─ volume ./data → SQLite + PDF + backups
```

- **Stack :** Astro 5 + TypeScript, rendu serveur, JavaScript vanilla, CSS vanilla
  (variables + glassmorphism léger, clair/sombre). Pas de React, pas de Tailwind.
- **Base :** SQLite (`better-sqlite3`), mode WAL, migrations SQL versionnées maison
  (table `schema_migrations`), aucune ORM lourde.
- **PDF :** `pdfkit` + `swissqrbill` (PDFKit natif, adresses structurées, libellés FR).
- **Process :** un seul conteneur. Jobs quotidiens via `node scripts/jobs.mjs`, lancé par
  le cron de l'hôte dans le conteneur (`docker exec`), pas de démon supplémentaire.
- **Accès LAN :** `http://192.168.1.67:3000` reste disponible pour secours et administration.

### Arborescence du projet (`/Users/thomas/factures-app`)

```
src/
  pages/            # routes Astro (pages + endpoints POST)
  components/       # .astro réutilisables (layout, table, formulaire)
  lib/
    db.ts           # connexion, migrations, transactions
    auth.ts         # sessions, scrypt, TOTP, passkeys, CSRF, rate limit
    invoices.ts     # totaux, numérotation, transitions de statut
    pdf/invoice.ts  # rendu PDFKit + swissqrbill
    contracts.ts    # cadence, prochaine échéance, génération de brouillon
    reminders.ts    # niveaux, échéances, génération PDF
    format.ts       # CHF, dates suisses, pluriels
  styles/app.css
scripts/
  jobs.mjs          # cron quotidien
  seed-history.mjs  # import historique idempotent
tests/
  unit/             # Vitest
  e2e/              # Playwright
data/               # volume Docker (non versionné)
```

---

## 3. Modèle de données

Tous les montants sont stockés en **centimes (INTEGER)** pour éviter les erreurs flottantes.

```sql
settings(id INTEGER PRIMARY KEY CHECK (id = 1),
  sender_name, sender_street, sender_building_no, sender_zip, sender_city,
  sender_country DEFAULT 'CH', sender_email, sender_phone, sender_website,
  iban, qr_iban, bank_name, bic,
  vat_registered INTEGER DEFAULT 0, vat_rate_bp INTEGER DEFAULT 0,
  vat_mention TEXT,            -- ex. « Non assujetti à la TVA »
  payment_terms_days INTEGER DEFAULT 30,
  reminder_1_days INTEGER DEFAULT 15, reminder_2_days INTEGER DEFAULT 30,
  invoice_prefix TEXT DEFAULT '', footer_note TEXT, logo_path TEXT,
  updated_at)

clients(id, name, contact_name, email, phone,
  street, building_no, zip, city, country DEFAULT 'CH',
  ide_number, vat_number, notes, tags, archived INTEGER DEFAULT 0,
  created_at, updated_at)

contracts(id, client_id REFERENCES clients, label, description_template,
  amount_cents, cadence TEXT CHECK (cadence IN ('monthly','quarterly','yearly')),
  start_date, end_date, next_invoice_date, auto_issue INTEGER DEFAULT 0,
  payment_terms_days, active INTEGER DEFAULT 1, notes, created_at, updated_at)

invoices(id, number TEXT UNIQUE, external_number, client_id, contract_id,
  issue_date, due_date, period_start, period_end,
  status TEXT CHECK (status IN ('draft','issued','partial','paid','cancelled')),
  currency TEXT DEFAULT 'CHF', subtotal_cents, vat_rate_bp, vat_cents, total_cents,
  paid_cents DEFAULT 0, paid_at, payment_method,
  qr_reference, message, intro_note, footer_note,
  pdf_path, pdf_sha256, issued_at, cancelled_at, cancel_reason,
  created_at, updated_at)

invoice_items(id, invoice_id, position, description, quantity_milli INTEGER,
  unit TEXT, unit_price_cents, line_total_cents)

payments(id, invoice_id, paid_on, amount_cents, method, note, created_at)

reminders(id, invoice_id, level INTEGER, issued_on, due_on, pdf_path, note, created_at)
  -- UNIQUE(invoice_id, level)

activity_log(id, entity, entity_id, action, detail_json, created_at)
counters(year INTEGER, kind TEXT, last_value INTEGER, PRIMARY KEY(year, kind))

users(id, email, password_hash, password_params, totp_secret, totp_enabled,
  recovery_codes_json, failed_attempts, locked_until, last_login_at, created_at)
sessions(id, token_hash UNIQUE, csrf_token, user_id, created_at, last_seen_at,
  expires_at, ip_hash, user_agent)
webauthn_credentials(id, user_id, credential_id UNIQUE, public_key, counter,
  transports, label, created_at, last_used_at)
auth_attempts(id, ip_hash, at, success)
```

### Règles

- Un client peut être archivé ; ses factures restent visibles.
- Une facture émise est immuable (montants, lignes, client). Seules les actions de statut,
  les paiements et les relances la modifient. Toute modification d'un brouillon est libre.
- Suppression : jamais de suppression physique d'une facture émise (annulation uniquement).
- Un `activity_log` enregistre chaque création/émission/paiement/annulation/relance.

---

## 4. Numérotation

- Format par défaut : `AAAA-NNN` (ex. `2026-022`), `NNN` sur 3 chiffres, extensible.
  Préfixe optionnel dans les réglages.
- Séquence annuelle globale (`counters`), reprise à **022** pour 2026 (après Charles 2026-021).
- Le numéro est attribué **à l'émission**, dans une transaction `BEGIN IMMEDIATE` :
  `SELECT last_value → +1 → UPDATE → INSERT`. Un brouillon n'a pas de numéro définitif.
- Une facture annulée **garde son numéro** ; aucun numéro n'est réattribué.
- Les numéros historiques non conformes (`FAC-2026-DAR-02`, `2026-021`) sont stockés dans
  `external_number` et affichés à côté du numéro interne, sans renumérotation.

---

## 5. Facture PDF et QR-facture

### Mise en page

- A4 portrait, marges 16 mm, en-tête émetteur à droite, titre + numéro + date + échéance à gauche.
- Bloc client (adresse structurée), objet/période, tableau des lignes (qté, unité, prix, total),
  sous-total, TVA (ou mention), **total en évidence**, conditions et pied de page.
- Bas de page : section paiement QR de **210 × 105 mm** (PDFKit + swissqrbill), QR 46 × 46 mm,
  marges 5 mm. Si le contenu dépasse 192 mm, la section paiement part sur une page dédiée.
- Brouillon : aperçu PDF avec filigrane « BROUILLON », jamais archivé comme facture.

### Payload QR

- `SPC`, version `0200`, `CHF`, créancier = émetteur (adresse structurée),
  débiteur = client (adresse structurée, `S`), montant à 2 décimales.
- IBAN ordinaire : référence `NON`, motif libre `Facture 2026-022 · période …`.
  QR-IBAN (si configuré) : référence QR 27 chiffres avec checksum modulo 10 récursif.
- Le QR n'est généré qu'à partir de l'émission ; le montant est toujours connu.
- Validation : test unitaire du payload + décodage réel du QR depuis le PDF rasterisé
  (avant livraison) + passage une fois dans le validateur SIX.

### Archivage

- Chemin : `data/pdfs/AAAA/<numero>.pdf` ; `pdf_sha256` stocké en base.
- Régénération possible (numéro et données figés) ; l'ancien fichier est conservé si le sha change.
- Téléchargement authentifié uniquement (`/invoices/[id]/pdf`), `Content-Disposition: inline`.

---

## 6. Contrats et abonnements

- Cadences : mensuelle, trimestrielle, annuelle. `next_invoice_date` recalculée à chaque émission.
- Job quotidien : pour chaque contrat actif dont `next_invoice_date <= today + 7 j`, créer un
  **brouillon** de facture (période = cycle concerné), sauf si un brouillon existe déjà pour
  ce cycle (idempotence par `contract_id + period_start`).
- `auto_issue = 1` : la facture est émise directement à `next_invoice_date` (numéro, PDF),
  jamais avant. Par défaut à 0 : Thomas valide le brouillon.
- Mise en pause = `active = 0` ; l'historique et les échéances futures restent visibles.
- Le libellé et la description sont des modèles avec variables `{client}`, `{periode}`,
  `{annee}`.

---

## 7. Relances

- Détection : facture `issued`/`partial` dont `due_date + reminder_1_days` (15 j) ou
  `due_date + reminder_2_days` (30 j) est atteint.
- Chaque niveau génère un PDF de rappel (mise en page facture + mention « 1er rappel »,
  QR-facture avec le **solde restant**), enregistré dans `reminders` (unique par niveau).
- Le rappel n'est jamais envoyé automatiquement (pas d'email en v1) : il apparaît dans la
  file « À relancer » du tableau de bord, avec téléchargement PDF et bouton « marquer envoyé ».
- Notification **Telegram** optionnelle (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) :
  résumé quotidien des impayés et des brouillons d'abonnement à valider. Désactivée si absente.

---

## 8. Authentification et sécurité

### Compte admin

- Mono-utilisateur. Création au premier lancement via `/setup`, protégé par `SETUP_TOKEN`
  (généré à l'installation, affiché une seule fois dans les logs du conteneur).
- Mot de passe : minimum 16 caractères, généré à 24 caractères aléatoires (affiché une fois,
  à stocker dans Apple Mots de passe). Hachage **scrypt** (`N=2^15, r=8, p=1`, 32 octets),
  sel de 16 octets, comparaison à temps constant.
- **TOTP obligatoire** (RFC 6238, 30 s, 6 chiffres, dérive ±1), secret base32 + QR
  `otpauth://`, 10 codes de secours à usage unique stockés hachés (SHA-256).
- **Passkey (WebAuthn)** optionnelle mais proposée : `@simplewebauthn/server`, `rpID` dérivé de
  `APP_ORIGIN`, `userVerification: required`, algorithme ES256/RS256. Utilisable comme second
  facteur après mot de passe **ou** comme connexion directe (Face ID / Touch ID sur iPhone).
- Verrouillage : 8 échecs sur 15 min → blocage 15 min du compte + délai progressif ;
  `auth_attempts` conservé 7 jours, purge par le job.

### Sessions

- Jeton aléatoire 32 octets, cookie `factures_session` `HttpOnly; Secure; SameSite=Lax; Path=/`,
  `Max-Age` 12 h glissant (absolu 7 jours). Seul le SHA-256 du jeton est stocké.
- Rotation à la connexion ; révocation possible depuis Réglages → Sécurité (liste des sessions).
- CSRF : jeton par session en champ caché + vérification stricte de `Origin` sur tout POST.
- Toute page et tout endpoint (sauf `/login`, `/setup`, `/healthz`, `/api/cron/*`) exige une session.

### Durcissement

- CSP `default-src 'self'` (aucun CDN, aucune police externe), `frame-ancestors 'none'`,
  `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, HSTS via Caddy.
- Secrets uniquement en variables d'env (`.env` en 600, hors dépôt) ; aucun secret en base.
- Journalisation sans données sensibles (pas de secret, pas de cookie).
- Authelia devant l'app reste activée en `two_factor` pour ce domaine (2ᵉ barrière).
- Sauvegarde chiffrée des données ? Non en v1 : disque LXC dédié + backups PVE ; l'export ZIP
  contient la base et les PDF.

---

## 9. Écrans et parcours

| Route | Contenu |
|---|---|
| `/setup` | Assistant unique : compte admin (mot de passe généré + TOTP), identité émetteur, IBAN |
| `/login` | Mot de passe, puis TOTP ou passkey |
| `/` | Tableau de bord : encaissé YTD, en attente, en retard, prochains abonnements, file de relances, 8 dernières factures |
| `/clients` | Recherche (nom, email, IDE), filtres (actifs/archivés/solde), solde par client |
| `/clients/new`, `/clients/[id]`, `/clients/[id]/edit` | Fiche, notes/contexte, contrats, timeline factures + paiements |
| `/contracts`, `/contracts/[id]` | Liste, prochaine échéance, pause, « générer maintenant » |
| `/invoices` | Filtres année/statut/client/échéance, tri, total filtré |
| `/invoices/new` | Client, période, lignes dynamiques, total live, échéance auto, notes |
| `/invoices/[id]` | Détail, actions (émettre, payer, paiement partiel, annuler, relancer, dupliquer, PDF) |
| `/reminders` | File des rappels à envoyer, historique |
| `/settings` | Identité, banque/IBAN, TVA, délais, séquence, sauvegarde/export |
| `/settings/security` | Mot de passe, TOTP, passkeys, sessions, codes de secours |
| `/healthz` | `200 ok` + version (public, sans donnée) |
| `/api/cron/daily` | POST authentifié `Bearer CRON_SECRET`, exécute les jobs |

UI : navigation latérale, tableau dense, formulaires en POST classique (pas de SPA),
confirmations pour les actions destructives, messages flash, responsive ≥ 360 px, impression
propre des pages facture. Aucun asset externe.

---

## 10. Jobs quotidiens

`node scripts/jobs.mjs` (idempotent, verrou fichier pour éviter deux exécutions) :

1. Factures impayées échues → statut visuel « en retard » (calculé, pas un statut stocké).
2. Contrats à échéance ≤ 7 j → brouillon (ou émission si `auto_issue`).
3. Rappels niveau 1 puis 2 → génération PDF, insertion, sans doublon.
4. Purge : `auth_attempts` > 7 j, sessions expirées, PDF orphelins.
5. Sauvegarde SQLite (`VACUUM INTO`) + copie des PDF du jour → `data/backups/`, rétention 14 jours.
6. Notification Telegram optionnelle (résumé).

Exécution par cron LXC : `15 6 * * * docker exec factures node scripts/jobs.mjs` ; sortie
journalisée dans `data/jobs.log`, code de sortie non nul → alerte Telegram.

---

## 11. Déploiement

### LXC 112

- Debian 13 (trixie) unprivileged, `nesting=1`, 2 vCPU, 1024 Mo RAM, 8 Go disque,
  `192.168.1.67/24`, gw `192.168.1.1`, hostname `factures`.
- Clé SSH déjà déployée par `add-my-key.sh` ; `PasswordAuthentication no`.
- Route NetBird `100.70.0.0/16 via 192.168.1.60` comme les autres LXC (fichier
  `/etc/systemd/network/eth0.network`), sinon le VPS ne peut pas joindre l'app.
- Docker + compose plugin ; `daemon.json` log rotation 10m × 3 ; conteneur `restart: unless-stopped`.
- UFW/iptables : seuls 22 (LAN/NetBird) et 3000 (LAN + VPS) nécessaires, pas d'exposition WAN.

### App

- Image Node 22 alpine multi-stage (build Astro → runtime standalone), utilisateur non-root,
  healthcheck `/healthz`.
- `docker-compose.yml` : `./data:/data`, `./.env:/app/.env:ro`, port `192.168.1.67:3000:3000`.
- `.env` : `APP_ORIGIN`, `SESSION_SECRET`, `CRON_SECRET`, `SETUP_TOKEN`, `DATA_DIR`,
  `TELEGRAM_*` (optionnels).

### Exposition

- DNS Cloudflare `factures` A → `132.243.200.40` (proxifié).
- Caddy VPS : bloc `factures.mayoraz-net.ch` avec `import authelia` puis
  `reverse_proxy 192.168.1.67:3000` (via NetBird), en-têtes de sécurité, compression.
- Authelia : règle `factures.mayoraz-net.ch` en `two_factor`.
- Uptime Kuma : sonde HTTP `/healthz` + notification Telegram/Pushover existantes.

### Sauvegardes

- Vzdump PVE quotidien du LXC (déjà en place) + backup applicatif quotidien (job 5).
- Export ZIP manuel depuis Réglages (base + PDF + JSON des réglages).

---

## 12. Import de l'historique

Script `scripts/seed-history.mjs`, idempotent (clé : `external_number` ou nom de client).

- **Garage Darbellay Sàrl** — CHE-413.731.090, Rue du Chable-Bet 18, 1920 Martigny,
  garage.darbellay@gmail.com : factures `FAC-2026-DAR-01` (acompte 500 CHF, payé) et
  `FAC-2026-DAR-02` (solde 500 CHF, impayé sur un total de 1'000 CHF), devis `DEV-2026-DAR-02`
  en note, contrat « Domaine + hébergement + modifications » 69 CHF/an à partir de la 2ᵉ année
  (1ʳᵉ année incluse dans le forfait).
- **Charles Jenny Architecte Sàrl** — Rue Mauborget 6, 1003 Lausanne : facture `2026-021`,
  200 CHF, émise le 21.10.2026, statut à confirmer (impayée par défaut), objet « Signature
  email + page d'installation ».
- **Cabinet dentaire Tivoli / Ivan** — forfait 30 h, 1'100 CHF, trois versements
  (400 / 400 / 300, échéances 23.10, 02.11, 01.12.2026) : soit un contrat « forfait » avec
  trois échéances, soit trois factures liées ; choix retenu : **un contrat ponctuel** +
  trois factures en brouillon pour les trois versements (aucune n'a été émise à ce jour).
- Chaque entrée importée porte le tag `historique` et une note de contexte.
- Les montants et dates non confirmés sont marqués dans la note « à vérifier ».

---

## 13. Tests et vérifications

- **Unitaires (Vitest)** : totaux et arrondis en centimes, qté milli, numérotation (course,
  annulation, changement d'année), checksum IBAN et référence QR, payload QR, cadence des
  contrats (mensuel/trimestriel/annuel, fins de mois, année bissextile), échéances de rappel,
  hachage/vérification mot de passe, TOTP, CSRF.
- **E2E (Playwright)** sur base jetable : setup → login TOTP → client → facture → émission →
  PDF téléchargé → paiement partiel → solde → rappel → export.
- **PDF** : taille > 10 Ko, page A4, présence de la section paiement, QR décodé (rasterisation
  + `jsQR`) et comparé au payload attendu.
- **Sécurité** : accès sans session → 302/401, POST sans CSRF → 403, mauvais Origin → 403,
  8 échecs → verrouillage, cookie `Secure`/`HttpOnly`.
- **Manuel** : validateur officiel SIX sur une facture réelle ; rendu iPhone (passkey) ;
  accès via `https://factures.mayoraz-net.ch` et via LAN.
- `astro check` et `npm run build` doivent passer sans erreur.

---

## 14. Découpage

| Phase | Contenu | Sortie vérifiable |
|---|---|---|
| P1 | LXC 112 + Docker + squelette Astro + SQLite/migrations + auth (mdp, TOTP, sessions) + setup + clients | login réel, CRUD client, `/healthz` |
| P2 | Factures + lignes + numérotation + PDF QR + statuts + paiements | facture réelle PDF validée |
| P3 | Contrats + jobs + relances + tableau de bord + Telegram | brouillon d'abonnement auto, relance générée |
| P4 | Import historique + réglages/sécurité + export + tests complets | historique visible, E2E vert |
| P5 | Exposition Caddy/Authelia/DNS + Uptime Kuma + doc + `agy.md` | accès public 2FA, monitoring |

Chaque phase se termine par une vérification réelle (pas seulement un build) et un point
avec Thomas.

---

## 15. Risques et parades

| Risque | Parade |
|---|---|
| Perte de la base SQLite | WAL + backup `VACUUM INTO` quotidien + vzdump + export ZIP |
| Numéro sauté ou dupliqué | transaction `BEGIN IMMEDIATE` + contrainte `UNIQUE(number)` |
| PDF non conforme | payload testé, QR décodé, validation SIX avant mise en service |
| Passkey capricieuse derrière Cloudflare | TOTP toujours disponible + codes de secours |
| Authelia indisponible | app protégée par son propre login ; accès LAN direct |
| Cron silencieux | log + code de sortie + alerte Telegram |
| Facture émise modifiée par erreur | immuabilité applicative + `activity_log` + annulation |
