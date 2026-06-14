# Purpose

- Owns project route pages.

## Ownership

- Covers project list and project detail entrypoints.

## Local Contracts

- Route orchestration lives here; reusable project feature UI belongs in `src/components/projects`.

## Work Guidance

- Keep page-level data flow and route parameters explicit because this subtree owns navigation entrypoints into project features.

## Verification

- Check route parameters and imports in `src/App.tsx` after path or export changes.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
