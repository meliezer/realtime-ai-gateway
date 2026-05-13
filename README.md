# Realtime AI Gateway

Prototype realtime AI gateway built with modern backend infrastructure patterns:

- OpenAI-compatible streaming APIs
- Redis pub/sub event streaming
- BullMQ async processing
- Server-Sent Events (SSE)
- Structured observability
- Health and readiness endpoints

This project focuses on backend architecture, async workflows, and operational thinking rather than UI development.

---

# Architecture

```text
Client
  ↓
Fastify API
  ↓
BullMQ Queue
  ↓
AI Worker
  ↓
Redis Pub/Sub
  ↓
SSE Streaming Response
```

---

# Features

- OpenAI-compatible streaming endpoint
- Queue-backed async AI processing
- Redis pub/sub streaming bridge
- Concurrent worker processing
- Structured JSON logging and stream correlation
- Health and readiness checks
- Typed TypeScript architecture
- Docker Compose local infrastructure
- Production-minded lifecycle handling

---

# Tech Stack

- Node.js
- TypeScript
- Fastify
- BullMQ
- Redis
- PostgreSQL
- Docker Compose
- Vitest
- ESLint
- Prettier
- Pino

---

# Endpoints

## Health

### Liveness

```http
GET /health/live
```

### Readiness

```http
GET /health/ready
```

---

## Realtime SSE Streaming

```http
GET /ai/stream?prompt=hello
```

Example:

```bash
curl -N "http://localhost:3000/ai/stream?prompt=distributed-systems"
```

---

## OpenAI-Compatible Streaming API

```http
POST /v1/chat/completions
```

Example:

```bash
curl -N http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model":"fake-gpt",
    "stream":true,
    "messages":[
      {
        "role":"user",
        "content":"hello ai gateway"
      }
    ]
  }'
```

Example streamed response:

```text
data: {"choices":[{"delta":{"content":"Processing"}}]}

data: {"choices":[{"delta":{"content":"prompt:"}}]}

data: {"choices":[{"delta":{"content":"hello ai gateway"}}]}

data: [DONE]
```

---

# Local Development

## Requirements

- Node.js 24+
- Docker
- Docker Compose

---

## Install dependencies

```bash
npm install
```

---

## Start infrastructure

```bash
docker compose up -d
```

---

## Run application

```bash
npm run dev
```

---

## Verification

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Tests

```bash
npm run test
```

---

# Current Design Notes

- SSE is used instead of WebSockets for simpler AI token streaming semantics
- Redis pub/sub decouples worker processing from HTTP streaming
- BullMQ provides async job orchestration
- Fake AI provider is intentionally used to allow offline/local development without external AI vendor dependencies

---

# Future Improvements

- Provider abstraction layer
- OpenAI / Anthropic adapters
- JWT authentication
- Rate limiting
- OpenTelemetry tracing
- Prometheus metrics
- Kubernetes deployment manifests
- Stream persistence
- Retry and dead-letter queues
- Horizontal worker scaling

---

# Why This Project Exists

This repository is intended as a backend/platform engineering showcase focused on:

- async systems
- realtime streaming
- infrastructure-oriented backend design
- operational awareness
- AI gateway architecture patterns

Rather than building a simple CRUD application, the goal is to demonstrate production-minded engineering decisions and modern backend architecture concepts.
