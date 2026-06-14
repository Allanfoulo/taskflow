# Convex Cutover Design

## Goal

Replace Supabase with Convex for both application data and authentication while preserving the current React-facing contracts long enough to perform a staged migration with a short maintenance-window cutover.

## Current State

- The frontend is a Vite + React + TypeScript app.
- Supabase is currently used for auth plus data access in:
  - `src/contexts/AuthContext.tsx`
  - `src/contexts/ProjectContext.tsx`
  - `src/pages/profile/Profile.tsx`
  - `src/pages/settings/Settings.tsx`
  - `src/lib/supabase.ts`
- A Convex cloud deployment already exists and `.env.local` includes `VITE_CONVEX_URL`.
- Convex Auth setup failed on Windows during automatic initialization, but the required deployment env vars now exist:
  - `SITE_URL`
  - `JWT_PRIVATE_KEY`
  - `JWKS`

## Chosen Approach

Recommended and approved approach:

- keep the current page and component tree stable
- preserve the existing `AuthContext` and `ProjectContext` contracts during phase 1
- replace Supabase implementations underneath those contexts with Convex Auth and Convex queries/mutations
- migrate existing Supabase data into Convex during a managed maintenance window
- require users to establish new Convex-auth-managed passwords instead of attempting direct password-hash migration

## Phase 1 Scope

Phase 1 covers:

- manual Convex Auth scaffolding for password-based auth
- Convex schema for auth tables plus app data tables
- Convex server functions for profiles, workspaces, projects, tasks, and activities
- frontend provider wiring in `src/main.tsx`
- internal refactor of `AuthContext` to Convex Auth while preserving its consumer-facing shape where practical
- internal refactor of `ProjectContext` and direct profile/settings data access from Supabase to Convex
- one-time import path for Supabase users and project data
- cutover checklist for maintenance-window migration

Phase 1 does not cover:

- password reset flows
- email verification
- milestone normalization into a dedicated table
- dual-write operation between Supabase and Convex
- removal of all compatibility shims before the cutover is verified

## Target Backend Structure

Add a `convex` backend with these responsibilities:

- `convex/schema.ts`
  - include `authTables`
  - define `profiles`, `workspaces`, `projects`, `tasks`, and `activities`
- `convex/auth.config.ts`
  - register the Convex auth application against `CONVEX_SITE_URL`
- `convex/auth.ts`
  - initialize `convexAuth`
  - configure the `Password` provider
- `convex/http.ts`
  - mount auth HTTP routes
- domain files such as:
  - `convex/profiles.ts`
  - `convex/workspaces.ts`
  - `convex/projects.ts`
  - `convex/tasks.ts`
  - `convex/activities.ts`
- migration/import support:
  - a script or action path for importing Supabase-exported data

## Data Model Decisions

- Keep milestones embedded on projects in phase 1 even though a separate table would be cleaner.
  - This reduces UI churn and keeps the initial migration focused on replacing the backend, not redesigning feature boundaries.
- Store ownership and authorization on the server.
  - Convex functions must validate the authenticated user before returning or mutating records.
- Keep the React-facing model shapes as close as possible to the current `Project`, `Task`, `Milestone`, `Activity`, `Workspace`, and `User` types.
  - This keeps component rewrites minimal during the compatibility phase.

## Authentication Plan

- Use Convex Auth with the `Password` provider for email/password sign-up and sign-in.
- Replace the Supabase session source in `AuthContext` with Convex Auth state.
- Preserve `login`, `signup`, `register`, `logout`, `isAuthenticated`, and `isLoading` semantics where practical so current consumers remain stable.
- Defer password reset and email verification until after the main cutover.

## User Migration Constraint

Supabase password hashes should not be treated as portable into Convex Auth by default. The migration plan will therefore:

- migrate user identity and profile records
- create corresponding Convex-auth-backed account records through a controlled onboarding/reset path
- require each migrated user to set or reset their password during the transition

This avoids an unsafe or vendor-specific hash migration path.

## Frontend Integration Plan

1. Wrap the app in `ConvexAuthProvider` and `ConvexReactClient` in `src/main.tsx`.
2. Refactor `AuthContext` internals to use Convex Auth hooks/actions.
3. Introduce Convex-backed data hooks or helper functions behind `ProjectContext`.
4. Replace the direct Supabase calls in profile and settings pages with Convex functions.
5. Remove `src/lib/supabase.ts` only after all active call sites are migrated.

## Data Migration Plan

1. Export Supabase data for users, profiles, workspaces, projects, tasks, and activities.
2. Normalize the export into the Convex schema shape.
3. Import the historical data into Convex in a dry run.
4. Verify record counts and key relationships.
5. Freeze writes during the maintenance window.
6. Run a final delta import.
7. Switch the frontend to Convex-only auth and data access.
8. Verify sign-in, workspace load, project load, task mutations, and profile/settings edits.

## Verification

- `npm run dox:check`
- targeted TypeScript verification after provider wiring and context changes
- manual auth smoke test on local dev:
  - sign up
  - sign in
  - sign out
- manual data smoke test:
  - create project
  - update project
  - create task
  - update task
  - delete task
  - update profile/settings
- migration dry-run validation:
  - record counts by table
  - spot-check user ownership and workspace/project/task relationships

## Risks

- Convex Auth initialization on Windows is partially manual, so setup drift is possible if generated expectations are missed.
- Existing user passwords will not migrate seamlessly; the user communication plan matters.
- `AuthContext` and `ProjectContext` are high-impact integration points, so preserving their contracts is critical to avoid broad UI breakage.
- Existing package peer dependency mismatches may complicate installs unrelated to Convex and should be treated as separate stabilization work.
