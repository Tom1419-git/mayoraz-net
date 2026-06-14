# -*- coding: utf-8 -*-
import re
import codecs
import os

translations = {
    "Intervention rapide et très professionnelle. Thomas a réussi à récupérer toutes mes données sur mon disque dur endommagé et m'a conseillé un super système de sauvegarde.": "Fast and very professional intervention. Thomas managed to recover all my data on my damaged hard drive and advised me on a great backup system.",
    "Intervention rapide pour un dépannage sur mon ordinateur de travail qui refusait de démarrer. Réparation efficace et super conseils.": "Quick intervention for troubleshooting my work computer that refused to start. Efficient repair and great advice.",
    "Travail très professionnel ! Thomas a monté mon PC gaming avec un câblage impeccable. Tout tourne à merveille, je recommande vivement.": "Very professional work! Thomas built my gaming PC with flawless cable management. Everything runs perfectly, I highly recommend.",
    "À votre disposition pour tous vos besoins informatiques": "At your disposal for all your IT needs",
    "(Films).": "(Movies).",
    "(Séries) ou": "(Series) or",
    "(outil d'automatisation de workflows). Si Prometheus détecte qu'un conteneur crash ou consomme trop de RAM, n8n est capable de redémarrer automatiquement le service défaillant et de m'envoyer une notification.": "(workflow automation tool). If Prometheus detects that a container crashes or consumes too much RAM, n8n is able to automatically restart the failing service and send me a notification.",
    ", de le transmettre au client": ", to transmit it to the client",
    ", et enfin de l'organiser proprement pour le serveur de streaming": ", and finally to organize it cleanly for the streaming server",
    ", je peux accéder à toute mon infrastructure depuis mon téléphone en 4G, de manière totalement sécurisée et cryptée avec Wireguard sous le capot.": ", I can access my entire infrastructure from my phone on 4G, completely securely and encrypted with Wireguard under the hood.",
    ". En l'installant sur ma VM Ubuntu et en l'activant en tant que": ". By installing it on my Ubuntu VM and activating it as a",
    ". J'ai fait le choix d'isoler chaque service dans des conteneurs": ". I made the choice to isolate each service in containers",
    "Afin de m'assurer que le serveur n'est jamais surchargé, j'utilise": "To ensure the server is never overloaded, I use",
    "Appuyez sur": "Press",
    "Architecture Média Automatisée": "Automated Media Architecture",
    "Architecture de la Stack \"Arr\"": "\"Arr\" Stack Architecture",
    "Au lieu d'ouvrir les ports de mon routeur à internet (et risquer des attaques), j'utilise": "Instead of opening my router ports to the internet (and risking attacks), I use",
    "Auto-Healing": "Auto-Healing",
    "Auto-Healing : Redémarrer un conteneur crashé": "Auto-Healing : Restart a crashed container",
    "Cloudflare Tunnels": "Cloudflare Tunnels",
    "Dernière vérification: Il y a quelques secondes": "Last check: A few seconds ago",
    "Docker": "Docker",
    "Docker Compose": "Docker Compose",
    "Docker Engine": "Docker Engine",
    "Détails Techniques": "Technical Details",
    "En tant que passionné par l'administration système et réseau, j'héberge et je maintiens ma propre infrastructure à domicile. Ce": "As a system and network administration enthusiast, I host and maintain my own home infrastructure. This",
    "Espace": "Space",
    "Essayez cette commande dans votre terminal :": "Try this command in your terminal:",
    "Gateway Principale": "Main Gateway",
    "Grafana": "Grafana",
    "Grâce à": "Thanks to",
    "Homelab": "Homelab",
    "Infrastructure Personnelle & Automatisation": "Personal Infrastructure & Automation",
    "J'ai déployé la fameuse stack \"Arr\". Les requêtes sont faites via": "I deployed the famous \"Arr\" stack. Requests are made via",
    "Jellyfin": "Jellyfin",
    "Jellyseerr": "Jellyseerr",
    "Jellyseerr (Requêtes)": "Jellyseerr (Requests)",
    "Jellyseerr envoie la requête à": "Jellyseerr sends the request to",
    "L'ensemble de mon infrastructure repose sur une machine virtuelle": "My entire infrastructure relies on a virtual machine",
    "L'utilisateur fait une demande sur": "The user makes a request on",
    "La stack d'automatisation multimédia peut être complexe à relier. Voici le sens des flux :": "The multimedia automation stack can be complex to connect. Here is the flow direction:",
    "Lancer le script": "Run script",
    "Le fichier docker-compose parfait pour débuter": "The perfect docker-compose file to start",
    "Le fichier est envoyé à": "The file is sent to",
    "Le serveur a crashé !": "The server has crashed!",
    "Le système m'envoie ensuite un message sur Telegram pour m'avertir de l'incident et de sa résolution automatique.": "The system then sends me a Telegram message to warn me of the incident and its automatic resolution.",
    "Lent": "Slow",
    "Ma petite base de connaissances technique": "My little technical knowledge base",
    "Media": "Media",
    "Mission : Maintenir le serveur en ligne !": "Mission: Keep the server online!",
    "Mon Homelab": "My Homelab",
    "Mon infrastructure personnelle : Serveur Ubuntu, conteneurs Docker, automatisation média et monitoring avec Grafana.": "My personal infrastructure: Ubuntu Server, Docker containers, media automation, and monitoring with Grafana.",
    "Netdata": "Netdata",
    "Netdata Host Metrics": "Netdata Host Metrics",
    "Nginx Proxy Manager": "Nginx Proxy Manager",
    "Normal": "Normal",
    "Pi-hole DNS & AdBlock": "Pi-hole DNS & AdBlock",
    "Pour aller plus loin qu'un simple monitoring, j'utilise": "To go further than simple monitoring, I use",
    "Pour déployer rapidement n'importe quel conteneur en gardant une trace claire des configurations, j'utilise toujours la structure YAML suivante. Elle intègre les logs rotatifs pour éviter de saturer le disque de la VM.": "To quickly deploy any container while keeping a clear trace of configurations, I always use the following YAML structure. It includes log rotation to avoid saturating the VM disk.",
    "Prometheus": "Prometheus",
    "Prowlarr": "Prowlarr",
    "Prêt à courir ?": "Ready to run?",
    "Quiz Informatique": "IT Quiz",
    "Radarr": "Radarr",
    "Radarr/Sonarr": "Radarr/Sonarr",
    "Rapide": "Fast",
    "Reboot Server": "Reboot Server",
    "Record:": "Record:",
    "Score final :": "Final score:",
    "Score:": "Score:",
    "Sonarr": "Sonarr",
    "Sonarr/Radarr interrogent": "Sonarr/Radarr interrogate",
    "Stack \"Arr\" (Radarr, Sonarr...)": "\"Arr\" Stack (Radarr, Sonarr...)",
    "Subnet Router": "Subnet Router",
    "Surveillance en temps réel de l'infrastructure": "Real-time infrastructure monitoring",
    "Sécuriser son accès avec Tailscale": "Secure access with Tailscale",
    "Tailscale": "Tailscale",
    "Tailscale VPN (Subnet Router)": "Tailscale VPN (Subnet Router)",
    "Testez vos connaissances en IT avec ce quiz interactif. Défiez le classement quotidien !": "Test your IT knowledge with this interactive quiz. Challenge the daily leaderboard!",
    "Thomas Mayoraz |": "Thomas Mayoraz |",
    "Tous les systèmes sont opérationnels": "All systems operational",
    "Tout mon environnement tourne de manière optimisée et isolée, me permettant d'explorer les technologies d'entreprise comme la conteneurisation, le monitoring avancé et l'automatisation de processus.": "My whole environment runs in an optimized and isolated way, allowing me to explore enterprise technologies like containerization, advanced monitoring, and process automation.",
    "Tutoriels & Astuces": "Tutorials & Tips",
    "Ubuntu Server": "Ubuntu Server",
    "Ubuntu Server VM (Host)": "Ubuntu Server VM (Host)",
    "Un mini-jeu SysAdmin : évitez les pannes réseau et maintenez le serveur en ligne !": "A SysAdmin mini-game: avoid network outages and keep the server online!",
    "Une fois téléchargé, Radarr renomme et déplace le fichier vers le dossier final.": "Once downloaded, Radarr renames and moves the file to the final folder.",
    "Voici quelques mémos techniques et configurations rapides basés sur mon expérience avec mon infrastructure personnelle.": "Here are some technical memos and quick configurations based on my experience with my personal infrastructure.",
    "Webhooks": "Webhooks",
    "afin de garantir la stabilité, la sécurité et faciliter les mises à jour et les sauvegardes.": "to ensure stability, security, and facilitate updates and backups.",
    "complète le tout pour le monitoring natif de la VM.": "completes everything for native VM monitoring.",
    "curl --unix-socket /var/run/docker.sock -X POST http://localhost/containers/{container_id}/restart": "curl --unix-socket /var/run/docker.sock -X POST http://localhost/containers/{container_id}/restart",
    "curl https://mayoraz-net.ch/api/cv.json": "curl https://mayoraz-net.ch/api/cv.json",
    "est mon laboratoire d'apprentissage continu.": "is my continuous learning laboratory.",
    "et l'API Docker locale, j'ai créé un workflow qui écoute les alertes webhook de Prometheus. Si un conteneur tombe, n8n lance cette commande via SSH ou Socket :": "and the local Docker API, I created a workflow that listens to Prometheus webhook alerts. If a container goes down, n8n runs this command via SSH or Socket:",
    "n8n": "n8n",
    "n8n Automation Engine": "n8n Automation Engine",
    "ou touchez l'écran pour sauter.": "or touch the screen to jump.",
    "pour collecter les métriques matérielles et applicatives, et": "to collect hardware and application metrics, and",
    "pour trouver les sources via les indexers.": "to find sources via indexers."
}

file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media', 'js', 'lang.js')

with codecs.open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'const frToEn\s*=\s*{(.*?)};', content, re.DOTALL)
if match:
    dict_content = match.group(1)
    
    existing_keys = []
    for line in dict_content.split('\n'):
        if ':' in line:
            k = re.search(r'["\'](.*?)["\']\s*:', line)
            if k:
                existing_keys.append(k.group(1))
    
    new_entries = []
    for k, v in translations.items():
        if k not in existing_keys:
            k_esc = k.replace('"', '\\"')
            v_esc = v.replace('"', '\\"')
            new_entries.append(f'    "{k_esc}": "{v_esc}"')
            
    if new_entries:
        insertion_idx = match.end(1)
        last_char_idx = insertion_idx - 1
        while content[last_char_idx].isspace():
            last_char_idx -= 1
            
        new_text = ",\n" + ",\n".join(new_entries) + "\n"
        new_content = content[:insertion_idx] + new_text + content[insertion_idx:]
        
        with codecs.open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Updated lang.js successfully with", len(new_entries), "new translations.")
    else:
        print("No new translations to add.")
