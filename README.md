<div align="center">
  <img src="public/media/img/logo.webp" alt="Logo" width="100"/>
  <h1>Portfolio & Services Informatiques - Thomas Mayoraz</h1>
  <p>Mon portfolio personnel et vitrine de mes services informatiques en région lausannoise.</p>
  
  <p>
    <a href="https://mayoraz-net.ch">🌐 Visiter le site web</a>
    ·
    <a href="https://github.com/Tom1419-git/mayoraz-net/issues">🐛 Signaler un bug</a>
  </p>
</div>

<br/>

<div align="center">
  <img src="public/media/img/og_banner.png?v=4" alt="Aperçu du site" width="800" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);"/>
</div>

<br/>

## 🚀 À propos du projet

Ce projet est le code source de mon site personnel et portfolio professionnel. Il présente mes compétences, mes projets en tant qu'Apprenti Informatique à l'ETML, ainsi que les différents services informatiques que je propose aux particuliers et entreprises de la région de Lausanne.

### ✨ Fonctionnalités clés
* **Design Premium** : Interface sombre (Dark mode), Glassmorphism, animations fluides et transitions natives avec Astro (`<ClientRouter />`).
* **Statut Serveur en Direct** : Interrogation en temps réel de l'API Uptime Kuma pour afficher l'état de l'infrastructure Homelab dans le footer.
* **Portfolio intégré** : Présentation détaillée de mes projets personnels, setups PC (avec galerie Lightbox) et travaux scolaires.
* **Formulaire de contact sécurisé** : Protection anti-spam propulsée par Cloudflare Turnstile intégrée au frontend, avec soumission AJAX via Web3Forms.
* **SEO optimisé** : Génération de sitemap dynamique, intégration JSON-LD (Schema.org), et balises Open Graph/Twitter Cards.

## 🛠️ Technologies Utilisées

* **Framework** : Astro (SSG)
* **Frontend** : HTML5, CSS3 (Variables, Flexbox, Grid), JavaScript Vanilla
* **Polices & Icônes** : Google Fonts (Inter, DM Serif Display)
* **Sécurité & Infra** : Cloudflare Turnstile, Cloudflare Zero Trust
* **Hébergement & CI/CD** : GitHub Pages (via GitHub Actions)
* **Backend Messagerie** : Web3Forms

## 📂 Structure du projet (Astro)

```text
├── src/
│   ├── layouts/
│   │   └── Layout.astro    # Modèle principal (Header, Footer, Transitions)
│   └── pages/
│       ├── index.astro     # Page d'accueil (Services)
│       ├── contact/        # Formulaire de contact sécurisé
│       ├── tutoriels/      # Base de connaissances
│       └── ...             # Autres pages
├── public/
│   ├── media/
│   │   ├── css/            # Feuilles de style (main.css...)
│   │   ├── img/            # Images, logos, bannières
│   │   └── js/             # Scripts (thème, captcha...)
│   └── ...                 # Fichiers statiques (sitemap, etc.)
└── .github/workflows/      # Action de déploiement automatique
```

## 📬 Me contacter

* **Email professionnel** : [contact@mayoraz-net.ch](mailto:contact@mayoraz-net.ch)
* **Site web** : [mayoraz-net.ch](https://mayoraz-net.ch)
* **GitHub** : [@Tom1419-git](https://github.com/Tom1419-git)

---

> [!NOTE]
> *Ce site web et ses fonctionnalités interactives ont été développés en partie avec l'assistance d'une Intelligence Artificielle avancée.*

---

<div align="center">
  <i>Développé avec passion par Thomas Mayoraz &copy; 2026</i>
</div>
