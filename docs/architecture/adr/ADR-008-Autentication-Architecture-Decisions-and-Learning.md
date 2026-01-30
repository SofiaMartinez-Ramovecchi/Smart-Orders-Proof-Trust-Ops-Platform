# ADR-001 – Authentication Architecture

## Status

Accepted

## Context

This ADR consolidates the architectural decisions and learnings from:

* The initial authentication HTTP integration issue
* The Phantom wallet authentication design and preparation

The system is currently in an early stage, focused on **authentication and session issuance**, without persistence, users, or authorization rules. This ADR documents **why this approach was chosen**, what trade-offs were made, and how the architecture is expected to evolve safely.

---

## Problem Statement

The application needs an authentication mechanism that:

* Works with blockchain wallets (initially Phantom / Solana)
* Can later support other authentication methods (Google, email, SMS)
* Does not prematurely introduce users, roles, or persistence
* Remains reusable across applications
* Avoids tight coupling between authentication technology and application logic

---

## Decision Summary

We explicitly separate the system into:

1. **Authentication (external identity verification)**
2. **Login (application acceptance of identity)**
3. **Session (JWT with trusted claims)**

At the current stage, the system implements:

* Authentication
* Session issuance

Login remains **trivial and implicit** until business rules or persistence are required.

---

## Key Concepts & Definitions

### Authentication (Auth)

* Verifies an external identity
* Depends on third-party systems (wallets, OAuth providers)
* Produces a `VerifiedIdentity`
* Reusable across applications

### Identity

* External, verifiable identifier (wallet, email, provider subject)
* Stateless
* Not an application user

### Login

* Application-level decision
* Accepts or rejects a verified identity
* May create or resolve internal state
* Deferred until persistence or domain rules exist

### JWT (Session Token)

* Represents an identity accepted by the application
* Transports trusted claims
* Is not authentication or login itself

### Claims

* Assertions trusted by the backend while the token is valid
* Limited to data that does not require DB lookups

---

## Current Architecture (Today)

### Characteristics

* Stateless backend
* Wallet-based authentication (Phantom)
* No database
* No users, roles, or permissions

### Current Flow

```
Client
  ↓
AuthController (HTTP)
  ↓
AuthStrategy (Wallet / Phantom)
  ↓
VerifiedIdentity
  ↓
JwtService
  ↓
JWT returned to client
```

### Current JWT Claims

* `sub`: external identity (wallet address)
* `identityType`: WALLET
* `provider`: PHANTOM
* Standard claims (`iat`, `exp`, `iss`)

This flow represents **authentication + session issuance**, not full domain login.

---

## Explicit Non-Decisions (Deferred by Design)

The following concepts are intentionally not implemented at this stage:

* User entity
* Registration flow
* Database persistence (e.g., MongoDB)
* Roles and permissions
* Identity linking
* Multi-factor authentication

These will be introduced only when required by domain features.

---

## Minimal Structural Decisions (Now)

### AuthStrategy Abstraction

An `AuthStrategy` interface is introduced to decouple authentication mechanisms from application logic.

* Each strategy verifies identity
* Strategies do not issue JWTs
* Strategies do not know about HTTP, users, or roles

### VerifiedIdentity

A simple domain object representing the result of authentication.

Purpose:

* Remove provider-specific details from the rest of the system
* Enable multiple authentication methods

### LoginService

Login logic remains intentionally trivial:

> "Any verified identity is accepted"

This defines a clear extension point for future persistence and authorization.

---

## Future Architecture (Intended Evolution)

### When Domain Features Appear

When the application introduces:

* Orders
* Roles
* Permissions
* Profiles

The login process will evolve to:

```
AuthStrategy
   ↓
VerifiedIdentity
   ↓
LoginService
   ↓
User resolution / creation
   ↓
JWT enriched with domain claims
```

### New Responsibilities (Future)

* Persist users
* Auto-register identities
* Assign roles and permissions
* Enrich JWT with authorization claims

Authentication strategies remain unchanged.

---

## Reusable vs Application-Specific Boundaries

### Reusable Authentication Core

* AuthStrategy interface
* Identity verification
* Challenge-response mechanisms
* Cryptographic validation

### Application Domain

* Login rules
* JWT claim structure
* Roles and permissions
* Post-login behavior

---

## Design Invariants

The following rules must never be violated:

* Authentication strategies never emit JWTs
* Login never verifies external proofs
* JWT represents accepted identity, not authentication
* HTTP layer contains no business logic

---

## Consequences

### Positive

* Enables real-world authentication integration early
* Avoids premature domain modeling
* Supports multiple auth providers without refactor
* Keeps backend reusable and extensible

### Trade-offs

#### No Persistence or Authorization Initially

**What this means**

At this stage, the system does **not persist users, sessions, or permissions** in a database. Identity continuity is achieved exclusively through JWTs traveling in HTTP headers.

* The JWT is the only carrier of identity
* Claims are minimal and trusted for the lifetime of the token
* No server-side session state exists

**Why this is acceptable now**

* There are no domain entities yet that require persistence (orders, profiles, roles)
* There is no business rule that depends on historical user state
* Wallet-based identity is already globally unique

Introducing a database at this stage would add complexity without enabling new behavior.

---

#### Authorization Is Not Yet Required

**Authorization** answers the question:

> *What is this identity allowed to do?*

Today, the system has no differentiated permissions:

* All verified identities are treated equally
* There are no protected domain actions

Because of this:

* There is nothing meaningful to authorize
* Adding roles or permissions would be speculative

Authorization is intentionally deferred until domain features (orders, admin actions, restricted flows) exist.

---

#### Login Logic Is Minimal by Design

The current login behavior is intentionally simple:

> "Any verified identity is accepted and issued a JWT"

This is not a shortcut — it is a **conscious design decision**:

* It establishes a clear seam where future logic will live
* It avoids encoding business rules before they are known
* It keeps authentication reusable and framework-agnostic

Login will evolve only when the application needs to:

* Persist users
* Enforce rules
* Associate identity with business data

These trade-offs are intentional and revisited as the domain evolves.

---

## Plugin-Based Architecture Vision

The authentication system is designed as a **core + extensions** model.

### Core Auth (Reusable Across Applications)

The core authentication layer is independent of any specific business domain.

It includes:

* AuthStrategy interface
* Identity verification logic
* Challenge–response flows
* Cryptographic validation
* VerifiedIdentity model

This core can be reused unchanged in:

* Web apps
* APIs
* Internal services
* Other business domains

### Auth Plugins (Authentication Methods)

Authentication methods are added as plugins by implementing `AuthStrategy`:

Examples:

* Phantom / Solana wallet
* Google OAuth
* Email magic link
* SMS OTP
* Password-based auth
* Two-factor authentication

Each plugin:

* Verifies an external proof
* Produces a VerifiedIdentity
* Does not depend on application business logic

---

### Application Domain Extensions

On top of the auth core, each application layers its **own domain logic**.

In this application, future domain-specific concerns include:

* Orders
* Roles
* Permissions
* Profiles
* Blockchain smart contract interactions

These concerns:

* Live outside the auth core
* Are specific to the business model
* Can evolve without modifying authentication mechanisms

---

## Domain vs Reusable Boundaries

### Reusable (Cross-Domain)

* Authentication flows
* Identity verification
* JWT issuance mechanics
* Cryptographic trust

These elements can be extracted and reused in other products.

### Application Domain (Business Model)

* What happens *after* login
* What data is persisted
* Which actions are allowed
* How identities relate to domain entities (orders, profiles)

This separation ensures the auth system remains stable while the business evolves.

---

## Future Consideration: HTTP Contract & Auth Assertions

A future hardening step will introduce **explicit HTTP contract assertions** for the authentication API.

This includes:

* Exact request/response schemas
* Stable HTTP status semantics
* Strict validation of auth error cases
* Backward-compatible evolution guarantees

These contract tests will ensure:

* Frontends can rely on stable auth behavior
* New auth methods do not break existing clients

This is intentionally deferred until the authentication surface stabilizes.

---

## Long-Term Vision

This backend can evolve into:

* A reusable authentication API
* A plugin-based auth system with domain-specific extensions
* A stable core that supports new authentication methods without refactor

This ADR acts as a **design log and guardrail**, capturing why the architecture is minimal today and how it safely grows tomorrow.

