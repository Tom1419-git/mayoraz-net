La stack d'automatisation multimédia peut être complexe à relier. Voici le sens des flux :

1. L'utilisateur fait une demande sur **Jellyseerr**.
2. Jellyseerr envoie la requête à **Sonarr** (Séries) ou **Radarr** (Films).
3. Radarr interroge les indexers via **Prowlarr** pour trouver le meilleur fichier.
4. Le torrent est envoyé à **qBittorrent** pour téléchargement.
5. Une fois terminé, Radarr déplace et renomme le fichier proprement dans le pool **MergerFS**.
6. **Jellyfin** détecte le nouveau fichier et l'ajoute à la bibliothèque.