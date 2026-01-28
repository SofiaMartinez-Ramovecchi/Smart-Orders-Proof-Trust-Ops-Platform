# Auth Login — Architecture Logbook (Pre-Frontend)

## Context
I make http issue, when i finished controllers with tdd, I begin gateway proxy with caddy, my test gateway fail and I reflections about boundary and arch decisions.

## What I discovered
- Identity ≠ Auth
- Roles live in Identity
- Gateway as security boundary
- Contracts first saved me

## What I intentionally postponed
- Blockchain real
- Roles & permissions
- Orders domain

## Current Architecture Snapshot
(Auth / Gateway / Infra / Blockchain)

## Issue Breakdown & Rationale
ISSUE 1 — Frontend
ISSUE 2 — CI/CD & Infra
ISSUE 3 — Blockchain Auth

## Backlog That Emerged Naturally
(lista viva)

## PM / Engineering Reflection
I get decision of focused me in login auth only, because I don't mix responsabilities, and finished one issue good before other issue or responsability.

## Next Revisit Points
- After frontend
- After CI/CD
- Before blockchain integration

