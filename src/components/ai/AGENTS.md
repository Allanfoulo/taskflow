# Purpose

- Owns AI-facing UI components.

## Ownership

- Covers interactive assistant surfaces and AI-specific feature presentation.

## Local Contracts

- Keep AI UI concerns here instead of leaking them into generic shared primitives.
- The assistant UI renders markdown replies from `AIContext`; preserve support for GitHub-flavored Markdown because agent responses may include lists and tables.
- The assistant UI also surfaces global conversation history from `AIContext`; keep chat switching and new-chat controls in this domain instead of pushing them into generic layout components.

## Work Guidance

- Preserve clear boundaries between AI interaction UI and underlying provider logic from `src/contexts`.
- Do not let the component layer decide when writes occur; approval and execution rules live in `AIContext`.

## Verification

- Check consuming routes or feature entrypoints when changing exported AI components.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
