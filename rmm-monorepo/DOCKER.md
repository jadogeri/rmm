# Docker development database

The current docker-compose.yml starts PostgreSQL only. The NestJS backend and the mock MSP API are run as local Node processes; they are not Docker services in this Compose file.

## Prerequisites and environment

Run these commands from rmm-monorepo, the directory containing package.json and docker-compose.yml. Use Node.js 24 or newer and the pnpm version declared by the repository. Copy .env.sample to .env and set DB_USERNAME, DB_PASSWORD, DB_NAME, and DB_PORT before starting Compose. Do not commit the local .env file.

~~~bash
cp .env.sample .env
# Edit .env and replace all placeholder values.
docker compose config
docker compose up -d postgres_db
docker compose ps
~~~

The database listens on container port 5432 and is published to 127.0.0.1 at DB_PORT. The backend's MikroORM configuration connects to 127.0.0.1 using DB_PORT, so this setup is intended for running the backend on the host.

## Common commands

~~~bash
# Start PostgreSQL in the background
docker compose up -d postgres_db

# Follow database logs
docker compose logs -f postgres_db

# Stop the container but keep the named pgdata volume
docker compose stop postgres_db

# Remove Compose containers and network; the named volume remains
docker compose down

# Destructive: also removes pgdata and all persisted PostgreSQL data
docker compose down --volumes
~~~

The repository wrappers are pnpm docker:dev (runs docker-compose up in the foreground) and pnpm docker:stop (runs docker-compose down). The wrapper docker:redis references a Redis service that is not present in the current Compose file. The docker:prod wrapper references docker-compose.prod.yml, which is not present in this repository snapshot. The docker:truncate wrapper runs Docker builder and system cleanup; it is not required to start the database.

## Run the backend against PostgreSQL

In another terminal, copy apps/backend/.sample.env to apps/backend/.env and set NEST_API_PORT and NODE_ENV. Set the database values in the monorepo-root .env. Apply migrations using the steps in MIKROORM.md, then start the API:

~~~bash
cp apps/backend/.sample.env apps/backend/.env
pnpm --filter backend start:dev
~~~

The backend listens on port 3001 by default. To shut down the database, use docker compose down; avoid --volumes unless you intentionally want to erase the local database.
