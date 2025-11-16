### Build Docker Image

```sh
docker build -t=mongo-pwa -f docker/Dockerfile.local .
```

### Compose Up → MongoDB + MongoPWA
```sh
cd docker && docker compose up
OR
docker compose -f docker/docker-compose.yml up
```

### Compose Up → MongoPWA
```sh
cd docker && docker compose -f docker-compose.single.yml up
OR
docker compose -f docker/docker-compose.single.yml up
```
