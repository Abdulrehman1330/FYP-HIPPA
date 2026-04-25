# Agent Working Methodology

**Last Updated:** 2026-02-05
**Project:** Nexo CRM Frontend
**Purpose:** Document the systematic approach for designing and implementing the Nexo CRM frontend consistently across sessions

---

## Overview

This document describes the working pattern and methodology used to build the Nexo CRM frontend (Sales, Service, and Platform UX). Following this pattern ensures:
- Consistent UI quality and interaction patterns
- Metadata-driven UI remains the source of truth
- Clear progress tracking across sessions
- Easy resumability after interruptions
- Maintainable and scalable component architecture

---

## Core Workflow Pattern

### Collaboration Notes

1. **PR Review Automation**
   - When sharing PR or workflow guidance, remind the user to mention `@codex` in the PR to trigger automated review or tasks.

2. **Commit Hygiene**
   - Ensure all intended changes are committed before finishing a task.
   - If Git identity is missing, set repo-local `user.name` and `user.email` using user-provided values.

### The 5-Step Cycle

Every feature or screen implementation follows this cycle:

```
1. PLAN → 2. IMPLEMENT → 3. TEST → 4. COMMIT → 5. UPDATE PROGRESS
    ↓                                                    ↓
    ←←←←←←←←←←←← Repeat for next task ←←←←←←←←←←←←←←←←←←
```

### Step 1: PLAN

**Before writing any code:**

1. **Review PROGRESS.md**
   - Check current phase and task list
   - Identify next incomplete task
   - Understand dependencies (Sales vs Service vs Platform UX)

2. **Check Backend Contracts**
   - Verify UI runtime APIs (record pages, list views, kanban)
   - Confirm metadata entities and rule behavior expectations

3. **Use TodoWrite Tool**
   - Create todo list for multi-step tasks (3+ steps)
   - Break down complex UI features into specific, actionable items
   - Mark first item as "in_progress"

4. **Read Existing UI Patterns**
   - Never modify files without reading them first
   - Confirm design system tokens and component usage

### Step 2: IMPLEMENT

**Building UI:**

1. **File Organization**
   - Follow existing structure if present.
   - If missing, prefer this layout and document it in PROGRESS.md:
     ```
     src/
     ├── app/ or pages/        # Routes and page shells
     ├── features/             # Feature modules (sales, service, admin)
     ├── components/           # Shared UI components
     ├── layouts/              # App shell layouts
     ├── styles/               # Tokens and global styles
     ├── hooks/                # Reusable hooks
     ├── lib/                  # API client, utilities
     └── assets/               # Static assets
     ```

2. **Design System Standards**
   - Use tokens for colors, spacing, and typography (no hardcoded values).
   - Keep components composable and accessible (labels, focus states, keyboard nav).

3. **Metadata-Driven UI**
   - Render record pages, list views, and kanban from metadata.
   - Respect UI rules: show/hide/required/read-only based on rule evaluation.
   - Enforce field-level and object-level permissions in the UI.

4. **Data Access Patterns**
   - Use a central API client and consistent error handling.
   - Keep caching and data loading concerns in feature modules.

5. **Mark Todos Complete**
   - As SOON as a task is done, mark it complete.
   - Do NOT batch completions.

### Step 3: TEST

**Testing approach:**

1. **Local Development Testing**
   - Run the app locally using the package manager defined in the repo.
   - Run lint and unit tests before commit.

2. **Manual QA Checklist**
   - Responsive behavior across breakpoints
   - Accessibility (keyboard, focus, labels)
   - Loading, empty, and error states
   - Role and permission gates
   - Metadata-driven field rules applied correctly

3. **Contract Validation**
   - Validate UI runtime responses render correctly for records, lists, and kanban.

### Step 4: COMMIT

**Git commit standards:**

1. **Commit Frequency**
   - Commit after each logical unit of work
   - Commit after fixing each issue
   - NEVER make giant commits with multiple unrelated changes

2. **Commit Message Format**
   ```
   <Type>: <Short summary (50 chars max)>

   - <Bullet point detail 1>
   - <Bullet point detail 2>
   - <Result or impact>
   ```

3. **Commit Types**
   - `Add:` New feature or file
   - `Fix:` Bug fix or error resolution
   - `Update:` Modification to existing UI or logic
   - `Refactor:` Code restructuring without changing behavior
   - `Phase N:` Completion of a major phase

### Step 5: UPDATE PROGRESS

**After successful testing and commit:**

1. **Update PROGRESS.md**
   - Mark completed tasks with [x]
   - Update phase completion percentages
   - Add notes about important decisions or issues encountered

2. **Update Files Created Table**
   - Add new files immediately with path and description

---

## MCP Browser Automation (Playwright)

**Purpose:** Use Playwright MCP for any UI/browser validation so results are evidence-based (screenshots/logs) and recorded in docs.

### When to use Playwright MCP (required)
- Any task involving opening pages, clicking, typing, navigation, onboarding flows, auth flows, UI verification, or screenshot capture MUST use Playwright MCP tools (do not "guess" UI states).

### Run mode defaults
- Default to **headed** (visible) for debugging interactive flows.
- Use **headless** for repeatable runs/CI-like checks or when explicitly requested.
- If unsure, choose headed.

### Evidence & artifacts (Antigravity-style)
- For multi-step UI flows, create: `docs/runs/<YYYY-MM-DD>/<short-run-name>/`
- Capture screenshots at:
  - Start state
  - Each major step/page transition
  - Any error/validation state
  - Final success state
- Naming convention: `01-start.png`, `02-step-1.png`, `03-step-2.png`, etc.
- Save console errors to: `docs/runs/<...>/console.txt` (and include key snippets in the run README)

### Run summary + progress updates (required)
- Write a run summary to: `docs/runs/<...>/README.md` including:
  - Steps performed
  - Outcome (pass/fail)
  - Paths to screenshots
  - Console/network findings
  - Repro steps
- Update `PROGRESS.md` immediately after the run with:
  - What was tested
  - Outcome
  - Link/paths to the run folder
  - Any blockers/issues discovered

### Selector stability rules
- Prefer role/label/testid selectors over brittle CSS.
- If selectors are flaky, add/standardize `data-testid` in app code (if allowed) as a small focused change.

### Safety
- Do not automate personal logged-in accounts.
- Prefer local/staging and test accounts.
- Never hardcode secrets; use env vars / local config ignored by git.

---

## Phase-Based Development

Each phase follows this pattern:

1. **Phase Planning**
   - Review phase objectives in PROGRESS.md
   - Understand dependencies on backend readiness

2. **Task Execution**
   - Follow the 5-step cycle for each task
   - Complete ALL subtasks before moving to the next task

3. **Phase Completion**
   - Update phase status in Quick Status table
   - Mark all deliverables as complete
   - Create a phase completion commit

---

## Error Resolution Pattern

### When Errors Occur

1. **Don't Panic - Follow the Process**
   ```
   Error Occurs → Identify Root Cause → Fix → Test → Commit
   ```

2. **Common UI Issues**
   - Metadata contract mismatch
   - Permissions not reflected in UI
   - Rule-driven visibility not applied
   - Layout regressions due to token misuse

3. **Document Issues**
   - Add notes to PROGRESS.md
   - Include summary of root cause and fix

---

## Dependencies Management

1. **Check if Already Exists**
   - Search the package manager config first (package.json or equivalent).

2. **Add Dependencies Deliberately**
   - Keep additions minimal and justified.
   - Document why a dependency is required.

3. **Commit Separately**
   - Dependency changes should be their own commit.

---

## Testing Methodology

### Manual Testing Checklist

- [ ] App loads without errors
- [ ] Routing and navigation are correct
- [ ] Record pages render from metadata
- [ ] List views and kanban render and behave correctly
- [ ] Forms enforce required/read-only rules
- [ ] Permission gates are respected

---

## Session Continuity

### Starting a New Session

1. **Read PROGRESS.md**
   - Understand current phase
   - Check what's completed
   - Review notes and blockers

2. **Check Git Status**
   - Ensure working directory is clean before new work

3. **Resume from Last Task**
   - Use PROGRESS.md to find next incomplete task

### Ending a Session

1. **Commit All Work**
   - No uncommitted changes
   - Clean working directory

2. **Update PROGRESS.md**
   - Mark what's complete
   - Note any blockers or issues

---

## Communication Standards

### When Reporting Progress

Use this format:
```markdown
## ✅ [Phase/Task] Complete!

### What Was Implemented
- Feature 1 with details
- Feature 2 with details

### Files Created/Modified
- `path/to/file` - Purpose

### Testing Results
- ✅ Test 1 passed
- ✅ Test 2 passed

### Ready for Next
- Next logical step
```

---

## Quality Checklist

### Before Committing UI Changes

- [ ] Uses design tokens (no hardcoded values)
- [ ] Accessible labels and keyboard navigation
- [ ] Handles loading, empty, and error states
- [ ] Permissions and rules enforced in UI
- [ ] Responsive across breakpoints
- [ ] PROGRESS.md updated

---

## Anti-Patterns to Avoid

❌ **Don't Do This:**
- Hardcode object fields or labels that should come from metadata
- Ignore permission gates or field-level security
- Skip loading/error states
- Introduce one-off UI patterns outside the design system

✅ **Do This Instead:**
- Render from metadata contracts
- Respect role-based UI restrictions
- Use shared components and tokens
- Keep UI behavior consistent across modules

---

## Conclusion

Following this methodology ensures:
- **Consistency** across design and implementation
- **Metadata-first UI** for Salesforce-like flexibility
- **Resumability** after interruptions
- **Quality** through systematic testing and review

**When in doubt, follow the 5-step cycle:**
```
PLAN → IMPLEMENT → TEST → COMMIT → UPDATE PROGRESS
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-20
**Maintained By:** Development Team
