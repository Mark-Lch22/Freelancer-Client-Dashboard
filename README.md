# Freelancer-Client Project Management Dashboard

Platform for managing freelance projects — connecting clients with freelancers and tracking the full project lifecycle from bid to delivery.

**Team:** Zlaten Vek
**Stack:** React 19 + Vite · NestJS · PostgreSQL (Supabase) · Docker · GitHub Actions

---

## Docker Hub Images

Pre-built images are published automatically to Docker Hub on every push to `main`.

| Image | Link |
|-------|------|
| Backend | [`kaloyangavrilov/freelancer-dashboard-api`](https://hub.docker.com/r/kaloyangavrilov/freelancer-dashboard-api) |
| Frontend | [`kaloyangavrilov/freelancer-dashboard-web`](https://hub.docker.com/r/kaloyangavrilov/freelancer-dashboard-web) |

---

## Architecture

### Frontend

A single-page application built with **React 19**, **TypeScript**, and **Vite**. State management uses **TanStack Query** for server state and local React state for UI concerns. The app communicates with the backend via a typed Axios client. Authentication flows through Supabase JWT tokens, which are automatically attached to every API request.

### Backend

A **NestJS** REST API written in TypeScript. The architecture follows a layered approach: controllers handle HTTP concerns and Swagger documentation, services orchestrate business logic, and repository interfaces abstract data access via the Dependency Inversion Principle. Domain logic (state machine for project lifecycle, Strategy Pattern for bid ranking) lives in a dedicated `domain/` layer. Global validation pipes enforce DTO constraints; a global exception filter standardises error responses.

### Database

**PostgreSQL** managed by **Supabase**. The schema includes 15 tables with Row Level Security policies, database triggers for audit logging (project state history), rating recalculation, and status-transition validation. Supabase also provides JWT-based authentication, file storage for deliverables, and presigned download URLs.

### Deployment

Both services are containerised with **multi-stage Docker** builds (see `frontend/Dockerfile` and `backend/Dockerfile`). **GitHub Actions** builds and pushes images to **Docker Hub** on every push to `main`. To run the latest deployment on any machine with Docker, pull the images using `docker-compose.prod.yml`.

---

## Repository Structure

```
/
├── frontend/                # React 19 + Vite + TypeScript
├── backend/                 # NestJS + TypeScript
├── supabase/
│   ├── migrations/          # SQL migration files
│   └── db-schema.sql        # Full database schema
├── docs/
│   ├── adr/                 # Architecture Decision Records
│   ├── api.md               # API request/response examples
│   └── ai-usage-log.md
├── .github/
│   └── workflows/
│       ├── docker.yml       # Build & push images to Docker Hub
│       └── frontend.yml     # Frontend CI (lint → test → build)
├── docker-compose.yml       # Local development (builds images from source)
└── docker-compose.prod.yml  # Production (pulls images from Docker Hub)
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >= 20.0.0 | Runtime for local dev and frontend tooling |
| npm | >= 10.0.0 | Package manager (workspaces) |
| Docker & Docker Compose | Latest | Containerised running of services |
| Supabase account | — | Auth, database, and file storage |

---

## Option A — Run from Docker Hub (fastest)

Pull and run the pre-built images without cloning the repo or installing Node.

### 1. Download the production compose file

```bash
curl -O https://raw.githubusercontent.com/Mark-Lch22/Freelancer-Client-Dashboard/main/docker-compose.prod.yml
curl -O https://raw.githubusercontent.com/Mark-Lch22/Freelancer-Client-Dashboard/main/.env.prod.example
```

Or if you already have the repo cloned, just use the files in place.

### 2. Create your environment file

```bash
cp .env.prod.example .env.prod
```

Open `.env.prod` and fill in your Supabase credentials (found in **Supabase Dashboard → Settings → API**):

```env
DOCKERHUB_USERNAME=kaloyangavrilov
TAG=latest

BACKEND_PORT=3000
FRONTEND_PORT=80

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### 3. Pull and start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:80 |
| Backend API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api/docs |

### 4. Update to the latest images

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### 5. Stop

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod down
```

---

## Option B — Local Docker build (from source)

Builds both images locally from source code. Useful for testing Dockerfile changes.

### 1. Clone the repository

```bash
git clone https://github.com/Mark-Lch22/Freelancer-Client-Dashboard.git
cd Freelancer-Client-Dashboard
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in both files with your Supabase credentials.

### 3. Build and start

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api/docs |

### 4. Stop

```bash
docker compose down
```

---

## Option C — Local development (Node.js)

Run each service directly with hot-reload. Requires Node.js >= 20 installed.

### 1. Clone the repository

```bash
git clone https://github.com/Mark-Lch22/Freelancer-Client-Dashboard.git
cd Freelancer-Client-Dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in both files with your Supabase credentials.

### 4. Start services

```bash
# Backend (hot-reload on file changes)
npm run start:dev --workspace=backend

# Frontend (Vite dev server with HMR) — in a second terminal
npm run dev --workspace=frontend
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api/docs |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Public URL of your Supabase project |
| `SUPABASE_ANON_KEY` | Anon/public key (respects RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — bypasses RLS, **never expose to the browser** |
| `SUPABASE_JWT_SECRET` | JWT secret for server-side token verification |
| `PORT` | Server port (default: `3000`) |
| `NODE_ENV` | Environment mode (`development` / `production`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Public URL of your Supabase project |
| `VITE_SUPABASE_ANON_KEY` | Anon/public key (safe for the browser) |
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:3000`) |

> **Note:** `VITE_*` variables are **baked into the JavaScript bundle at build time** by Vite. The Docker Hub frontend image already has these values compiled in from the CI build. If you need to point at a different backend, rebuild the image with updated `VITE_API_URL`.

---

## Running Tests

```bash
# All tests across workspaces
npm run test

# Backend only
npm run test --workspace=backend

# Frontend only
npm run test --workspace=frontend
```

---

## CI/CD

GitHub Actions runs the following pipelines:

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `docker.yml` | Push to `main`, version tags (`v*.*.*`), manual | Builds both Docker images and pushes them to Docker Hub |
| `frontend.yml` | Changes to `frontend/**` | Lint → test → build (verifies the frontend compiles cleanly) |

The `docker.yml` workflow builds both images in parallel and tags them as:
- `latest` — always points to the most recent `main` build
- `sha-<short-commit>` — immutable reference to a specific build
- `v1.2.3` — created when you push a git tag like `git tag v1.2.3 && git push --tags`

### Required GitHub Secrets

Go to **Repository → Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username (`kaloyangavrilov`) |
| `DOCKERHUB_TOKEN` | Docker Hub access token (**Account Settings → Security → Access Tokens**) |
| `VITE_API_URL` | Production backend URL baked into the frontend image |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

---

## Documentation

- [API Request/Response Examples](docs/api.md)
- [Architecture Decision Records](docs/adr/)
- [AI Usage Log](docs/ai-usage-log.md)

---

## Contributing

1. Branch off `main` following the naming convention: `feature/<ticket-id>-<short-description>`
2. Open a PR — the template will guide you through required sections
3. PRs require at least 1 approval and passing CI checks before merge
