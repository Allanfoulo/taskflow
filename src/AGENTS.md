# Purpose

- Owns the application source tree for the frontend.

## Ownership

- Covers app bootstrapping, routes, UI domains, styling, hooks, contexts, and frontend utilities.

## Local Contracts

- Respect the existing route and domain separation: pages compose features, components implement reusable UI, contexts manage cross-cutting state, and `lib` holds shared helpers/config.
- Keep edits within the most specific domain possible before reaching for cross-cutting changes.

## Work Guidance

- Favor domain-local changes over broad shared rewrites unless the task genuinely spans multiple areas.
- When a subtree accumulates its own stable rules, keep them in that subtree's AGENTS.md instead of duplicating them here.

## Verification

- Run `npm run dox:check` after meaningful source-structure changes.
- Run targeted code verification appropriate to the edited area when behavior changes.

## Child DOX Index

- `components/AGENTS.md`: reusable UI and domain component implementation.
- `contexts/AGENTS.md`: React providers and shared state boundaries.
- `hooks/AGENTS.md`: custom React hooks.
- `lib/AGENTS.md`: utility helpers and service configuration.
- `pages/AGENTS.md`: route-level page composition.
- `styles/AGENTS.md`: CSS assets and responsive styling helpers.
