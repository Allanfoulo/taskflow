# Purpose

- Owns repository-local agent skills, prompts, and support artifacts under `.agent`.

## Ownership

- This subtree is for agent-facing tooling content, not product runtime code.

## Local Contracts

- Changes here must not assume the frontend imports or executes these files in production.
- Preserve existing skill organization and names unless there is a clear repository-wide migration.

## Work Guidance

- Prefer additive edits over broad rewrites because these files often serve as reference material.
- Keep repository-specific guidance separate from generic imported skill content when possible.

## Verification

- Confirm changed paths are still represented accurately in this doc and the root index.

## Child DOX Index

- `skills/react-best-practices/AGENTS.md`: third-party or imported React guidance reference currently present in this repository.
