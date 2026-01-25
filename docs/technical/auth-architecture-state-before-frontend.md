# Auth Architecture — State Before Frontend Integration

## Context

This document describes the **current architectural state** of the authentication system *before* frontend integration and *before* real blockchain infrastructure is introduced.

It is not an ADR. It is a **technical snapshot** intended for engineer-to-engineer communication, documenting boundaries, tradeoffs, and consciously deferred decisions.

The goal is to make explicit **where the system stands today**, why it is shaped this way, and what assumptions the frontend and future services must respect.

---

## Current Scope

### What is implemented

* Wallet-based authentication (challenge–response)
* Backend-first, TDD-driven design
* Clear separation between:

  * **Signature verification**
  * **Challenge lifecycle**
  * **Login orchestration**
  * **JWT issuance**
* Full backend coverage:

  * Unit tests (domain)
  * Service-level integration tests
  * HTTP-level integration tests

### What is intentionally excluded

* User persistence / database
* Roles or permissions
* Blockchain RPC / on-chain validation
* Smart contracts
* CI/CD pipelines

These exclusions are deliberate to avoid premature coupling.

---

## Bounded Contexts

### Auth Context

**Responsibility**:

* Prove wallet ownership
* Issue a short-lived identity token (JWT)

**Does NOT**:

* Know who the user is
* Assign roles
* Persist identity
* Authorize domain actions

Auth answers only one question:

> “Does this request prove control of a given wallet?”

---

### Future Contexts (Not Implemented)

#### Identity / Roles

* Will consume wallet identity
* Will map wallets to roles, permissions, or profiles
* Completely separate lifecycle from Auth

#### Orders / Workflows

* Will trust JWT issued by Auth
* Will not verify signatures
* Will not handle wallet logic

---

## Login Flow (Conceptual)

1. Client requests a challenge
2. Backend issues a unique, single-use challenge
3. Wallet signs the challenge
4. Backend verifies signature
5. Backend consumes the challenge
6. Backend issues a JWT containing wallet identity

This flow is **stateless except for challenge tracking**.

---

## API Design Philosophy

### Why HATEOAS-style responses

HATEOAS is used **as a constraint, not a framework**.

Goals:

* Avoid frontend assumptions
* Allow backend-driven flow evolution
* Make authentication steps explicit

The frontend should *follow links*, not hardcode flows.

---

### Example: Login Challenge Response

```json
{
  "challenge": "login:abc123",
  "expiresAt": "2026-01-25T02:00:00Z",
  "_links": {
    "sign": {
      "href": "/auth/login",
      "method": "POST"
    }
  }
}
```

The frontend does not infer next steps.
It reads them.

---

### Example: Login Success Response

```json
{
  "token": "<jwt>",
  "_links": {
    "self": {
      "href": "/auth/session"
    }
  }
}
```

The token represents **verified wallet control**, nothing more.

---

## Gateway Contract (Future)

The system is designed to support an API Gateway without refactors.

### Gateway responsibilities

* Route requests to bounded contexts
* Validate JWT
* Enforce transport-level security

### Gateway does NOT

* Interpret roles
* Understand wallet logic
* Orchestrate login

---

## Tradeoffs & Known Limitations

### Accepted tradeoffs

* JWT is issued without persistence
* No revocation mechanism yet
* In-memory challenge storage

These are acceptable because:

* Auth logic is isolated
* Contracts are explicit
* Replacement is localized

---

### Deferred decisions (Consciously)

* Token refresh strategy
* Role-based authorization
* On-chain verification
* Multi-device sessions

Deferring these avoids architectural lock-in.

---

## Frontend Expectations

Frontend is expected to:

* Treat Auth as a black box
* Follow API links
* Never verify signatures or challenges
* Never construct JWT payloads

Frontend responsibility ends at:

> UX + signature capture

---

## What Will Change Later

When blockchain integration is added:

* SignatureService implementation will change
* Tests will remain
* LoginService contract will not

This is the key architectural invariant.

---

## Summary

This architecture prioritizes:

* Explicit boundaries
* Test-driven behavior
* Backend authority
* Future adaptability

No feature was added without a contract.
No contract was added without tests.

This document freezes that state before frontend integration.

