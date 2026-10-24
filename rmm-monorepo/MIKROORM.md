# MikroORM and database commands

Run commands from the rmm-monorepo root. The scripts below are defined in the root package.json and delegate to packages/database. The ORM configuration is packages/database/src/mikro-orm.config.ts; it loads the database environment from the monorepo-root .env and connects to PostgreSQL at 127.0.0.1:DB_PORT.

## First-time setup

~~~bash
cp .env.sample .env
# Set DB_USERNAME, DB_PASSWORD, DB_NAME, and DB_PORT in .env.
docker compose up -d postgres_db
pnpm install
pnpm migration:run
~~~

The checked-in migrations live in packages/database/src/migrations. migration:run applies pending migrations; migration:show prints migration status. Verify the PostgreSQL container is running before either command.

## Migration workflow

~~~bash
# Run the root migration:create wrapper (MikroORM migration:create)
pnpm migration:create

# Run the root migration:generate wrapper (migration:create --schema)
pnpm migration:generate

# See which migrations have run
pnpm migration:show

# Apply all pending migrations
pnpm migration:run

# Revert the most recently applied migration
pnpm migration:revert
~~~

Review and test a generated migration before applying it to shared or production data. migration:revert runs a down migration; it does not restore data removed by a migration.

## Direct schema and seed commands

~~~bash
# Print the schema-update SQL without applying it
pnpm schema:log

# Apply schema changes directly (development only; bypasses migration history)
pnpm schema:sync

# Destructive: drops application tables and the migration history table
pnpm schema:drop

# Run configured MikroORM seeders, if present
pnpm seeds
~~~

Prefer migrations for schema changes that must be repeatable across environments. schema:sync is convenient for a disposable local database but does not create a migration file. schema:drop destroys database contents; recreate the schema by running migrations afterward.

The database package also exposes pnpm --filter @repo/database db:push, db:drop, migration:create, migration:up, and migration:down. db:push is a direct schema update; db:drop is destructive. Root-level scripts above are the recommended shortcuts.

## Connection check

~~~bash
pnpm --filter @repo/database test:db
~~~

Read the command's printed result and confirm it says CONNECTION SUCCESSFUL. The current test script catches connection errors and prints them, so do not rely on the process exit code alone.
