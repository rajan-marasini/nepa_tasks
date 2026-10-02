# ⚡ Real-Time Event Dashboard & Ingestion Pipeline

A production-ready full-stack application for real-time ingestion, filtering, and aggregate analytics of user activity logs. Built with high-throughput backend APIs, native WebSocket live streaming, rate limiting, and an interactive React dashboard.

---

> [!NOTE]
>
> ### 💡 Tech Stack Choice: Why Node.js & TypeScript?
>
> Out of the options (Node.js/TypeScript, Python/FastAPI, or Go), I went with **Node.js + TypeScript** primarily for speed and consistency:
>
> - **Single language across the stack**: Since the frontend is built with React, using TypeScript on the backend meant I could share event payload types and API contracts directly without context switching or mismatching models.
> - **Straightforward real-time setup**: Handling both the REST API and the WebSocket server (`ws`) within the same lightweight process was quick to set up and works reliably for broadcasting live events.
> - **Tooling comfort**: I'm most productive with the TypeScript ecosystem (Express, Zod, and Drizzle ORM), which helped me build, validate, and test everything cleanly within the time limit.

---

## 🏛️ System Architecture

```
                                  ┌────────────────────────┐
                                  │   React 19 Frontend    │
                                  │  (Vite + Tailwind CSS) │
                                  └───────┬────────▲───────┘
                                          │        │
                     REST API (HTTP/JSON) │        │ WebSocket (ws://)
                                          ▼        │ Live Event Stream
                                  ┌────────────────┴───────┐
                                  │        Express         │
                                  │   (Backend REST & WS)  │
                                  └───────┬────────────────┘
                                          │
                        Drizzle ORM       │ Pool Connection
                                          ▼
                                  ┌────────────────────────┐
                                  │  PostgreSQL Database   │
                                  │  (Persistent Storage)  │
                                  └────────────────────────┘
```

### Architecture Highlights

- **Ingestion & Validation Pipeline**: High-performance HTTP endpoint validates incoming event payloads using Zod schemas.
- **Real-Time Pub/Sub**: Incoming events are immediately broadcast to connected clients over WebSockets via an internal `EventEmitter`, falling back to 5-second polling via TanStack Query.
- **Security & Reliability**: Configured with `express-rate-limit` (30 req/min per IP), structured error handling for database failures/malformed payloads, and Better Auth authentication.
- **Containerization**: Multi-stage production Dockerfiles for both backend and frontend orchestrated with `docker-compose.yml`.

---

## 🛠️ Tech Stack

| Layer                        | Technology                                                                           |
| :--------------------------- | :----------------------------------------------------------------------------------- |
| **Backend Runtime & Server** | [Bun](https://bun.sh/) / [Express.js](https://expressjs.com/) / TypeScript           |
| **Database & ORM**           | [PostgreSQL](https://www.postgresql.org/) / [Drizzle ORM](https://orm.drizzle.team/) |
| **Real-Time Streaming**      | Native WebSockets (`ws`) + Node `EventEmitter`                                       |
| **Validation & Security**    | [Zod v4](https://zod.dev/), `express-rate-limit`, `cors`                             |
| **Authentication**           | [Better Auth](https://www.better-auth.com/)                                          |
| **Frontend Framework**       | [React 19](https://react.dev/), [Vite](https://vitejs.dev/), TypeScript              |
| **Styling & Components**     | [Tailwind CSS v4](https://tailwindcss.com/), Radix UI / shadcn, Lucide Icons         |
| **State & Data Fetching**    | [TanStack React Query](https://tanstack.com/query/latest)                            |
| **Testing**                  | Bun Test runner (Unit & Integration)                                                 |
| **DevOps & Containers**      | Docker, Nginx, Docker Compose                                                        |

---

## 🚀 Quick Start (Docker Compose)

The easiest way to run the entire stack (PostgreSQL + Backend Server + Frontend Dashboard) is with Docker Compose:

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd nepa_task

# 2. Copy the environment file
cp .env.example .env

# 3. Build and launch all services
docker compose up --build
```

Services will be available at:

- 🌐 **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- 🔌 **Backend API**: [http://localhost:8000](http://localhost:8000)
- 📡 **WebSocket Stream**: `ws://localhost:8000/ws`
- 🐘 **PostgreSQL**: `localhost:5432`

To tear down containers:

```bash
docker compose down -v
```

---

## 💻 Local Development Setup

### Prerequisites

- [Bun](https://bun.sh/) (v1.1+)
- [PostgreSQL](https://www.postgresql.org/) running locally

### 1. Backend Setup

```bash
cd server

# Copy environment variables
cp .env.example .env

# Install dependencies
bun install

# Run database migrations
bun run db:push

# Start development server
bun run dev
```

Backend will start on `http://localhost:8000`.

### 2. Frontend Setup

```bash
cd client

# Copy environment variables
cp .env.example .env

# Install dependencies
bun install

# Start Vite development server
bun run dev
```

Frontend will start on `http://localhost:5173`.

---

## 🧪 Running Tests

The test suite covers Zod schema validation, utility classes, middleware pipelines, error handlers, and API endpoints:

```bash
cd server
bun test
```

Test coverage includes:

- ✅ `createEventSchema`, `getEventsQuerySchema`, `getEventAnalyticsQuerySchema`
- ✅ `AppError` and custom status codes
- ✅ `EventEmitter` pub/sub messaging
- ✅ `validate` & `validateQuery` middleware
- ✅ SyntaxError (malformed JSON) & DB connection error formatting

---

## 📖 API Documentation

### 1. Ingest Event

**`POST /api/events`**

Ingests a new activity log event, saves it to PostgreSQL, and broadcasts it in real-time.

- **Request Headers**: `Content-Type: application/json`
- **Rate Limit**: 30 requests / minute per IP
- **Request Body**:

```json
{
  "id": "e44146a8-208b-4fc6-b8cb-4e963ee3e8e1",
  "user_id": "usr_1029",
  "event_type": "checkout_completed",
  "payload": {
    "order_id": "ord_9941",
    "amount": 149.99,
    "currency": "USD"
  },
  "timestamp": "2026-10-02T12:30:00.000Z"
}
```

- **Response `(201 Created)`**:

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "e44146a8-208b-4fc6-b8cb-4e963ee3e8e1",
    "user_id": "usr_1029",
    "event_type": "checkout_completed",
    "payload": {
      "order_id": "ord_9941",
      "amount": 149.99,
      "currency": "USD"
    },
    "timestamp": "2026-10-02T12:30:00.000Z",
    "created_at": "2026-10-02T12:30:00.120Z"
  }
}
```

---

### 2. Retrieve Events (Paginated & Filtered)

**`GET /api/events`**

- **Query Parameters**:
  - `page` (optional, default: `1`): Page number.
  - `limit` (optional, default: `10`, max: `100`): Items per page.
  - `event_type` (optional): Filter by exact event type string.
  - `date_from` (optional): ISO 8601 start date.
  - `date_to` (optional): ISO 8601 end date.

- **Response `(200 OK)`**:

```json
{
  "success": true,
  "data": [
    {
      "id": "e44146a8-208b-4fc6-b8cb-4e963ee3e8e1",
      "user_id": "usr_1029",
      "event_type": "checkout_completed",
      "payload": { "amount": 149.99 },
      "timestamp": "2026-10-02T12:30:00.000Z",
      "created_at": "2026-10-02T12:30:00.120Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "filters": {
    "event_type": null,
    "date_from": null,
    "date_to": null
  }
}
```

---

### 3. Get Aggregate Analytics

**`GET /api/events/analytics`**

- **Query Parameters**:
  - `hours` (optional, default: `24`): Lookback window in hours (1 - 8760).
  - `event_type` (optional): Filter metrics by specific event type.
  - `date_from` / `date_to` (optional): Custom timeframe range.

- **Response `(200 OK)`**:

```json
{
  "success": true,
  "data": {
    "timeframe": {
      "from": "2026-10-01T12:30:00.000Z",
      "to": "2026-10-02T12:30:00.000Z",
      "hours": 24
    },
    "total_events": 1420,
    "unique_users": 384,
    "by_type": [
      {
        "event_type": "page_view",
        "count": 890,
        "percentage": 62.68
      },
      {
        "event_type": "checkout_completed",
        "count": 310,
        "percentage": 21.83
      },
      {
        "event_type": "user_signup",
        "count": 220,
        "percentage": 15.49
      }
    ]
  }
}
```

---

### 4. WebSocket Streaming

**`ws://localhost:8000/ws`**

Connect to receive live broadcasts whenever any event is ingested:

```json
{
  "type": "NEW_EVENT",
  "data": {
    "id": "e44146a8-208b-4fc6-b8cb-4e963ee3e8e1",
    "user_id": "usr_1029",
    "event_type": "checkout_completed",
    "payload": { "amount": 149.99 },
    "timestamp": "2026-10-02T12:30:00.000Z"
  }
}
```

---

## 🔒 Error Handling & Status Codes

All API error responses follow a consistent structured schema:

```json
{
  "success": false,
  "message": "id must be a valid UUID"
}
```

| HTTP Code                 | Description                                      |
| :------------------------ | :----------------------------------------------- |
| `400 Bad Request`         | Zod validation failure or malformed JSON payload |
| `409 Conflict`            | Duplicate record (e.g. duplicate UUID)           |
| `429 Too Many Requests`   | IP rate limit exceeded (30 req / min)            |
| `503 Service Unavailable` | PostgreSQL database connection unreachable       |
| `500 Internal Error`      | Unhandled server error                           |
