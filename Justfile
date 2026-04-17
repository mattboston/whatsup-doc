image := "ghcr.io/mattboston/whatsup-doc"
version := `git describe --tags --always --dirty 2>/dev/null || echo "dev"`

# list available recipes
default:
    @just --list

# --- Local Dev ---

# build the React frontend bundle
build-frontend:
    bun run build

# run Bun dev server locally with hot-reload
dev: build-frontend
    bun run dev

# --- Docker Compose ---

# build image and start the container
up: build
    docker compose up -d

# stop the container
down:
    docker compose down

# rebuild image and restart
restart: build
    docker compose down
    docker compose up -d

# tail container logs
logs:
    docker compose logs -f

# show container status
ps:
    docker compose ps

# --- Image Build & Publish ---

# build the Docker image with version tag (for pushing)
build:
    docker build --build-arg VERSION={{version}} -t {{image}}:{{version}} -t {{image}}:latest .

# push image to DockerHub
push: build
    docker push {{image}}:{{version}}
    docker push {{image}}:latest

# build and push in one step
release: push
