# Purpose

- Owns reusable UI primitives and wrappers.

## Ownership

- Covers low-level components intended for reuse across multiple feature domains.

## Local Contracts

- Keep components generic, composable, and free of feature-specific business rules.
- If a component starts to need domain knowledge, move that logic up into the owning feature layer.

## Work Guidance

- Prefer stable APIs and minimal surface-area changes because many domains depend on this subtree.

## Verification

- Check shared imports broadly when renaming or changing exported primitives.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
