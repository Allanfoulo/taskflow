# Purpose

- Owns the Convex backend for this repository.

## Ownership

- Covers schema, auth setup, HTTP routes, server functions, and backend-side migration helpers.

## Local Contracts

- Keep authorization and data validation on the server instead of trusting frontend inputs.
- Treat generated files under `_generated` as build output; do not hand edit them.

## Work Guidance

- Prefer focused domain files over one large backend module.
- Keep frontend-facing shapes close to existing app contracts when migrating from Supabase.
- Keep reusable demo or migration dataset utilities in dedicated backend modules instead of mixing them into product CRUD files.

## Verification

- Run Convex code generation or deployment sync after backend function changes.
- Verify auth and affected query or mutation flows from the frontend after schema or auth edits.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
