# PulsePoll ⚡

> Modern, zero-friction realtime audience polling and live presentation analytics platform. Built for the HCL GUVI Developer Internship Assignment.

---

## 🌟 Tech Stack

* **Frontend:** React (Vite, Javascript ES6+, CSS Design Tokens)
* **Backend:** Go (Gin Web Framework)
* **Database:** MongoDB
* **Realtime Infrastructure:** Redis (Atomic Counters & Pub/Sub)

---

## 🚀 Sprint 1 — Foundation Overview

Sprint 1 establishes a production-grade full-stack architecture proving end-to-end communication between React, Go (Gin), MongoDB, and Redis.

### Features Implemented in Sprint 1:
- [x] Full-stack directory structure (`/frontend`, `/backend`, `/docs`)
- [x] Go/Gin HTTP server with CORS, structured logging, and panic recovery middleware
- [x] Real MongoDB client connection with context ping verification
- [x] Real Redis client connection with context ping verification
- [x] `GET /api/v1/health` endpoint returning real-time dependency status and ping latency without exposing secrets
- [x] React single-page application with GUVI-inspired UI design tokens (navy header `#0B192C`, emerald/blue accents `#10B981`, grid cards)
- [x] Dynamic Health Status Widget fetching backend health and displaying MongoDB + Redis connectivity in real time
- [x] Environment configuration setup (`.env.example`)
- [x] Architectural documentation (`docs/architecture/ARCHITECTURE.md`)

---

## 🛠️ Quick Start & Verification

### 1. Prerequisites
Ensure Docker, Go (1.22+), and Node.js (18+) are installed.

### 2. Start Services via Docker
```bash
docker run -d --name pulsepoll-mongo -p 27017:27017 mongo:latest
docker run -d --name pulsepoll-redis -p 6379:6379 redis:alpine
```

### 3. Start Backend (Go + Gin)
```bash
cd backend
go run cmd/server/main.go
```
The backend starts on `http://localhost:8080`.  
Verify health endpoint: `curl http://localhost:8080/api/v1/health`

### 4. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 📄 Documentation

For full architectural details, data flow diagrams, and design decisions, see:
[docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)
