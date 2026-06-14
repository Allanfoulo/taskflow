# Settings And Profile Dropdown Simplification

## Summary

Replace free-text profile and account preference fields with structured dropdown controls where that reduces user error and form complexity.

This change covers:

- profile `Job Title`
- account settings `Language`
- account settings `Timezone`
- account settings `Date Format`
- account settings `Time Format`

The goal is to make these forms feel closer to a production settings experience while preserving the current Convex data model and save flows.

## Current State

- `src/pages/profile/Profile.tsx` stores `jobTitle` as a free-text string.
- `src/pages/settings/Settings.tsx` stores `language`, `timezone`, `dateFormat`, and `timeFormat` as free-text strings in `preferences.account`.
- Convex already stores these values as strings, so the backend does not require a schema redesign for dropdown support.

## Goals

- Reduce form complexity by replacing open text inputs with guided selections.
- Preserve compatibility with the current Convex profile and preference documents.
- Support real-world settings options rather than placeholder demo values.
- Avoid losing existing custom values during migration to dropdown-based controls.

## Non-Goals

- No backend schema redesign for preferences.
- No new standalone settings table or enum migration.
- No combobox or autocomplete implementation in this pass.
- No localization system or actual timezone-aware formatting behavior changes in this pass.

## UX Design

### Profile Job Title

`Job Title` becomes a dropdown with a curated preset list and an `Other` option.

Preset options should cover common product and team roles, for example:

- Founder
- Product Manager
- Project Manager
- Designer
- Developer
- Marketing
- Operations
- Admin
- Manager
- Member

When the user selects `Other`:

- show a text input below the dropdown
- prefill it from the existing custom `jobTitle` if present
- save the custom text as the final `jobTitle` value

When the saved `jobTitle` matches a preset option:

- load that preset directly into the dropdown
- hide the custom text field

When the saved `jobTitle` does not match any preset option:

- load the dropdown as `Other`
- show the custom text field with the saved value

### Account Settings

The account settings fields become dropdowns with broader production-style option sets.

#### Language

Use a curated list of common interface languages, such as:

- English
- Spanish
- French
- German
- Portuguese
- Arabic
- Hindi
- Japanese
- Mandarin Chinese

#### Timezone

Use a curated production-style list of major timezones with readable labels, for example:

- Pacific Time (UTC-8 / UTC-7)
- Mountain Time (UTC-7 / UTC-6)
- Central Time (UTC-6 / UTC-5)
- Eastern Time (UTC-5 / UTC-4)
- Greenwich Mean Time (UTC+0)
- Central European Time (UTC+1 / UTC+2)
- South Africa Standard Time (UTC+2)
- India Standard Time (UTC+5:30)
- Singapore Time (UTC+8)
- Japan Standard Time (UTC+9)
- Australian Eastern Time (UTC+10 / UTC+11)

#### Date Format

Use a dropdown with common display formats:

- MM/DD/YYYY
- DD/MM/YYYY
- YYYY-MM-DD
- MMM D, YYYY

#### Time Format

Use a dropdown with common display formats:

- 12-hour
- 24-hour

## Data Model And State Handling

- Keep the current Convex `preferences.account` fields as strings.
- Keep `profiles.jobTitle` as a string.
- Do not add schema enums for these values in this pass.
- Store dropdown selections as stable string values already compatible with the existing data shape.

## Component Strategy

- Keep implementation local to the existing route pages unless duplication clearly justifies extracting helpers.
- Reuse the existing shared `Select` UI from `src/components/ui/select.tsx`.
- Introduce lightweight option constants in the relevant page modules or a small local helper if that reduces duplication cleanly.

## Save Behavior

- Profile save behavior remains explicit via the existing `Save Changes` button.
- Account settings save behavior remains explicit via the existing `Save Changes` button.
- Notification toggles remain unchanged.

## Fallback Rules

- If the profile has a custom job title not present in presets, represent it as `Other` plus the custom text value.
- If account preference values are missing or unexpected, default to the existing app defaults instead of rendering invalid selections.
- Existing stored strings should remain readable after rollout even if they were entered before dropdown support.

## Verification

Verify:

- a preset job title saves and reloads correctly
- a custom `Other` job title saves and reloads correctly
- language saves and reloads correctly
- timezone saves and reloads correctly
- date format saves and reloads correctly
- time format saves and reloads correctly
- forms still render safely for older or custom stored values

## Risks

- A strict dropdown can hide previously saved custom values unless `Other` fallback handling is implemented correctly.
- Long timezone labels can affect layout on smaller screens, so trigger width and wrapping need a quick responsive check.

## Recommendation

Implement the curated dropdown approach now because it improves usability with minimal backend risk and preserves compatibility with the current Convex model.
