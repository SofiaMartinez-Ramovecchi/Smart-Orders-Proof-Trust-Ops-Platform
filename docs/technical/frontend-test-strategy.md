# Frontend Test Strategy — Gateway & Wallet Mocking

**Status:** Proposed
**Audience:** Frontend / Fullstack Engineers
**Scope:** Login flow only (pre-MVP)

---

## 1. Purpose

This document defines how the frontend will be tested **without coupling to backend services, blockchain nodes, or wallet extensions**.

The goal is to:

* validate frontend behavior deterministically
* avoid flaky E2E tests tied to infra
* preserve backend-first architecture
* enable parallel development

The frontend **never mocks backend internals** — it only mocks the **Gateway contract**.

---

## 2. Core Principle

> **The frontend only knows the Gateway.**

Everything else is an implementation detail.

```
Frontend ──▶ Gateway (mocked)
   │
   └──▶ Wallet Adapter (mocked)
```

---

## 3. What We Mock (and Why)

### 3.1 API Gateway (Required)

The Gateway is mocked because:

* it defines the public API contract
* it is stable and versioned
* it represents real production behavior

The frontend never mocks:

* AuthService
* IdentityService
* OrdersService

Those are backend concerns.

---

### 3.2 Wallet Adapter (Required)

Wallets (Phantom, etc.) are:

* external
* browser-dependent
* non-deterministic

Therefore, the frontend uses a **Wallet Adapter interface** that can be mocked.

Example interface:

```ts
export interface WalletAdapter {
  connect(): Promise<{ publicKey: string }>;
  signMessage(message: string): Promise<string>;
}
```

---

## 4. Test Levels

### 4.1 Unit Tests (Components / Hooks)

**Scope:**

* UI state
* user interactions
* form validation

**Mocks:**

* Gateway client (mocked responses)
* Wallet adapter

**Examples:**

* renders login button
* shows error on failed login
* disables button while loading

---

### 4.2 Integration Tests (Login Flow)

**Scope:**

* full login flow
* orchestration correctness

**Mocks:**

* Gateway HTTP contract
* Wallet adapter

**Does NOT mock:**

* internal component wiring

---

### 4.3 What We Explicitly Avoid

We do **not** do:

* browser wallet E2E tests
* blockchain RPC calls
* real JWT validation

Those belong to backend and infra testing.

---

## 5. Gateway Mocking Strategy

### 5.1 Contract-Driven Mocking

Mocks must conform to:

```
contracts/gateway.contract.json
```

No ad-hoc responses are allowed.

Example mocked response:

```json
{
  "token": "fake-jwt",
  "links": {
    "me": "/identity/me",
    "orders": "/orders"
  }
}
```

---

### 5.2 HTTP Mocking Tools

Recommended options:

* MSW (Mock Service Worker)
* fetch/axios mocks

The key rule:

> **Mocks simulate HTTP, not functions.**

---

## 6. Wallet Mocking Strategy

The wallet adapter is mocked at the boundary.

Example:

```ts
const mockWallet: WalletAdapter = {
  connect: async () => ({ publicKey: 'TEST_WALLET' }),
  signMessage: async () => 'SIGNED_CHALLENGE',
};
```

This allows:

* deterministic signatures
* reproducible tests
* no browser extension dependency

---

## 7. Example: Login Integration Test

```ts
it('logs in successfully', async () => {
  mockGateway.post('/auth/login').reply(200, {
    token: 'fake-jwt',
    links: { orders: '/orders' },
  });

  mockWallet.signMessage.mockResolvedValue('signature');

  await login();

  expect(store.token).toBe('fake-jwt');
});
```

---

## 8. Error Scenarios to Cover

Frontend tests must cover:

* invalid signature (401)
* expired challenge
* network failure
* wallet rejection

Each scenario is mocked via Gateway responses.

---

## 9. Contract Ownership

* Backend owns the Gateway contract
* Frontend consumes it
* Changes require contract update + coordinated tests

This prevents silent breaking changes.

---

## 10. Summary

This strategy ensures:

* frontend autonomy
* backend-driven architecture
* stable, fast tests
* clean separation of concerns

Frontend development proceeds **with confidence**, even while backend and infra evolve.

