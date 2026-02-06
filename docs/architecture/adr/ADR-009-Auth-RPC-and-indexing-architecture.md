# ADR – Auth, RPC & Indexing Architecture

## Status

Accepted – Iterative (Auth & Phantom Issue)

## Context

This document acts as a **bitácora de decisiones y aprendizajes** surgidos durante los issues de *Auth/Login* y *Phantom integration*. It captures **why certain architectural choices were made**, what exists **now**, and how the system is intentionally prepared for **future evolution**.

The project combines:

* Web authentication (JWT)
* Wallet-based identity (Phantom)
* On-chain business logic (Solana + Anchor)
* Backend orchestration (NestJS)

A key goal is **strict separation of concerns** between:

* reusable auth infrastructure
* application-specific crypto logic
* frontend responsibilities

---

## Key Decisions

### 1. Why Helius for RPC & Indexing

**Decision**: Use **Helius RPC** as the exclusive blockchain gateway for the backend.

**Why**:

* High-performance Solana RPC (sub-100ms latency)
* Reliable indexing & enriched APIs
* Webhooks and real-time account monitoring
* Production-grade infrastructure

**What Helius Is Used For**:

* Reading blockchain state
* Indexing program accounts
* Listening to on-chain events
* Submitting signed transactions

**What Helius Is NOT**:

* It does not execute business logic
* It does not replace Anchor
* It does not manage keys or permissions

Anchor remains the source of truth for rules and validation.

---

### 2. Why JWT for Application Auth

**Decision**: Use JWT as the application session mechanism.

**Why**:

* Stateless identity propagation
* No forced persistence early
* Works across tabs and requests

**JWT Represents**:

> "This identity was verified and accepted by this application"

JWT is:

* NOT blockchain auth
* NOT cryptographic authority
* NOT permission to execute transactions

JWT is used for:

* Securing backend endpoints
* Lightweight authorization (future roles)
* UI/session continuity

---

### 3. Why Session Keys for Blockchain Actions

**Decision**: Use **Session Keys / Delegated Authority** for on-chain actions (future).

**Why**:

* Avoid constant Phantom popups
* Enable smoother UX for repetitive actions
* Keep user consent explicit and scoped

**Session Key Characteristics**:

* Created by user signature (Phantom)
* Limited scope (specific instructions)
* Time-bound
* Stored on-chain

This is **not** a JWT equivalent.
It is **on-chain authority**, enforced by the program.

---

### 4. Why Phantom Lives in the Frontend

**Decision**: Phantom wallet remains exclusively in the frontend.

**Why**:

* Private keys never leave the browser
* User explicitly consents to signatures
* Aligns with wallet security model

**Frontend Responsibilities**:

* Connect wallet
* Sign login challenge
* Create session key
* Sign critical transactions

**Backend Never**:

* Accesses private keys
* Signs as the user

---

## Current Architecture (Now)

```
Frontend
  ├─ Phantom (sign)
  ├─ JWT storage
  └─ UI

Backend (NestJS)
  ├─ Auth (JWT)
  ├─ LoginService
  ├─ Blockchain RPC (Helius)
  └─ No persistence yet

Blockchain
  ├─ Anchor program
  └─ Wallet authority
```

**Characteristics**:

* Stateless
* No users
* No roles
* No DB

This is intentional.

---

## Security Model (End-to-End)

```
[ User ]
   ↓
[ Phantom Wallet ]
   ↓  (signature)
[ Frontend ]
   ↓  (login request)
[ Backend Auth ]
   ↓  (JWT issued)
[ Backend APIs ]
   ↓  (tx build)
[ Phantom / Session Key ]
   ↓  (signed tx)
[ Solana Network ]
   ↓
[ Anchor Program Validation ]
```

**Key Invariants**:

* JWT ≠ Blockchain authority
* Session key ≠ Web auth
* Backend never signs as user
* Program enforces final permissions

---

## Smart Contract Additions (Planned)

### Program Derived Accounts (PDAs)

PDAs will be introduced for:

* Orders
* Session authorities
* Escrow / state accounts

**Why PDAs**:

* Deterministic addressing
* Program-controlled ownership
* Secure state management

Example conceptual PDAs:

* `order_pda`
* `session_pda`

The program will validate:

* Who can act
* With which authority
* During which time window

---

## Separation of Domains

### Reusable Core

* AuthStrategy
* JWT issuance
* RPC abstraction
* Signature verification

### Application-Specific Domain

* Wallet logic
* Orders
* Blockchain indexing
* Program instructions

This allows the auth core to be reused in:

* non-crypto apps
* future auth providers

---

## Future Architecture (Planned)

```
Frontend
  ├─ Phantom
  ├─ Minimal signing
  └─ UI

Backend
  ├─ Auth core
  ├─ Indexer (Helius)
  ├─ DB
  ├─ Role & order logic
  └─ Tx orchestrator

Blockchain
  ├─ Anchor program
  ├─ PDAs
  └─ Session authority
```

---

## Summary

* Helius is chosen for performance, indexing, and reliability
* JWT handles application identity only
* Session keys handle on-chain authority
* Phantom remains in the frontend
* Anchor enforces final security

This architecture is intentionally minimal today and scalable tomorrow.

