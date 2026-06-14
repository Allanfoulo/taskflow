# Purpose

- Owns lightweight repository utility scripts.

## Ownership

- Covers manual verification helpers and developer workflow scripts that are not part of the shipped frontend bundle.

## Local Contracts

- Keep scripts deterministic, local-first, and easy to run from `package.json`.
- Prefer read/verify/report behavior for workflow helpers unless the repository explicitly needs mutation.

## Work Guidance

- Use plain Node scripts for small checks so contributors can run them without extra tooling.
- Keep output actionable and concise.

## Verification

- Run the script directly through its package entrypoint when changed.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
