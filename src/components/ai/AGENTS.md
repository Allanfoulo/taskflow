# Purpose

- Owns AI-facing UI components.

## Ownership

- Covers interactive assistant surfaces and AI-specific feature presentation.

## Local Contracts

- Keep AI UI concerns here instead of leaking them into generic shared primitives.

## Work Guidance

- Preserve clear boundaries between AI interaction UI and underlying provider logic from `src/contexts`.

## Verification

- Check consuming routes or feature entrypoints when changing exported AI components.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
