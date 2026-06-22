La stack d'automatisation multimédia peut être complexe à relier. Voici le sens des flux :

1. L'utilisateur fait une demande sur **Jellyseerr**.
2. Jellyseerr envoie la requête à **Sonarr** (Séries) ou **Radarr** (Films).
3. Radarr interroge les indexers via **Prowlarr** pour trouver le meilleur fichier.
4. Le lien magnet est envoyé à **qBittorrent**.
5. Une fois téléchargé, Radarr déplace et renomme le fichier dans le dossier final.
6. **Jellyfin** détecte le nouveau fichier, télécharge les métadonnées et le rend disponible pour le streaming.

> **Astuce** : Pensez à utiliser des "Hardlinks" dans Radarr pour éviter de dupliquer l'espace disque entre les torrents en cours de seed et votre bibliothèque média !