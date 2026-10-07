# Site public mayoraz-net.ch — hebergement et pipeline

> Etat verifie le 07/10/2026 apres migration GitHub Pages -> Cloudflare Workers.
> Ce document fait foi : il decrit ce qui tourne, par quoi, et comment deployer.

---

## Vue d'ensemble

```
Navigateur ──> Cloudflare edge
                 ├─ www.mayoraz-net.ch  (Redirect Rules  -> 301 vers apex)
                 └─ mayoraz-net.ch      (Workers route  -> worker "mayoraz-net")
                                              └─ assets statiques Astro (dist/)
Source de verite : GitHub repo Tom1419-git/mayoraz-net (branche main)
CI/CD       : GitHub Actions -> wrangler deploy -> Cloudflare Workers
DNS         : jamais touche pendant la migration (records d origine conserves)
```

- **Hebergement** : Cloudflare Workers en mode assets statiques (gratuit et illimite ;
  les requetes de fichiers ne sont pas comptees, seul l'usage du worker est facture).
- **Usage commercial autorise**, contrairement a GitHub Pages (interdit par leurs ToS).

## Composants (etat reel verifie par API)

| Element | Valeur | ID |
|---|---|---|
| Worker | `mayoraz-net` (assets-only, ~140 fichiers) | script id `mayoraz-net` |
| Route apex | `mayoraz-net.ch/*` -> worker `mayoraz-net` | `47bf5979` |
| Ruleset Redirect | `http_request_dynamic_redirect` | `4bafdd95df254cfda7c0083924d006b8` |
| Rule www | `Redirect www vers apex (301)`, enabled, expression `(http.host eq "www.mayoraz-net.ch")`, cible `concat("https://mayoraz-net.ch", http.request.uri.path)`, `preserve_query_string: true` | ruleset `4bafdd95` |
| Custom domain | Aucun (les custom domains Workers sont refuses aux API tokens, code 10405 CF) : on passe par une route workers | — |
| DNS apex | 4 records A vers `185.199.108-111.153` (GitHub Pages), proxifies, jamais atteints : la route intercepte a l'edge avant l'origin | ids conserves |
| DNS www | CNAME -> `tom1419-git.github.io` (proxifie), jamais atteint, sert seulement d'entree DNS valide pour la rule | `8b254a0f5d0a` |
| DNS autres | 27 A VPS (`132.243.200.40` et cibles tunnel), 4 CNAME tunnel, MX iCloud et TXT : `_dmarc`, `spf`, `apple-domain`, `google-site-verification` | intacts |

## Pipeline de deploy (push -> prod automatique)

1. Commit + push sur `main`.
2. GitHub Actions ([.github/workflows/ci.yml](../.github/workflows/ci.yml)) :
   - job `build-check` : `npm ci` + `npm run build` (controle du build).
   - job `deploy-cloudflare` (uniquement push sur main, apres un build-check vert) :
     `npm run build`, puis step `Write build info` :
     `node scripts/write-build-info.mjs` ecrit `dist/build.json`
     (timestamp UTC, sha du commit, statut ok ou degraded sans faire echouer le
     deploy), puis `npx wrangler@4.148.0 deploy --config wrangler.jsonc`.
3. Le secret `CLOUDFLARE_API_TOKEN` donne le droit d'upload (chiffre avec la cle
   publique du repo, sealed box libsodium).
4. Cloudflare sert la nouvelle version des assets en quelques secondes.
5. Le footer du site affiche alors le badge de deploy (`/build.json` lu par
   [public/media/js/buildinfo.js](../public/media/js/buildinfo.js)) : vert si le
   deploy est frais, ambre si degrade, orange si plus ancien que 30 jours, date
   au format FR ou EN selon la langue du site.

> L'integration Git de Workers Builds ne declenche AUCUN build (webhook absent du repo :
> verifie par API, liste vide). C'est le job `deploy-cloudflare` qui remplit ce role.
> Le pipeline n'ecrit JAMAIS dans la zone DNS : le deploiement ne touche qu'aux assets du worker.

## Verification (sweep standard, tout doit passer)

- 18 pages HTML en 200 sur l'apex, sans aucun header GitHub.
- Les 40 regles de [public/_redirects](../public/_redirects) servent le bon code (301)
  et la bonne cible (clean URLs, .html -> dossier, `index.html` -> racine, ctt Montriond).
- `/page-inexistante-xyz` -> 404 ; `/CNAME` -> 404 (fichier obsolete purge le 07/10).
- `/build.json` -> 200 `application/json` : `{"timestamp": ISO UTC, "sha": sha du
  commit deploye, "status": "ok"} ; le badge de deploy du footer en depend.
- `sitemap-index.xml`, `sitemap-0.xml`, `robots.txt` -> 200.
- noindex sur `/offre-pme/merci/` et `/contact/merci/` (pages de confirmation, en
  meta robots ; le header X-Robots-Tag est absent de ces deux pages).
- JSON-LD de `/sites-web/` sans reference a `index.html`.
- `www` : 301 single-hop vers l'apex avec query preservee, sur n'importe quel chemin.
- `/` -> 200 ; `/index.html` -> 301 vers `/`.

## Surveillance : webhook formulaire + site public (n8n + Uptime Kuma)

- Le webhook `https://n8n.mayoraz-net.ch/webhook/contact-form` (workflow n8n
  `j7gZ5Hj1rHkKB7Kg`, conteneur Docker n8n sur le VPS) est surveillé par
  `n8n_watchdog.py` : miroir à la racine du repo, déployé en
  `/opt/n8n-watchdog/n8n_watchdog.py` (root), cron `4-59/15 * * * *`, log
  `/opt/n8n-watchdog/watchdog.log` (logrotate weekly, copytruncate).
- Deux contrôles indépendants : sonde HTTP POST silencieuse (honeypot `website`
  renseigné, réponse attendue 429 du node Respond 429, aucun message Telegram
  envoyé ; échec confirmé par une seconde sonde 15 s après), et lecture du flag
  `workflow_entity.active` sur la base n8n (checkpoint WAL PASSIVE avant lecture).
- Interprétation de la sonde : 429 = vivant ; 200 = honeypot contourné (anomalie) ;
  404 = webhook désenregistré (désync flag/runtime n8n connu) ; 5xx, timeout ou
  refus = n8n ne répond plus. Base illisible = alerte `db_lecture`.
- Alertes Telegram via les creds de `/opt/prospex/.env` (même bot que prospex,
  jamais affichées) : 1 alerte max par 60 min par type, compteur d'échecs
  consécutifs dans le message, unique message de rétablissement au retour à la
  normale. Auto-réparation du flag=0 par `docker exec n8n n8n
  update:workflow --id=j7gZ5Hj1rHkKB7Kg --active=true` (tentée à chaque alerte
  due, puis re-vérifiée).
- Sonde du site public (ajout du 07/10 soir) : GET `https://mayoraz-net.ch/`
  (200 attendu ; headers GitHub `x-github-request-id` ou `x-served-by` présents
  ou code non 200 = `site_anomalie`, régression de migration possible ;
  connexion, timeout ou 5xx = `site_down`) et GET `/build.json` (200 + JSON
  avec sha et status, sinon `site_build_ko`) ; double sonde anti-blip 15 s,
  même anti-spam que le reste.
- Remontée Uptime Kuma : à chaque passage, push vers le monitor type push
  « Site public (watchdog) » (id 69, interval 1200 s / retry 300 s, SANS
  notification attachée), affiché dans le groupe « Site public » de la status
  page publique (slug `home`) sur status.mayoraz-net.ch. Token de push dans
  `/opt/n8n-watchdog/kuma-push.conf` (600 root, jamais journalisé). Le monitor
  HTTP `mayoraz-net.ch (apex)` existant (id 63) garde ses notifications
  Pushover + Telegram actuelles. Rollback monitor : `docker stop uptime-kuma`,
  restaurer `/opt/monitoring/backups/kuma.db.bak-1791405005` ou DELETE des
  lignes monitor 69 + monitor_group + `group` 2, puis `docker start`.
- Widget footer du site : le badge de statut ([public/media/js/status.js](../public/media/js/status.js)) reflète désormais le monitor « Site public (watchdog) » (id 69) spécifiquement, via l'endpoint badge SVG public `https://status.mayoraz-net.ch/api/badge/69/status?label=` (CORS ouvert, vérifié) : pastille verte « Site en ligne » si le monitor est UP, rouge « Site indisponible » si DOWN ou si le badge est injoignable (optimiste vert en attendant la sonde). Couleur lue en parsant le SVG chargé (fill #66c20a = up, #e05d44 = down, mesurés le 07/10) avec secours sur la longueur de réponse (895 o up vs 1316 o down) ; sonde répétée toutes les 60 s. Libellés i18n FR (« Site en ligne » / « Site indisponible ») et EN (« Site online » / « Site unavailable ») dans [public/media/locales/en.js](../public/media/locales/en.js). Le badge deploy du footer (`/build.json`) reste inchangé à côté.
- ATTENTION : si le workflow n8n est désactivé volontairement (maintenance),
  retirer d'abord la ligne cron (`crontab -e`), sinon le watchdog le réactivera
  à chaque passage. Rollback : retirer la ligne cron, `rm -rf
  /opt/n8n-watchdog` et `rm /etc/logrotate.d/n8n-watchdog`.

## Secrets et tokens

| Secret | Emplacement | Usage |
|---|---|---|
| API token Cloudflare (Zone Read, Zone DNS Edit, Zone Workers Routes Edit, Zone Single Redirect Edit, Account Workers Scripts Edit, Account Workers Builds Config Edit, Account DNS Settings Edit) | `~/.cf-token-mayoraz` (chmod 600, hors git) | utilise pour la config manuelle |
| Meme token chiffre | Secret GitHub `CLOUDFLARE_API_TOKEN` du repo mayoraz-net | utilise par GitHub Actions pour wrangler |

> Rotation : si un token pivote, re-PUT le secret GitHub (meme nom, nouveau chiffrement
> via PyNaCl sealed box) et mettre a jour le fichier local en meme temps.

## Limites et points d'attention

- Les custom domains Workers (PUT/POST /workers/domains) sont **refuses aux API tokens**
  (405 code 10405, restriction auth scheme Cloudflare) : verifier ou modifier les
  routes doit se faire avec les routes ci-dessus, PAS par custom domain.
- Le webhook Workers Builds ne declenche jamais de build : si un deploy manuel est
  necessaire, `npx wrangler@4.148.0 deploy --config wrangler.jsonc` suffit.
- `npm run build` local (18 pages) doit rester identique au build CI : les hash cache-busting
  inline (`?v=` dans les HTML) varient entre environnements, sans consequence.
- La route workers de l'apex exige UN record DNS proxifie sur `mayoraz-net.ch` :
  c'est le placeholder A `192.0.2.1` (proxie, documentation et communaute Cloudflare).
  NE PAS le supprimer, sinon l'apex tombe. Les 4 records A historiques GitHub
  (185.199.108-111.153) ont ete supprimes le 07/10 (placeholder pose et prod verifiee
  AVANT chaque suppression). Le CNAME www vers github.io, lui, DOIT rester : il fournit
  le record proxifie requis par la redirect rule www.

## Historique de migration (07/10/2026)

1. Repo Git prepare : wrangler.jsonc assets-only (assets.directory dist/,
   html_handling auto-trailing-slash, not_found_handling 404-page), rules provenant de
   `_redirects`.
2. Projet Workers `mayoraz-net` connecte au repo (build command `npm run build`,
   deploy command `npx wrangler deploy`), https://mayoraz-net.thomasmayoraz.workers.dev
   reactif pour le pre-controle.
3. **Route apex** : POST /zones/{zone}/workers/routes vers le worker (200, id 47bf5979).
4. **Redirect www** : PUT entrypoint ruleset phase `http_request_dynamic_redirect`
   (200, ruleset id 4bafdd95) avec une regle 301 (expression host + target concat +
   preserve query). Teste en prod avant toute suppression d'ancien chemin.
5. **Nettoyage** : suppression du chemin provisoire www -> worker www-redirect
   (DELETE route + DELETE script) : le compte ne contient plus qu'un seul worker.
6. **Repo** : suppression de `public/CNAME` et du workflow GH Pages (9dfa686),
   ajout du job `deploy-cloudflare` dans ci.yml + secret (b3c96d0).
7. **GitHub Pages desactive** (DELETE /repos/{repo}/pages via API admin, confirm 404).
8. **Sweep final PASS** (audit du 07/10 16h).
9. **Badge de deploy** : step `Write build info` dans le job deploy (script
   [scripts/write-build-info.mjs](../scripts/write-build-info.mjs)), badge footer
   alimente par `/build.json` (public/media/js/buildinfo.js).
10. **Purge DNS GitHub** : placeholder A 192.0.2.1 proxie pose, prod verifiee, puis
   suppression des 4 A 185.199.x ; apex toujours 200 sans header GitHub.

## Reproduire pour un site client

1. wrangler.jsonc + _redirects a copier, build command `npm run build`.
2. Creer le projet Workers, connecter au repo (dashboard).
3. Si le client a deja des records GitHub Pages : ne PAS toucher au DNS, ajouter
   simplement la route workers vers son hostname (zero downtime, meme mechanisme).
4. Redirect rule pour www si un domaine secondaire existe (Single Redirect, 301,
   preserve query) — pas de worker dedie necessaire.
5. Nettoyer le repo (CNAME, workflow GH Pages), desactiver GH Pages par API, sweep complet.
