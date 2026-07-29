
## Architecture

```text
                        Docker Compose
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
             Build Image            Pull Images
             from Dockerfile         from Registry
                  │                       │
                  ▼                 ┌─────┴─────┐
              Backend              │           │
             Container          PostgreSQL    Redis
             Port: 8000          Container    Container
                                  │             │
                                  ▼             ▼
                               Volume         Volume
                          postgress_data    redis_data
```

Our Compose application contains three services:

```text
backend
postgres
redis
```

Each service runs inside its own container.

---

# 1. Docker Image

A **Docker image** is a read-only template used to create containers.

For example:

```yaml
image: postgres:16
```

Docker uses the `postgres:16` image to create our PostgreSQL container.

Similarly:

```yaml
image: redis:7-alpine
```

uses the Redis image.

If these images are not available locally, Docker automatically pulls them from a container registry.

Think of it as:

```text
Image
  │
  │ docker run
  ▼
Container
```

---

# 2. Docker Container

A **container** is a running instance of an image.

Example:

```yaml
db:
  image: postgres:16
  container_name: postgres
```

Here:

```text
postgres:16
     │
     ▼
   Image
     │
     ▼
postgres container
```

The image contains everything required to run PostgreSQL, while the container is the actual running PostgreSQL process.

---

# 3. Dockerfile

A `Dockerfile` contains instructions for building our **own Docker image**.

For example, our backend might have:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"]
```

The flow is:

```text
Dockerfile
    │
    │ docker build
    ▼
Backend Image
    │
    │ docker run
    ▼
Backend Container
```

A Dockerfile **builds an image**. It does not publish the image automatically.

Publishing to a registry is a separate operation using commands such as:

```bash
docker push
```

---

# 4. Docker Compose

Docker Compose allows us to define and manage **multiple containers** using one YAML file.

Instead of manually starting:

```text
Backend
PostgreSQL
Redis
```

we define all of them inside:

```text
docker-compose.yml
```

and start everything using:

```bash
docker compose up
```

or:

```bash
docker compose up -d
```

`-d` means **detached mode**, so the containers continue running in the background.

---

# 5. Our Docker Compose File

```yaml
name: e-com

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: Backend
    ports:
      - "8000:8000"

  db:
    image: postgres:16
    container_name: postgres
    environment:
      POSTGRES_PASSWORD: postgress
      POSTGRES_USER: postgres
      POSTGRES_DB: first
    volumes:
      - postgress_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: redis
    volumes:
      - redis_data:/data

volumes:
  postgress_data:
  redis_data:
```

---

# 6. `services`

```yaml
services:
```

The `services` section defines the applications/containers that make up our system.

Our project has:

```yaml
services:
  backend:
  db:
  redis:
```

So we have three services.

```text
services
   │
   ├── backend
   ├── db
   └── redis
```

---

# 7. `build`

For the backend we wrote:

```yaml
backend:
  build:
    context: .
    dockerfile: Dockerfile
```

This tells Docker Compose:

> Don't pull a ready-made backend image. Build our backend image using our Dockerfile.

### `context`

```yaml
context: .
```

`.` means the current project directory is used as the build context.

Docker can access files from this context when processing instructions such as:

```dockerfile
COPY . .
```

### `dockerfile`

```yaml
dockerfile: Dockerfile
```

This tells Docker which Dockerfile should be used to build the image.

Flow:

```text
docker compose up
        │
        ▼
backend service
        │
        ▼
build
        │
        ├── context: .
        └── dockerfile: Dockerfile
                    │
                    ▼
              Backend Image
                    │
                    ▼
             Backend Container
```

---

# 8. `image`

PostgreSQL uses:

```yaml
image: postgres:16
```

Redis uses:

```yaml
image: redis:7-alpine
```

Unlike our backend, we don't need to create Dockerfiles for these services.

Their images already exist.

```text
Backend
Dockerfile → Build image

PostgreSQL
postgres:16 → Existing image

Redis
redis:7-alpine → Existing image
```

---

# 9. `container_name`

Example:

```yaml
container_name: postgres
```

This gives the running container a custom name.

We can then easily use commands such as:

```bash
docker logs postgres
```

or:

```bash
docker exec -it postgres bash
```

---

# 10. Port Mapping

Our backend contains:

```yaml
ports:
  - "8000:8000"
```

The format is:

```text
HOST_PORT : CONTAINER_PORT
```

Therefore:

```text
Our Computer              Docker Container

localhost:8000 ──────────► Backend:8000
```

When we visit:

```text
localhost:8000
```

Docker forwards the request to port `8000` inside the backend container.

---

# 11. Why PostgreSQL Doesn't Need a Published Port

Our current PostgreSQL service doesn't have:

```yaml
ports:
  - "5432:5432"
```

That's okay if only the backend container needs to communicate with PostgreSQL.

Docker Compose creates a network automatically.

The backend can communicate with PostgreSQL using its **service name**:

```text
db
```

For example:

```ts
const client = new Client({
  host: "db",
  port: 5432,
  user: "postgres",
  password: "postgress",
  database: "first",
});
```

The important difference is:

```text
Backend running on host machine
        ↓
localhost + published port

Backend running inside Compose
        ↓
service name + container port
```

So container-to-container communication can use:

```text
db:5432
redis:6379
```

without publishing those database ports to the host.

---

# 12. Docker Compose Networking

Docker Compose automatically creates a network for the project.

Conceptually:

```text
             Docker Network
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
   backend       db         redis
      │           │           │
      │           │           │
      ├── db:5432 ───────────►│ PostgreSQL
      │
      └── redis:6379 ─────────► Redis
```

Containers can discover each other using their **service names**.

Therefore, inside the backend container:

```text
localhost ❌ PostgreSQL
db        ✅ PostgreSQL

localhost ❌ Redis
redis     ✅ Redis
```

This is because `localhost` inside the backend container means:

```text
"this backend container"
```

not another container.

---

# 13. Environment Variables

PostgreSQL uses:

```yaml
environment:
  POSTGRES_PASSWORD: postgress
  POSTGRES_USER: postgres
  POSTGRES_DB: first
```

These variables configure PostgreSQL when its data directory is initialized.

They define things such as:

```text
Username → postgres
Password → postgress
Database → first
```

For learning, putting these values directly in Compose is okay.

For real projects, sensitive values should normally come from environment configuration such as `.env` and should not be committed to a public Git repository.

Example:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=first
```

Then:

```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  POSTGRES_DB: ${POSTGRES_DB}
```

---

# 14. Docker Volumes

Containers are disposable.

If a container is deleted, data stored only in the container's writable layer can disappear with it.

For databases, we usually want the data to survive container recreation.

That's why we use **volumes**.

PostgreSQL:

```yaml
volumes:
  - postgress_data:/var/lib/postgresql/data
```

Redis:

```yaml
volumes:
  - redis_data:/data
```

And at the bottom:

```yaml
volumes:
  postgress_data:
  redis_data:
```

These are **named volumes** managed by Docker.

---

# 15. PostgreSQL Volume

```yaml
- postgress_data:/var/lib/postgresql/data
```

Means:

```text
Docker Volume
postgress_data
      │
      ▼
/var/lib/postgresql/data
      │
      ▼
PostgreSQL Container
```

PostgreSQL stores its database files at:

```text
/var/lib/postgresql/data
```

Docker stores those files in the named volume.

Therefore, recreating the PostgreSQL container does not necessarily mean losing the database.

---

# 16. Redis Volume

```yaml
- redis_data:/data
```

Conceptually:

```text
redis_data
    │
    ▼
 /data
    │
    ▼
Redis Container
```

A volume gives Redis a persistent storage location. Actual Redis persistence also depends on Redis's persistence configuration.

---

# 17. `depends_on`

We can write:

```yaml
backend:
  depends_on:
    - db
    - redis
```

This expresses startup dependencies between services.

For example:

```text
db ─────┐
        ├──► backend
redis ──┘
```

However, an important concept is:

> `depends_on` controls startup ordering, but basic `depends_on` does not guarantee that PostgreSQL or Redis is fully ready to accept connections.

For stronger readiness handling, applications commonly use health checks and/or connection retry logic.

Also, Redis normally does **not** depend on PostgreSQL:

```yaml
redis:
  depends_on:
    - db
```

is unnecessary unless your particular architecture has some unusual reason for it.

Usually:

```text
Backend
 ├── depends on PostgreSQL
 └── depends on Redis
```

rather than:

```text
Redis → PostgreSQL
```

---

# 18. `docker compose up`

When we run:

```bash
docker compose up
```

Docker Compose roughly performs:

```text
Read docker-compose.yml
          │
          ▼
Understand services
          │
    ┌─────┼───────────┐
    ▼     ▼           ▼
 backend  db         redis
    │     │            │
    ▼     ▼            ▼
 build   pull         pull
 image   image        image
    │     │            │
    ▼     ▼            ▼
container container  container
    │     │            │
    └─────┼────────────┘
          ▼
     Docker Network
          │
          ▼
   Attach volumes
          │
          ▼
   Start containers
```

---

# 19. Useful Docker Compose Commands

Start services:

```bash
docker compose up
```

Start in background:

```bash
docker compose up -d
```

Build/rebuild images and start:

```bash
docker compose up --build
```

Check services:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs
```

Follow logs:

```bash
docker compose logs -f
```

Stop and remove containers/network:

```bash
docker compose down
```

Stop containers without removing them:

```bash
docker compose stop
```

Start stopped containers:

```bash
docker compose start
```

List Docker volumes:

```bash
docker volume ls
```

---

# 20. `docker compose down` and Volumes

Running:

```bash
docker compose down
```

removes Compose containers and the Compose network, but named volumes are normally preserved.

Therefore:

```text
docker compose down
        │
        ├── Containers ❌ removed
        ├── Network    ❌ removed
        │
        └── Volumes    ✅ preserved
```

If we intentionally want to remove the volumes too:

```bash
docker compose down -v
```

Then database data stored in those volumes can be deleted.

Be careful with this command.

---

# 21. Dockerfile vs Docker Compose

This was one of the most important concepts learned.

### Dockerfile

Used to define **how to build an image**.

```text
Dockerfile
    ↓
docker build
    ↓
Image
    ↓
Container
```

### Docker Compose

Used to define and manage **multiple services/containers**.

```text
docker-compose.yml
        │
        ├── Backend
        ├── PostgreSQL
        └── Redis
```

So:

```text
Dockerfile      → How do I build my application image?

Docker Compose  → How do all my application's services run together?
```

---

# 22. Image vs Container vs Volume

```text
IMAGE
  │
  │ Creates
  ▼
CONTAINER
  │
  │ Reads/Writes persistent data
  ▼
VOLUME
```

### Image

Blueprint/template for creating containers.

### Container

Running instance of an image.

### Volume

Persistent storage managed by Docker.

---

# 23. Complete Architecture

Our final learning architecture looks like:

```text
                         User / Browser
                              │
                              │ localhost:8000
                              ▼
                    ┌──────────────────┐
                    │     Backend      │
                    │    Container     │
                    │      :8000       │
                    └────────┬─────────┘
                             │
                       Docker Network
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
          ┌──────────────┐        ┌──────────────┐
          │  PostgreSQL  │        │    Redis     │
          │  Container   │        │  Container   │
          │    :5432     │        │    :6379     │
          └──────┬───────┘        └──────┬───────┘
                 │                       │
                 ▼                       ▼
         postgress_data              redis_data
             Volume                    Volume
```

The backend connects internally using:

```text
PostgreSQL → db:5432
Redis      → redis:6379
```

The browser connects to the backend through:

```text
localhost:8000
```

---

# 24. What I Learned

Through this project I learned:


Dockerfile
    │
    ▼
Build our Backend Image
    │
    ▼
Backend Container
    │
    │
    ├──────── Docker Network ────────┐
    │                                │
    ▼                                ▼
PostgreSQL                        Redis
    │                                │
    ▼                                ▼
Volume                           Volume
```

**Dockerfile builds the application image.**

**Docker Compose connects and manages all the services required by the application.**

**Volumes keep important data persistent.**

**Docker networking allows containers to communicate with each other using service names.**
