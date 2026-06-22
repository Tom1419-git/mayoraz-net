Pour déployer rapidement n'importe quel conteneur en gardant une trace claire des configurations, j'utilise toujours la structure YAML suivante. Elle intègre les logs rotatifs pour éviter de saturer le disque de la VM.

```yaml
version: "3.8"
services:
  app:
    image: nginx:latest
    container_name: web_app
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./data:/usr/share/nginx/html
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```