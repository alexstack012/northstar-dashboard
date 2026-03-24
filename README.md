# Northstar Workforce Solutions Dashboard

Northstar is a mock staffing and workforce-management dashboard built as a portfolio demo. It simulates the kind of internal tool a recruiting or operations team would use to manage job openings, candidates, account access, and hiring activity across multiple tenants.

The app is designed to feel like a real business application. It includes authenticated routing, role-based admin access, dashboard metrics, CRUD flows for jobs and candidates, user management, password recovery, and a mock API powered by `json-server`.

## What The App Does

- Auth flow with login, logout, forgot-password, session expiry, and browser-session persistence
- Dashboard summary view across jobs, candidates, and users
- Jobs management with create, edit, detail, and delete flows
- Candidate management with create, edit, detail, and delete flows
- Admin-only user management with activate/deactivate support
- Tenant-aware data display for jobs and users
- Mock data layer using `db.json`

## Tech Stack

- Angular 21
- Angular Material
- TypeScript
- RxJS
- SCSS
- `json-server` for the mock API
- `bcryptjs` for demo-side password and security-answer hashing
- Vitest for unit tests

## Running The Project

Install dependencies first:

```bash
npm install
```

Start the mock API in one terminal:

```bash
npx json-server --watch db.json --port 3001
```

Start the Angular frontend in another terminal:

```bash
npm start
```

The app will run at:

- Frontend: `http://localhost:4200`
- Mock API: `http://localhost:3001`

The frontend uses `proxy.conf.json`, so app requests to `/api/*` are forwarded to the local `json-server` instance.

## Useful Commands

Run the development server:

```bash
npm start
```

Build the app:

```bash
npm run build
```

Run unit tests:

```bash
npm test -- --watch=false
```

Watch build output during development:

```bash
npm run watch
```

## Demo Credentials

The seeded mock users in `db.json` can be used for local testing. The current demo password used during development is:

```text
Password123
```

Example accounts:

- `alex@northstar.com` - admin
- `jordan@northstar.com` - recruiter

Note: because this project uses `json-server`, records in `db.json` will change as you create, edit, and delete data during testing.

## How It Was Built

This project started as an Angular app shell and was expanded into a more complete line-of-business demo. The implementation focused on the kinds of workflows that make a portfolio project feel credible:

- route protection and role-based access control
- realistic CRUD slices instead of static pages
- reusable service-based data access
- session handling with expiration
- tenant-aware presentation
- mock auth and recovery flows
- test cleanup and baseline verification

Where a real production app would use a backend and database, this demo uses `json-server` plus local mock persistence to keep setup simple while still showing application structure and product thinking.

## Important Notes

- This is a demo application, not a production-auth system.
- Password hashing is handled in the client for demonstration only.
- In a production system, auth, hashing, validation, and authorization would be enforced server-side.
- `json-server@1.0.0-beta.12` may generate string ids, so the app is built to handle mixed string/number identifiers safely.

## Project Goals

This project is meant to showcase:

- frontend application architecture
- Angular feature organization
- CRUD workflow design
- admin and role-based UX
- dashboard and business-app presentation
- practical polish beyond scaffold-level implementation

## Verification

At the current portfolio-ready state:

- `npm run build` passes
- `npm test -- --watch=false` passes

