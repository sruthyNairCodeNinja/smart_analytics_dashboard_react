# Smart Factory Analytics Dashboard

A MERN-stack dashboard for monitoring simulated factory equipment: live machine
status, throughput/temperature/vibration trends, and an alerts feed for
threshold breaches and downtime — with JWT auth and admin/viewer roles.

## Stack

- **MongoDB** + **Mongoose** — machines, sensor readings, alerts, users
- **Express** — REST API, JWT auth, role-based authorization
- **React** (Vite) + **Tailwind CSS** + **Recharts** — dashboard UI
- A backend **simulation engine** generates a new sensor reading per machine
  on an interval (default every 5s), occasionally producing threshold
  breaches, downtime events, and defect spikes that surface as alerts. No
  real hardware or IoT gateway required — the frontend polls the API to stay
  near-live.

## Project structure

```
server/            Express API (+ Dockerfile)
  src/
    config/        MongoDB connection
    models/        User, Machine, Reading, Alert (Mongoose schemas)
    controllers/    Route handlers
    routes/         Express routers
    middleware/     JWT auth (protect/authorize), error handler
    services/       simulationService.js — the telemetry generator
    seed.js         Creates an admin user + starter machines
client/            React (Vite) app (+ Dockerfile)
  src/
    api/            Axios instance with JWT interceptor
    context/        AuthContext (login/register/logout, current user)
    components/     Navbar, Layout, StatCard, badges, ProtectedRoute
    pages/          Login, Register, Dashboard, Machines, MachineDetail, Alerts
    theme/colors.js Shared chart/badge color tokens
docker-compose.yml  Mongo + API + client, wired together for local dev
```

## Quick start with Docker (recommended)

Requires only Docker + Docker Compose — no local Node or MongoDB install.

```bash
# 1. Build and start Mongo + the API + the client
docker compose up --build

# 2. In another terminal, seed an admin user + starter machines
docker compose exec server npm run seed
```

- API: http://localhost:5000 (health check at `/api/health`)
- Client: http://localhost:5173

Source files are bind-mounted into the containers, so edits on your host
hot-reload inside them (nodemon for the API, Vite HMR for the client). Stop
everything with `docker compose down` (add `-v` to also drop the MongoDB
volume and start fresh next time).

## Manual setup (without Docker)

Requires Node 18+ and a running MongoDB instance (local or Atlas).

```bash
# 1. Install dependencies for both apps
npm run install:all

# 2. Configure environment variables
cp server/.env.example server/.env      # set MONGO_URI, JWT_SECRET, etc.
cp client/.env.example client/.env      # points the client at the API

# 3. Seed an admin user + starter machines
npm run seed

# 4. Run both the API and the client together
npm run dev
```

- API: http://localhost:5000 (health check at `/api/health`)
- Client: http://localhost:5173

Default seeded admin login (override via `server/.env`, or the `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` env vars under Docker):

```
email:    admin@smartfactory.io
password: Admin123!
```

Anyone can also self-register from the client at `/register`; new accounts
are `viewer`s unless no admin exists yet, in which case the very first
account can bootstrap itself as `admin`.

### Roles

| | Viewer | Admin |
|---|---|---|
| View dashboard, machines, alerts | ✅ | ✅ |
| Add/edit/delete machines | ❌ | ✅ |
| Resolve alerts | ❌ | ✅ |

## API overview

All routes except `/api/auth/register` and `/api/auth/login` require an
`Authorization: Bearer <token>` header.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, get a JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/machines` | List machines + latest reading each |
| POST | `/api/machines` | Create a machine (admin) |
| PUT/DELETE | `/api/machines/:id` | Update/delete a machine (admin) |
| GET | `/api/machines/:id/readings?hours=6` | Historical readings for a machine |
| GET | `/api/readings/latest` | Latest reading per machine |
| GET | `/api/alerts?resolved=false&severity=high` | List alerts |
| PATCH | `/api/alerts/:id/resolve` | Resolve an alert (admin) |
| GET | `/api/stats/overview` | Dashboard KPI summary |

## Deploying (Vercel + Render)

The API is a persistent Express process with a background `setInterval`
simulation loop — that doesn't run correctly as a Vercel serverless
function (no long-lived process, no background timers between
invocations). The split that matches this app's architecture:

- **Client → Vercel** (it's a static SPA — a good fit)
- **API → Render** (or Railway/Fly.io — anything that runs a persistent
  Node process)
- **Database → MongoDB Atlas** (or any reachable MongoDB)

### 1. API on Render

This repo includes a `render.yaml` blueprint. In the Render dashboard:
New → Blueprint → point it at this repo/branch. It creates a web service
rooted at `server/` running `npm install` / `npm start`. Then, in that
service's **Environment** tab, set:

| Key | Value |
|---|---|
| `MONGO_URI` | your MongoDB Atlas connection string |
| `JWT_SECRET` | a long random string |
| `CLIENT_ORIGIN` | your Vercel URL(s), comma-separated (e.g. `https://your-app.vercel.app`) — see note below |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | optional, for `npm run seed` |

`JWT_EXPIRES_IN` and `SIMULATION_INTERVAL_MS` already have sane defaults
in `render.yaml`. After the first deploy, run the seed script once from
Render's Shell tab: `npm run seed`. Note your service URL (e.g.
`https://smart-factory-api.onrender.com`) — the client needs it next.

> Render's free tier spins the service down after inactivity; the first
> request after idling can take ~30–60s to wake it back up, and the
> simulation only ticks while the service is awake.

### 2. Client on Vercel

Create a Vercel project from this repo with **Root Directory set to
`client`** (Project Settings → General → Root Directory). Vercel
auto-detects the Vite framework preset. `client/vercel.json` (already in
the repo) adds the SPA rewrite so client-side routes like `/machines` or
`/alerts` don't 404 on refresh/direct load. In Project Settings →
Environment Variables, set:

| Key | Value |
|---|---|
| `VITE_API_URL` | your Render API URL + `/api`, e.g. `https://smart-factory-api.onrender.com/api` |

Redeploy after setting it (Vite env vars are baked in at build time).

### Common causes of 404 / 500 after deploying

- **404 on any route but `/`** → missing the SPA rewrite (`client/vercel.json`) or the Vercel project's Root Directory isn't set to `client`.
- **500 on every API call** → `MONGO_URI`/`JWT_SECRET` not set on the API host (they're never read from your local `.env`, which is gitignored on purpose).
- **API calls fail with a CORS error, not a 500** → `CLIENT_ORIGIN` on the API doesn't match the client's actual deployed URL exactly (scheme + host, no trailing slash).
- **Login works but data never appears/updates** → the API host went to sleep (Render free tier) or was deployed as serverless (Vercel) — the simulation loop needs an always-on process.

## Notes on the simulation engine

`server/src/services/simulationService.js` runs a `setInterval` tick
(`SIMULATION_INTERVAL_MS`, default 5000ms). Each tick, every machine takes a
small random walk in temperature/vibration/throughput, occasionally spikes
(simulating wear or a fault), and rarely transitions to `idle`/`down`. Any
reading over a machine's configured thresholds — or a transition to `down` —
creates an `Alert` document. This keeps the dashboard visibly "live" without
needing real sensors, and the thresholds/behavior are easy to tune per
machine via the `thresholds` field on the `Machine` model.
