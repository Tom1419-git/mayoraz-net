# Mémoire du Projet (Antigravity / Gemini)

Ce fichier sert de mémoire persistante pour ne pas oublier l'état du projet, l'infrastructure de Thomas, et ses préférences entre les différentes sessions.

## 🏢 Infrastructure & Homelab
- **Docker** : Utilisation exclusive de **OrbStack** sur le Mac local (beaucoup plus léger que Docker Desktop).
- **Sécurité & Accès** : Utilisation de **Cloudflare Zero Trust** / Cloudflare Tunnels pour exposer les services publics. *Note: Authelia a été abandonné au profit de Cloudflare Zero Trust.*
- **Monitoring** : Uptime Kuma (`status.mayoraz-net.ch`), Prometheus et Grafana.
- **Automatisation** : Utilisation de **n8n** avec accès au socket Docker local (permet le redémarrage automatique des conteneurs via webhook Prometheus). Pas besoin de rajouter de l'automatisation Ansible pour le moment car le setup n8n fait l'affaire.
- **DNS Local** : Utilisation de Pi-Hole. Le téléphone est routé via NetBird (`100.70.25.198`).

## 🌐 Site Web (Astro)
- **Stack** : Astro (SSG) pur, HTML/CSS natif (sans Tailwind).
- **Design** : Thème ultra "Premium" et fluide. Glassmorphism, fond sombre avec dégradé subtil, animations de hover fluides.
- **Performances (PageSpeed)** : 
  - Le script `particles.js` (fond animé) a été désactivé sur les écrans mobiles (`< 768px`) pour économiser le processeur et maintenir un score de 90+. Ne pas réactiver sur mobile.
  - Utilisation de la transition native Astro (`ViewTransitions`).
- **Composants Clés** :
  - **Statut en direct** : Le footer contient une pastille qui s'anime en vert ou rouge en interrogeant dynamiquement l'API d'Uptime Kuma (`/api/status-page/home`).
  - **Galerie Lightbox** : La page "Builds PC" possède une galerie d'images modale codée en JS natif. Ne jamais supprimer ce code.
- **Déploiement** : Poussé sur GitHub, déployé automatiquement via GitHub Actions sur GitHub Pages.

## 📌 À Garder en Tête
- Toujours vérifier que les optimisations SEO (JSON-LD, OpenGraph, sitemap-index.xml) sont intactes.
- Thomas préfère un code natif, propre et autonome sans ajouter de surcouches inutiles.
- Toujours penser à l'optimisation mobile (Total Blocking Time) lors de l'ajout de nouveaux scripts JS.
