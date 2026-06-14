# Purpose

- Owns route-level page components.

## Ownership

- Covers page composition for application routes and route-specific layout/auth wrappers.

## Local Contracts

- Pages should primarily compose feature components and route concerns rather than duplicate shared domain logic.
- Keep route ownership clear: page files define entrypoints, child components own most reusable UI.

## Work Guidance

- When route behavior changes, check whether the change belongs in a page component or a lower domain layer.

## Verification

- Check routing in `src/App.tsx` when page exports or paths change.

## Child DOX Index

- `auth/AGENTS.md`: login, signup, and auth layout pages.
- `calendar/AGENTS.md`: calendar route page.
- `collaboration/AGENTS.md`: collaboration settings and communication pages.
- `integrations/AGENTS.md`: integration route entrypoints and exports.
- `notifications/AGENTS.md`: notifications route page.
- `profile/AGENTS.md`: profile route page.
- `projects/AGENTS.md`: project list and project detail routes.
- `settings/AGENTS.md`: settings route pages.
- `tasks/AGENTS.md`: tasks route page.
- `team/AGENTS.md`: team route page.
