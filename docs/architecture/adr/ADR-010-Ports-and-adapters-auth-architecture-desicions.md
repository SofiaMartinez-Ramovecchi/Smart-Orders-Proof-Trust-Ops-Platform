# ADR-001: Backend Authentication Architecture using Ports & Adapters

## Status

Accepted

## Date

2026-02-06

## Context

The application is **not intended to be a blockchain-only application**. Blockchain is used deliberately and selectively, only where its properties (immutability, non-repudiation, trust minimization) add clear business value. The broader system includes:

* Business process logic (orders, roles, workflows)
* Off-chain persistence (databases, projections, indexing)
* A user-facing frontend optimized for UX
* A backend responsible for orchestration, security, and domain integrity

Authentication was initially implemented directly in the frontend using Phantom and Solana libraries. While functional, this approach tightly couples:

* Wallet provider APIs (Phantom)
* Blockchain-specific libraries
* Authentication logic
* Application-level authorization

This coupling limits evolvability, testability, and security isolation.

## Decision

We adopt a **Backend Authentication API** implemented using **Ports & Adapters (Hexagonal Architecture)** with a **clear domain boundary**.

The authentication system is designed as:

* A **dedicated Auth domain**
* Technology-agnostic core logic
* Pluggable authentication strategies
* Explicit separation between:

  * Authentication (who you are)
  * Authorization / roles (what you can do)
  * Business logic (orders, workflows)

Blockchain wallets (e.g. Phantom) are treated as **external identity providers**, not as the core of the domain.

## Architecture Overview

```
┌──────────────────────────┐
│        Frontend          │
│                          │
│  Phantom Wallet          │
│  UI / Views              │
│                          │
└───────────┬──────────────┘
            │ signed challenge
            ▼
┌──────────────────────────┐
│        Auth API          │
│  (Isolated Service)      │
│                          │
│  ┌───────────────────┐  │
│  │ Auth Domain       │  │
│  │                   │  │
│  │ - LoginService     │  │
│  │ - Roles Logic      │  │
│  │ - Policies         │  │
│  └─────────┬─────────┘  │
│            │ Ports       │
│  ┌─────────▼─────────┐  │
│  │ Adapters           │  │
│  │                   │  │
│  │ - Phantom Strategy │  │
│  │ - JWT Provider     │  │
│  │ - Challenge Store  │  │
│  └───────────────────┘  │
└───────────┬──────────────┘
            │ JWT / claims
            ▼
┌──────────────────────────┐
│   Business APIs          │
│   (Orders, etc.)         │
│                          │
│ - Validate JWT           │
│ - Enforce roles          │
│ - Orchestrate workflows  │
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│  Blockchain (Solana)     │
│  Smart Contracts         │
│  (Anchor Programs)       │
└──────────────────────────┘
```

## Key Principles

### 1. Strong Domain Decoupling

The **Auth domain** does not depend on:

* Phantom
* Solana SDKs
* Specific cryptographic libraries
* HTTP frameworks

All such details are pushed to adapters behind **explicit ports**.

This allows:

* Swapping Phantom for another wallet
* Adding Web2 auth without touching domain logic
* Testing auth logic without blockchain dependencies

### 2. Ports & Adapters Justification

Ports define **what the domain needs**, not **how it is implemented**:

* `SignatureVerificationPort`
* `JwtIssuerPort`
* `ChallengeRepositoryPort`

Adapters implement these contracts using:

* Phantom-compatible signatures
* Solana cryptography
* JWT libraries

This enforces a clean dependency direction: **infrastructure depends on domain, never the opposite**.

### 3. Separation of Auth, Roles, and Business Logic

Authentication, authorization, and business processes are separated into different bounded contexts:

* **Auth API**

  * Identity verification
  * Session issuance
  * Authentication policies

* **Authorization / Roles**

  * Role resolution
  * Claims mapping
  * Permission rules

* **Business APIs**

  * Orders
  * Workflows
  * Smart contract orchestration

This separation improves security: a failure or compromise in one area does not automatically expose others.

### 4. Security by Service Isolation

By isolating authentication into its own API:

* Attack surface is reduced
* Blast radius is minimized
* Secrets and policies are centralized
* Rate limiting and monitoring can be focused

Even if a business API is compromised, authentication logic and key material remain isolated.

### 5. Blockchain as an External System

Blockchain is treated as:

* A verification and settlement layer
* An invariant enforcement mechanism
* A source of truth for critical state

It is **not** used for:

* Session management
* Application roles
* High-frequency queries
* UX-driven workflows

This avoids unnecessary cost and complexity.

### 6. Evolution via Pluggable Authentication Strategies

The architecture explicitly supports future authentication methods:

* Google / OAuth
* Two-factor authentication
* Email magic links
* Hardware wallets

Each new method is implemented as a new **AuthStrategy adapter**, without modifying the domain.

Example:

```
AuthStrategy
├── PhantomAuthStrategy
├── GoogleAuthStrategy
├── TwoFactorAuthStrategy
└── FutureStrategies...
```

This allows gradual evolution based on user needs rather than architectural constraints.

## Consequences

### Positive

* High testability
* Strong security boundaries
* Technology independence
* Clear ownership of responsibilities
* Easier long-term evolution

### Trade-offs

* Higher upfront complexity
* More abstractions
* Requires discipline to maintain boundaries

These trade-offs are acceptable given the security and scalability goals of the system.

## Summary

This architecture ensures that:

* Authentication is **explicit, secure, and evolvable**
* Blockchain usage is **intentional, not accidental**
* Business logic remains **clean and independent**
* Future changes in auth or blockchain technology do not destabilize the core domain

The system is designed to grow safely, without locking itself to any single wallet, SDK, or framework.

