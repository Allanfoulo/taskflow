# Purpose

- Owns static frontend assets served directly by Vite from `public`.

## Ownership

- Covers images, icons, and other files copied into the final frontend build without React processing.

## Local Contracts

- Keep filenames stable when referenced by metadata, HTML, or runtime code.
- Optimize for predictable asset naming and clear purpose over ad hoc file drops.

## Work Guidance

- Prefer storing generated media here only when it is intended for direct app delivery.
- Remove unused assets when their owning feature is removed.

## Verification

- Check that any renamed or new asset paths still match references in the application.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
