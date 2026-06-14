# DOX Tree Design

## Goal

Apply the `agent0ai/dox` documentation-tree methodology to this repository as a hybrid rollout:

- add a real `AGENTS.md` hierarchy
- document the workflow for humans and agents
- add lightweight enforcement through `package.json`

## Chosen Approach

Recommended and approved approach:

- create a root `AGENTS.md` with the DOX contract and repo-specific child index
- add child `AGENTS.md` files for durable boundaries, going deeper than top-level folders where this repo already has stable feature domains
- add a lightweight `npm run dox:check` script that verifies the expected DOX tree exists and reminds contributors to do a DOX pass
- update `README.md` so the repo workflow explains how DOX is intended to be used

## Scope

The initial tree covers:

- root repository guidance
- `.agent`
- `public`
- `scripts`
- `src`
- `src/components` and each existing feature domain under it
- `src/pages` and each existing route domain under it
- `src/contexts`
- `src/hooks`
- `src/lib`
- `src/styles`

## Tradeoffs

- This is deeper than a shallow root-only install, which improves local guidance for agents editing feature code.
- It stops short of hard CI or pre-commit enforcement, which keeps rollout lightweight and consistent with the requested medium scope.
- The verifier intentionally checks structure, not semantic quality. Human and agent review still own content accuracy.

## Verification

- `npm run dox:check`
