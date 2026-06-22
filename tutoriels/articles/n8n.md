Grâce à **n8n** et l'API Docker locale, j'ai créé un workflow qui écoute les alertes webhook de Prometheus. Si un conteneur tombe, n8n lance cette commande via SSH ou Socket :

```bash
curl --unix-socket /var/run/docker.sock -X POST http://localhost/containers/{container_id}/restart
```

Le système m'envoie ensuite un message sur Telegram pour m'avertir de l'incident et de sa résolution automatique.
