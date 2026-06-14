# Purpose

- Owns integration route entrypoints.

## Ownership

- Covers the integrations page and route-level export surface for this domain.

## Local Contracts

- Keep service-specific reusable panels in `src/components/integrations`; keep route composition here.

## Work Guidance

- Be careful with index exports because the route import currently depends on this subtree's module surface.

## Verification

- Check `src/App.tsx` and route imports after export changes.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
