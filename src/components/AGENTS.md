# Purpose

- Owns reusable UI building blocks and domain feature components.

## Ownership

- This subtree contains shared primitives in `ui` plus feature-oriented components grouped by domain.

## Local Contracts

- Keep shared primitives in `ui` generic and reusable.
- Keep domain components near their feature area instead of promoting them to shared scope prematurely.
- When a component is tightly coupled to a page or feature domain, preserve that boundary in naming and placement.

## Work Guidance

- Prefer editing the smallest owning domain first.
- Extract common behavior only when at least two domains need the same contract.

## Verification

- Check imports after moves or renames because this subtree is heavily cross-referenced.

## Child DOX Index

- `ai/AGENTS.md`: AI assistant UI and AI-driven feature surfaces.
- `analytics/AGENTS.md`: reporting and analytics widgets.
- `auth/AGENTS.md`: authentication forms and account recovery UI.
- `collaboration/AGENTS.md`: collaboration, comments, notifications, and activity UI.
- `dashboard/AGENTS.md`: dashboard-specific insight components.
- `integrations/AGENTS.md`: external service integration panels.
- `layout/AGENTS.md`: shell, navigation, and layout scaffolding.
- `projects/AGENTS.md`: project management feature components.
- `tasks/AGENTS.md`: task management feature components.
- `ui/AGENTS.md`: reusable UI primitives and wrappers.
- `user/AGENTS.md`: profile and team management components.
