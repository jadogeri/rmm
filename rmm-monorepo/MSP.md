# Run the mock MSP Manager API

The mock MSP app is apps/mock-msp-api. It is a separate NestJS service with Faker-generated OData-shaped data stored in SQLite; it does not use the backend's PostgreSQL database. Run these commands from the rmm-monorepo root with Node.js 24 or newer.

## Start the mock API

~~~bash
pnpm install
cp apps/mock-msp-api/.env.sample apps/mock-msp-api/.env
~~~

Edit apps/mock-msp-api/.env. Replace BOOTSTRAP_ADMIN_PASSWORD with a unique password of at least 12 characters before first launch. The first run creates the administrator account and seeds the nine OData resources. The SQLite database is stored under apps/mock-msp-api/data by default and persists across restarts.

~~~bash
pnpm --filter mock-msp-api dev
~~~

The API listens on http://localhost:3002. Swagger UI is at http://localhost:3002/docs. For a production-style local build, run pnpm --filter mock-msp-api build followed by pnpm --filter mock-msp-api start.

## Log in and use the API key

POST /auth/login with the bootstrap email and password. The response includes apiKey; keep it private and send it as X-API-Key on every protected request. Login is the exception because it creates the initial key. Resource and admin endpoints reject missing or invalid keys.

~~~bash
curl -sS -X POST http://localhost:3002/auth/login \
  -H 'Content-Type: application/json' \
  --data '{"email":"admin@example.test","password":"<the password set in the local .env>"}'

curl -sS 'http://localhost:3002/odata/Customers?$top=5' \
  -H 'X-API-Key: <apiKey returned by login>'
~~~

The available resources are Users, Tickets, Company, Contacts, Customers, IssueTypes, Locations, ServiceItems, and TicketCustomStatuses. Collections use the OData value envelope; Company returns one Company object. Ticket creation accepts PascalCase or camelCase fields and validates service, contact, location, and issue-type IDs. Auth-user management is under /auth/users; password changes use PATCH /auth/password and revoke prior keys.

## Connect the RMM backend

Copy apps/backend/.sample.env to apps/backend/.env. Set HELP_DESK_URL to http://localhost:3002/odata/ and HELP_DESK_API_KEY to the key returned by login. Keep the key in the local ignored .env file, not in source control or frontend code. The separate database settings belong in the monorepo-root .env; see DOCKER.md and MIKROORM.md.

~~~bash
# Terminal 1: start PostgreSQL and apply the backend migrations
docker compose up -d postgres_db
pnpm migration:run

# Terminal 2: run the backend
pnpm --filter backend start:dev

# Terminal 3: run the Next.js frontend
pnpm --filter frontend dev
~~~

The backend listens on port 3001 by default and the frontend on port 3000. If needed, set RMM_API_URL=http://localhost:3001 in apps/frontend/.env.local. The Compose file starts only PostgreSQL; the mock MSP API, backend, and frontend run as local processes.

## Data and reset behavior

The mock API's database is independent of PostgreSQL. To regenerate fake data and create a fresh bootstrap administrator, stop the app and remove apps/mock-msp-api/data/msp-mock.sqlite (and its -shm/-wal sidecars if present), then start it again with the desired local .env settings. This deletes only the mock API's local accounts, keys, tickets, and fake records. No real MSP Manager account is contacted by this service.
