# PulsePoll Architecture & Design Specification

**Document Version:** 1.0.0 (Sprint 1 Foundation)  
**Date:** September 16, 2026  
**Status:** Approved & Implemented  

---

## 1. System Overview

PulsePoll is a high-performance, real-time interactive audience polling platform engineered to deliver sub-100ms response synchronization. The system utilizes a modern decoupled full-stack architecture built on **React** for the user interface, **Go (Gin)** for high-throughput HTTP/WebSocket backend services, **MongoDB** for durable persistence, and **Redis** for in-memory vote counters and Pub/Sub real-time fan-out.

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  React (Vite) Single Page Application (SPA)                │
│  - Mobile Participant View (Zero-login PIN/QR voting)       │
│  - Presenter Command Dashboard & Animated Live Charts        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST (Sprint 1) / WS (Sprint 2+)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND ENGINE                          │
│  Go (Gin Web Framework) Microservice                        │
│  - Middleware: CORS, Structured Logger, Panic Recovery       │
│  - Route Handlers & Input Validation                        │
│  - Realtime Engine & Event Broadcaster                      │
└──────────────────┬───────────────────────┬──────────────────┘
                   │                       │
                   ▼                       ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      DURABLE STORAGE         │ │     REALTIME IN-MEMORY     │
│  MongoDB Database            │ │  Redis Instance            │
│  - Users & Credentials       │ │  - Atomic Vote Counters    │
│  - Poll Metadata & Schemas   │ │  - Pub/Sub Channel Fanout  │
│  - Historical Analytics      │ │  - Active Room Registry    │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 2. Frontend / Backend Separation

The system maintains strict architectural boundaries:

* **/frontend (React SPA):** Handles all visual rendering, user interactions, routing, design-token state management, and real-time state subscription. Communicates with the backend strictly via API endpoints defined in `services/api.js`.
* **/backend (Go + Gin):** Encapsulates core business logic, input validation, database access, session validation, and real-time socket connections. The backend never serves rendered HTML or static frontend assets directly.
* **Secrets Isolation:** All database credentials, Redis connections, and port settings are loaded via environment variables (`.env`). Secrets are never committed or exposed to the client.

---

## 3. Database & Infrastructure Responsibilities

### 3.1 MongoDB Responsibility (Durable Source of Truth)
* **Users & Auth:** Stores hashed presenter credentials, session tokens, and metadata.
* **Poll Definitions:** Persists poll questions, option lists, creator ID, created timestamps, and poll status (`draft`, `published`, `closed`).
* **Archival Tallies:** Stores long-term snapshot data of poll results after live sessions complete.

### 3.2 Redis Responsibility (Realtime State Engine)
* **Atomic Live Counters:** Uses `INCRBY` / Hash operations for high-speed concurrent vote casting without causing MongoDB write bottlenecks.
* **Pub/Sub Messaging:** Broadcasts live vote events instantly across server nodes and WebSocket connections (`pulsepoll:events:poll_id`).
* **Active Room Registry:** Manages active room codes (e.g. 6-digit numeric PINs) with fast expiration TTLs.

### 3.3 Go / Gin Responsibility (API & Business Logic)
* **High Concurrency HTTP:** Handles client API requests with minimal memory overhead and CPU usage.
* **Request Validation:** Strictly validates all incoming payloads (e.g., question lengths, option counts, vote IDs) before database or Redis calls.
* **Graceful Failure Handling:** Structured middleware catches panics and returns standardized JSON error responses (`500 Internal Server Error`).

---

## 4. Planned Realtime Flow (Sprint 2+)

1. **Vote Submission:** Participant taps an option in the React SPA → `POST /api/v1/polls/:id/vote`.
2. **Backend Processing:** Go backend validates request payload and participant session token.
3. **Redis Atomic Increment:** Go updates Redis in-memory hash `HINCRBY poll:<id>:votes option_index 1`.
4. **Redis Pub/Sub Fan-out:** Backend publishes event `VOTE_CAST` to Redis channel `poll:<id>:stream`.
5. **Realtime Broadcast:** Connected WebSocket clients receive the payload and re-render live charts with spring-physics transitions (< 100ms total latency).
6. **Async Mongo Sync:** Redis tallies are flushed asynchronously to MongoDB for permanent storage.

---

## 5. Environment Configuration

| Variable | Description | Default (Dev) |
| :--- | :--- | :--- |
| `PORT` | Backend HTTP Listening Port | `8080` |
| `MONGO_URI` | MongoDB Connection String | `mongodb://localhost:27017` |
| `MONGO_DB` | Target MongoDB Database Name | `pulsepoll` |
| `REDIS_ADDR` | Redis Instance Host & Port | `localhost:6379` |
| `REDIS_PASSWORD` | Redis Authentication Password | `""` |
| `CORS_ORIGIN` | Allowed Frontend Origin | `http://localhost:5173` |
| `ENVIRONMENT` | Runtime Mode (`development` / `production`) | `development` |
| `VITE_API_BASE_URL` | Frontend API Target Base URL | `http://localhost:8080/api/v1` |

---

## 6. Local Development Setup

### Prerequisites
* Go v1.22+
* Node.js v18+ & npm
* Docker (for MongoDB & Redis containers)

### 1. Start Infrastructure
```bash
docker run -d --name pulsepoll-mongo -p 27017:27017 mongo:latest
docker run -d --name pulsepoll-redis -p 6379:6379 redis:alpine
```

### 2. Start Go Backend
```bash
cd backend
go run cmd/server/main.go
```
Verify health: `curl http://localhost:8080/api/v1/health`

### 3. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open browser at: `http://localhost:5173`
