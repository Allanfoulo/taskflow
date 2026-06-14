# TaskFlow - AI-Enhanced Project Management

TaskFlow is a modern project management application built with React, Vite, Tailwind CSS, and Convex, featuring advanced AI capabilities to streamline workflow.

## Key Features

### AI-Powered Autopilot
- Intelligent Monitoring: the Autopilot mode monitors project activity and provides proactive suggestions.
- Optimization Hints: receive real-time advice on resource allocation, blocker resolution, and task velocity.

### Magic Task Breakdown
- Smart Subtasks: automatically break down complex tasks into manageable subtasks using AI.
- Interactive Checklist: track progress with a granular subtask checklist directly within the task view.

### n8n Integration Hub
- Workflow Automation: connect projects to n8n via webhooks.
- Event Triggers: trigger external workflows based on task creation, completion, or project updates.

### Intelligent Dashboard
- Smart Insights: get AI-generated summaries of project health and recent activities.
- Visual Analytics: use dynamic charts and progress tracking for data-driven decision making.

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
4. Run the development server.
   ```bash
   npm run dev
   ```

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

The application is fully responsive, featuring a collapsible sidebar on desktop and a slide-out navigation sheet on mobile devices.

## UI/UX

The application is designed with a focus on usability and aesthetics, featuring:

- dark and light mode support
- smooth animations and transitions
- glassmorphism effects for a modern look

---

Built by the TaskFlow team
