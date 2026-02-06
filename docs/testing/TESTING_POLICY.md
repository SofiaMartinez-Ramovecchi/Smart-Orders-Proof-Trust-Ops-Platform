# Testing Policy

## Purpose

This document defines **what we test, what we deliberately do NOT test, and why**.

The goal is to:

* Maximize confidence in the system
* Minimize brittle or low‑value tests
* Protect architectural decisions (ports & adapters, domain‑first design)
* Enable safe refactors without fear

This policy is intentionally strict.

---

## Guiding Principles

1. **Test contracts, not implementations**
2. **Test what would break if we change technology**
3. **If a test fails due to the network, it does not belong in CI**
4. **Security is validated by behavior, not cryptography**

---

## What We Test

### 1. Domain (Highest Priority)

These tests validate the core business and security rules.

✅ LoginService behavior

* Accepts VerifiedIdentity
* Rejects invalid identities
* Emits JWT only after verification

✅ AuthStrategy contract

* Produces VerifiedIdentity
* Does not issue JWTs

✅ VerifiedIdentity model

* Explicit identity type and provider

✅ JWT claims

* sub
* provider
* expiration

---

### 2. Integration (Adapters & HTTP)

These tests validate real wiring between layers.

✅ HTTP Controllers

* Correct status codes
* Correct JSON shape
* Authentication required when expected

✅ Adapter wiring

* AuthStrategy plugged into LoginService
* JwtService integration

---

### 3. End‑to‑End (Minimal but Critical)

These tests validate the full authentication flow.

✅ Happy path login

* Challenge → signature → login → JWT

✅ Failure cases

* Invalid signature → 401
* Reused challenge → 401
* Expired token → 401

---

## What We Explicitly Do NOT Test

### 🚫 Wallets / Phantom

❌ Phantom signature correctness
❌ Wallet UI behavior
❌ Browser wallet availability

**Reason:** External, battle‑tested software outside our control.

---

### 🚫 Blockchain Nodes / RPC Providers

❌ Solana RPC availability
❌ Helius node responses
❌ Anchor serialization correctness

**Reason:** Infrastructure dependency. Network failures must not break CI.

---

### 🚫 Cryptographic Implementations

❌ JWT signing algorithms
❌ Hashing correctness

**Reason:** Provided by trusted libraries.

---

### 🚫 Framework Internals

❌ NestJS decorators
❌ React hooks behavior

**Reason:** Framework responsibility, not domain logic.

---

## Allowed Non‑Functional Tests (Limited)

### Framework Integration Smoke Test

✔️ One test verifying DI + guards wiring

Purpose: Ensure framework integration behaves as expected.

---

### Lightweight Stress Test

✔️ Small concurrent login burst (50–100 requests)

Purpose:

* Detect race conditions
* Validate challenge consumption

Not intended for performance benchmarking.

---

### Manual Smoke Tests (Not in CI)

✔️ Real Phantom wallet
✔️ Real Solana devnet via Helius

Documented in README or scripts, never automated.

---

## Test Ownership by Layer

| Layer       | Test Type          |
| ----------- | ------------------ |
| Domain      | Unit               |
| Application | Unit / Integration |
| Adapters    | Integration        |
| HTTP API    | Integration        |
| Full Flow   | E2E                |

---

## CI Rules

* No test may depend on network availability
* No test may require a real wallet
* No flaky or timing‑dependent tests

---

## Architectural Invariant

> If authentication providers change (Phantom → Google → 2FA),
> **all domain tests must still pass without modification**.

This document protects that invariant.

---

## Summary

This testing strategy prioritizes:

* Architectural correctness
* Security behavior
* Long‑term maintainability

Testing exists to protect decisions, not to inflate coverage numbers.

