# ADR-002 — Auth Login HTTP Integration

## Status
Proposed

## Context

The domain-level login logic (signature verification + JWT issuance)
is already implemented and covered by unit tests.

The next step is to expose this behavior through an HTTP interface
without leaking business logic into controllers.

This ADR defines:
- the HTTP contract
- the test strategy
- the exact scope of this issue

## Decision

We will implement a thin HTTP layer for authentication login,
with the following constraints:

- Controllers contain no business logic
- All behavior is validated through tests
- The domain remains framework-agnostic
- No persistence or external infrastructure is introduced

## HTTP Endpoints

### `GET /auth/challenge`

- Returns a challenge for a given wallet
- Stateless (in-memory only)
- Used only for login flow

### `POST /auth/login`

- Accepts wallet + signature + challenge
- Delegates verification to domain service
- Returns a signed JWT on success
- Returns 401 on invalid signature

## Test Plan

### Integration (HTTP-level)

- Valid signature returns 200 + JWT
- Invalid signature returns 401
- JWT payload contains wallet
- No JWT is issued on failure

### Out of Scope

- User persistence
- Refresh tokens
- Roles / permissions
- CI / Dagger
- Frontend logic

## Consequences

- HTTP layer stays thin and replaceable
- Login behavior remains driven by tests
- This issue can be closed independently

## Checklist

- [ ] AuthController implemented
- [ ] DTOs defined and validated
- [ ] HTTP integration tests passing
- [ ] No domain logic in controllers
- [ ] Issue can be closed safely

