# DOX framework

- DOX is the AGENTS.md hierarchy installed in this repository.
- Every meaningful edit must follow the DOX chain for the files being changed.

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees.
- Read the applicable chain from the repository root down to the target area before editing.
- The nearest AGENTS.md controls local details. Parent AGENTS.md files still control repo-wide rules.
- Child docs may specialize local workflow, but they must not weaken the root DOX contract.

## Repository Profile

- This repository is a Vite + React + TypeScript frontend for project management workflows.
- Runtime app data and auth are backed by Convex and Convex Auth.
- The embedded TaskFlow Agent uses Gemini for conversational AI and can draft project/task creation plans that require explicit user confirmation before writes.
- The app code lives under `src`; static assets live under `public`.
- `.agent` stores local agent skills and guidance artifacts. Treat it as tooling/support material, not runtime app code.
- `scripts` contains lightweight repository utilities such as verification helpers.

## Read Before Editing

1. Read this root AGENTS.md.
2. Identify every file or folder you expect to touch.
3. Walk from the repository root to each target path.
4. Read every AGENTS.md on each path.
5. Use the nearest AGENTS.md as the local contract.
6. Re-read the current DOX chain in the active session before editing. Do not rely on memory.

## Update After Editing

Run a DOX pass before closing any meaningful task.

Update the nearest owning AGENTS.md when changes affect:

- folder purpose, ownership, or boundaries
- durable structure, contracts, workflows, or verification steps
- expected inputs, outputs, dependencies, or side effects
- user preferences or recurring implementation rules
- Child DOX Index contents

Update parent or child docs when the structural change crosses their scope. Remove stale text instead of leaving history notes.

## Work Guidance

- Preserve the existing React/Vite/Tailwind patterns already present in the repository.
- Keep guidance operational and specific to the owned subtree.
- Prefer small, durable instructions over aspirational or speculative notes.
- If a folder has no special rules yet, say so directly instead of inventing them.

## Verification

- For repository-level DOX verification, run `npm run dox:check`.
- Run area-relevant existing verification when code changes justify it.

## User Preferences

- The project uses a hybrid DOX rollout: repository documentation plus lightweight enforcement through `package.json`.
- Child docs should go deeper than top-level folders when domains already have durable boundaries.

## Child DOX Index

- `.agent/AGENTS.md`: local AI skill assets and non-runtime agent guidance.
- `convex/AGENTS.md`: Convex backend functions, schema, auth, and migration helpers.
- `public/AGENTS.md`: static assets shipped by the frontend.
- `scripts/AGENTS.md`: repository utility scripts, including DOX verification helpers.
- `src/AGENTS.md`: application source code and all frontend domains.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
