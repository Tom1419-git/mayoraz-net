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

## 📂 Structure

```
├── src/
│   ├── layouts/Layout.astro    # Layout principal (Header, Footer)
│   └── pages/                  # Pages du site
│       ├── index.astro         # Accueil / Services
│       ├── a-propos/           # À propos & CV
│       ├── contact/            # Formulaire de contact
│       ├── homelab/            # Infrastructure homelab
│       └── ...
├── public/
│   └── media/
│       ├── css/                # Styles globaux et par page
│       ├── img/                # Images & logos
│       └── js/                 # Scripts
└── .github/workflows/          # CI/CD déploiement
```

## 📬 Contact

- **Email** : [contact@mayoraz-net.ch](mailto:contact@mayoraz-net.ch)
- **Site** : [mayoraz-net.ch](https://mayoraz-net.ch)
- **GitHub** : [@Tom1419-git](https://github.com/Tom1419-git)

---

> [!NOTE]
> *Ce projet a été développé avec l'assistance d'une IA (Google Gemini / Antigravity).*

<div align="center"><i>Développé avec passion par Thomas Mayoraz &copy; 2026</i></div>
