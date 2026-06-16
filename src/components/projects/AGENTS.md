# Purpose

- Owns project-management feature components.

## Ownership

- Covers project dashboards, timelines, search, tags, board views, creation flows, and autopilot controls.

## Local Contracts

- Keep project-specific UI contracts here rather than pushing them into generic shared components.
- Durable project suggestions live in a dedicated project-facing panel and should stay within this domain instead of being folded into generic activity UI.

## Work Guidance

- Preserve distinctions between project overview, creation, board, and metadata components.
- Keep autopilot persistence and suggestion workflow UI aligned around the `projectSuggestions` backend contract.

## Verification

- Check page-level project flows when changing exports or shared props.

## Child DOX Index

- No child AGENTS.md files are defined here yet.
