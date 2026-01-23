# ADR-004: Git Worktree-Based Development Workflow

## Status

Accepted

## Context

As the project grows in complexity, development work is increasingly split into:

* parent issues that define high-level goals (epics)
* sub-issues that represent isolated architectural concerns (e.g. domain, HTTP, frontend)

Using traditional `git checkout` + `git stash` workflows introduced several problems:

* frequent context switching between branches
* accidental work on the wrong branch
* reliance on `git stash`, increasing cognitive load and risk of mistakes
* difficulty keeping domain, HTTP, and frontend work clearly separated

Given the architectural goals of this project (clean architecture, TDD, backend-first, strong separation of concerns), a clearer development workflow was required.

## Decision

We adopt **Git Worktrees** as the primary development workflow.

Each significant issue or sub-issue is developed in its own **dedicated working directory**, backed by a specific Git branch.

Instead of switching branches inside a single directory, we switch **directories**, where:

* one directory == one branch
* one directory == one responsibility

This removes the need for frequent stashing and makes architectural boundaries explicit at the filesystem level.

## Workflow Overview

### Branch Strategy

* `main`: stable baseline
* Parent issue branch (e.g. `10-backend-auth-login-tdd`): coordination and integration
* Sub-issue branches:

  * `11-auth-backend-login-core-tdd-domain-only`
  * `12-auth-backend-login-http`
  * `13-auth-frontend-minimal`

### Directory Layout

```text
Smart-Orders-Proof-Trust-Ops-Platform/        -> parent issue branch
Smart-Orders-auth-domain/                     -> domain sub-issue
Smart-Orders-auth-http/                       -> HTTP sub-issue
Smart-Orders-auth-front/                      -> frontend sub-issue
```

Each directory contains:

* its own checked-out branch
* an independent working tree
* isolated `git status`, commits, and pushes

### Creating a Worktree

From the parent directory:

```bash
git worktree add ../Smart-Orders-auth-domain 11-auth-backend-login-core-tdd-domain-only
```

This:

* creates a new directory
* checks out the specified branch
* does not affect the current working directory

### Working Rules

* **Never** switch branches to work on a different concern
* **Always** change directories instead
* Domain work happens only in the domain worktree
* HTTP work happens only in the HTTP worktree
* Frontend work happens only in the frontend worktree

If you find yourself asking "what branch am I on?", you are likely in the wrong directory.

## Consequences

### Positive

* Eliminates most uses of `git stash`
* Prevents accidental cross-branch contamination
* Makes architectural boundaries tangible
* Aligns well with TDD and incremental development
* Reduces mental overhead and context switching
* Produces cleaner, more understandable Git history

### Trade-offs

* Requires initial learning of `git worktree`
* Slightly higher disk usage due to multiple directories
* Requires discipline in naming branches and directories consistently

## Why This Matters

This project emphasizes:

* backend-first development
* test-driven design
* clean architecture boundaries
* long-term maintainability

Using Git worktrees reinforces these values by making architectural separation explicit not only in code, but also in the developer workflow itself.

This ADR documents the workflow as a **deliberate architectural decision**, not a personal preference.

## References

* Git Documentation: [https://git-scm.com/docs/git-worktree](https://git-scm.com/docs/git-worktree)

