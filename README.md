Smart Orders Platform – Proof of Concept

This repository contains a Proof of Concept (PoC) for Smart Orders Platform:
a verifiable operations system based on signed workflows, role-based actions, and immutable state transitions on-chain.

The project demonstrates how operational processes (payments, shipping, delivery, confirmations) can be modeled as cryptographically verifiable facts, removing ambiguity, disputes, and trust assumptions between parties.

🧩 Project Components

Backend
NestJS API with Solana integration (authentication, verification, orchestration)

Frontend
React-based UI (non-technical friendly) interacting with Phantom Wallet and the Solana program

🚀 Quick Start (Docker – Recommended)

The backend and frontend are deployed independently.
There is no docker-compose by design.

Requirements

Docker

Git

📁 Repository Structure
smart-orders/
├── backend/        # NestJS API (Render)
├── frontend/       # React UI (Vercel)
└── README.md

🔧 Backend – NestJS API
1️⃣ Environment configuration
cd backend
cp .env.example .env


Example .env:

PORT=3000
JWT_SECRET=supersecret
SOLANA_RPC_URL=https://api.devnet.solana.com

2️⃣ Build & run with Docker
docker build -t smart-orders-backend .
docker run -p 3000:3000 --env-file .env smart-orders-backend


Backend will be available at:

http://localhost:3000

🎨 Frontend – React UI
1️⃣ Environment configuration
cd frontend
cp .env.example .env


Example .env:

VITE_API_URL=http://localhost:3000
VITE_PROGRAM_ID=YOUR_PROGRAM_ID
VITE_RPC_URL=https://api.devnet.solana.com

2️⃣ Build & run with Docker
docker build -t smart-orders-frontend .
docker run -p 5173:80 smart-orders-frontend


Frontend will be available at:

http://localhost:5173

🔗 Deployed Demo

Frontend (Vercel)
👉 smart-orders-proof-trust-ops-platfo.vercel.app
 

Backend (Render)
👉 https://smart-orders-backend.onrender.com

🔐 Authentication Flow – Phantom Login

Smart Orders does not rely on passwords or traditional sessions.

Login flow

User connects Phantom Wallet from the frontend

Backend issues a challenge message

User signs the message with Phantom

Backend verifies the signature

A JWT is issued and returned to the frontend

This guarantees:

Wallet ownership

Non-repudiation

No shared secrets

📡 API Endpoints (Backend)
Authentication
POST /auth/challenge
POST /auth/login

Orders
GET    /orders
POST   /orders
POST   /orders/:id/mark-paid
POST   /orders/:id/mark-shipping
POST   /orders/:id/mark-delivered
POST   /orders/:id/mark-received


All critical transitions are validated on-chain, not just in the API.

🔄 Order Workflow (On-chain)

Each order is an immutable state machine:

Created → Paid → Shipping → Delivered → Received

Role-based permissions

Customer

Create order

Confirm received

Finance

Mark order as paid

Logistics

Mark shipping

Mark delivered

Invalid transitions are rejected by the Solana program itself.

📌 What This PoC Demonstrates

Orders modeled as on-chain immutable workflows

Role-based transitions enforced on-chain

Cryptographic signatures per role

Multiple orders per user using PDAs

Full historical traceability

UI abstraction for non-technical users

⚠️ This is a Proof of Concept, not production-ready software.

🧠 Project Status
Area	Status
Core technical hypothesis	✅ Validated
On-chain workflow rules	✅ Validated
Phantom login flow	✅ Validated
UI usability	✅ Validated
Production hardening	❌ Pending
Enterprise features	❌ Out of scope
🧪 Proof of Concept Scope

This PoC intentionally focuses only on risk validation:

Can workflows be enforced on-chain? → ✅

Can multiple roles sign independently? → ✅

Can data be audited without trust? → ✅

Everything beyond that (billing, admin panels, analytics, compliance tooling) is intentionally excluded.

🛣️ Next Steps (Post-PoC)

Harden backend security & rate limiting

Indexer or hybrid off-chain cache

Multi-organization support

SLA analytics dashboards

Enterprise audit exports

Legal & compliance review

🧠 Final Note

Smart Orders Platform is not a blockchain app and not an ERP.

It is a trust infrastructure.

It does not replace existing systems —
it makes them auditable, verifiable, and dispute-proof.
