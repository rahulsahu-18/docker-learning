# Docker Storage

This repository contains my notes and hands-on practice for Docker storage concepts.

## Topics Covered

* Bind Mounts
* Named Volumes
* Volume Persistence
* Creating & Managing Volumes
* Reading/Writing Data in Volumes
* Bind Mount vs Named Volume
* Common PowerShell Commands
* Best Practices

## Commands Practiced

```bash
docker volume create <volume-name>
docker volume ls
docker volume inspect <volume-name>
docker volume rm <volume-name>

docker run -it -v <volume-name>:/path/in/container ubuntu
```

## What I Learned

* Containers are ephemeral by default.
* Bind mounts share a host directory with a container.
* Named volumes are managed by Docker and preserve data after container removal.
* Docker automatically creates a named volume if it doesn't exist.
* Multiple containers can use the same named volume.
* Docker Desktop allows inspecting and managing named volumes.
