# ADR-004 — API Boundaries & HATEOAS Conventions

## Status

Accepted (initial scope)

## Context

The authentication domain has reached a stable backend-first state:

* Domain logic is isolated and fully tested
* HTTP layer exists only as an adapter
* No frontend or blockchain integration is in scope yet

Before exposing this API to a frontend or a gateway, it is necessary to define **clear API boundaries** and a **consistent response contract** that can evolve safely.

This ADR focuses only on **conventions**, not on full implementation.

---

## Decision

### 1. Why HATEOAS

HATEOAS is adopted as a **guiding convention**, not as a heavy framework requirement.

It is used to:

* Make API flows explicit and discoverable
* Avoid hard‑coding frontend navigation rules
* Allow the backend to remain the source of truth for valid next actions

Example intent:

* After requesting a challenge, the API explicitly exposes that `login` is the next allowed action
* After a successful login, the API exposes that authenticated resources are now available

The frontend consumes links, not assumptions.

---

### 2. Problems this avoids

This decision prevents:

* Tight coupling between frontend state machines and backend logic
* Frontend assumptions about authentication flow order
* Future breaking changes when adding roles, policies or gateways

It also enables:

* Multiple clients (web, mobile, services) without duplicated logic
* Easier evolution toward a gateway‑based architecture

---

### 3. What is explicitly NOT done yet

The following are intentionally out of scope for this stage:

* Full HATEOAS compliance or media‑type negotiation
* Role‑based authorization links
* API versioning strategy
* Gateway orchestration logic
* Cross‑service navigation between Auth and Orders

Only **Auth → Login flow contracts** are defined at this stage.

---

## Consequences

* API responses will include semantic `links` objects where relevant
* Controllers remain thin translators
* Domain services remain unaware of HTTP or navigation concerns

This ADR establishes a stable foundation for future frontend and gateway work without over‑engineering the current scope.

