# Purpose

- Owns the calendar route page.

## Ownership

- Covers route-level calendar page composition.

## Local Contracts

- Keep route concerns here and push reusable calendar UI downward when it grows beyond page-local needs.
- The calendar route merges read-only due-date events derived from projects and tasks with persisted manual calendar events from Convex.

## Work Guidance

- Prefer page composition over embedding generic UI primitives directly here when domain components already exist.
- Keep data-shape normalization for calendar events close to the route unless a reusable calendar domain module is introduced.

## Verification

- Check route behavior and imports after edits.
- When calendar data behavior changes, verify both derived due dates and manual event creation paths.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
