# Codera

**Codera Contest-Mode Judge Integration** — A monorepo application for compiling, running, and judging code submissions across multiple languages with real-time feedback.

## Features

- **Monorepo Architecture**: Organized using npm workspaces for seamless code sharing between apps and packages.
- **Multiple Languages Supported**: Python 3, JavaScript, TypeScript, C, C++, Java, Go, and Rust.
- **Real-time Feedback**: WebSocket integration for live streaming of submission statuses and per-testcase execution results.
- **Robust Infrastructure**: Backed by PostgreSQL (relational data), Redis (BullMQ queues/caching), and MongoDB (document/log storage).

## Project Structure

This project is a monorepo containing multiple applications and shared packages:

### Apps (`/apps`)
- **`frontend`**: The user-facing application where users write code (using Monaco editor) and view live results.
- **`api`**: The REST API and WebSocket server handling submissions and user interactions.
- **`coordinator`**: Manages the job queues and distributes code execution tasks to worker nodes.

### Packages (`/packages`)
- **`db`**: Database schemas, migrations, and ORM clients.
- **`config`**: Shared configuration files globally accessible across the monorepo.
- **`types`**: Shared TypeScript definitions ensuring type safety between apps.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Docker](https://www.docker.com/) and Docker Compose (for running dependencies)

## Getting Started

### 1. Start Infrastructure Dependencies
The project relies on PostgreSQL, Redis, and MongoDB. Start them using Docker Compose:

```bash
docker-compose up -d
```

### 2. Install Dependencies
Install npm dependencies across all workspaces from the project root:

```bash
npm install
```

### 3. Database Setup
Initialize the database schemas and push the configuration:

```bash
npm run db:generate
npm run db:push
```

*Optional: Run `npm run db:studio` to open a local database management UI.*

### 4. Run Development Servers
You can run the different services using the provided npm scripts. It is recommended to run each of these in a separate terminal:

**Start the API Server:**
```bash
npm run dev:api
```

**Start the Coordinator:**
```bash
npm run dev:coordinator
```

**Start the Frontend:**
```bash
npm run dev:frontend
```

## API Reference

The backend exposes a REST API on `http://localhost:3000` and a WebSocket server on `ws://localhost:3000/ws`.

For comprehensive details on endpoints, payloads, websocket message structures, and submission statuses, please see the [FRONTEND_API.md](./FRONTEND_API.md) documentation.

## Scripts Reference

From the root `package.json`, you have access to the following commands:

- `npm run dev:api`: Starts the API app in dev mode.
- `npm run dev:coordinator`: Starts the Coordinator app in dev mode.
- `npm run dev:frontend`: Starts the Frontend app in dev mode.
- `npm run build`: Builds all workspaces.
- `npm run db:generate`: Generates database clients.
- `npm run db:push`: Pushes schema changes to the database.
- `npm run db:migrate`: Runs database migrations.
- `npm run db:studio`: Opens a UI for database inspection.
- `npm run clean`: Cleans up `dist` folders across all workspaces.
