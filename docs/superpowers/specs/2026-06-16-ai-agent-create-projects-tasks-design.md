# AI Agent Project And Task Creation

## Summary

Give the TaskFlow agent the ability to turn natural-language requests into real project and task creation, but only after the user explicitly confirms a generated summary.

## Current State

- The TaskFlow agent can answer questions and generate text responses from live project data.
- The agent cannot currently write any project management data.
- Project and task creation already exist in `ProjectContext` through `addProject` and `addTask`.

## Goals

- Allow the user to ask the AI agent to create projects and tasks in natural language.
- Require an explicit confirmation step before any write happens.
- Reuse the existing frontend creation flows and Convex-backed context actions.
- Keep the conversational flow inside the current AI assistant surface.

## Non-Goals

- No direct write without confirmation.
- No broad agent write access beyond project and task creation in this pass.
- No complex visual draft editor in this pass.
- No backend AI tool-calling system in this pass.

## UX Flow

### Draft Creation

When the user sends a creation-oriented prompt such as:

- create a marketing campaign project with 6 tasks
- set up a website refresh project for next month

the agent should:

- parse the prompt into a draft creation plan
- show a confirmation summary in chat
- avoid writing any data yet

The summary should include:

- project name
- description
- target workspace
- optional due date
- planned tasks

The summary should end with a clear approval instruction such as:

- Reply with `confirm` to create this project.

### Confirmation

The agent should only perform creation when the user responds with an explicit confirmation phrase:

- `confirm`
- `confirm create`
- `yes, create it`

If the user confirms:

- create the project first
- create the drafted tasks under that project
- post a success message in chat

### Clarification

If the original creation request is too ambiguous:

- ask a follow-up question
- do not create a draft with guessed details

Examples of ambiguity include:

- missing project name when intent is unclear
- unclear workspace when there are multiple reasonable targets and no default is obvious
- unclear whether tasks should be created or only suggested

### Pending Draft Rules

- Only one pending draft may exist at a time.
- A new creation request replaces the old pending draft.
- If a draft is replaced, the agent should say it updated the pending plan.
- If the user says `confirm` without a pending draft, the agent should explain that nothing is waiting for approval.
- After success or failure, the pending draft should be cleared.

## Architecture

### AI Context Responsibilities

Keep the orchestration in `src/contexts/AIContext.tsx`.

`AIContext` should:

- hold the chat message history
- hold pending draft creation state
- decide whether an incoming message is:
  - a normal chat prompt
  - a creation request
  - a confirmation message
- call existing project and task creation methods only after confirmation

### Project Context Integration

Reuse the existing `ProjectContext` methods:

- `addProject`
- `addTask`

To support post-confirmation orchestration cleanly, project creation should expose enough result information for the AI flow to create child tasks against the created project.

## Data Shape

Add a lightweight pending draft object in `AIContext`, for example:

- project name
- description
- workspace id
- due date
- tasks array

Each drafted task should include at least:

- title
- description
- status
- priority
- due date if present

## Model Output Strategy

The model should be instructed to return structured content that can be parsed reliably for create flows.

The practical response modes are:

- normal chat response
- clarification request
- project creation draft

The project creation draft should be represented in a structured machine-readable block embedded in the model response so the frontend can parse it predictably before showing the human-readable confirmation summary.

## Failure Handling

- If project creation fails before anything is written, tell the user no data was created.
- If the project is created but one or more tasks fail, report partial success honestly.
- Never claim success unless the actual write calls succeed.

## Verification

Verify:

- a creation prompt produces a draft summary only
- `confirm` creates the project
- confirmed creation also creates the drafted tasks
- ambiguous prompts ask clarifying questions
- `confirm` with no draft gives a safe message
- replacing a pending draft behaves predictably
- partial failure messaging is honest

## Recommendation

Implement the two-step confirmation flow now because it gives the AI agent real creation ability while keeping destructive risk and accidental writes low.
