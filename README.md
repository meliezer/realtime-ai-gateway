# Realtime AI Gateway

![CI](https://github.com/meliezer/realtime-ai-gateway/actions/workflows/ci.yml/badge.svg)

The project was partially inspired by enterprise environments where internal AI platforms provide centralized access to multiple LLM providers through controlled backend services and operational gateways. Prototype realtime AI gateway built with modern backend infrastructure patterns:

- OpenAI-compatible streaming APIs
- Redis pub/sub event streaming
- BullMQ async processing
- Server-Sent Events (SSE)
- Structured logging and stream correlation
- Health and readiness endpoints

This project focuses on backend architecture, async workflows, streaming semantics, and operational concerns rather than UI development.

---

# Features

- OpenAI-compatible streaming endpoint
- Redis pub/sub streaming bridge
- Queue-backed async AI processing
- Concurrent worker processing
- Rate limiting
- Structured logging with stream correlation and timing metrics
- Health and readiness checks
- GitHub Actions CI pipeline
- CodeQL security scanning
- Strict TypeScript and ESM-based architecture
- Docker Compose local infrastructure
- Graceful shutdown and application lifecycle handling

---

# Developer Tooling

- ESLint
- Prettier
- SonarLint-ready setup
- EditorConfig
- GitHub Actions CI
- CodeQL security scanning

---

# Architecture Overview

```text
Client
  │
  ▼
Fastify API
  │
  ▼
BullMQ Queue
  │
  ▼
AI Worker
  │
  ▼
Redis Pub/Sub
  │
  ▼
SSE Streaming Response
```

---

# Potential Use Cases

- internal enterprise AI gateway
- provider abstraction layer for multiple LLM vendors
- streaming proxy for frontend AI applications
- async orchestration for long-running AI tasks
- centralized rate limiting and operational controls
- observability and auditing layer for AI integrations
- foundation for multi-tenant AI platform architectures

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
- OpenTelemetry tracing
- Prometheus metrics
- Kubernetes deployment manifests
- Stream persistence
- Retry and dead-letter queues
- Horizontal worker scaling

---

# Future CI Enhancements

- AI-assisted PR review workflows
- automated architecture feedback
- CI-integrated code quality suggestions

---

# Why This Project Exists

This repository is intended as a backend/platform engineering showcase focused on:

- async systems
- realtime streaming
- infrastructure-oriented backend design
- operational awareness
- AI gateway architecture patterns

The goal of this project is to explore realtime AI gateway patterns, async processing workflows, streaming semantics, and operational concerns commonly found in modern backend and platform engineering environments.
