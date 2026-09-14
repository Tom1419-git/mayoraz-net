[![CI Deploy](https://github.com/Tom1419-git/mayoraz-net/actions/workflows/deploy.yml/badge.svg)](https://github.com/Tom1419-git/mayoraz-net/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-7.x-BC52EE?logo=astro&logoColor=white)](https://astro.build)

<div align="center">
  <img src="public/media/img/logo.webp" alt="Logo" width="100"/>
  <h1>Portfolio & Services Informatiques — Thomas Mayoraz</h1>
  <p>Portfolio personnel et vitrine de services informatiques en région lausannoise.</p>
  
  <p>
    <a href="https://mayoraz-net.ch">🌐 Visiter le site</a>
    ·
    <a href="https://github.com/Tom1419-git/mayoraz-net/issues">🐛 Signaler un bug</a>
  </p>

  <img src="public/media/img/og_banner.png?v=4" alt="Aperçu du site" width="800" style="border-radius:10px"/>
</div>

---

## 🚀 À propos

Site personnel et portfolio professionnel présentant mes compétences, projets et services informatiques aux particuliers et entreprises de la région lausannoise.

Développé en tant qu'**Apprenti Informaticien 3ème année** à l'ETML.

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 🎨 Design Dark Mode | Glassmorphism, animations natives Astro (`<ClientRouter />`) |
| 📡 Statut serveur live | API Uptime Kuma en temps réel dans le footer |
| 🗂️ Portfolio complet | Projets, setups PC (galerie Lightbox), travaux scolaires |
| 📬 Formulaire sécurisé | Cloudflare Turnstile + webhook n8n self-hosted |
| 🔍 SEO optimisé | Sitemap dynamique, JSON-LD Schema.org, Open Graph |
| 🌍 Multilingue | Support FR / EN complet |

## 🛠️ Stack technique

- **Framework** : [Astro](https://astro.build) (SSG)
- **Frontend** : HTML5, CSS3 Vanilla (Variables, Flexbox, Grid), JavaScript Vanilla
- **Infra & Sécurité** : Cloudflare Turnstile, Cloudflare Zero Trust, n8n (self-hosted)
- **Déploiement** : GitHub Actions → GitHub Pages
- **Notifications** : Bot Telegram via n8n
- **Licence** : [MIT](LICENSE) — code réutilisable avec attribution

## 📂 Structure

```
├── src/
│   ├── pages/                  # 13 pages : accueil, services, projets, homelab,
│   │                           #   tutoriels, builds PC, jeux, contact…
│   ├── components/             # Composants Astro réutilisables
│   ├── layouts/Layout.astro    # Layout principal (Header, Footer)
├── public/
│   └── media/
│       ├── css/                # Styles globaux et par page
│       ├── img/                # Images & logos
│       └── js/                 # Scripts
└── .github/workflows/          # CI/CD déploiement
```

## 📬 Contact

- **Site** : [mayoraz-net.ch](https://mayoraz-net.ch)
- **Email** : [contact@mayoraz-net.ch](mailto:contact@mayoraz-net.ch)
- **GitHub** : [@Tom1419-git](https://github.com/Tom1419-git)

---

> [!NOTE]
> *Développé avec l'assistance d'outils d'IA (Google Gemini / Antigravity), piloté et maintenu par Thomas Mayoraz.*

<div align="center"><i>Développé avec passion par Thomas Mayoraz &copy; 2026</i></div>

