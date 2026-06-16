# Calendar Real Data Integration

## Summary

Replace the calendar's hardcoded mock events with a hybrid real-data model that combines:

- derived project due-date events
- derived task due-date events
- manually created calendar events stored in Convex

## Current State

- `src/pages/calendar/Calendar.tsx` currently renders hardcoded mock events.
- The event creation dialog also uses hardcoded project names.
- Manual events do not persist as real application data.
- Projects and tasks already exist in Convex and expose due dates through the frontend context.

## Goals

- Make the calendar reflect real application data.
- Persist manually created calendar events in Convex.
- Show project due dates and task due dates in the same calendar views.
- Preserve the existing month, week, and day calendar experience.

## Non-Goals

- No editing of project or task due dates from the calendar in this pass.
- No recurring event system.
- No external calendar sync in this pass.
- No full calendar domain redesign beyond the manual event table needed here.

## Data Model

Add a new Convex table for manual calendar events only.

Manual calendar events should store at least:

- owner id
- title
- description
- start date
- end date
- attendees
- optional linked project id
- location
- color

Project due dates and task due dates should remain derived from their source records rather than copied into this table.

## Event Sources

The calendar should merge three event sources at render time:

### Manual Events

- stored in Convex
- created from the calendar UI
- persisted across reloads
- editable only through future work, not this pass

### Project Due-Date Events

- derived from real projects with due dates
- read-only in the calendar
- should identify the project clearly

### Task Due-Date Events

- derived from real tasks with due dates
- read-only in the calendar
- should identify both the task and its parent project when available

## UX Behavior

### Display

The calendar should visually distinguish event source types:

- manual events
- project due dates
- task due dates

This can be done through labels, colors, badges, or a combination of those.

### Creation Dialog

The `Add Event` dialog should:

- use real project options from the current user's projects
- stop relying on hardcoded project names
- allow manual events even when the user has no projects

Project association for manual events should be optional when there are no suitable projects.

### Read-Only Derived Events

Derived project and task events should be visible in all calendar views but not editable from the calendar in this pass.

## Architecture

### Convex

Add a focused backend module for manual calendar event CRUD needed by this page.

Keep:

- project and task records as their own source of truth
- manual calendar events in their own table

### Frontend

Keep the route orchestration in `src/pages/calendar/Calendar.tsx`.

The page should:

- load projects and tasks from the existing `ProjectContext`
- load manual calendar events from Convex
- normalize all three event sources into one frontend event shape
- merge and sort them for month, week, and day views

## Verification

Verify:

- project due dates appear on the calendar
- task due dates appear on the calendar
- manually created events persist after reload
- the event dialog shows real project choices
- month view renders merged events correctly
- week view renders merged events correctly
- day view renders merged events correctly

## Recommendation

Implement the hybrid calendar now because it gives the page immediate real operational value while keeping project/task records as the authoritative source for derived events.
