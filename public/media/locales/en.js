const frToEn = {
    // Nav & Common
    "Accueil": "Home",
    "À propos": "About",
    "Tutoriels": "Tutorials",
    "Contact": "Contact",
    "Thème clair activé": "Light theme enabled",
    "Thème sombre activé": "Dark theme enabled",
    "Retour à l'accueil": "← Back to Home",

    // Home
    "Spécialisé dans les": "Specialized in",
    "services informatiques à Lausanne": "IT services in Lausanne",
    "je propose des solutions sur mesure pour particuliers et entreprises.": "I offer custom solutions for individuals and businesses.",
    "De la création de sites web au montage PC, en passant par le dépannage informatique, je suis à votre disposition pour concrétiser vos projets technologiques.": "From website creation to PC building and IT troubleshooting, I am available to bring your tech projects to life.",
    "Besoin d'un service ou d'un devis informatique ?": "Need an IT service or quote?",
    "Contactez-moi dès maintenant via le formulaire pour discuter de votre projet !": "Contact me now via the form to discuss your project!",
    "💬 Me Contacter Maintenant": "💬 Contact Me Now",

    // Projects
    "Sites Web": "Websites",
    "Création de sites vitrines, boutiques en ligne et applications digitales sur mesure pour votre entreprise.": "Creation of showcase websites, online stores, and custom digital applications for your business.",
    "Montage PC": "PC Building",
    "Assemblages personnalisés et configurations optimisées à Lausanne. Du choix des composants à la mise en service, explorez mes réalisations hardware.": "Custom builds and optimized configurations in Lausanne. From component selection to setup, explore my hardware projects.",
    "Projets Divers": "Various Projects",
    "Projets variés incluant des rapports techniques, des guides pratiques, des documentations et autres créations. Une collection de travaux diversifiés et de ressources utiles.": "Various projects including technical reports, practical guides, documentation, and other creations. A collection of diverse work and useful resources.",
    "Quiz Informatique": "IT Quiz",
    "Testez vos connaissances en IT avec ce quiz interactif. Défiez le classement quotidien !": "Test your IT knowledge with this interactive quiz. Challenge the daily leaderboard!",
    "Admin Run": "Admin Run",
    "Un mini-jeu SysAdmin : évitez les pannes réseau et maintenez le serveur en ligne !": "A SysAdmin mini-game: avoid network outages and keep the server online!",
    "À Propos de moi": "About Me",
    "Découvrez mon parcours, mes compétences et ma passion pour l'informatique. Expert en services informatiques basé à Lausanne, spécialisé dans les solutions techniques.": "Discover my background, skills, and passion for IT. IT services expert based in Lausanne, specializing in technical solutions.",
    "Me Contacter": "Contact Me",
    "Une question, un projet ou besoin d'assistance ? N'hésitez pas à me contacter via le formulaire dédié. Je vous répondrai très rapidement.": "A question, a project, or need assistance? Feel free to contact me via the dedicated form. I will reply very quickly.",
    
    // Buttons
    "Voir  ": "View  ",
    "Jouer  ": "Play  ",
    "Découvrir  ": "Discover  ",
    "Contacter  ": "Contact  ",

    // Testimonials
    "Ce que disent mes clients": "What my clients say",
    "Travail très professionnel ! Thomas a monté mon PC gaming avec un câblage impeccable. Tout tourne à merveille, je recommande vivement.": "Very professional work! Thomas built my gaming PC with impeccable cable management. Everything runs wonderfully, I highly recommend him.",
    "Client Montage PC": "PC Build Client",
    "Intervention rapide pour un dépannage sur mon ordinateur de travail qui refusait de démarrer. Réparation efficace et super conseils.": "Quick intervention for troubleshooting my work computer that refused to start. Efficient repair and great advice.",
    "Client Dépannage": "Troubleshooting Client",
    "Intervention rapide et très professionnelle. Thomas a réussi à récupérer toutes mes données sur mon disque dur endommagé et m'a conseillé un super système de sauvegarde.": "Fast and very professional intervention. Thomas managed to recover all my data on my damaged hard drive and advised me on a great backup system.",
    "Client Récupération de Données": "Data Recovery Client",

    // Tutoriels
    "Tutoriels & Snippets": "Tutorials & Snippets",
    "Ma base de connaissances et astuces techniques": "My knowledge base and tech tips",
    "Voici quelques mémos techniques, bouts de code et configurations rapides basés sur mon expérience avec mon infrastructure personnelle.": "Here are some technical memos, code snippets, and quick configs based on my experience with my personal infrastructure.",
    "Le fichier docker-compose parfait pour débuter": "The perfect docker-compose file for beginners",
    "Auto-Healing : Redémarrer un conteneur crashé": "Auto-Healing: Restarting a crashed container",
    "Architecture de la Stack 'Arr'": "Architecture of the 'Arr' Stack",
    "Pour déployer rapidement n'importe quel conteneur en gardant une trace claire des configurations, j'utilise toujours la structure YAML suivante. Elle intègre les logs rotatifs pour éviter de saturer le disque de la VM.": "To quickly deploy any container while keeping a clear track of configurations, I always use the following YAML structure. It integrates rotating logs to avoid filling up the VM disk.",
    "Grâce à <strong>n8n</strong> et l'API Docker locale, j'ai créé un workflow qui écoute les alertes webhook de Prometheus. Si un conteneur tombe, n8n lance cette commande via SSH ou Socket :": "Thanks to <strong>n8n</strong> and the local Docker API, I created a workflow that listens to Prometheus webhook alerts. If a container crashes, n8n runs this command via SSH or Socket:",
    "Le système m'envoie ensuite un message sur Telegram pour m'avertir de l'incident et de sa résolution automatique.": "The system then sends me a message on Telegram to notify me of the incident and its automatic resolution.",
    
    // HTML Translations via data-i18n-html
    "tuto_arr_1": "The user makes a request on <strong>Jellyseerr</strong>.",
    "tuto_arr_2": "Jellyseerr sends the request to <strong>Sonarr</strong> (Series) or <strong>Radarr</strong> (Movies).",
    "tuto_arr_3": "Radarr queries the indexers via <strong>Prowlarr</strong> to find the best file.",
    "tuto_arr_4": "The torrent is sent to <strong>qBittorrent</strong> for downloading.",
    "tuto_arr_5": "Once completed, Radarr cleanly moves and renames the file in the <strong>MergerFS</strong> pool.",
    "tuto_arr_6": "<strong>Jellyfin</strong> detects the new file and adds it to the library.",

    "Snippets & Astuces": "Snippets & Tips",
    "Nettoyage Complet Docker": "Complete Docker Cleanup",
    "Pour faire le ménage en profondeur sur votre serveur Docker et libérer de l'espace disque en supprimant les conteneurs arrêtés, les réseaux inutilisés, les images non attachées et le cache de build.": "To thoroughly clean up your Docker server and free up disk space by removing stopped containers, unused networks, dangling images, and build cache.",
    "Mise à jour rapide Ubuntu (Alias)": "Quick Ubuntu Update (Alias)",
    "tuto_alias_1": "Add this alias to your <code>~/.bashrc</code> file to be able to update everything with a single quick command.",
    "tuto_alias_2": "After adding it, reload your terminal with <code>source ~/.bashrc</code>.",
    "Redirection HTTP vers HTTPS (Nginx)": "HTTP to HTTPS Redirect (Nginx)",
    "Un bloc serveur minimaliste pour forcer toutes les requêtes HTTP (port 80) de tous vos domaines vers leur équivalent HTTPS (port 443).": "A minimalist server block to force all HTTP requests (port 80) from all your domains to their HTTPS equivalent (port 443).",

    "Vérification des systèmes...": "Checking systems...",
    "Tous les systèmes opérationnels": "All systems operational",
    "Incident en cours...": "Incident ongoing...",
    "Statut indisponible": "Status unavailable"
    "Télécharger ma VCard": "Download my VCard"
};