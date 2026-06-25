const frToDe = {
    // Nav & Common
    "Accueil": "Startseite",
    "À propos": "Über mich",
    "Tutoriels": "Tutorials",
    "Contact": "Kontakt",
    "Thème clair activé": "Helles Design aktiviert",
    "Thème sombre activé": "Dunkles Design aktiviert",
    "Retour à l'accueil": "← Zurück zur Startseite",

    // Home
    "Spécialisé dans les": "Spezialisiert auf",
    "services informatiques à Lausanne": "IT-Dienstleistungen in Lausanne",
    "je propose des solutions sur mesure pour particuliers et entreprises.": "biete ich maßgeschneiderte Lösungen für Privatpersonen und Unternehmen.",
    "De la création de sites web au montage PC, en passant par le dépannage informatique, je suis à votre disposition pour concrétiser vos projets technologiques.": "Von der Erstellung von Websites über die PC-Montage bis hin zur Computerreparatur stehe ich Ihnen zur Verfügung, um Ihre technologischen Projekte zu verwirklichen.",
    "Besoin d'un service ou d'un devis informatique ?": "Benötigen Sie einen Service oder ein IT-Angebot?",
    "Contactez-moi dès maintenant via le formulaire pour discuter de votre projet !": "Kontaktieren Sie mich jetzt über das Formular, um Ihr Projekt zu besprechen!",
    "💬 Me Contacter Maintenant": "💬 Jetzt kontaktieren",

    // Projects
    "Sites Web": "Websites",
    "Création de sites vitrines, boutiques en ligne et applications digitales sur mesure pour votre entreprise.": "Erstellung von Schaufenster-Websites, Online-Shops und maßgeschneiderten digitalen Anwendungen für Ihr Unternehmen.",
    "Montage PC": "PC-Montage",
    "Assemblages personnalisés et configurations optimisées à Lausanne. Du choix des composants à la mise en service, explorez mes réalisations hardware.": "Individuelle Montagen und optimierte Konfigurationen in Lausanne. Von der Auswahl der Komponenten bis zur Inbetriebnahme, entdecken Sie meine Hardware-Projekte.",
    "Projets Divers": "Verschiedene Projekte",
    "Projets variés incluant des rapports techniques, des guides pratiques, des documentations et autres créations. Une collection de travaux diversifiés et de ressources utiles.": "Verschiedene Projekte einschließlich technischer Berichte, praktischer Leitfäden, Dokumentationen und anderer Kreationen. Eine Sammlung vielfältiger Arbeiten und nützlicher Ressourcen.",
    "Quiz Informatique": "IT-Quiz",
    "Testez vos connaissances en IT avec ce quiz interactif. Défiez le classement quotidien !": "Testen Sie Ihr IT-Wissen mit diesem interaktiven Quiz. Fordern Sie die tägliche Rangliste heraus!",
    "Admin Run": "Admin Run",
    "Un mini-jeu SysAdmin : évitez les pannes réseau et maintenez le serveur en ligne !": "Ein SysAdmin-Minispiel: Vermeiden Sie Netzwerkausfälle und halten Sie den Server online!",
    "À Propos de moi": "Über mich",
    "Découvrez mon parcours, mes compétences et ma passion pour l'informatique. Expert en services informatiques basé à Lausanne, spécialisé dans les solutions techniques.": "Entdecken Sie meinen Werdegang, meine Fähigkeiten und meine Leidenschaft für IT. Experte für IT-Dienstleistungen mit Sitz in Lausanne, spezialisiert auf technische Lösungen.",
    "Me Contacter": "Kontakt aufnehmen",
    "Une question, un projet ou besoin d'assistance ? N'hésitez pas à me contacter via le formulaire dédié. Je vous répondrai très rapidement.": "Eine Frage, ein Projekt oder benötigen Sie Hilfe? Zögern Sie nicht, mich über das entsprechende Formular zu kontaktieren. Ich werde Ihnen sehr schnell antworten.",
    
    // Buttons
    "Voir  ": "Ansehen  ",
    "Jouer  ": "Spielen  ",
    "Découvrir  ": "Entdecken  ",
    "Contacter  ": "Kontakt  ",

    // Testimonials
    "Ce que disent mes clients": "Was meine Kunden sagen",
    "Travail très professionnel ! Thomas a monté mon PC gaming avec un câblage impeccable. Tout tourne à merveille, je recommande vivement.": "Sehr professionelle Arbeit! Thomas hat meinen Gaming-PC mit tadelloser Verkabelung zusammengebaut. Alles läuft wunderbar, ich kann ihn wärmstens empfehlen.",
    "Client Montage PC": "PC-Montage Kunde",
    "Intervention rapide pour un dépannage sur mon ordinateur de travail qui refusait de démarrer. Réparation efficace et super conseils.": "Schnelles Eingreifen für eine Reparatur an meinem Arbeitscomputer, der sich nicht starten ließ. Effiziente Reparatur und tolle Tipps.",
    "Client Dépannage": "Reparatur Kunde",
    "Intervention rapide et très professionnelle. Thomas a réussi à récupérer toutes mes données sur mon disque dur endommagé et m'a conseillé un super système de sauvegarde.": "Schnelles und sehr professionelles Eingreifen. Thomas konnte alle meine Daten von meiner beschädigten Festplatte wiederherstellen und hat mir ein tolles Backup-System empfohlen.",
    "Client Récupération de Données": "Datenrettung Kunde",

    // Tutoriels
    "Tutoriels & Snippets": "Tutorials & Snippets",
    "Ma base de connaissances et astuces techniques": "Meine Wissensdatenbank und technische Tipps",
    "Voici quelques mémos techniques, bouts de code et configurations rapides basés sur mon expérience avec mon infrastructure personnelle.": "Hier sind einige technische Notizen, Code-Snippets und schnelle Konfigurationen basierend auf meiner Erfahrung mit meiner persönlichen Infrastruktur.",
    "Le fichier docker-compose parfait pour débuter": "Die perfekte docker-compose Datei für Anfänger",
    "Auto-Healing : Redémarrer un conteneur crashé": "Auto-Healing: Neustart eines abgestürzten Containers",
    "Architecture de la Stack 'Arr'": "Architektur des 'Arr'-Stacks",
    "Pour déployer rapidement n'importe quel conteneur en gardant une trace claire des configurations, j'utilise toujours la structure YAML suivante. Elle intègre les logs rotatifs pour éviter de saturer le disque de la VM.": "Um schnell einen Container bereitzustellen und dabei die Konfigurationen klar im Blick zu behalten, verwende ich immer die folgende YAML-Struktur. Sie integriert rotierende Protokolle, um eine Überlastung der VM-Festplatte zu vermeiden.",
    "Grâce à <strong>n8n</strong> et l'API Docker locale, j'ai créé un workflow qui écoute les alertes webhook de Prometheus. Si un conteneur tombe, n8n lance cette commande via SSH ou Socket :": "Dank <strong>n8n</strong> und der lokalen Docker-API habe ich einen Workflow erstellt, der auf Prometheus-Webhook-Benachrichtigungen hört. Wenn ein Container ausfällt, führt n8n diesen Befehl über SSH oder Socket aus:",
    "Le système m'envoie ensuite un message sur Telegram pour m'avertir de l'incident et de sa résolution automatique.": "Das System sendet mir dann eine Nachricht über Telegram, um mich über den Vorfall und dessen automatische Behebung zu informieren.",
    
    // HTML Translations via data-i18n-html
    "tuto_arr_1": "Der Benutzer stellt eine Anfrage auf <strong>Jellyseerr</strong>.",
    "tuto_arr_2": "Jellyseerr sendet die Anfrage an <strong>Sonarr</strong> (Serien) oder <strong>Radarr</strong> (Filme).",
    "tuto_arr_3": "Radarr fragt die Indexer über <strong>Prowlarr</strong> ab, um die beste Datei zu finden.",
    "tuto_arr_4": "Der Torrent wird zum Herunterladen an <strong>qBittorrent</strong> gesendet.",
    "tuto_arr_5": "Sobald der Vorgang abgeschlossen ist, verschiebt Radarr die Datei sauber in den <strong>MergerFS</strong>-Pool und benennt sie um.",
    "tuto_arr_6": "<strong>Jellyfin</strong> erkennt die neue Datei und fügt sie der Bibliothek hinzu.",

    "Snippets & Astuces": "Snippets & Tipps",
    "Nettoyage Complet Docker": "Vollständige Docker-Bereinigung",
    "Pour faire le ménage en profondeur sur votre serveur Docker et libérer de l'espace disque en supprimant les conteneurs arrêtés, les réseaux inutilisés, les images non attachées et le cache de build.": "Um Ihren Docker-Server gründlich zu bereinigen und Speicherplatz freizugeben, indem gestoppte Container, ungenutzte Netzwerke, ungebundene Images und der Build-Cache entfernt werden.",
    "Mise à jour rapide Ubuntu (Alias)": "Schnelles Ubuntu-Update (Alias)",
    "tuto_alias_1": "Fügen Sie diesen Alias zu Ihrer Datei <code>~/.bashrc</code> hinzu, um alles mit einem einzigen schnellen Befehl zu aktualisieren.",
    "tuto_alias_2": "Nach dem Hinzufügen laden Sie Ihr Terminal mit <code>source ~/.bashrc</code> neu.",
    "Redirection HTTP vers HTTPS (Nginx)": "HTTP zu HTTPS Weiterleitung (Nginx)",
    "Un bloc serveur minimaliste pour forcer toutes les requêtes HTTP (port 80) de tous vos domaines vers leur équivalent HTTPS (port 443).": "Ein minimalistischer Server-Block, um alle HTTP-Anfragen (Port 80) von all Ihren Domains auf ihr HTTPS-Äquivalent (Port 443) umzuleiten.",

    "Vérification...": "Systeme werden überprüft...",
    "Tous les systèmes opérationnels": "Alle Systeme sind betriebsbereit",
    "Incident en cours...": "Vorfall im Gange...",
    "Statut indisponible": "Status nicht verfügbar",
    "Télécharger ma VCard": "Meine VCard herunterladen"
};