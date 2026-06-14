# Purpose

- Owns React context providers and shared application state boundaries.

## Ownership

- Covers authentication, project, theme, and AI providers.

## Local Contracts

- Keep cross-cutting state and provider contracts here rather than embedding them in pages or components.
- Provider API changes are high-impact because they affect many consumers.

## Work Guidance

- Favor explicit context value shapes and predictable provider responsibilities.

## Verification

- Check provider composition in `src/App.tsx` and affected consumers after contract changes.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
