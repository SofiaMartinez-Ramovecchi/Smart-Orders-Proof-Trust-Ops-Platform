# Backend Refactor — Separación Frontend / Backend / Blockchain

## 1. Objetivo técnico

El objetivo de esta etapa **no es agregar nuevas features**, sino refactorizar la arquitectura para:

* Separar correctamente responsabilidades entre **frontend, backend y blockchain**.
* Asegurar que cada capa sea **testeable de forma aislada**, **reemplazable** y **verificable**.

Este refactor apunta a sentar bases sólidas para el crecimiento del proyecto, evitando acoplamientos tempranos y deuda técnica futura.

### Principios clave

* **TDD-first en el backend**
* **Frontend desacoplado del chain**
* **Blockchain como infraestructura**, no como core lógico
* **Smart contracts modulares y versionables**
* **Integración reproducible vía Dagger**

---

## 2. Separación Front / Back — criterio real

### ❌ Lo que NO debe hacer el frontend

* Validar reglas de negocio
* Decidir estados válidos
* Hablar directamente con Solana para lógica crítica
* Conocer detalles internos del programa on-chain

### ✅ Lo que SÍ hace el frontend

* UX / UI
* Captura de firmas (ej. Phantom)
* Mostrar estados
* Llamar al backend vía HTTP

---

### ❌ Lo que NO debe hacer el backend

* Manejar claves privadas
* Firmar por el usuario
* Tomar decisiones subjetivas

### ✅ Lo que SÍ hace el backend

* Verificar firmas
* Emitir challenges
* Validar roles
* Orquestar interacciones con la blockchain
* Exponer una API estable

> El backend es el **cerebro**, el frontend es la **cara**, la blockchain es la **verdad**.

---

## 3. Arquitectura general

### Diagrama de alto nivel (C4 simplificado)

```
User --> Frontend (UI)
Frontend --> Backend (REST)
Frontend --> Phantom (Signature)
Backend --> SolanaProxy (RPC)
SolanaProxy --> OrderImplementation (CPI)
```

---

## 4. Tesis técnica del Backend (NestJS)

### Rol del backend

El backend **no es un API CRUD**. Es un **orquestador verificable**.

### Responsabilidades

* Autenticación basada en firma
* Autorización por rol
* Validación de workflows
* Abstracción del chain
* Observabilidad y auditoría off-chain

### Capas internas (NestJS)

```
src/
├── auth/
│   ├── challenge.service.ts
│   ├── signature.service.ts
│   ├── auth.controller.ts
│
├── orders/
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── orders.workflow.ts
│
├── blockchain/
│   ├── blockchain.port.ts
│   ├── tatum.adapter.ts
│   ├── proxy.client.ts
│
├── common/
│   ├── roles.ts
│   ├── errors.ts
│
└── app.module.ts
```

**Clave:** `blockchain.port.ts` define el contrato. Tatum, Solana RPC o mocks deben ser intercambiables.

---

## 5. Tesis técnica del Frontend (React)

### Rol del frontend

El frontend **nunca debe conocer reglas**, solo **estados**.

### Responsabilidades

* Login con Phantom
* Mostrar órdenes
* Disparar acciones
* Visualizar timeline

### Arquitectura del frontend

```
src/
├── api/
│   ├── auth.api.ts
│   ├── orders.api.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useOrders.ts
│
├── components/
│   ├── OrderList.tsx
│   ├── OrderTimeline.tsx
│
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│
└── main.tsx
```

> El frontend habla solo con HTTP, nunca con Solana directamente.

---

## 6. Contrato Backend ↔ Frontend

### Login con Phantom (flujo)

```
FE -> BE : GET /auth/challenge
BE -> FE : challenge
FE -> Phantom : sign(challenge)
Phantom -> FE : signature
FE -> BE : POST /auth/verify
BE -> FE : JWT
```

### Crear orden

```
POST /orders
Authorization: Bearer <jwt>

{
  "title": "...",
  "details": "...",
  "amount": 1500,
  "finance": "...",
  "logistics": "..."
}
```

---

## 7. Estrategia TDD (clave)

### Feature inicial elegida

**Auth: login con Phantom**

Motivos:

* Feature crítica
* Transversal a todo el sistema
* No depende del chain
* Define la arquitectura futura

### Ciclo TDD Backend

1. Test: verifica firma válida
2. Test: rechaza firma inválida
3. Test: emite JWT
4. Implementación mínima
5. Refactor

> En esta fase **no hay blockchain**.

---

## 8. Stack de testing recomendado

### Backend

* Jest → unit tests
* Supertest → controller tests
* jest-mock / ts-mockito → puertos
* Testcontainers → más adelante
* Dagger → integración real

Los tests apuntan a **puertos**, no a implementaciones.

### Frontend (por ahora)

* Vitest
* Testing Library
* Mock de API

No enfocar todavía en E2E.

---

## 9. Proxy Pattern para Smart Contracts

### Problema

Cada cambio en el programa implica:

* Re-deploy
* Nuevo programId
* Migraciones
* Fricción

### Solución: Proxy Program

```
Client -> ProxyProgram
ProxyProgram -> ImplementationV1
ProxyProgram -> ImplementationV2
```

### Concepto

* El Proxy tiene un `program_id` estable
* Guarda la implementación activa
* Todas las instrucciones entran al proxy
* El proxy hace CPI al contrato real

### Beneficios

* Upgrade sin migrar órdenes
* Versionado por feature
* A/B testing on-chain
* Reemplazo de lógica sin romper front/back

### Backend + Tatum

El backend:

* Siempre habla con el Proxy Program
* Nunca con implementaciones

```ts
interface BlockchainPort {
  createOrder(...)
  markPaid(...)
}
```

---

## 10. Roadmap técnico

### Fase 1 — Backend puro (TDD)

* Auth con Phantom (tests)
* JWT
* Roles

### Fase 2 — Orders sin blockchain

* Workflow en memoria
* Tests de transición

### Fase 3 — Blockchain adapter

* Implementar `BlockchainPort` con Tatum
* Mocks para tests

### Fase 4 — Proxy program

* Deploy proxy
* Deploy implementation v1

### Fase 5 — Integración

* Pipeline Dagger
* Test end-to-end real

---

## Conclusión

Este refactor **no es overengineering**. Es ingeniería correcta para un producto serio.

Con esto se logra:

* Separación clara de dominios
* Upgradeabilidad real
* Alta testabilidad
* Reducción de riesgo futuro

La recomendación es clara: **arrancar por TDD del backend con auth + signature**. Todo lo demás se apoya sobre esta base.


# Backend Refactor — Frontend / Backend / Blockchain Separation

## 1. Technical Objective

The goal of this stage is **not to add new features**, but to refactor the architecture in order to:

* Properly separate responsibilities between **frontend, backend, and blockchain**.
* Ensure that each layer is **independently testable**, **replaceable**, and **verifiable**.

This refactor aims to establish solid foundations for future growth, avoiding early coupling and long-term technical debt.

### Key Principles

* **TDD-first on the backend**
* **Frontend fully decoupled from the blockchain**
* **Blockchain treated as infrastructure**, not as core business logic
* **Modular and versionable smart contracts**
* **Reproducible integration via Dagger**

---

## 2. Frontend / Backend Separation — Practical Criteria

### ❌ What the frontend must NOT do

* Validate business rules
* Decide valid state transitions
* Interact directly with Solana for critical logic
* Know internal details of on-chain programs

### ✅ What the frontend DOES

* UX / UI
* Signature capture (e.g. Phantom)
* Display states
* Call the backend via HTTP

---

### ❌ What the backend must NOT do

* Handle private keys
* Sign transactions on behalf of users
* Make subjective decisions

### ✅ What the backend DOES

* Verify signatures
* Issue authentication challenges
* Validate roles
* Orchestrate blockchain interactions
* Expose a stable API

> The backend is the **brain**, the frontend is the **face**, and the blockchain is the **source of truth**.

---

## 3. General Architecture

### High-level diagram (simplified C4)

```
User --> Frontend (UI)
Frontend --> Backend (REST)
Frontend --> Phantom (Signature)
Backend --> SolanaProxy (RPC)
SolanaProxy --> OrderImplementation (CPI)
```

---

## 4. Backend Technical Thesis (NestJS)

### Backend role

The backend is **not a CRUD API**. It is a **verifiable orchestrator**.

### Responsibilities

* Signature-based authentication
* Role-based authorization
* Workflow validation
* Blockchain abstraction
* Off-chain observability and auditing

### Internal layers (NestJS)

```
src/
├── auth/
│   ├── challenge.service.ts
│   ├── signature.service.ts
│   ├── auth.controller.ts
│
├── orders/
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── orders.workflow.ts
│
├── blockchain/
│   ├── blockchain.port.ts
│   ├── tatum.adapter.ts
│   ├── proxy.client.ts
│
├── common/
│   ├── roles.ts
│   ├── errors.ts
│
└── app.module.ts
```

**Key point:** `blockchain.port.ts` defines the contract. Tatum, Solana RPC, or mocks must be interchangeable.

---

## 5. Frontend Technical Thesis (React)

### Frontend role

The frontend must **never know business rules**, only **states**.

### Responsibilities

* Phantom-based login
* Display orders
* Trigger actions
* Render timelines

### Frontend architecture

```
src/
├── api/
│   ├── auth.api.ts
│   ├── orders.api.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useOrders.ts
│
├── components/
│   ├── OrderList.tsx
│   ├── OrderTimeline.tsx
│
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│
└── main.tsx
```

> The frontend communicates **only via HTTP**, never directly with Solana.

---

## 6. Backend ↔ Frontend Contract

### Phantom login flow

```
FE -> BE : GET /auth/challenge
BE -> FE : challenge
FE -> Phantom : sign(challenge)
Phantom -> FE : signature
FE -> BE : POST /auth/verify
BE -> FE : JWT
```

### Create order

```
POST /orders
Authorization: Bearer <jwt>

{
  "title": "...",
  "details": "...",
  "amount": 1500,
  "finance": "...",
  "logistics": "..."
}
```

---

## 7. TDD Strategy (Critical)

### Initial feature selection

**Auth: Phantom-based login**

Why:

* Business-critical
* Cross-cutting concern
* Does not depend on blockchain
* Defines future architecture

### Backend TDD cycle

1. Test: verifies valid signature
2. Test: rejects invalid signature
3. Test: issues JWT
4. Minimal implementation
5. Refactor

> No blockchain involvement at this stage.

---

## 8. Recommended Testing Stack

### Backend

* Jest → unit tests
* Supertest → controller tests
* jest-mock / ts-mockito → ports
* Testcontainers → later stages
* Dagger → real integration

Tests must target **ports**, not implementations.

### Frontend (for now)

* Vitest
* Testing Library
* API mocks

No E2E focus yet.

---

## 9. Proxy Pattern for Smart Contracts

### The problem

Every program change implies:

* Re-deploy
* New programId
* Migrations
* Friction

### The solution: Proxy Program

```
Client -> ProxyProgram
ProxyProgram -> ImplementationV1
ProxyProgram -> ImplementationV2
```

### Concept

* The Proxy has a stable `program_id`
* Stores the active implementation address
* All instructions go through the proxy
* The proxy performs CPI to the real contract

### Benefits

* Upgrades without migrating orders
* Feature-based versioning
* On-chain A/B testing
* Logic replacement without breaking front/back

### Backend + Tatum

The backend:

* Always communicates with the Proxy Program
* Never with implementations directly

```ts
interface BlockchainPort {
  createOrder(...)
  markPaid(...)
}
```

---

## 10. Technical Roadmap

### Phase 1 — Pure backend (TDD)

* Phantom auth (tests)
* JWT
* Roles

### Phase 2 — Orders without blockchain

* In-memory workflow
* Transition tests

### Phase 3 — Blockchain adapter

* Implement `BlockchainPort` with Tatum
* Mocks for testing

### Phase 4 — Proxy program

* Deploy proxy
* Deploy implementation v1

### Phase 5 — Integration

* Dagger pipeline
* Real end-to-end test

---

## Conclusion

This refactor is **not overengineering**. It is correct engineering for a serious product.

It enables:

* Clear domain separation
* Real upgradeability
* High testability
* Reduced future risk

The recommendation is clear: **start with backend TDD for auth + signature**. Everything else builds on this foundation.

