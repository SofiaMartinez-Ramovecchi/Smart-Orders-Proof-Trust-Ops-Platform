# Authentication Architecture

## Purpose

This document describes:

* How authentication works **today** (post HTTP + Phantom integration)
* How it is expected to evolve **tomorrow** as domain features are added

It is a **technical architecture document**, complementary to ADR-001.
While the ADR explains *why* decisions were made, this document explains *how the system is structured and how it grows*.

---

## Architecture – As Is (Current State)

### System Characteristics

* Stateless backend
* No database
* No users or registration
* No roles or permissions
* Wallet-based authentication (Phantom)
* JWT used as session token

The backend’s only responsibility is to:

> Verify an external identity and issue a trusted session token.

---

## Current Authentication Flow

```
Client (Browser / Wallet)
   ↓
AuthController (HTTP)
   ↓
AuthStrategy (PhantomWalletAuthStrategy)
   ↓
VerifiedIdentity
   ↓
LoginService (trivial accept)
   ↓
JwtService
   ↓
JWT returned to client
```

### Responsibilities by Layer

#### HTTP Layer

* Receives requests
* Maps input/output DTOs
* Translates domain errors to HTTP responses
* Contains **no business logic**

#### AuthStrategy (Phantom)

* Validates challenge–response
* Verifies wallet signature via Solana RPC
* Produces a `VerifiedIdentity`
* Knows nothing about users, JWT, or roles

#### VerifiedIdentity

* Represents a verified external identity
* Example fields:

  * identityType
  * provider
  * subject (wallet address)

#### LoginService (Current)

* Accepts any verified identity
* Defines the future extension point for domain logic

#### JwtService

* Issues signed JWTs
* Encodes only trusted, stateless claims

---

## Current JWT Model

### Claims Included

* `sub`: external identity (wallet address)
* `identityType`: WALLET
* `provider`: PHANTOM
* Standard claims (`iat`, `exp`, `iss`)

### Design Rules

* Claims must be valid without DB lookup
* JWT lifetime defines session lifetime
* JWT represents **accepted identity**, not authentication

---

## What the System Does NOT Do (Yet)

* Persist users
* Persist sessions
* Perform authorization checks
* Enforce domain rules
* Link identities

This is intentional.

---

## Architecture – To Be (Future State)

### When This Architecture Evolves

The system evolves only when domain features appear:

* Orders
* Profiles
* Roles / permissions
* Restricted actions

---

## Future Authentication & Login Flow

```
External Proof
   ↓
AuthStrategy (Wallet / Google / Email / etc)
   ↓
VerifiedIdentity
   ↓
LoginService
   ↓
User Resolution / Creation
   ↓
Domain Authorization
   ↓
JwtService (enriched claims)
```

---

## New Components (Future)

### User Entity

* Represents an application-specific actor
* Linked to one or more VerifiedIdentities
* Persisted in database

### Persistence Layer

* Stores users and domain state
* Does NOT store authentication proofs

### Authorization Layer

* Evaluates permissions
* Depends on domain rules
* Independent of authentication mechanisms

---

## Supporting Multiple Authentication Methods

All authentication methods follow the same pipeline:

```
External Proof
→ AuthStrategy
→ VerifiedIdentity
→ Login
→ JWT
```

Adding a new auth method requires:

* New AuthStrategy implementation
* No changes to controllers
* No changes to JWT consumers

---

## Identity Linking (Future)

Because identity is explicit:

* Multiple identities can map to one user
* Wallet + Google + Email can coexist
* Step-up authentication is possible

---

## Smart Contracts & Blockchain Integration

### Current State

* Blockchain used only for identity verification
* No contract calls required for auth

### Future State

* Orders and permissions may be derived from smart contracts
* Blockchain state can enrich authorization decisions
* Authentication remains unchanged

---

## Frontend Integration

### Today

* Frontend obtains JWT after wallet verification
* JWT sent via Authorization header

### Future

* Frontend unaware of auth provider differences
* Frontend relies on stable HTTP auth contract

---

## Design Constraints (Must Hold)

* Authentication logic is provider-agnostic
* Domain logic does not depend on auth provider
* Phantom remains an implementation detail
* Auth core remains reusable

---

## Summary

The current authentication architecture is intentionally minimal and stateless.

It provides:

* Real-world authentication
* Clean extension points
* No premature domain modeling

This design enables future growth into a full user, role, and order system without breaking existing authentication flows.

