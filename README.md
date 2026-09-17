# PulsePoll ⚡

> Modern, zero-friction realtime audience polling and live presentation analytics platform with Redis Pub/Sub and WebSockets. Built for the HCL GUVI Developer Internship Assignment.

---

## 🌟 Tech Stack

* **Frontend:** React 18 (Vite, JavaScript ES6+, Custom CSS Design Tokens)
* **Backend:** Go 1.22+ (Gin Web Framework)
* **Database:** MongoDB (Durable persistence for users, polls, and votes)
* **Realtime Infrastructure:** Redis (Atomic counters via `HINCRBY` & Pub/Sub event channel)
* **Realtime Streaming:** Gorilla WebSockets (Full duplex live result updates)

---

## 🚀 System Architecture & Data Flow

```
[ Participant / Creator Browser ]
               │
               ▼ (HTTP REST / WebSockets)
       [ Go / Gin Backend ]
         │              │
         ▼              ▼
   [ MongoDB ]       [ Redis ]
(Durable Truth)   (Atomic Counters + Pub/Sub)
```

1. **Auth & Poll Management:** Creators sign up/login via HTTP-Only session cookies, create polls (`single` or `multiple` choice), and publish live poll links (`/p/:code`).
2. **Participant Voting:** Participants access `/p/:code`, select option(s), and submit vote (`POST /api/v1/polls/:code/votes`).
3. **MongoDB Persistence:** Vote is durably recorded in MongoDB with server-side duplicate prevention.
4. **Redis Realtime Counters:** Redis atomically updates option counters (`pulsepoll:counts:<code >`) and publishes live event to Redis Pub/Sub (`pulsepoll:events:<code >`).
5. **WebSocket Broadcast:** Go backend receives Pub/Sub message and streams updated counts over WebSockets (`/api/v1/polls/:code/ws`) to all connected client browsers.
6. **Progressive Live Results UI:** React frontend transitions into a vertical bar chart results view with smooth height animations without page refresh.

---

## 📡 API Reference

### Health
- `GET /api/v1/health` — Infrastructure health status & dependency latencies

### Authentication (Creator)
- `POST /api/v1/auth/signup` — Register new creator account
- `POST /api/v1/auth/login` — Authenticate creator session
- `POST /api/v1/auth/logout` — Logout session
- `GET /api/v1/auth/me` — Current authenticated user profile

### Poll Management (Creator & Public)
- `POST /api/v1/polls` — Create poll (Protected)
- `GET /api/v1/polls` — List creator polls (Protected)
- `GET /api/v1/polls/:id` — Fetch poll details by ID or Code (Public/Creator)
- `POST /api/v1/polls/:id/publish` — Publish draft poll (Protected)

### Participant Voting & Realtime Results
- `POST /api/v1/polls/:code/votes` — Submit anonymous participant vote
- `GET /api/v1/polls/:code/results` — Fetch live poll counts & percentages (REST)
- `GET /api/v1/polls/:code/ws` — Realtime WebSocket stream for live vote updates

---

## 🛠️ Quick Start & Verification

### 1. Prerequisites
Ensure Docker, Go (1.22+), and Node.js (18+) are installed.

### 2. Start Database & Cache Services
```bash
docker run -d --name pulsepoll-mongo -p 27017:27017 mongo:latest
docker run -d --name pulsepoll-redis -p 6379:6379 redis:alpine
```

### 3. Start Backend (Go + Gin)
```bash
cd backend
go run cmd/server/main.go
```
The backend runs on `http://localhost:8080`.  
Run unit tests: `go test -v ./...`

### 4. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open browser at `http://localhost:5173`.  
Production build: `npm run build`

---

## 📄 Project Documentation
For comprehensive architectural diagrams and design decisions, see:  
[docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)
