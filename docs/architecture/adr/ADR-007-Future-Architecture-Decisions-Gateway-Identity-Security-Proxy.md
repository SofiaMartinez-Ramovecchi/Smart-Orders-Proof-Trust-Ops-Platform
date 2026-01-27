📄 ADR-007 — Future Architecture Decisions: Gateway, Identity, Security & Proxy

Status: Proposed
Date: 2026-01-25
Scope: Backend / Gateway / Security / Frontend contracts
Audience: Engineers (architecture-level)

Context

The project has completed a backend-first, TDD-driven Auth Login domain and HTTP integration.

Before proceeding with:

frontend implementation

real blockchain-based login

CI/CD hardening

we need a shared architectural direction for how the system will evolve regarding:

API Gateway responsibilities

separation between Auth and Identity concerns

security model end-to-end

infrastructure proxy layer

This ADR documents intentional future decisions, not immediate implementation.

Architectural Direction (High Level)
Browser / Frontend
        │
        ▼
   Reverse Proxy (Caddy)
        │
        ▼
    API Gateway
   ├── Auth API
   ├── Identity API (future)
   └── Orders API (future)
        │
        ▼
  Internal Services (isolated)


Each layer has strict responsibility boundaries.

1. API Gateway Responsibilities

The API Gateway is the only public backend entry point.

The Gateway is responsible for:

Routing requests to internal services

Enforcing API contracts

Applying authentication context (JWT → identity)

Returning HATEOAS-style responses

The Gateway is NOT responsible for:

Business rules

Cryptographic verification

Persistence

UI-oriented transformations

2. Auth vs Identity vs Orders — Responsibility Split
Auth Service

Purpose: Prove identity.

Verifies wallet signature

Issues JWT

Stateless

No persistence

Knows:

wallet address

cryptographic validity

Does NOT know:

user roles

permissions

orders

profiles

Identity Service (Future)

Purpose: Interpret identity.

Resolves JWT → identity context

Maps wallet → roles / capabilities

Central authority for “who is this?”

This may be:

an internal service

or logic inside the gateway initially

Orders Service (Future)

Purpose: Business logic only.

Requires identity context

Never verifies JWT

Never talks to blockchain

Never talks to frontend directly

3. End-to-End Security Model
Authentication Flow

Frontend requests challenge

Wallet signs challenge

Auth Service verifies signature

JWT is issued

Gateway validates JWT on each request

Identity context is derived

Request forwarded to internal service

Security Boundaries
Layer	Responsibility
Proxy	TLS, headers, transport security
Gateway	Auth validation, identity context
Services	Business rules only
4. Reverse Proxy (Caddy) — Conceptual Role

The proxy sits in front of the Gateway and is treated as infrastructure.

Proxy Responsibilities

TLS termination

HTTPS enforcement

Security headers

Public API exposure only

Explicitly Out of Scope (for now)

Rate limiting

WAF rules

Bot detection

Advanced CSP tuning

5. Minimal Caddyfile (Illustrative)

⚠️ This is not final config, only to visualize responsibilities.

api.example.com {

  encode gzip

  header {
    Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "DENY"
    Referrer-Policy "strict-origin-when-cross-origin"
  }

  reverse_proxy gateway:3000
}


Key idea:
No app logic here. Only transport + safety.

6. API Contract Philosophy (HATEOAS)

All public APIs (starting with login) should:

return explicit links

describe next valid actions

avoid frontend assumptions

Example (login response):

{
  "token": "jwt",
  "links": {
    "self": "/auth/login",
    "me": "/identity/me",
    "orders": "/orders"
  }
}


This enables:

frontend decoupling

future gateway orchestration

easier evolution of services

7. Frontend Implications

Frontend consumes Gateway only

Frontend never talks to Auth or Orders directly

Frontend tests mock Gateway contracts, not services

Wallet is treated as an external dependency

8. What We Intentionally Defer

We explicitly postpone decisions about:

roles & permissions model

persistence of identity

multi-wallet users

advanced security rules

infra scaling

This avoids premature complexity.

Checklist — To Be Completed Over Time
Architecture

Finalize Gateway API surface

Define Identity service contract

Define Orders service contract

Security

Decide JWT claims structure

Define identity context object

Define auth failure semantics (401 vs 403)

Proxy / Infra

Final Caddyfile

Local dev proxy setup

CI/CD integration

API Contracts

Final login HATEOAS response

Gateway contract JSON

Frontend mock contracts

Frontend

Gateway-based login integration

Frontend tests mocking gateway

Wallet adapter abstraction

Closing Notes

This ADR intentionally documents direction, not completion.

It exists to:

align future work

prevent architectural drift

allow incremental, test-driven progress
