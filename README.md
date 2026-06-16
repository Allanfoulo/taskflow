# TaskFlow - AI-Enhanced Project Management

TaskFlow is a project management application built with React, Vite, Tailwind CSS, Convex, and Convex Auth. It combines standard project and task workflows with an embedded AI assistant that can summarize live data and draft real project creation plans for approval.

## Key Features

### Convex-Backed Workspaces, Projects, And Tasks
- Workspace-first navigation with project and task data stored in Convex.
- Sidebar workspace links open the existing Projects screen filtered to the selected workspace.
- Profile and account settings are stored through Convex-backed user preferences.

### TaskFlow Agent
- Live summaries: the agent can answer questions using the current project/task data from the database.
- Markdown chat rendering: assistant replies support GitHub-flavored Markdown, including lists and tables.
- Draft-before-write creation: the agent can draft a new project and task plan from natural language, then waits for an explicit `confirm` before creating anything.

### Project And Task Management
- Create projects inside workspaces, then manage status, progress, due dates, milestones, and favorites.
- Create tasks with priorities, subtasks, and due dates.
- Filter the Projects screen by workspace via sidebar navigation or the in-page filter UI.

### Intelligent Dashboard
- AI-generated summaries of project health and recent activity.
- Visual analytics and progress tracking for at-a-glance status awareness.

## Technology Stack

- Frontend: React, Vite, TypeScript
- Backend: Convex + Convex Auth
- Styling: Tailwind CSS, shadcn/ui
- Icons: Lucide React
- AI: Google Gemini API (`@google/genai`)
- State Management: Context API and hooks

## Getting Started

1. Clone the repository.
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Configure the environment.
   Create a `.env` file in the repository root and add your Gemini API key. Convex local development also expects `.env.local` with `VITE_CONVEX_URL`, which is written by `npx convex dev`.
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
4. Start Convex local development.
   ```bash
   npx convex dev
   ```
5. Run the frontend development server.
   ```bash
   npm run dev -- --host 127.0.0.1 --port 8083
   ```

Open the app at [http://localhost:8083](http://localhost:8083). If you run Vite without a fixed port, it may choose another available port.

## AI Agent Create Flow

The embedded TaskFlow Agent can now draft real project creation from natural language.

Example:

```text
Create a marketing campaign project with 5 tasks in Allan's Workspace
```

The agent will:

1. generate a pending project draft summary
2. wait for explicit approval
3. only create the project and tasks after you reply with `confirm`

Supported confirmation phrases:

- `confirm`
- `confirm create`
- `yes, create it`

If the request is too ambiguous, the agent will ask a follow-up question instead of guessing.

## Convex Migration Commands

For a staged Supabase-to-Convex import, first prepare normalized JSON from exported Supabase tables:

```bash
npm run migrate:supabase:prepare -- --input-dir ./supabase-export --output ./supabase-export/convex-import.json
```

Expected export files in `./supabase-export`:

- `users.json`
- `profiles.json`
- `workspaces.json`
- `projects.json`
- `tasks.json`
- `activities.json`

Then import the prepared snapshot into the linked Convex dev deployment in batches:

```bash
npm run migrate:supabase:import -- --input ./supabase-export/convex-import.json
```

This import path intentionally migrates users by email so imported data can link to Convex Auth sign-ups without retaining Supabase password hashes.

## Documentation Workflow

This repository uses a DOX-style `AGENTS.md` tree inspired by [agent0ai/dox](https://github.com/agent0ai/dox).

- Start at the root `AGENTS.md` before meaningful edits.
- Walk the documentation chain down to the folder you plan to change.
- Use the nearest `AGENTS.md` as the local contract for that subtree.
- After meaningful structural or behavioral changes, update the nearest owning `AGENTS.md` and any affected parent index entries.

Run the lightweight verifier with:

```bash
npm run dox:check
```

This check confirms the expected DOX files exist and reminds contributors to perform a DOX pass as part of normal change flow.

## Mobile Responsiveness

The application is responsive, with a collapsible desktop sidebar and a mobile navigation sheet.

---

Built by the TaskFlow team
