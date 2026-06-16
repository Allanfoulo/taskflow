# AI Assistant Memory Design

## Objective

Add durable, global assistant chat memory so users can start a new conversation without deleting the current one, and can return to previous conversations later with full message history and pending draft state restored.

## Problem

The current assistant stores all messages and pending project draft state only in `AIContext` local React state.

That causes two product problems:

- users cannot resume older conversations
- starting over requires wiping the current conversation state

This breaks continuity and makes the assistant feel disposable rather than dependable.

## Chosen Approach

Create dedicated Convex-backed conversation storage using:

- `aiConversations`
- `aiMessages`

The assistant remains a single floating global surface, but it gains multi-conversation history with an active conversation selected in `AIContext`.

This approach was chosen over `localStorage` or partial-memory approaches because the app already uses Convex as the system of record and conversations are durable, unbounded, and user-owned.

## Data Model

Add an `aiConversations` table with:

- `ownerId`
- `title`
- `status`: `active | archived`
- `pendingDraft?`

The `pendingDraft` shape should mirror the existing project draft contract used by `AIContext`, including:

- `projectName`
- `description`
- `workspaceId`
- `dueDate?`
- `tasks`

Add an `aiMessages` table with:

- `ownerId`
- `conversationId`
- `role`: `user | model`
- `content`

Recommended indexes:

- conversations by owner
- messages by conversation

Messages must live in their own table because conversations grow unbounded over time and should not be stored as arrays on a parent document.

## Backend API

Create a dedicated Convex module for assistant memory.

Recommended public queries:

- `listConversations`
  - returns recent conversations for the current user
  - ordered newest-first
- `listMessages(conversationId)`
  - validates ownership through the conversation
  - returns bounded conversation history in chronological order

Recommended public mutations:

- `createConversation`
  - creates a new conversation with default title such as `New chat`
- `appendMessage`
  - writes a single user or model message
  - validates conversation ownership
- `updateConversationTitle`
  - used after the first user prompt to create a useful title
- `updatePendingDraft`
  - stores or clears the restoreable project draft state
- `deleteConversation`
  - optional in first implementation if the UI needs cleanup, but not required for the core memory feature

If deletion is omitted initially, the assistant can still solve the user’s problem through conversation switching and new-chat creation.

## AIContext Contract

`AIContext` becomes the orchestration layer for:

- active conversation selection
- loading messages for the active conversation
- creating new conversations
- restoring pending draft state per conversation
- appending user and model messages through Convex

The current confirmation flow stays in `AIContext`, but `pendingDraft` must be persisted back to the active conversation whenever it changes.

Expected behavior:

- on startup, load recent conversations
- if one exists, select the most recent conversation
- if none exist, create a fresh conversation lazily when needed or immediately when the assistant opens
- when sending a message:
  - append the user message to the active conversation
  - generate the model response
  - append the model message
- when a create-project draft is produced:
  - store it in the active conversation
- when the draft is confirmed or cleared:
  - clear stored `pendingDraft`

## Assistant UI

Update the floating assistant to support lightweight conversation management inside the existing panel.

Core controls:

- `New chat`
- list of previous chats
- select a chat to resume

The current destructive clear-history action should be replaced with conversation-based actions. The user should not have to wipe the current thread just to start a new one.

Recommended presentation:

- a compact conversation list in the assistant header or a small sidebar region
- active conversation visually highlighted
- recent chats displayed with:
  - title
  - recency indicator

Auto-title behavior:

- use the first user message as the basis for the title
- trim and shorten it to a readable label
- keep `New chat` until the first real message is sent

## Global Scope

Conversation memory should be global across the app.

That means:

- same history list on dashboard, projects, tasks, and other routes
- same active conversation follows the floating assistant everywhere

This matches the assistant’s current product model as a single global helper rather than page-scoped mini-assistants.

## Scope Boundaries

In scope:

- durable conversation history
- new chat creation
- conversation switching
- restoring pending draft state
- global assistant memory

Out of scope for this version:

- renaming conversations manually
- search across conversation history
- pinning or folders
- summarization or long-term semantic memory
- automatic pruning or archiving policies

## Verification

- run Convex code generation after schema and function changes
- verify users can create a new chat without losing old ones
- verify selecting an older chat restores its messages
- verify pending project draft state restores when returning to a conversation mid-flow
- verify sending new messages continues inside the selected conversation
- run `npm run dox:check`

## Files Likely Affected

- `convex/schema.ts`
- `convex/aiConversations.ts`
- `src/contexts/AIContext.tsx`
- `src/components/ai/AIAssistant.tsx`
- `src/contexts/AGENTS.md`
- `src/components/ai/AGENTS.md`
