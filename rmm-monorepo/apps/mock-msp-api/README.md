# RMM Mock MSP Manager API

A NestJS companion service for local and integration testing. It stores deterministic Faker-generated MSP-shaped records in SQLite and exposes the nine resource collections used by RMM. Resource properties and types follow the MSP Manager OData Swagger models. Auth credentials and generated API keys are stored separately from the fake Users resource.

## Run locally

Use Node.js 24 or newer. Copy .env.sample to .env, replace the bootstrap password with a unique password of at least 12 characters, then run pnpm install and pnpm --filter mock-msp-api dev from the monorepo root. The service listens on port 3002 by default; Swagger UI is at /docs and OData resources are under /odata.

The first launch creates the administrator from BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD. After that, changing those environment variables does not reset the account password. SQLite data is written to data/msp-mock.sqlite and persists across restarts; delete that file to regenerate the Faker dataset and bootstrap a fresh administrator.

## Authentication

POST /auth/login accepts email and password. It returns one generated apiKey; send it in the X-API-Key header for every OData resource and protected auth request. The raw key is shown only in the login or password-rotation response; the database stores its SHA-256 digest. Keys expire after API_KEY_TTL_DAYS (30 by default).

PATCH /auth/password accepts currentPassword and newPassword. It revokes the account's existing keys and returns a replacement key. Administrator keys can GET /auth/users, POST /auth/users with email, password, and optional role, and DELETE /auth/users/:id. Account responses never include password hashes. Login is the bootstrap exception because a key does not exist until credentials are verified.

## Resource routes

Authenticated GET /odata/Users, /odata/Tickets, /odata/Company, /odata/Contacts, /odata/Customers, /odata/IssueTypes, /odata/Locations, /odata/ServiceItems, and /odata/TicketCustomStatuses are supported. Collection responses use the OData value envelope. The company route returns its single Company model. OData $top, $skip, $orderby, $filter (one eq/ne clause), $select, and $count=true are supported. Only tickets accept POST, PATCH, and DELETE; this mirrors operations needed by the current RMM ticket service.

Ticket creation accepts MSP Manager TicketCUDDto fields in PascalCase or camelCase. It validates referenced service, contact, location, and issue-type IDs, assigns a ticket number, and persists a complete Ticket model. The fake dataset creates companies, customers, locations, contacts, users, issue types, service items, custom statuses, and tickets. Auth accounts are separate from OData Users.

## Point RMM at the mock service

Set the existing backend environment variables to HELP_DESK_URL=http://localhost:3002/odata/ and HELP_DESK_API_KEY to the apiKey from POST /auth/login. The RMM sync readers accept either PascalCase or camelCase response fields while the mock responses keep the Swagger model's camelCase names.

This fixture contains synthetic data only; do not use it as a production MSP Manager replacement.
