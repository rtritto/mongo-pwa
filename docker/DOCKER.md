## Docker Build
### Build Docker Image

```sh
docker build -t=mongo-pwa -f docker/Dockerfile.local .
```

## Docker Compose
### Start Docker Compose: MongoDB + Mongo-PWA
```sh
cd docker && docker compose up
OR
docker compose -f docker/docker-compose.yml up
```

### Start Docker Compose: Mongo-PWA
```sh
cd docker && docker compose -f docker-compose.single.yml up
OR
docker compose -f docker/docker-compose.single.yml up
```

## Settings
### Set the Port of Mongo-PWA App and EXPOSE in Dockerfile
At the build of Dockefile, change the **port** (default is _3000_):
```sh
docker build -t=mongo-pwa -f docker/Dockerfile.local --build-arg PORT=8081 .
```
