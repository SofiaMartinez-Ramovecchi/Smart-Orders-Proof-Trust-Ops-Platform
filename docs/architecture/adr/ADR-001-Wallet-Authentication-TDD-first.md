# ADR-001: Wallet-based Authentication (Backend-first)

## Status

Accepted

## Context

The platform requires a secure and verifiable authentication mechanism based on Solana wallets (Phantom).

Early versions mixed frontend logic, cryptographic validation, and authentication responsibilities, increasing coupling and reducing testability.

A clear architectural decision is required to:

* Define ownership of authentication logic
* Enable backend-first development
* Ensure cryptographic verification is testable and auditable

## Decision

We will implement wallet-based authentication using a **backend-first, TDD-driven approach**.

The backend is responsible for:

* Issuing authentication challenges
* Verifying wallet signatures
* Issuing JWTs that represent verified wallet identity

The frontend is responsible only for:

* User experience
* Capturing wallet signatures via Phantom
* Communicating with the backend over HTTP

Cryptographic verification is isolated in a dedicated `SignatureService`.

JWTs represent **verified wallet ownership**, not persisted users.

## Consequences

### Positive

* Clear separation of concerns
* Fully testable authentication logic
* Frontend becomes stateless and simple
* Authentication logic is reusable across domains
* Ready for future role-based authorization

### Negative

* Slightly higher initial implementation cost
* Requires explicit integration tests

## Notes

* No database is involved at this stage
* No blockchain state is queried
* This ADR defines the foundation for future authorization and order workflows

---

# Issue Checklist — Auth: Login with Phantom

> **Implementation strategy:** backend-first, strict TDD, login-focused.
> Tests define behavior first, implementations follow. No cross-domain refactors in this issue.

---

## 0. Preparation

* [x] Ensure clean branch created from `main`
* [x] ADR-001 referenced in issue description
* [x] Remove or ignore unrelated legacy auth logic

---

## 1. Login Orchestration — Unit Tests First

### 1.1 LoginService unit tests (primary driver)

* [x] Test: issues JWT only after successful signature verification
* [x] Test: rejects login when signature verification fails
* [x] Test: does not issue JWT if verification fails

> These tests define the **public behavior** of login.

---

## 2. JWT Handling — Minimal Contract

### 2.1 JWT expectations

* [x] Define JWT payload shape (wallet only)
* [x] Define expiration policy (if any)

### 2.2 JWT usage tests (indirect)

* [x] Assert JWT is signed with `{ wallet }` payload
* [x] Assert JWT is not issued on invalid login

> No direct unit tests for external JWT library.

---

## 3. Signature Verification — Crypto Unit Tests

### 3.1 SignatureService unit tests

* [ ] Test: accepts valid signature
* [ ] Test: rejects invalid signature
* [ ] Test: rejects altered challenge
* [ ] Test: rejects signature from different wallet

### 3.2 SignatureService implementation

* [ ] Implement verification using Solana / Ed25519
* [ ] All crypto tests passing

---

## 4. Login Integration (Backend, No HTTP)

### 4.1 Service-level integration test

* [ ] Instantiate real `SignatureService`
* [x] Use fake or stubbed JWT service
* [ ] Test full login flow end-to-end (no mocks)

> Purpose: validate service wiring and real crypto interaction.

---

## 5. Login Integration (HTTP, No Dagger)

### 5.1 AuthController

* [ ] `GET /auth/challenge` endpoint
* [ ] `POST /auth/login` endpoint

### 5.2 HTTP integration tests

* [ ] Test: valid signature returns JWT
* [ ] Test: invalid signature returns 401

> Uses in-memory app instance only.

---

## 6. Frontend — TDD for Login Only

### 6.1 Frontend unit tests

* [ ] Test: login flow calls backend endpoints
* [ ] Test: signature is requested from Phantom
* [ ] Test: JWT is stored on success

### 6.2 Frontend integration test (login-only)

* [ ] Mock backend auth API
* [ ] Simulate full login flow

> No other frontend refactors included.

---

## 7. Validation & Completion

* [ ] Backend login logic fully covered by tests
* [ ] Frontend login has test coverage
* [ ] No blockchain RPC or smart contracts involved
* [ ] No unrelated refactors included

---

## Out of Scope (Explicit)

* [ ] User persistence / database
* [ ] Roles and permissions
* [ ] Orders or workflows
* [ ] Blockchain adapters
* [ ] Dagger / CI / deployment

---

## Completion Criteria

* [ ] Login logic is fully backend-driven
* [ ] Frontend contains no authentication business logic
* [ ] Login behavior is reproducible via tests
* [ ] Issue can be closed independently

---

## References

* ADR-001: Wallet-based Authentication (Backend-first)

* This checklist defines the concrete implementation of that decision

