# My App

A simple Node.js app, containerized using Docker.

## Tech Stack
- Node.js 20.17.0 (Alpine base image)
- Docker

## Project Structure
```
.
├── Dockerfile
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites
- [Docker](https://www.docker.com/) installed on your machine

## Getting Started

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Build the Docker image
```bash
docker build -t my-app .
```
This reads the `Dockerfile` in the current directory and builds an image named `my-app`.

### 3. Run the container
```bash
docker run -p 6000:6000 my-app
```
This maps port `6000` on your machine to port `6000` inside the container (as declared in the Dockerfile's `EXPOSE 6000`).

### 4. Check it's running
```bash
docker ps
```
Visit `http://localhost:6000` in your browser or test with curl:
```bash
curl http://localhost:6000
```

## Useful Docker Commands

| Command | Description |
|---------|--------------|
| `docker build -t my-app .` | Build the image from the Dockerfile |
| `docker images` | List all locally built images |
| `docker run -p 6000:6000 my-app` | Run a container from the image |
| `docker ps` | List running containers |
| `docker exec -it <container_id> sh` | Open a shell inside the running container |
| `docker stop <container_id>` | Stop a running container |

## Dockerfile Overview

```dockerfile
FROM node:20.17.0-alpine3.19
WORKDIR /home/app
COPY package.json /home/app/package.json
COPY package-lock.json /home/app/package-lock.json
RUN npm install
EXPOSE 6000
COPY index.js index.js
CMD [ "npm","start" ]
```

- Uses a lightweight Node.js Alpine image as the base
- Copies dependency files first and installs them (for faster rebuilds via Docker layer caching)
- Copies the app code afterward
- Starts the app using `npm start` when the container runs

## Notes
- Since this image is Alpine based, it uses `apk` instead of `apt` for package management (not needed for this project since Node.js is already included).
- Make sure your `package.json` has a `start` script defined, e.g.:
```json
"scripts": {
  "start": "node index.js"
}
```
