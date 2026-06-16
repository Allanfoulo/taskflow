# Purpose

- Owns application shell and navigation layout components.

## Ownership

- Covers sidebar, top bar, layout wrappers, and theme toggle controls.

## Local Contracts

- Layout components define app shell composition and should stay thinner than feature domains.

## Work Guidance

- Avoid feature-specific business logic here unless it is necessary for shell orchestration.
- Workspace links in the sidebar route to the existing Projects screen with a workspace query parameter instead of a standalone workspace page.

## Verification

- Check route composition and responsive navigation behavior after changes.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
