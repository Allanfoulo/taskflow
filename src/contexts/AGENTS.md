# Purpose

- Owns React context providers and shared application state boundaries.

## Ownership

- Covers authentication, project, theme, and AI providers.

## Local Contracts

- Keep cross-cutting state and provider contracts here rather than embedding them in pages or components.
- Provider API changes are high-impact because they affect many consumers.
- `AIContext` owns global assistant conversations, persisted message history, pending AI creation drafts, confirmation handling, and orchestration of approved project/task writes through `ProjectContext`.
- `ProjectContext` is the app-facing contract for Convex-backed workspaces, projects, tasks, activities, and any creation methods consumed by the AI agent.

## Work Guidance

- Favor explicit context value shapes and predictable provider responsibilities.
- When AI-driven writes are added, keep the write decision and confirmation gate in `AIContext` rather than the rendering layer.

## Verification

- Check provider composition in `src/App.tsx` and affected consumers after contract changes.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
