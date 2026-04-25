# Nexo CRM Frontend - Implementation Progress

**Project Start Date:** January 30, 2026
**Target MVP:** 12-16 weeks (Release 0)
**Current Phase:** Phase 22 Buyer Intent + Account Heat UX (In Progress)

> **Development Guide:** See [AGENTS.md](AGENTS.md) for the complete development methodology and working patterns used in this project.

---

## Tech Stack (Frontend)

**Framework**

- Next.js 15.5.6 (App Router + Turbopack)
- React 19.1.0
- TypeScript 5.x

**Styling**

- Tailwind CSS 4.1.14
- PostCSS + Autoprefixer

**State + Forms + Validation**

- Zustand
- React Hook Form
- Zod

**Data + Utilities**

- Axios
- date-fns + date-fns-tz
- DOMPurify
- clsx

**UI Libraries**

- Heroicons
- Lucide
- React Icons
- Sonner

**Tooling**

- ESLint
- Prettier

---

## Quick Status

| Phase                                          | Status      | Progress |
| ---------------------------------------------- | ----------- | -------- |
| Phase 0: UX Blueprint and IA                   | ✅ COMPLETE | 6/6      |
| Phase 1: Frontend Foundation                   | ✅ COMPLETE | 7/7      |
| Phase 2: Design System + App Shell             | ✅ COMPLETE | 8/8      |
| Phase 3: Dynamic UI Foundations                | ✅ COMPLETE | 7/7      |
| Phase 4: Rules, Workflow, Approvals UX         | ✅ COMPLETE | 6/6      |
| Phase 5: Sales App MVP UX                      | ✅ COMPLETE | 8/8      |
| Phase 6: Service App UX                        | ✅ COMPLETE | 6/6      |
| Phase 7: Products and Pricing UX               | ✅ COMPLETE | 5/5      |
| Phase 8: Quotes (CPQ-lite) UX                  | ✅ COMPLETE | 6/6      |
| Phase 9: Orders to Invoices to Payments UX     | ✅ COMPLETE | 7/7      |
| Phase 10: Reporting, Search, and Hardening UX  | ✅ COMPLETE | 7/7      |
| Phase 11: Backend Parity and CRUD Completion   | ✅ COMPLETE | 12/12    |
| Phase 12: Task Collaboration UX                | ✅ COMPLETE | 8/8      |
| Phase 13: Workflow Simulator + Safe Publish UX | COMPLETE    | 6/6      |
| Phase 14: Revenue Intelligence UX              | ✅ COMPLETE | 6/6      |
| Phase 15: Collaboration 2.0 UX                 | ✅ COMPLETE | 6/6      |
| Phase 16: Contact-Centric Meetings + Invites   | ✅ COMPLETE | 6/6   |
| Phase 17: Template Governance + Workspace Diff UX | ✅ COMPLETE | 6/6 |
| Phase 18: Migration Assistant + Data Capture UX | ✅ COMPLETE | 6/6 |
| Phase 19: Exception Control Tower + Triage UX | ✅ COMPLETE | 6/6 |
| Phase 20: Collections + AR Operations UX | ✅ COMPLETE | 6/6 |
| Phase 21: Revenue Leakage + Profitability Intelligence UX | ✅ COMPLETE | 6/6 |
| Phase 22: Buyer Intent + Account Heat UX | 🚧 IN PROGRESS | 5/6 |
| Phase 23: Trust & Security Control Center UX | ✅ COMPLETE | 6/6 |

---

## Phase 0: UX Blueprint and IA (Weeks 1-2)

### Tasks

- [x] **0.1 Personas and Roles**
  - [x] Confirm personas: Sales Rep, Manager, Support Agent, Admin, Finance
- [x] **0.2 Core Flows**
  - [x] Lead to deal flow
  - [x] Quote to cash flow
  - [x] Case to resolution flow
  - [x] Admin configuration flow
- [x] **0.3 Information Architecture**
  - [x] App navigation map
  - [x] Module entry points and workspace layout
- [x] **0.4 Low-Fi Wireframes**
  - [x] Record page
  - [x] List view
  - [x] Admin builder (objects/fields/layouts)
  - [x] Workflow and approval builder
- [x] **0.5 UX Principles**
  - [x] Accessibility baseline
  - [x] Error, empty, and loading patterns
- [x] **0.6 MVP UX Exit Criteria**
  - [x] Acceptance flows for Sales, Service, and Admin

### Core Flow Definitions (Phase 0.2)

- **Lead to Deal:** Lead capture -> assignment -> qualification -> convert to Account/Contact/Opportunity -> stage progression -> tasks/activities -> closed won/lost.
- **Quote to Cash:** Quote from opportunity -> pricing rules -> discount approvals -> PDF sent -> accepted -> sales order -> invoice -> payment -> reconciliation.
- **Case to Resolution:** Case intake (email/web) -> queue assignment -> SLA timer -> agent response -> resolution -> closure.
- **Admin Configuration:** Create object/fields -> layout and list views -> rules/workflows/approvals -> permissions -> publish.

### Information Architecture (Phase 0.3)

**Primary navigation**

- Home
- Sales
  - Leads
  - Opportunities (Kanban + list)
  - Accounts
  - Contacts
  - Activities
- Service
  - Cases
  - Queues
  - SLA Overview
- Revenue
  - Products
  - Price Books
  - Quotes
  - Orders
  - Invoices
  - Payments
- Reporting
  - Dashboards
  - Reports
- Admin
  - Objects
  - Fields
  - Layouts
  - List Views
  - Rules
  - Workflows
  - Approvals
  - Users and Roles
  - Permissions
  - Branding
  - Integrations
  - Audit Logs

**Workspace layout**

- Left: module navigation + object switcher
- Center: list/record workspace
- Right: contextual panel (details, approvals, activity timeline)

### Deliverables

- [x] Approved IA and navigation map
- [x] Low-fi wireframes for key screens
- [x] MVP UX acceptance criteria

---

## Phase 1: Frontend Foundation (Weeks 2-3)

### Tasks

- [x] **1.1 Scaffold Next.js App (App Router + Turbopack)**
  - [x] Create `app/` directory layout and base routes
- [x] **1.2 TypeScript + Path Aliases**
  - [x] Configure `tsconfig.json` with `@/` alias
- [x] **1.3 Tailwind v4 Setup**
  - [x] Tailwind config + PostCSS + Autoprefixer
  - [x] Global styles and CSS variables
- [x] **1.4 Tooling Setup**
  - [x] ESLint + Prettier + scripts
- [x] **1.5 Core Libraries**
  - [x] Zustand, RHF, Zod, Axios, date-fns/date-fns-tz, DOMPurify, clsx
- [x] **1.6 UI Libraries**
  - [x] Heroicons, Lucide, React Icons, Sonner
- [x] **1.7 Project Structure**
  - [x] Create `components/`, `features/`, `lib/`, `styles/` folders

### Deliverables

- [x] Next.js app bootstrapped with Tailwind and tooling
- [x] Dependency set aligned to stack

---

## Phase 2: Design System + App Shell (Weeks 3-5)

### Tasks

- [x] **2.1 Design Tokens (Tailwind + CSS variables)**
  - [x] Colors, typography, spacing, elevation, radii
- [x] **2.2 Core Components (Tailwind)**
  - [x] Buttons, inputs, selects, modals, toasts
- [x] **2.3 Data Components**
  - [x] Tables, filters, pagination, bulk actions
- [x] **2.4 App Shell Layout**
  - [x] Global nav, top bar, breadcrumbs, search
- [x] **2.5 Auth Screens**
  - [x] Login, MFA, password reset
- [x] **2.6 Responsive System**
  - [x] Breakpoints and layout grid
- [x] **2.7 Interaction States**
  - [x] Loading, empty, error, skeletons
- [x] **2.8 Sonner Toast System**
  - [x] Global toast provider and variants

### Deliverables

- [x] Design system documented in Tailwind classes
- [x] App shell implemented in `app/` layouts

---

## Phase 3: Dynamic UI Foundations (Weeks 5-7)

### Tasks

- [x] **3.1 Record Page Template**
  - [x] Metadata-driven sections and fields
- [x] **3.2 List View Template**
  - [x] Filters, saved views, columns
- [x] **3.3 Kanban Template**
  - [x] Grouping, drag rules, stage policies
- [x] **3.4 Field and Rule States**
  - [x] Show/hide/required/read-only states
- [x] **3.5 Admin Builders**
  - [x] Objects, fields, layouts, list views
- [x] **3.6 Metadata Import/Export**
  - [x] Bundle import and export UI
- [x] **3.7 UI Runtime Contract Checks**
  - [x] Sample data binding with backend APIs

### Deliverables

- [x] Dynamic UI templates for record, list, and kanban
- [x] Admin builder UX for metadata management

---

## Phase 4: Rules, Workflow, Approvals UX (Weeks 7-8)

### Tasks

- [x] **4.1 Rule Builder**
  - [x] Validation, decision, UI, pricing rules
- [x] **4.2 Workflow Builder**
  - [x] Triggers, actions, time-based rules
- [x] **4.3 Approvals Setup**
  - [x] Steps, approvers, thresholds, locking
- [x] **4.4 Monitoring UI**
  - [x] Failures, replays, execution logs
- [x] **4.5 Audit Trail**
  - [x] Approval and workflow history views
- [x] **4.6 Permissions**
  - [x] Role-based access for admin tools

### Deliverables

- [x] Rule and workflow configuration UX
- [x] Admin monitoring and audit views

---

## Phase 5: Sales App MVP UX (Weeks 8-11)

### Tasks

- [x] **5.1 Sales Dashboard**
  - [x] Tasks, pipeline summary, overdue leads
- [x] **5.2 Lead Workspace**
  - [x] List, detail, assignment, convert wizard
- [x] **5.3 Opportunity Workspace**
  - [x] Kanban, detail, stage history, approvals
- [x] **5.4 Account 360**
  - [x] Contacts, open opportunities, activity timeline
- [x] **5.5 Activity Center**
  - [x] Tasks, calls, meetings, quick logging
- [x] **5.6 Forecast View**
  - [x] Simple rollups and stage summaries
- [x] **5.7 Sales Reports**
  - [x] Pipeline, win rate, activity templates
- [x] **5.8 Email and Files**
  - [x] Lightweight email logging and attachments

### Deliverables

- [x] Sales MVP screen set ready for build
- [x] Sales dashboard and workspace flows

---

## Phase 6: Service App UX (Weeks 11-13)

### Tasks

- [x] **6.1 Case Intake**
  - [x] Web-form case entry flow
  - [x] Email-to-case entry wiring
- [x] **6.2 Case Queues**
  - [x] Assignment, prioritization, and queue views
- [x] **6.3 Agent Console**
  - [x] Timeline, notes context, and escalation history
- [x] **6.4 SLA Management**
  - [x] SLA timers, escalations, and breach indicators
- [x] **6.5 Macros and Knowledge**
  - [x] Canned responses and suggestions
- [x] **6.6 Service Dashboards**
  - [x] Backlog, SLA compliance, and trend surfaces

### Deliverables

- [x] Service app UX for case handling and SLAs

---

## Phase 7: Products and Pricing UX (Weeks 13-14)

### Tasks

- [x] **7.1 Product Catalog**
  - [x] Product list and detail views
- [x] **7.2 Price Books**
  - [x] Standard and customer-specific views
- [x] **7.3 Price Book Entries**
  - [x] Line editor and currency handling
- [x] **7.4 Tax Codes**
  - [x] Tax code and rate management
- [x] **7.5 Pricing Preview**
  - [x] Pricing summary in sales context

### Deliverables

- [x] Product and pricing admin UX

---

## Phase 8: Quotes (CPQ-lite) UX (Weeks 14-16)

### Tasks

- [x] **8.1 Quote Builder Wizard**
  - [x] Price book selection to line items to totals
- [x] **8.2 Line Items Table**
  - [x] Discounts, taxes, totals
- [x] **8.3 Discount Approvals**
  - [x] Approval state, comments, locking
- [x] **8.4 Quote PDF**
  - [x] Preview and template selection
- [x] **8.5 Status and Versioning**
  - [x] Draft to accepted lifecycle and versions
- [x] **8.6 Customer Acceptance**
  - [x] Acceptance view and confirmation

### Deliverables

- [x] Quote builder flow and approval UX

---

## Phase 9: Orders to Invoices to Payments UX (Weeks 16-18)

### Tasks

- [x] **9.1 Convert Quote to Order**
  - [x] Guided conversion wizard
- [x] **9.2 Order Lifecycle**
  - [x] Status views and history
- [x] **9.3 Invoice Issuance**
  - [x] Numbering and issuance UX
- [x] **9.4 Invoice Delivery**
  - [x] PDF download/open support
- [x] **9.5 Payment Capture**
  - [x] Processor and manual payment flows
- [x] **9.6 Reconciliation**
  - [x] Allocations and adjustments
- [x] **9.7 AR Aging**
  - [x] Aging buckets and reminders

### Deliverables

- [x] Order to cash UX flows

---

## Phase 10: Reporting, Search, and Hardening UX (Weeks 18+)

### Tasks

- [x] **10.1 Report Builder**
  - [x] Filters, grouping, aggregates
- [x] **10.2 Dashboard Builder**
  - [x] Widget layout and sharing controls
- [x] **10.3 Global Search**
  - [x] Results, facets, permission-aware UX
- [x] **10.4 Performance UX**
  - [x] Monitoring KPIs and alert thresholds
- [x] **10.5 Admin Diagnostics**
  - [x] Tenant health, logs, metrics
- [x] **10.6 Branding and Theming**
  - [x] Tenant branding and UI preferences
- [x] **10.7 Integrations UX**
  - [x] SSO provider configuration and readiness status

### Deliverables

- [x] Reporting and search UX system
- [x] Admin hardening UX for scale

---

## Phase 11: Backend Parity and CRUD Completion (Weeks 19+)

### Tasks

- [x] **11.1 Core CRM CRUD Parity**
  - [x] Add create/update/delete flows for Accounts, Contacts, Opportunities, Activities, and Leads.
  - [x] Wire generic record create/delete actions in record, list, and kanban pages.
  - [x] Add Activity status actions (complete/cancel) and update UI states.
- [x] **11.2 CSV Import/Export**
  - [x] Add CSV export downloads for Accounts, Contacts, Leads, Activities, Opportunities.
  - [x] Add CSV import upload with error summaries for the same objects.
- [x] **11.3 Metadata Edit Support**
  - [x] Add update types and API helpers for metadata objects, fields, and layouts.
  - [x] Add edit modals and status updates in Admin Objects/Fields/Layouts pages.
- [x] **11.4 Rules and Sharing Updates**
  - [x] Add rule edit support (PATCH) in Admin Rules.
  - [x] Add sharing rule edit/toggle support in Admin Permissions.
- [x] **11.5 Workflow Edit + Job Controls**
  - [x] Add edit support for workflow triggers and actions.
  - [x] Add workflow job controls (claim/complete/fail/replay/logs) surface.
- [x] **11.6 Dashboard Endpoint Coverage**
  - [x] Surface activity, pipeline, and win-rate dashboard endpoints in Sales dashboards or reports.
- [x] **11.7 Automation Templates**
  - [x] Add automation template list and apply actions in Admin.
- [x] **11.8 Tenant Admin**
  - [x] Add tenant list/create UI for platform admins.
- [x] **11.9 Revenue Summary Reporting**
  - [x] Add revenue report summary panel using `/v1/reports/revenue/summary`.
- [x] **11.10 Revenue Detail Fetches**
  - [x] Add by-id fetch flows for price books, price book entries, products, tax codes, quote lines, and invoice lines where needed.
- [x] **11.11 Health Checks**
  - [x] Add a lightweight health/ready check panel for ops visibility.
- [x] **11.12 Sales and Quote Edit Access**
  - [x] Add record open actions for Leads and Opportunities.
  - [x] Add quote delete action in quote detail.

---

## Phase 16: Contact-Centric Meetings + Invites (Complete)

### Why This Phase Exists

- Salesforce-style account relationships expect one `Account` to hold many `Contacts`, with meetings scheduled against the right people instead of only the parent record.
- The current product already supports account-to-contact relationships and `meeting` as an activity type, but meeting scheduling is not yet contact-aware and invite email delivery is still handled separately from activity creation.
- This phase closes that gap by turning meetings into a contact-centric workflow instead of a generic internal activity.

### Tasks

- [x] **16.1 Contact-Aware Meeting Model**
  - [x] Extend meeting records to capture attendee/contact linkage instead of only a generic related record.
  - [x] Add scheduling fields needed for real meetings: start/end time, timezone, location, and notes.
- [x] **16.2 Meeting Scheduler Entry Points**
  - [x] Add create-meeting entry points from Account 360, Contact records, Opportunity/Deal workspaces, and the Activity Center.
  - [x] Prefill selectable attendees from the account's active contacts.
- [x] **16.3 Invite Email Lifecycle UX**
  - [x] Add send/resend/cancel invite actions tied to meeting creation and updates.
  - [x] Surface invite state per attendee (queued, sent, failed, canceled, accepted if supported by backend).
- [x] **16.4 Contact and Account Timeline Parity**
  - [x] Show meetings in Account 360 and Contact detail/timeline views with clear attendee context.
  - [x] Add meeting-specific filters so tasks, calls, and meetings can be reviewed separately.
- [x] **16.5 Delivery and Audit Visibility**
  - [x] Link meeting invite history to Email & Files / delivery logs for support and troubleshooting.
  - [x] Add operator-friendly failure states and retry guidance when invite delivery fails.
- [x] **16.6 Regression and UAT Coverage**
  - [x] Validate flows for one account with multiple contacts, schedule/reschedule/cancel meeting, and correct recipient selection.
  - [x] Validate timezone display, permissions, and fallback behavior when contacts do not have email addresses.

### Deliverables

- [x] Contact-aware meeting scheduling flow aligned with Salesforce-style account/contact expectations.
- [x] Meeting invite lifecycle visibility across account, contact, and activity surfaces.
- [x] UAT-ready workflow for schedule, update, cancel, and troubleshoot invite delivery.

### Notes

- This phase depends on backend support for meeting attendee linkage and invite-delivery APIs.
- The frontend should treat meetings as a first-class workflow, not just a renamed activity type.

---

## Phase 17: Template Governance + Workspace Diff UX (Complete)

### Why This Phase Exists

- The partner brief says Nexo should lead with governed local flexibility, not generic platform language.
- The frontend already has strong admin, simulator, audit, and revenue workflows, but it does not yet make workspace inheritance, drift, and repeated rollout visible to the buyer.
- This phase starts Wave 2 on the tenant UX side by turning configuration depth into a guided template-governance experience.

### Tasks

- [x] **17.1 Wave 2 UX Scope Lock**
  - [x] Define the admin surfaces needed for template library, inheritance indicators, workspace diff review, and governed rollout.
  - [x] Reframe current playbook-marketplace UX toward internal template rollout and repeated workspace deployment.
- [x] **17.2 Workspace Template Library UX**
  - [x] Add template listing/detail surfaces with version, owner, target workspace type, and adoption indicators.
  - [x] Add create-from-template and clone-from-workspace entry points for tenant admins.
- [x] **17.3 Inheritance + Local Override UX**
  - [x] Show inherited vs locally overridden objects, fields, layouts, rules, workflows, and approvals.
  - [x] Add protected-policy indicators and clear override-request or override-risk states.
- [x] **17.4 Workspace Diff + Rollout Preview UX**
  - [x] Build pre-apply diff review for additions, removals, conflicts, and impacted modules.
  - [x] Surface validation, simulator results, compatibility checks, dependency-graph warnings, and rollout risk before publish or rollout.
- [x] **17.5 Rollout + Rollback Operations UX**
  - [x] Add staged rollout and canary-rollout UX, rollout status tracking, failure states, "why blocked" diagnostics, and rollback entry points.
  - [x] Link rollout events into audit, monitoring, backup snapshot, and metadata history surfaces.
- [x] **17.6 Proof Metrics + Demo Story**
  - [x] Expose rollout time, adoption count, override count, override-risk, and drift-severity signals in admin reporting surfaces.
  - [x] Update the Wave 2 demo path to lead with governed local flexibility instead of generic platform breadth.

### Deliverables

- [x] Tenant-admin template governance UX for repeated deployment.
- [x] First-class inheritance and workspace-diff experience in Admin Builder.
- [x] Buyer-facing proof surfaces for rollout speed, drift control, and safer change.

### Notes

- This phase does not replace Phase 16 UAT; meetings still need final validation.
- Broad external marketplace UX is intentionally out of scope for this Wave 2 foundation.

### 2026-03-28 (Template Library Foundation)

- Replaced marketplace-only framing in Admin Builder with a workspace-template library that reads from the new backend registry.
- Added tenant-facing template cards with owner, workspace type, lifecycle, adoption, readiness, and packaged-component visibility.
- Added `/admin/templates` as the preferred route while preserving the existing `/admin/playbooks` entry point and keeping local install/clone actions wired to the current rollout mechanics.

### 2026-03-28 (Override Visibility Foundation)

- Added template-level local override posture cards showing divergent install counts, changed-path totals, protected override counts, and risk level.
- Added install-row override summaries so tenant admins can see which local variants are low-, medium-, or high-risk against the governed baseline.
- Added protected-path visibility from the backend governance policy so Wave 2 can move toward full inheritance/override UX without hiding which paths are centrally protected today.

### 2026-03-28 (Diff Preview Foundation)

- Added template-level diff preview actions that load backend preview data on demand instead of forcing every card to render all diff state eagerly.
- Added human-readable diff items, impacted modules, blockers, and warnings for each local install so tenant admins can review drift before broader rollout.
- Deeper simulator-linked evidence and actual staged rollout execution UX remain open for later slices, especially 17.5.

### 2026-03-28 (Compatibility Preview UX)

- Added recommended rollout modes, compatibility checks, and dependency-graph sections to the tenant diff-preview modal.
- Surfaced simulation-state, dependency-state, approval-gate, and backup-snapshot readiness through the backend compatibility checks rather than burying them in raw JSON.
- Staged rollout execution, canary controls, and rollback operations were left for the next UI slice at the time of this update.

### 2026-03-28 (Rollout Operations UX)

- Added rollout planning inside the template diff-preview modal with target-install selection, canary cohort selection, staged batch size, approval confirmation, backup confirmation, and notes.
- Added rollout history cards with status, checkpoint summaries, and approve, confirm-backup, pause, resume, and rollback actions.
- Kept the control flow anchored in the existing diff-preview modal so tenant admins can move from diagnostics to governed rollout without switching screens.

### 2026-03-29 (Inheritance + Drift Visibility UX)

- Extended local install rows with inheritance-state summaries so tenant admins can see inherited components versus local, review-required, and blocked overrides without opening raw config JSON.
- Added rollout-exception and drift-hotspot visibility to template cards so tenant admins can see repeated blocked paths, open rollout pressure, and rolled-back rollout counts at a glance.
- This is the visibility slice of Phase 17.3 and 17.6; deeper per-object inheritance controls and demo-proof dashboards are still open.

### 2026-03-30 (Tenant Reconcile + Baseline Reset UX)

- Added tenant-admin actions to reset blocked overrides, reset review-required overrides, or fully reapply the inherited template baseline from the playbooks screen.
- Hooked the new reconcile flow to before/after counts so admins can see how many changed paths and governance blockers were actually resolved after each action.
- This closes the action side of Phase 17.3; the remaining open frontend work is Phase 17.6 proof metrics and demo-story surfaces.

### 2026-03-30 (Rollout Proof UX)

- Added rollout-proof cards to each template entry so tenant admins can see adoption rate, drift severity, rollback rate, override spread, canary usage, and average time-to-live without leaving the template registry.
- Kept the proof metrics on the same surface as drift posture and rollout controls so the buyer story is visible during normal admin review, not hidden in a separate dashboard.
- The remaining frontend gap is the explicit Wave 2 demo-path rewrite, not the metric visibility itself.

### 2026-04-01 (Governed Rollout Demo Story)

- Added a first-class Wave 2 demo-path card to the workspace-template screen so tenant admins can lead demos with governed local flexibility instead of generic configuration breadth.
- Added a matching governed-rollout demo runbook at `docs/runs/2026-04-01/governed-rollout-demo/README.md` so the demo narrative and proof signals stay consistent across product walkthroughs.
- This closes Phase 17.6 and completes Phase 17.

### 2026-03-30 (Migration Readiness Signals)

- Added migration-readiness panels to template cards so tenant admins can see supported source systems, primary objects, CSV-covered objects, connector-needed objects, mapping coverage, template-fit score, and starter match keys.
- This is a kickoff slice for Phase 18: it exposes switching-readiness signals on the existing template library without pretending the full mapping studio or dry-run workflow already exists.

---

## Phase 18: Migration Assistant + Data Capture UX (Complete)

### Why This Phase Exists

- After governed template rollout, the biggest buyer objection becomes switching friction.
- Migration assistant is the right Wave 2 Phase 2 because it directly lowers adoption pain and accelerates time-to-value.
- Lightweight AI data capture belongs here because it helps migration, onboarding, and note-to-record conversion more directly than a generalized agent-builder story.

### Tasks

- [x] **18.1 Source Selection + Mapping Studio**
  - [x] Add migration source selection and field-mapping studio for Salesforce, HubSpot, Zoho, and CSV-style imports.
  - [x] Surface AI-assisted mapping suggestions with source attribution on every suggested mapping.
- [x] **18.2 Dry Run + Conflict Review UX**
  - [x] Add sample-import dry run, duplicate/conflict review, and "why blocked" diagnostics.
  - [x] Show template-compatibility and dependency warnings before import commit.
- [x] **18.3 Relationship Resolution + Batch Controls**
    - [x] Add UX for parent/child dependency resolution, record ordering, and rollback-safe import batches.
    - [x] Show batch progress, resumability, and traceability for import execution.
- [x] **18.4 Post-Import Health + Template Fit**
  - [x] Add post-import health report, template-fit score, data-quality summary, and issue triage view.
  - [x] Link high-risk outcomes into the future exception-control workspace.
- [x] **18.5 AI Data Capture Assistant**
  - [x] Add note-to-record, onboarding capture, and field-population assistance with explicit source attribution.
  - [x] Keep generic agent-studio scope out of this phase; focus on trusted capture and migration speed.
- [x] **18.6 Demo + Proof Story**
  - [x] Add buyer-facing proof views for migration speed, match rate, mapping confidence, and remaining cleanup work.
  - [x] Update demo/runbook flows so switching leverage is shown before broader AI ambitions.

### Deliverables

- [x] Productized migration assistant UX with dry run, conflict review, batch progress, and health reporting.
- [x] Trustable AI data-capture assistant tied to migration and onboarding workflows.
- [x] Stronger buyer story around switching speed and implementation readiness.

### Notes

- Exception control tower and collections / AR operations are the next planned Wave 2 steps after migration assistant.
- Broad marketplace UX, generalized agent-studio positioning, and ERP-depth expansion remain out of scope.

### 2026-03-30 (Migration Studio Foundation)

- Added tenant-admin migration-plan summaries directly to template cards so switching work is visible in the same surface as rollout readiness and template adoption.
- Added a migration-assistant modal with source selection, object scope, estimated-record capture, editable field mappings, explicit suggestion attribution, and dry-run actions.
- This closes Phase 18.1 and starts the UX side of Phase 18.2; deeper duplicate/conflict review, relationship resolution, post-import health, and AI capture workflows remain open.

### 2026-03-30 (Conflict Review UX)

- Extended migration-plan cards and the migration-assistant modal with duplicate-review counts, dependency-review status, policy-review reasons, and mapping confidence bands.
- Added explicit "why blocked" dry-run visibility so tenant admins can see whether the issue is missing match keys, missing parent objects, or governance review pressure before import work advances.
- This closes Phase 18.2 and leaves the next frontend gap focused on relationship-resolution controls, batch execution, and post-import health.

### 2026-03-31 (Relationship Resolution + Migration Job UX)

- Extended the tenant migration-assistant modal with a dedicated relationship-resolution panel showing object order, recommended batches, unresolved links, and template-compatibility warnings from the backend summary.
- Added migration-job controls to the same modal so tenant admins can create governed import jobs, approve them when policy review is pending, and step through batch progress with pause/resume/rollback actions and visible checkpoint state.
- This closes Phase 18.3 and leaves the next frontend work centered on post-import health, AI data capture, and the Wave 2 proof-story surface.

### 2026-03-31 (Migration Audit Visibility)

- Added audit-evidence summaries and recent control-action timelines to the tenant migration-assistant modal so admins can see source trace, operator lineage, and rollback evidence on the same job card.
- Kept this slice inside the existing migration-job UX instead of opening a separate screen, so traceability is visible at the exact point where operators pause, resume, or roll back batches.
- This strengthens Phase 18.3 traceability without changing the remaining frontend roadmap: post-import health, AI capture, and buyer-proof views still remain.

### 2026-03-31 (Execution Receipts + Resumability UX)

- Extended tenant migration-job cards with execution summaries, batch receipts, source batch references, resume tokens, rollback references, and imported/skipped counters.
- Kept those receipts next to the existing audit trail and checkpoint cards so the execution story stays inside the migration assistant instead of branching into another admin screen.
- This advances the execution/readiness side of the migration phase while leaving post-import health, AI capture, and proof-story work still open.

### 2026-03-31 (Post-Import Health + Triage UX)

- Added post-import health status, template-fit score, data-quality score, unresolved issue rollups, and follow-up action cards directly onto tenant migration-job cards.
- Linked high-risk outcomes toward future exception-control and collections queues in the same assistant surface so admins can see the next step immediately after batch execution.
- This closes Phase 18.4 and leaves AI data capture plus the proof/demo story as the remaining frontend migration work.

### 2026-03-31 (Switching Proof + Demo Runbook)

- Added buyer-facing switching-proof panels to migration jobs so tenant admins can show migration speed, match quality, manual override rate, import error rate, and remaining cleanup work from the same job card.
- Added a dedicated Wave 2 migration-proof demo runbook at `docs/runs/2026-03-31/migration-proof-demo/README.md` so demos now lead with switching leverage before broader AI scope.
- This closes Phase 18.6 and leaves AI Data Capture Assistant as the remaining tenant-frontend migration slice.

### 2026-03-31 (Operator-Entered Batch Receipts)

- Added active-batch receipt capture to migration jobs so tenant admins can record source batch ids, imported/skipped/failure counts, and operator notes before advancing execution.
- Surfaced those operator-entered notes back onto execution receipts and checkpoint cards so the migration assistant now shows explicit batch lineage instead of inferred counters alone.
- This deepens the execution side of Phase 18 while keeping AI Data Capture Assistant as the remaining open frontend migration item.

### 2026-04-01 (AI Data Capture Assistant)

- Added a dedicated AI capture-input workflow inside the tenant migration assistant so admins can paste onboarding notes, exported headers, or field lists and generate source-attributed object, volume, and mapping suggestions without leaving the plan modal.
- Added an explicit `Apply suggestions` action so capture results can update object scope, record estimates, and mapping rows while preserving confidence scoring and source attribution on every suggested field.
- This closes Phase 18.5 and completes Phase 18 while still keeping generalized agent-studio scope out of the migration wedge.

---

### 2026-03-28 (Wave 2 Kickoff Planning)

- Started the post-Release-0 Wave 2 roadmap from the partner brief.
- Chose template governance, inheritance visibility, diff preview, and rollout proof as the first frontend phase because they are the clearest way to surface Nexo's strongest differentiator.
- Narrowed prior marketplace-style framing so the frontend story stays focused on internal rollout governance, not ecosystem breadth.
- Locked Wave 2 Phase 2 around migration assistant and AI data capture before exception control, collections, or generalized agent-platform UX.

---

## Phase 19: Exception Control Tower + Triage UX (Complete)

### Why This Phase Exists

- After governed rollout and migration assistant, tenant admins need one place to see what is stuck, risky, broken, or drifting.
- The product already exposes signals across sales workload, revenue intelligence, rollout governance, and migration health, but those signals still live in separate screens.
- This phase turns those signals into a tenant-facing exception-control workspace focused on fast triage and clear next actions.

### Tasks

- [x] **19.1 Unified Exception Feed**
  - [x] Aggregate rollout blockers, migration follow-up queues, overdue approvals, workflow failures, and revenue-risk alerts into one tenant control surface.
  - [x] Normalize severity, owner, status, and affected module labels for quick scanning.
- [x] **19.2 Triage + Filtering UX**
  - [x] Add filters for severity, queue, owner, module, and due status.
  - [x] Add "why now" summaries so admins can understand the operational change behind each exception.
- [x] **19.3 Action Routing**
  - [x] Link each exception into the right underlying workspace, record, or governance flow.
  - [x] Preserve reason capture when pausing, escalating, or resolving exception items.
- [x] **19.4 Revenue + Collections Hooks**
  - [x] Surface invoice/payment/import-risk items that should feed future collections operations.
  - [x] Keep full collections workflow depth out of this phase.
- [x] **19.5 Proof + Demo Story**
  - [x] Show exception backlog, mean time to clear, recurring risk categories, and cross-module pressure in buyer-facing proof surfaces.
  - [x] Update demo/runbook flows so Nexo is shown as an operating layer, not just a configurable workspace.
- [x] **19.6 Validation + Runbooks**
  - [x] Add UAT and runbooks for tenant-admin triage, escalation, and operational review.
  - [x] Keep broad ERP-depth and generalized agent-studio scope out of this phase.

### Deliverables

- [x] Tenant exception-control workspace spanning rollout, migration, workflow, and revenue-risk pressure.
- [x] Actionable triage UX with direct routing into source workflows.
- [x] Stronger buyer story around operational control after rollout and migration.

### Notes

- Collections / AR operations should integrate with this phase, but deeper collector workflow remains a later wave.
- Broad marketplace framing and generalized agent-platform UX remain out of scope.

### 2026-04-01 (Phase 19 Kickoff)

- Opened the next Wave 2 tenant-frontend phase around a unified exception-control workspace now that template governance and migration assistant are both complete.
- The first implementation target is a tenant-facing exception feed that combines rollout pressure, migration follow-up, and revenue/workflow risk into one triage surface.

### 2026-04-01 (Phase 19 Unified Queue Slice)

- Added the tenant `Admin > Exceptions` workspace with a shared exception feed spanning rollout, migration, workflow, monitoring, and revenue-risk pressure.
- Added summary cards, tenant/module hotspots, severity/module/source/status/queue filters, and "why now" triage summaries so admins can scan operational change quickly.

### 2026-04-01 (Phase 19 Lifecycle Action Slice)

- Turned the tenant exception queue into an actionable workspace with acknowledge, assign, snooze, escalate, and resolve controls wired to the new backend lifecycle endpoints.
- Added modal-based reason capture for snooze, escalate, and resolve actions, plus assignee/escalation metadata and snooze windows directly in the queue rows.
- Preserved direct routing into the underlying evidence and source workflows while keeping triage state visible in the same operational table.
- Added drill-down evidence links back into tenant workspaces and API records while leaving lifecycle controls and collections-specific routing for the next slice.

### 2026-04-01 (Phase 19 Proof Surface Slice)

- Added buyer-visible proof panels to the tenant exception workspace for aging pressure, repeat-offender patterns, triaged coverage, stale backlog, average open age, and mean time to clear so admins can explain queue pressure and resolution speed without leaving the page.
- Added inline `Priority`, `Age`, and repeat-pattern signals to the `Why now` column so the queue order is explainable during triage and demos.
- Added the Wave 2 demo runbook at `docs/runs/2026-04-01/exception-control-demo/README.md` so the exception-control story can be shown as an operating layer after rollout and migration.
- This closes Phase 19.5 while Phase 19.6 validation/runbooks remains open.

### 2026-04-01 (Phase 19 Collections Hook Slice)

- Added a dedicated `Collections hooks` panel to the tenant exception workspace so admins can see revenue-impact items, collections candidates, import-risk totals, and the current revenue-heavy hotspot without leaving exception control.
- Kept the slice intentionally narrow: this is the handoff into future collections operations, not a disguised full collections workflow inside the exception queue.
- This closes Phase 19.4 and leaves Phase 19.6 as the remaining tenant exception-control gap.

### 2026-04-01 (Phase 19 Validation Runbook Slice)

- Added a dedicated tenant-admin UAT runbook at `docs/runs/2026-04-01/exception-control-uat/README.md` covering queue load, filters, explainable priority, lifecycle controls, evidence routing, and proof/collections-hook validation.
- Kept Phase 19.6 open because the runbook is now in place, but the live/manual execution and sign-off still need to happen.

### 2026-04-01 (Phase 19 Scripted Validation Slice)

- Added a scripted tenant exception-control UAT command at `npm run uat:exceptions` plus a dry-run mode that writes report scaffolds into `docs/runs/<date>/exception-control-uat`.
- Folded `/admin/exceptions` into the existing frontend route smoke and release-readiness coverage so exception control stays in the normal validation surface instead of being a one-off manual check.
- This closes Phase 19.6 and completes Phase 19; live/manual execution still remains an operational sign-off step, not a missing product artifact.

---

## Phase 20: Collections + AR Operations UX (In Progress)

### Why This Phase Exists

- After exception control exposes revenue-impact pressure, tenant admins need a dedicated workspace for receivables follow-up, not just another exception list.
- The product already has AR aging and revenue intelligence, but collections work still needs an invoice-first queue, assignee state, promise/dispute handling, and follow-up timing.
- This phase turns Nexo's quote-to-cash story into day-two cash-control UX without drifting into heavy ERP finance sprawl.

### Tasks

- [x] **20.1 Collections Queue Workspace**
  - [x] Add a dedicated tenant collections workspace with queue filters, stage/risk summaries, owner hotspots, and invoice-level next-action guidance.
  - [x] Keep the queue grounded in live invoice due dates and revenue-risk pressure instead of static mock AR data.
- [x] **20.2 Collector Action UX**
  - [x] Add tenant action controls for assign, follow-up, promise-to-pay, dispute, escalate, and reset against invoice queue items.
  - [x] Surface collector state, assignee, follow-up timing, and promise/dispute status directly in the queue table.
- [x] **20.3 Reminder + Promise Visibility**
    - [x] Add deeper visibility for missed promises, follow-up cadence debt, and reminder readiness beyond the first collector action surface.
    - [x] Keep outbound reminder delivery out of scope until the workflow shape is validated.
- [x] **20.4 Collector Workflow Routing**
    - [x] Route disputes, escalations, and account-owner handoffs into the right downstream workspaces from the collections surface.
    - [x] Keep collector workflow depth intentionally narrower than a full ERP collections console.
- [x] **20.5 Proof + Demo Story**
    - [x] Add buyer-facing proof surfaces around actioned exposure, promise coverage, dispute load, and follow-up debt.
    - [x] Update demo/runbook material so collections reads as part of Nexo's operational wedge.
- [x] **20.6 Validation + Runbooks**
  - [x] Add collections-specific tenant UAT and runbooks after the first workflow slices stabilize.
  - [x] Keep generalized agent-platform and ERP-depth scope out of this phase.

### Deliverables

- [x] Tenant collections workspace spanning queue pressure, hotspots, and invoice-level next-action guidance.
- [x] Actionable collector-state UX with assignee, follow-up, promise-to-pay, dispute, and escalation handling.
- [x] Stronger buyer story around cash-control operations after quote-to-cash.

### Notes

- This phase should deepen collections operations, not add broad marketplace or generalized agent-platform UX.
- Full collector automation, payment plans, and ERP-style cash application remain later-wave work.

### 2026-04-01 (Phase 20 Kickoff)

- Opened the next tenant-frontend phase around collections and AR operations once exception control was complete.
- The first implementation target is a dedicated collections workspace so tenant admins can manage cash-risk follow-up without piecing it together from AR aging and exception-control screens.

### 2026-04-01 (Phase 20 Queue Foundation Slice)

- Added the tenant `/revenue/collections` workspace with queue filters, stage pressure, summary cards, owner hotspots, and invoice-level recommended actions.
- Wired the page to the new collections summary API so due-soon and overdue invoice pressure is grounded in live backend data.

### 2026-04-01 (Phase 20 Collector Action Slice)

- Added a collections action modal for assign, follow-up, promise-to-pay, dispute, escalate, and reset directly from queue rows.
- Surfaced collector state, assignee, follow-up timing, promise dates, and latest action metadata directly in the queue table and summary cards.
- Added actioned exposure and follow-up-due proof cards so the collections workspace starts to show operational progress instead of only raw AR totals.

### 2026-04-01 (Phase 20 Cadence + Proof Slice)

- Added missed-promise, cadence-step, dispute-category, and handoff-readiness visibility directly to queue rows and the current-state panel in the collections action modal.
- Extended the tenant collections summary cards with promise coverage, missed-promise exposure, follow-up debt, and dispute pressure so collections reads as an operational control surface instead of a basic AR list.
- Kept outbound reminder delivery out of scope while still exposing the workflow shape needed to validate reminder readiness in UAT.

### 2026-04-01 (Phase 20 Validation + Runbook Completion)

- Added tenant collections demo and UAT runbooks under `docs/runs/2026-04-01/collections-demo/` and `docs/runs/2026-04-01/collections-uat/`.
- Added `npm run uat:collections` plus a dry-run mode that writes reusable report scaffolds into the dated collections UAT folder.
- This closes Phase 20.6 and completes the tenant collections UX phase while keeping live business-user sign-off as an operational follow-up step.

---

## Reference Prototype (Static HTML)

Use these files as UI reference when porting to Next.js components:

- `index.html`
- `styles.css`
- `app.js`

---

## Files Created

### Phase 1: Next.js Foundation

| File                       | Status | Description                                        |
| -------------------------- | ------ | -------------------------------------------------- |
| `package.json`             | ✅     | Next.js, React, Tailwind, and library dependencies |
| `tsconfig.json`            | ✅     | TypeScript config with `@/` alias                  |
| `next.config.mjs`          | ✅     | Next.js configuration                              |
| `postcss.config.mjs`       | ✅     | PostCSS + Autoprefixer config                      |
| `tailwind.config.ts`       | ✅     | Tailwind v4 content + theme setup                  |
| `next-env.d.ts`            | ✅     | Next.js TypeScript globals                         |
| `src/app/layout.tsx`       | ✅     | Root layout entry                                  |
| `src/app/landing/page.tsx` | ✅     | Landing page placeholder                           |
| `src/styles/globals.css`   | ✅     | Global styles and CSS variables                    |
| `.eslintrc.json`           | ✅     | ESLint config                                      |
| `.prettierrc`              | ✅     | Prettier config                                    |
| `.gitignore`               | ✅     | Git ignore rules for Next.js                       |
| `.prettierignore`          | ✅     | Prettier ignore list                               |

---

### Phase 2: Design System + App Shell

| File                                     | Status | Description                  |
| ---------------------------------------- | ------ | ---------------------------- |
| `src/lib/cn.ts`                          | ✅     | Class name utility           |
| `src/lib/api.ts`                         | ✅     | Axios client for backend API |
| `src/components/ui/button.tsx`           | ✅     | Button component variants    |
| `src/components/ui/input.tsx`            | ✅     | Input component              |
| `src/components/ui/card.tsx`             | ✅     | Card component primitives    |
| `src/components/ui/badge.tsx`            | ✅     | Badge styles and variants    |
| `src/components/ui/icon-button.tsx`      | ✅     | Icon-only button component   |
| `src/components/ui/chip.tsx`             | ✅     | Filter chip component        |
| `src/components/ui/empty-state.tsx`      | ✅     | Empty state component        |
| `src/components/ui/skeleton.tsx`         | ✅     | Skeleton loading blocks      |
| `src/components/ui/table.tsx`            | ✅     | Table primitives             |
| `src/components/ui/pagination.tsx`       | ✅     | Pagination layout helpers    |
| `src/components/ui/select.tsx`           | ✅     | Select input component       |
| `src/components/ui/textarea.tsx`         | ✅     | Textarea input component     |
| `src/components/ui/checkbox.tsx`         | ✅     | Checkbox component           |
| `src/components/ui/modal.tsx`            | ✅     | Modal dialog component       |
| `src/components/ui/toaster.tsx`          | ✅     | Sonner toast wrapper         |
| `src/components/ui/spinner.tsx`          | ✅     | Spinner loader               |
| `src/components/ui/loading-state.tsx`    | ✅     | Loading state block          |
| `src/components/ui/error-state.tsx`      | ✅     | Error state block            |
| `src/components/ui/filter-bar.tsx`       | ✅     | Filter bar layout            |
| `src/components/ui/bulk-action-bar.tsx`  | ✅     | Bulk action toolbar          |
| `src/components/ui/breadcrumbs.tsx`      | ✅     | Breadcrumb trail component   |
| `src/components/navigation/nav-link.tsx` | ✅     | Sidebar navigation link      |
| `src/components/navigation/nav-items.ts` | ✅     | Navigation link definitions  |
| `src/components/layout/app-shell.tsx`    | ✅     | App shell layout wrapper     |
| `src/components/layout/sidebar.tsx`      | ✅     | Left navigation rail         |
| `src/components/layout/topbar.tsx`       | ✅     | Top navigation bar           |
| `src/components/layout/right-rail.tsx`   | ✅     | Context panel rail           |
| `src/components/layout/mobile-nav.tsx`   | ✅     | Mobile navigation drawer     |
| `src/app/(app)/layout.tsx`               | ✅     | App shell route layout       |
| `src/app/(app)/page.tsx`                 | ✅     | Dashboard page               |
| `src/app/(app)/list/page.tsx`            | ✅     | List view page               |
| `src/app/(app)/kanban/page.tsx`          | ✅     | Kanban view page             |
| `src/app/(app)/record/page.tsx`          | ✅     | Record detail page           |
| `src/app/(app)/admin/page.tsx`           | ✅     | Admin builder page           |
| `src/app/(app)/workflow/page.tsx`        | ✅     | Workflow center page         |
| `src/app/(app)/design-system/page.tsx`   | ✅     | Design system showcase       |
| `src/app/(auth)/layout.tsx`              | ✅     | Auth layout wrapper          |
| `src/app/(auth)/login/page.tsx`          | ✅     | Login screen                 |
| `src/app/(auth)/mfa/page.tsx`            | ✅     | MFA verification screen      |
| `src/app/(auth)/reset/page.tsx`          | ✅     | Password reset screen        |

---

### Phase 3: Backend Wiring (Auth)

| File                                         | Status | Description                                 |
| -------------------------------------------- | ------ | ------------------------------------------- |
| `src/types/auth.ts`                          | ✅     | Auth and user response types                |
| `src/lib/storage.ts`                         | ✅     | Local storage helpers for auth token        |
| `src/store/auth.ts`                          | ✅     | Zustand auth store + API integration        |
| `src/components/providers/app-providers.tsx` | ✅     | App bootstrap for auth hydration            |
| `src/components/providers/auth-gate.tsx`     | ✅     | Route guard for authenticated areas         |
| `src/types/ui-runtime.ts`                    | ✅     | UI runtime response types                   |
| `src/lib/ui-runtime.ts`                      | ✅     | UI runtime API helpers                      |
| `src/lib/object-data.ts`                     | ✅     | Object data fetch helpers                   |
| `src/types/metadata.ts`                      | ✅     | Metadata admin and bundle types             |
| `src/lib/metadata-api.ts`                    | ✅     | Metadata admin API helpers                  |
| `src/types/dashboard.ts`                     | ✅     | Dashboard summary response types            |
| `src/lib/dashboards-api.ts`                  | ✅     | Dashboard API helpers                       |
| `src/types/activity.ts`                      | ✅     | Activity response types                     |
| `src/lib/activities-api.ts`                  | ✅     | Activity API helpers                        |
| `src/types/workflow.ts`                      | ✅     | Workflow trigger/action/job types           |
| `src/lib/workflows-api.ts`                   | ✅     | Workflow API helpers                        |
| `src/components/admin/admin-nav.tsx`         | ✅     | Admin builder navigation                    |
| `src/app/(app)/admin/layout.tsx`             | ✅     | Admin builder sub-layout                    |
| `src/app/(app)/admin/objects/page.tsx`       | ✅     | Metadata objects builder                    |
| `src/app/(app)/admin/fields/page.tsx`        | ✅     | Metadata fields builder                     |
| `src/app/(app)/admin/layouts/page.tsx`       | ✅     | Metadata layouts builder                    |
| `src/app/(app)/admin/list-views/page.tsx`    | ✅     | Metadata list views builder                 |
| `src/app/(app)/admin/metadata/page.tsx`      | ✅     | Metadata import/export UI                   |
| `src/lib/auth-api.ts`                        | ✅     | Auth helper API methods (change password)   |
| `src/app/(app)/profile/page.tsx`             | ✅     | User profile page with change-password form |

### Phase 4: Rules, Workflow, Approvals UX

| File                                       | Status | Description                         |
| ------------------------------------------ | ------ | ----------------------------------- |
| `src/types/rules.ts`                       | ✅     | Rule builder types                  |
| `src/lib/rules-api.ts`                     | ✅     | Rule API helpers                    |
| `src/types/approvals.ts`                   | ✅     | Approval request types              |
| `src/lib/approvals-api.ts`                 | ✅     | Approval API helpers                |
| `src/types/monitoring.ts`                  | ✅     | Monitoring response types           |
| `src/lib/monitoring-api.ts`                | ✅     | Monitoring API helpers              |
| `src/types/compliance.ts`                  | ✅     | Audit trail and retention types     |
| `src/lib/compliance-api.ts`                | ✅     | Compliance API helpers              |
| `src/types/security.ts`                    | ✅     | Security policy and allowlist types |
| `src/lib/security-api.ts`                  | ✅     | Security API helpers                |
| `src/types/sharing.ts`                     | ✅     | Sharing rule types                  |
| `src/lib/sharing-api.ts`                   | ✅     | Sharing API helpers                 |
| `src/types/users.ts`                       | ✅     | User and role types                 |
| `src/lib/users-api.ts`                     | ✅     | User API helpers                    |
| `src/app/(app)/admin/rules/page.tsx`       | ✅     | Rule builder UI                     |
| `src/app/(app)/admin/workflows/page.tsx`   | ✅     | Workflow builder UI                 |
| `src/app/(app)/admin/approvals/page.tsx`   | ✅     | Approvals queue UI                  |
| `src/app/(app)/admin/monitoring/page.tsx`  | ✅     | Monitoring dashboard UI             |
| `src/app/(app)/admin/audit/page.tsx`       | ✅     | Audit trail and retention UI        |
| `src/app/(app)/admin/permissions/page.tsx` | ✅     | Permissions and security UI         |

### Phase 5: Sales App MVP UX

| File                                         | Status | Description                       |
| -------------------------------------------- | ------ | --------------------------------- |
| `src/types/leads.ts`                         | ✅     | Lead and conversion request types |
| `src/lib/leads-api.ts`                       | ✅     | Lead workspace API helpers        |
| `src/types/opportunities.ts`                 | ✅     | Opportunity pipeline types        |
| `src/lib/opportunities-api.ts`               | ✅     | Opportunity API helpers           |
| `src/types/accounts.ts`                      | ✅     | Account entity types              |
| `src/lib/accounts-api.ts`                    | ✅     | Account API helpers               |
| `src/types/contacts.ts`                      | ✅     | Contact entity types              |
| `src/lib/contacts-api.ts`                    | ✅     | Contact API helpers               |
| `src/types/reports.ts`                       | ✅     | Report definition and run types   |
| `src/lib/reports-api.ts`                     | ✅     | Reports API helpers               |
| `src/app/(app)/sales/page.tsx`               | ✅     | Sales overview dashboard          |
| `src/app/(app)/sales/leads/page.tsx`         | ✅     | Lead workspace UI                 |
| `src/app/(app)/sales/opportunities/page.tsx` | ✅     | Opportunity workspace UI          |
| `src/app/(app)/sales/accounts/page.tsx`      | ✅     | Account 360 UI                    |
| `src/app/(app)/sales/activities/page.tsx`    | ✅     | Activity center UI                |
| `src/app/(app)/sales/forecast/page.tsx`      | ✅     | Forecast rollups UI               |
| `src/app/(app)/sales/reports/page.tsx`       | ✅     | Sales reports UI                  |

### Phase 7: Products and Pricing UX

| File                                                | Status | Description                               |
| --------------------------------------------------- | ------ | ----------------------------------------- |
| `src/types/products.ts`                             | ✅     | Product entity types                      |
| `src/types/price-books.ts`                          | ✅     | Price book entity types                   |
| `src/types/price-book-entries.ts`                   | ✅     | Price book entry + pricing response types |
| `src/types/tax-codes.ts`                            | ✅     | Tax code entity types                     |
| `src/types/pricing-reports.ts`                      | ✅     | Pricing report summary types              |
| `src/lib/products-api.ts`                           | ✅     | Products API helpers                      |
| `src/lib/price-books-api.ts`                        | ✅     | Price books API helpers                   |
| `src/lib/price-book-entries-api.ts`                 | ✅     | Price book entries API helpers            |
| `src/lib/tax-codes-api.ts`                          | ✅     | Tax codes API helpers                     |
| `src/lib/pricing-reports-api.ts`                    | ✅     | Pricing reports API helpers               |
| `src/app/(app)/revenue/page.tsx`                    | ✅     | Revenue overview dashboard                |
| `src/app/(app)/revenue/products/page.tsx`           | ✅     | Product catalog UI                        |
| `src/app/(app)/revenue/price-books/page.tsx`        | ✅     | Price books UI                            |
| `src/app/(app)/revenue/price-book-entries/page.tsx` | ✅     | Price book entries UI                     |
| `src/app/(app)/revenue/tax-codes/page.tsx`          | ✅     | Tax codes UI                              |
| `src/app/(app)/revenue/pricing/page.tsx`            | ✅     | Pricing preview UI                        |

### Phase 8: Quotes (CPQ-lite) UX

| File                                         | Status | Description                          |
| -------------------------------------------- | ------ | ------------------------------------ |
| `src/types/quotes.ts`                        | ✅     | Quote entity and request types       |
| `src/types/quote-lines.ts`                   | ✅     | Quote line entity and request types  |
| `src/types/quote-reports.ts`                 | ✅     | Quote report summary types           |
| `src/lib/quotes-api.ts`                      | ✅     | Quote API helpers                    |
| `src/lib/quote-lines-api.ts`                 | ✅     | Quote line API helpers               |
| `src/lib/quote-reports-api.ts`               | ✅     | Quote report API helpers             |
| `src/app/(app)/revenue/quotes/page.tsx`      | ✅     | Quotes workspace list + builder      |
| `src/app/(app)/revenue/quotes/[id]/page.tsx` | ✅     | Quote detail, line items, acceptance |

### Phase 9: Orders to Invoices to Payments UX

| File                                           | Status | Description                               |
| ---------------------------------------------- | ------ | ----------------------------------------- |
| `src/types/orders.ts`                          | ✅     | Order entity and request types            |
| `src/types/invoices.ts`                        | ✅     | Invoice entity and request types          |
| `src/types/invoice-lines.ts`                   | ✅     | Invoice line entity types                 |
| `src/types/payments.ts`                        | ✅     | Payment and refund request types          |
| `src/types/payment-links.ts`                   | ✅     | Payment link entity types                 |
| `src/types/ar-aging.ts`                        | ✅     | AR aging report types                     |
| `src/lib/orders-api.ts`                        | ✅     | Order API helpers                         |
| `src/lib/invoices-api.ts`                      | ✅     | Invoice API helpers                       |
| `src/lib/invoice-lines-api.ts`                 | ✅     | Invoice lines API helpers                 |
| `src/lib/payments-api.ts`                      | ✅     | Payment API helpers                       |
| `src/lib/payment-links-api.ts`                 | ✅     | Payment link API helpers                  |
| `src/lib/ar-aging-api.ts`                      | ✅     | AR aging API helpers                      |
| `src/app/(app)/revenue/orders/page.tsx`        | ✅     | Orders list and create flow               |
| `src/app/(app)/revenue/orders/[id]/page.tsx`   | ✅     | Order detail and status updates           |
| `src/app/(app)/revenue/invoices/page.tsx`      | ✅     | Invoice list and issuance flow            |
| `src/app/(app)/revenue/invoices/[id]/page.tsx` | ✅     | Invoice detail, line items, payment links |
| `src/app/(app)/revenue/payments/page.tsx`      | ✅     | Payment capture and refunds               |
| `src/app/(app)/revenue/ar-aging/page.tsx`      | ✅     | AR aging dashboard                        |

### Phase 10: Reporting, Search, and Hardening UX

| File                                            | Status | Description                       |
| ----------------------------------------------- | ------ | --------------------------------- |
| `src/types/search.ts`                           | ✅     | Global search response types      |
| `src/lib/search-api.ts`                         | ✅     | Global search API helper          |
| `src/types/dashboard-builder.ts`                | ✅     | Dashboard builder contracts       |
| `src/lib/dashboard-builder-api.ts`              | ✅     | Dashboard builder API helpers     |
| `src/types/backups.ts`                          | ✅     | Backup export/restore types       |
| `src/lib/backups-api.ts`                        | ✅     | Backup export/restore API helpers |
| `src/app/(app)/reporting/page.tsx`              | ✅     | Reporting overview dashboard      |
| `src/app/(app)/reporting/dashboards/page.tsx`   | ✅     | Dashboard builder workspace       |
| `src/app/(app)/reporting/reports/page.tsx`      | ✅     | Report builder UI                 |
| `src/app/(app)/reporting/search/page.tsx`       | ✅     | Global search UI                  |
| `src/app/(app)/reporting/diagnostics/page.tsx`  | ✅     | Diagnostics, logs, and backups    |
| `src/app/(app)/reporting/integrations/page.tsx` | ✅     | SSO provider integrations         |
| `src/types/tenant-branding.ts`                  | ✅     | Tenant branding contracts         |
| `src/lib/tenant-branding-api.ts`                | ✅     | Tenant branding API helpers       |
| `src/app/(app)/admin/branding/page.tsx`         | ✅     | Branding and theming workspace    |

### Phase 11: Backend Parity and CRUD Completion

| File                                      | Status | Description                       |
| ----------------------------------------- | ------ | --------------------------------- |
| `src/types/import-export.ts`              | ✅     | CSV import/export result types    |
| `src/types/automation.ts`                 | ✅     | Automation template types         |
| `src/lib/automation-templates-api.ts`     | ✅     | Automation template API helpers   |
| `src/app/(app)/admin/automation/page.tsx` | ✅     | Automation template management UI |
| `src/types/tenants.ts`                    | ✅     | Tenant entity types               |
| `src/lib/tenants-api.ts`                  | ✅     | Tenant admin API helpers          |
| `src/app/(app)/admin/tenants/page.tsx`    | ✅     | Tenant provisioning UI            |
| `src/types/revenue-reports.ts`            | ✅     | Revenue summary report types      |
| `src/lib/revenue-reports-api.ts`          | ✅     | Revenue summary API helper        |
| `src/types/health.ts`                     | ✅     | Health check response types       |
| `src/lib/health-api.ts`                   | ✅     | Health and readiness API helpers  |

---

## Phase 12: Task Collaboration UX (Planned)

### Tasks

- [x] **12.1 Activity Collaboration Panel**
  - [x] Collaborator list with role badges (co-owner/helper)
  - [x] Pending collaboration requests surfaced on activity detail
- [x] **12.2 Collaboration Request Flow**
  - [x] Request modal (select user + role + optional note)
  - [x] Accept/decline request UI for recipients
- [x] **12.3 Comment Thread for Activities**
  - [x] Activity comments list + composer
  - [x] Helper-only comment access enforcement in UI
- [x] **12.4 Permissions + Gating**
  - [x] Admin can add collaborators directly
  - [x] Owners can request collaborators; helpers are comment-only
  - [x] Co-owners can edit task fields + status (no owner reassignment)
- [x] **12.5 Activity List Enhancements**
  - [x] Show collaborator indicators + pending request count
- [x] **12.6 Notifications (UI Only)**
  - [x] Inline alerts/badges for incoming collaboration requests
- [x] **12.7 Empty/Error States**
  - [x] Collaboration empty state, loading, and error views
- [x] **12.8 Owner Collaboration Notifications**
  - [x] Bell notification list for accepted/declined requests
  - [x] Mark-read actions and counts

### Deliverables

- [x] Collaborative activity UX with request/accept, comment thread, and owner notifications

---

## Phase 13: Workflow Simulator + Safe Publish UX (Complete)

### Tasks

- [x] **13.1 Simulation Runner Entry Points**
  - [x] Add "Run Simulation" actions in Admin Rules and Admin Workflows
  - [x] Capture selected object, trigger, and sample scope from UI
- [x] **13.2 Simulation Result Explorer**
  - [x] Show impacted records count, validation failures, and side-effect summary
  - [x] Add expandable before/after diff viewer for record field changes
- [x] **13.3 Publish Guardrail Wizard**
  - [x] Require successful simulation before publish
  - [x] Show risk level badges and mandatory confirmation steps
- [x] **13.4 Safe Publish Rollback UX**
  - [x] Add release history list with version metadata
  - [x] Add rollback action with warning and confirmation modal
- [x] **13.5 Monitoring Integration**
  - [x] Link simulation and publish outcomes into monitoring pages
  - [x] Surface failed publish diagnostics and retry guidance
- [x] **13.6 Access and Audit UX**
  - [x] Restrict simulator/publish controls by role
  - [x] Add user-facing audit timeline for simulate/publish/rollback actions

### Deliverables

- [x] Safe publish UX with simulation-first rollout and rollback visibility

---

## Phase 14: Revenue Intelligence UX (Complete)

### Tasks

- [x] **14.1 Revenue Risk Dashboard**
  - [x] Add leakage/risk widgets (margin erosion, discount abuse, collection risk)
  - [x] Add trends and filter controls by team, segment, and time
- [x] **14.2 Opportunity/Quote/Invoice Risk Panels**
  - [x] Show risk score and top risk reasons on record pages
  - [x] Show confidence and last-evaluated timestamps
- [x] **14.3 Next Best Action Cards**
  - [x] Show recommended owner actions with expected impact
  - [x] Add one-click run actions for approved recommendations
- [x] **14.4 Alert Feed and Escalation UX**
  - [x] Add prioritized alert feed with acknowledge/assign/snooze
  - [x] Add escalation flow to manager/admin for critical risks
- [x] **14.5 Forecast Impact UX**
  - [x] Add forecast adjustment previews based on risk signals
  - [x] Show scenario comparison with current pipeline totals
- [x] **14.6 Explainability and Trust UI**
  - [x] Expose "why this risk/action" details per recommendation
  - [x] Add feedback controls to improve recommendation relevance

### Deliverables

- [x] Revenue intelligence UX with explainable risk scoring and action orchestration

---

## Phase 15: Collaboration 2.0 UX (Complete)

### Tasks

- [x] **15.1 Workload Balancing Board**
  - [x] Add team workload visualization across owners/co-owners/helpers
  - [x] Add rebalance suggestions and assignment assist actions
- [x] **15.2 SLA Ownership UX**
  - [x] Add SLA owner fields and breach countdown timers on activities
  - [x] Add visual breach states and escalation controls
- [x] **15.3 Collaboration Performance Analytics**
  - [x] Add completion-time and collaboration-efficiency metrics
  - [x] Add co-owner/helper contribution breakdowns
- [x] **15.4 Collaboration Command Center**
  - [x] Add manager view for pending requests, bottlenecks, and blocked tasks
  - [x] Add filters by team/user/priority/SLA risk
- [x] **15.5 Collaboration Policies and Controls**
  - [x] Add admin policy settings for collaborator limits and default roles
  - [x] Add UI validation for policy-enforced assignment rules
- [x] **15.6 Collaboration Insights Exports**
  - [x] Add exportable collaboration reports
  - [x] Add scheduled summary digest configuration UX

### Deliverables

- [x] Collaboration 2.0 UX with workload, SLA ownership, and team performance insights

---

## Future Differentiator Backlog (Planned)

- [ ] **AI Data Capture Assistant**
  - [ ] Smart form-fill from notes, files, and pasted conversation context
  - [ ] Review/accept workflow with source attribution
- [ ] **Buyer Intent + Account Heat**
  - [ ] Intent signal ingestion and account heat scoring views
  - [ ] Intent-triggered outreach workflow prompts
- [ ] **Agent Studio for Business Users**
  - [ ] No-code assistant/agent builder with action guardrails
  - [ ] Agent run preview and execution trace UX
- [ ] **Trust & Security Control Center**
  - [ ] High-risk action visibility, policy controls, and audit drill-down UX
  - [ ] AI and API risk posture dashboard

## Notes and Decisions

### 2026-02-05

- Frontend UX blueprint completed.
- Static HTML prototype created as a visual reference for the Next.js implementation.
- Tech stack locked for App Router + Tailwind + Zustand + RHF + Zod + Axios + date-fns.

### 2026-02-08

- Completed Phase 1 frontend foundation setup (Next.js App Router + Turbopack, Tailwind v4, tooling, and core libraries).
- Standardized on `src/` app directory with layout/page scaffolding and global tokens.
- npm install completed; Next.js 15.5.6 reports a critical vulnerability warning (version pinned per stack).
- ESLint lint passed after setup.
- Added Axios client with `NEXT_PUBLIC_API_BASE_URL` defaulting to `http://localhost:8000` for Docker backend.
- Completed Phase 2 design system, app shell, and auth screens (login, MFA, reset).
- Added mobile navigation drawer, breadcrumbs, and Sonner toast provider.
- Moved the landing placeholder to `/landing` to avoid root route conflicts.
- ESLint lint passed after Phase 2 updates.
- Wired frontend auth to backend `/v1/auth/login` and `/v1/auth/me` with token persistence.
- Started Phase 3 metadata-driven UI wiring for record, list, and kanban pages.
- Wired list/record/kanban to backend object data endpoints for sample data binding.
- Built admin builder pages for objects, fields, layouts, and list views with live metadata APIs.
- Added metadata bundle import/export UI with JSON upload/download support.
- Wired dashboard summaries and workflow center to backend dashboard and workflow APIs.
- Completed Phase 4 admin tools (rules, workflows, approvals, monitoring, audit, permissions) wired to backend APIs.
- Built Sales Overview, Leads, Opportunities, Accounts, Activity Center, Forecast, and Reports pages wired to backend APIs.
- Added Sales navigation section and stage summary dashboards for pipeline visibility.

### 2026-02-11

- Completed Phase 7 product and pricing UX (products, price books, entries, tax codes, pricing preview) wired to backend APIs.
- Added Revenue navigation section with pricing overview routes.
- Completed Phase 8 quote builder UX (quotes list/detail, line items, approvals, PDF, acceptance).
- Implemented Phase 9 order/invoice/payment flows (orders, invoices, payments, AR aging) wired to backend APIs.
- Started Phase 10 reporting UX with report builder, global search, diagnostics, and integrations pages wired to backend APIs.

### 2026-02-21

- Added direct record access from Leads and Opportunities to reach edit/delete flows.
- Added quote delete action in quote detail view.

### 2026-02-25

- Planned task collaboration UX: request/accept flow between users, collaborator roles (co-owner/helper).
- Helper role limited to comments; co-owner can edit task fields and status (no owner reassignment).
- Admin can add collaborators directly; owners can request collaborators.
- Implemented collaboration panel and request workflow in Activity record view.
- Added activity comments thread with composer and helper-only comment access.
- Wired activity collaboration API helpers and frontend types.
- Added collaboration request alert card and per-activity collaboration indicators in Activity Center.

### 2026-03-02

- Added dedicated profile page at `/profile` with account details.
- Added password change form for users with current/new/confirm password checks.
- Updated top-right avatar action to open the profile page directly.

### 2026-03-03

- Added planned roadmap phases for:
  - Workflow Simulator + Safe Publish UX
  - Revenue Intelligence UX
  - Collaboration 2.0 UX
- Added remaining CRM differentiators into a dedicated future backlog section.
- Implemented simulator UX baseline:
  - Added dedicated Workflow Simulator admin page with run history and impact preview.
  - Added deep-link "Simulate" actions from Rules and Workflows pages.
  - Added query-param prefill for object/trigger/event context in simulator entry flows.
- Enhanced simulator impact explorer:
  - Added impact severity summary badges and diff availability counts.
  - Added expandable per-impact before/after field diff rows in impact preview.
- Added publish guardrail wizard:
  - Added simulation gate checks (completed run + zero errors).
  - Added risk-level badges and mandatory publish confirmation checklist.
- Added safe publish rollback UX scaffold:
  - Added release history timeline with version metadata and active/rolled-back states.
  - Added rollback confirmation modal with required reason capture.
- Added monitoring integration for workflow simulator outcomes:
  - Added automation outcomes and focused-run visibility in Admin Monitoring.
  - Added failed-run diagnostics with retry guidance and direct retry actions.
- Completed simulator access/audit UX:
  - Added role-based gating for run/publish/rollback controls in Workflow Simulator.
  - Added user-facing audit timeline for simulate/publish/rollback events.
- Started revenue intelligence UX:
  - Added `/revenue/intelligence` dashboard with risk scoring for leakage, margin pressure, and collections.
  - Added segment/time/owner filters, trend proxies, and prioritized risk queue with record actions.
- Completed Phase 14.2 risk panels:
  - Added reusable risk assessment engine for Opportunity, Quote, and Invoice records.
  - Added risk panel UI with score, confidence, last-evaluated timestamp, and top risk reasons.
  - Integrated risk panels into Opportunity record page, Quote detail page, and Invoice detail page.
- Completed Phase 14.3 next best actions:
  - Added prioritized recommendation cards with expected impact and confidence scoring.
  - Added approval gating and one-click run actions for approved recommendations.
  - Added action execution history and automatic risk-queue cleanup after action runs.
- Completed Phase 14.4 alert feed and escalation UX:
  - Added prioritized alert feed with per-alert acknowledge, assignee selection, snooze, and resolve actions.
  - Added escalation modal flow supporting manager/admin targeting with escalation notes.
  - Added alert status rollups and escalation state tracking in revenue intelligence workspace.
- Completed Phase 14.5 forecast impact UX:
  - Added forecast scenario cards (current, mitigated, stress) with delta comparisons.
  - Added scenario focus control and selected-scenario preview metrics.
  - Added forecast adjustment driver table with current vs adjusted impact rows.
- Completed Phase 14.6 explainability and trust UX:
  - Added "why this action" explainability details and trust scoring on each recommendation card.
  - Added per-action relevance feedback controls with note capture for tuning loops.
  - Added feedback-aware recommendation ordering to prioritize helpful actions.
- Completed Phase 15.1 workload balancing board:
  - Added `/sales/workload` board with owner/co-owner/helper workload visualization.
  - Added utilization scoring and overload/available capacity status markers.
  - Added rebalance suggestions with assignment-assist actions to add helper collaborators.
- Completed Phase 15.2 SLA ownership UX:
  - Added SLA owner and SLA state columns in Activity Center with breach/at-risk countdown labels.
  - Added escalation controls (request helper/co-owner, direct assignment, owner reassignment for admins).
  - Added SLA ownership card on Activity record pages with countdown, state, and one-click escalation entry.
- Completed Phase 15.3 collaboration performance analytics:
  - Added completion throughput metrics in `/sales/workload` (average completion time, on-time rate, collaboration completion count).
  - Added collaboration efficiency scoring by member, combining timeliness, cycle-time, and contribution signals.
  - Added co-owner/helper contribution breakdown bars and contribution score rollups.
- Completed Phase 15.4 collaboration command center:
  - Added `/sales/command-center` manager workspace for pending collaboration requests, bottlenecks, and blocked activities.
  - Added command-center filters by team, owner, priority, and SLA risk with synchronized summary metrics.
  - Added Sales navigation link and quick access from workload board.
- Completed Phase 15.5 collaboration policies and controls:
  - Added tenant-level collaboration policy settings in Admin Permissions (default role, collaborator limits, helper request toggle).
  - Added policy-aware UI validation across Activity record collaboration, Activity Center escalation, and Workload suggestion assignment.
  - Wired frontend policy fetch/update APIs for runtime enforcement and admin management.

### 2026-03-04

- Completed Phase 15.6 collaboration insights exports:
  - Added collaboration insights table to `/sales/command-center` with last-30-days metrics.
  - Added CSV export action for collaboration insights.
  - Added digest settings modal (enable/frequency/channel/send time/day) wired to backend digest APIs.
- Validated build after updates (`npm run build`) with no TypeScript errors.

### 2026-03-13 (Phase 1 Start)

- Hardened auth store login/MFA flow state handling to avoid false error-state transitions during MFA challenge.
- Added structured MFA challenge handling with delivery target support in login + MFA pages.
- Improved sign-in error messaging for timeout/network/503 scenarios to provide actionable retry guidance.
- Added post-deploy auth/navigation smoke script (`scripts/smoke-auth-navigation.mjs`) with health + optional login verification.
- Expanded diagnostics surface with explicit auth/email reliability KPIs and pass/review checks for MFA/email delivery health.
- Validated updates via `npm run lint` and `npm run build`.

### 2026-03-16 (Phase 0 Program Setup Completion)

- Added cross-repo milestone alignment doc at `docs/cross-repo-roadmap-alignment.md`.
- Added pinned API sync baseline at `docs/api-contract-sync-2026-03.md`.
- Added CI workflow at `.github/workflows/ci.yml` enforcing lint, typecheck, test, and build.
- Added `typecheck` and `test` scripts in `package.json` to enforce CI quality gates consistently.

### 2026-03-16 (Phase 6.4 Completion)

- Refactored admin Rules/Workflows pages to memoize field-loading callbacks with `useCallback`.
- Updated dependent `useEffect` hooks to include stable callback dependencies.
- Cleared remaining hook dependency warnings and re-ran `npm run lint` + `npm run build`.

### 2026-03-18 (Phase 6 Service UX Baseline)

- Added a full Service navigation section to desktop and mobile app shell.
- Added typed frontend service contracts in `src/types/service.ts` and API helpers in `src/lib/service-api.ts`.
- Implemented `/service` overview with queue workload, SLA watchlist, and escalation feed.
- Implemented `/service/cases` with intake, assignment, SLA controls, agent console, and escalation deep links.
- Implemented `/service/queues` with create/edit flows and live workload rollups.
- Implemented `/service/escalations` with filtered queue, create/edit lifecycle, and quick acknowledge/resolve actions.
- Validated with `npm run lint`, `npm run typecheck`, and `npm run build`.

### 2026-03-18 (Phase 6 Service UX Completion)

- Added dedicated Email Intake flow in Service Cases to convert inbound emails into `source=email` cases.
- Added Agent Console Macro + Knowledge Assist with canned response templates and contextual article suggestions.
- Added note-save workflow from Agent Console to append timestamped support notes directly into case description.
- Re-validated updates with `npm run lint`, `npm run typecheck`, and `npm run build`.

### 2026-03-18 (Phase 2.1 Email and Files UX Completion)

- Added typed email/file integration contracts: `src/types/email-logs.ts` and `src/types/file-attachments.ts`.
- Added API clients: `src/lib/email-logs-api.ts` and `src/lib/file-attachments-api.ts`.
- Added Sales workspace page `/sales/email-files` with:
  - send-and-log email composer (`/v1/email-logs`)
  - email delivery log table with status filters and error visibility
  - file upload/list/download/delete flows (`/v1/files`)
- Added Sales navigation entry and Sales Overview quick action for Email & Files.
- Re-validated updates with `npm run lint`, `npm run typecheck`, and `npm run build`.

### 2026-03-18 (Phase 2.3 Dashboard Builder UX Completion)

- Added typed dashboard builder contracts in `src/types/dashboard-builder.ts`.
- Added dashboard builder API client in `src/lib/dashboard-builder-api.ts`.
- Added `/reporting/dashboards` workspace for:
  - dashboard list/detail views
  - create/edit JSON layout+widgets+filters workflows
  - preset-based dashboard creation flow
  - share controls (public, role sharing, user sharing)
- Added Reporting navigation entry for Dashboard Builder and linked it from Reporting Overview.
- Re-validated updates with `npm run lint`, `npm run typecheck`, and `npm run build`.

### 2026-03-18 (Phase 2.4 Branding and Theming UX Completion)

- Added tenant branding contracts in `src/types/tenant-branding.ts`.
- Added tenant branding API client in `src/lib/tenant-branding-api.ts`.
- Added `/admin/branding` workspace with:
  - brand identity controls (name/logo/favicon/login background URLs)
  - full theme color controls with defaults and live preview
  - theme token JSON overrides and custom CSS editing
- Added Branding navigation links in Admin Builder navigation and global admin shortcuts.
- Re-validated updates with `npm run lint`, `npm run typecheck`, and `npm run build`.

### 2026-03-18 (Phase 3.1 Role-Permission Matrix UX Completion)

- Added role-permission profile contracts in `src/types/users.ts`.
- Added role-permission API helpers in `src/lib/users-api.ts` for:
  - `GET /v1/users/permissions/roles`
  - `PUT /v1/users/permissions/roles/{role}`
- Extended `/admin/permissions` with a Role Permission Matrix section:
  - role selector for tenant-managed roles
  - editable permission checkbox matrix by role
  - base/effective permission visibility and custom-default state
  - reset-to-system-default and save-role-default actions
- Re-validated updates with `npm run lint`, `npm run typecheck`, and `npm run build`.

### 2026-03-25 (Phase 3 Superadmin Power Features Completion)

- Extended `src/types/users.ts` with temporary permission grant and permission replay contracts.
- Added temporary permission grant and permission replay API helpers in `src/lib/users-api.ts`.
- Extended `/admin/permissions` with:
  - temporary elevated access creation with expiry timestamp and reason capture
  - active/inactive temporary grant visibility and revoke actions
  - permission replay investigation modal with decision sources, effective permission context, and audit timeline
- Re-validated updates with `npm run typecheck`.

### 2026-03-25 (Phase 4 Differentiator Wave 1 Completion)

- Confirmed the existing `/revenue/intelligence` workspace already covers the AI revenue copilot brief with explainable recommendations, feedback capture, forecast scenarios, and escalation handling.
- Confirmed the existing `/admin/workflow-simulator` workspace already covers simulator expansion with impact diffs, guardrail review, release history, and rollback audit visibility.
- Added a new `/sales/deal-room` workspace that combines:
  - opportunity summary and commercial package context
  - linked quotes and approval blockers
  - linked execution activities and buyer contacts
  - stage progression and risk snapshot sidebars
- Added direct navigation into the deal room from Sales Overview, Sales navigation, and Opportunity Workspace actions.
- Re-validated updates with `npm run lint`, `npm run build`, and `npm run typecheck`.

### 2026-03-25 (Phase 5.1 Relationship Intelligence UX Completion)

- Added a new `/sales/relationships` workspace for account-centered relationship intelligence.
- Built a graph view linking:
  - account owner and interaction hub
  - linked leads
  - account contacts
  - active opportunities
- Added node selection and interaction drill-down so each branch surfaces related activities, quote signals, lead conversion context, or owner-linked work.
- Added navigation entry points from Sales navigation, Sales Overview, Account 360, and Opportunity Workspace actions.
- Updated the `typecheck` script in `package.json` to run `next typegen` before `tsc`, fixing the repo's flaky `.next/types` issue.
- Re-validated updates with `npm run lint`, `npm run build`, and `npm run typecheck`.

### 2026-03-25 (Phase 5.2 Playbook Marketplace UX Completion)

- Added tenant-scoped playbook marketplace contracts in `src/types/playbooks.ts`.
- Added frontend API helpers in `src/lib/playbook-marketplace-api.ts` for:
  - catalog discovery
  - installed playbook listing
  - catalog install
  - installed playbook clone
- Added a new `/admin/playbooks` workspace with:
  - catalog search and category/object filters
  - installed playbook filtering by search, status, source template, and clone visibility
  - install modal with editable JSON config overrides
  - clone modal for tenant-specific derivative playbooks
  - config previews and install counts by template
- Added navigation entry points from the admin builder landing page and admin side navigation.
- Re-validated updates with `npm run lint`, `npm run build`, and `npm run typecheck`.

### 2026-03-25 (Phase 5.3 Benchmarking UX Completion)

- Added privacy-safe benchmark contracts in `src/types/benchmark.ts`.
- Added benchmark API helper in `src/lib/benchmarks-api.ts` for `GET /v1/benchmarks/cross-tenant`.
- Added a new `/revenue/benchmarks` workspace with:
  - minimum cohort size controls to respect privacy thresholds
  - segment views for pipeline, pricing, and collections metrics
  - metric cards showing tenant value, p25/p50/p75 cohort ranges, and percentile position
  - comparison table for exact cohort-band review by metric
- Added navigation entry points from revenue navigation, Revenue Overview, and Revenue Intelligence.
- Re-validated updates with `npm run lint`, `npm run build`, and `npm run typecheck`.

### 2026-03-25 (Phase 6.1 User Directory Virtualization Completion)

- Added a reusable `VirtualizedList` primitive in `src/components/ui/virtualized-list.tsx`.
- Reworked `/admin/permissions` user management with:
  - directory search by name, email, and role
  - role and status filters
  - horizontal containment for narrow screens
  - virtualized row rendering for large user lists
  - truncated user identity cells to prevent table overflow
- Kept role updates, temporary access, and permission replay actions available inside the virtualized directory rows.
- Re-validated updates with `npm run lint`, `npm run build`, and `npm run typecheck`.

### 2026-03-25 (Phase 6.2 Dashboard Cache Strategy Completion)

- Exported shared query/cache option types from `src/lib/api.ts` to standardize cache-aware read helpers.
- Updated high-traffic dashboard and reporting helpers to use `cachedGet` with explicit TTLs and optional cache bypass:
  - `src/lib/dashboards-api.ts`
  - `src/lib/revenue-reports-api.ts`
  - `src/lib/pricing-reports-api.ts`
  - `src/lib/ar-aging-api.ts`
  - `src/lib/dashboard-builder-api.ts`
  - `src/lib/revenue-intelligence-api.ts`
- Extended related list helpers so manual refresh actions can bypass the client cache for live reads:
  - activities, leads, opportunities, quotes, invoices
  - products, price books, price book entries
- Wired refresh and retry actions in key sales and revenue overview pages to force a live refetch while keeping initial page loads cache-friendly.
- Re-validated updates with `npm run lint`, `npm run build`, and `npm run typecheck`.

### 2026-03-25 (Phase 6.3 Frontend Regression Test Expansion Completion)

- Added Node test-runner coverage for high-risk business logic in:
  - `src/lib/revenue-risk.test.ts`
  - `src/lib/activity-collaboration-policy.test.ts`
  - `src/lib/permissions.test.ts`
- Covered risk scoring regressions for opportunities, quotes, and invoices, plus collaboration policy enforcement and role permission gates.
- Updated `package.json` so `npm test` now runs unit coverage before the existing auth/navigation smoke check.
- Enabled `allowImportingTsExtensions` in `tsconfig.json` so the TypeScript unit tests work with the Node test runner under the repo's no-emit setup.
- Re-validated updates with `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build`.

### 2026-03-25 (Phase 7 Release Readiness Baseline)

- Added an executable release-readiness audit script at `scripts/frontend-release-readiness.mjs`.
- Added a role/module UAT matrix at `docs/frontend-uat-role-module-matrix.md`.
- Added package scripts:
  - `npm run release:check`
  - `npm run release:check:dry`
- Recorded automated evidence at `docs/runs/2026-03-25/frontend-release-readiness/README.md` and `report.json`.
- Ran the release check against `https://admin.nexo.ash-systems.net` and confirmed that hostname is not valid for this repo's tenant frontend validation.
- Clarified that `admin.nexo.ash-systems.net` belongs to the separate admin portal deployment, not the tenant frontend served by this repository.
- Reverted the temporary hostname-change draft and kept this frontend deployment scoped to `nexo.ash-systems.net`.
- Next release-readiness validation must be rerun against the correct tenant frontend hostname.

### 2026-03-27 (Phase 16 Planning)

- Added a planned Phase 16 roadmap for contact-centric meetings and invite automation.
- Defined frontend scope for:
  - account-to-contact attendee selection
  - meeting scheduling entry points
  - invite send/resend/cancel UX
  - timeline and delivery-log visibility
- Captured UAT expectations for multi-contact scheduling, timezone behavior, and invite failure handling.

### 2026-03-28 (Phase 16 Implementation Progress)

- Completed backend meeting-attendee support, scheduling fields, invite send/resend/cancel flows, and attendee-based activity filtering.
- Completed frontend meeting scheduling entry points from Account 360, Contact/Opportunity records, and the Activity Center.
- Added attendee selection, invite-state visibility, invite delivery history, retry guidance, and Email & Files linkage on meeting records.
- Added Account and Contact timeline visibility for meetings, including contact attendee timeline context and Account 360 activity filtering.
- Added frontend regression helpers/tests for attendee selection, contact timeline query routing, and invite log summaries, plus a Phase 16 UAT runbook under `docs/runs/2026-03-28/phase16-contact-meetings/`.
- Hardened meeting timezone handling with timezone-aware schedule previews, valid timezone selection, backend IANA timezone validation, and pre-save warnings for selected attendees who do not have contact email addresses.
- Updated the record timeline, Account 360 timeline, and Activity Center queue to render meeting schedules using the meeting timezone instead of generic local due-date formatting.
- Left UAT/regression sign-off open pending scenario-based validation for multi-contact scheduling, timezone behavior, permissions, and missing-email fallbacks.

### 2026-03-28 (Phase 16 UAT Closure)

- Re-ran `npm run release:check` against the correct tenant frontend hostname (`https://nexo.ash-systems.net`) and recorded a passing release-readiness report under `docs/runs/2026-03-28/frontend-release-readiness/`.
- Recorded a local tenant-backed `6/6` pass for account/contact/opportunity scheduling, resend/cancel invite lifecycle, no-email fallback, timezone persistence, and helper read-only permissions under `docs/runs/2026-03-28/phase16-contact-meetings/AUTOMATED_LOCAL_UAT.md` and `automated-local-report.json`.
- Closed Phase 16.6 using tenant-backed evidence and kept the artifact reusable for a later live-tenant rerun when environment credentials are available.

---

## Phase 21: Revenue Leakage + Profitability Intelligence UX (Complete)

### Why This Phase Exists

- After collections, the next buyer-visible UX gap is not another queue; it is commercial leakage visibility.
- The tenant app already shows revenue intelligence and collections pressure, but it does not yet turn discount leakage, quote expiry, stalled pipeline, and overdue cash into one explainable profitability story.
- This phase makes that leakage visible to admins, managers, and sellers in a way they can act on.

### Tasks

- [x] **21.1 Leakage Pressure Surface**
  - [x] Add a revenue-leakage summary to the tenant intelligence workspace using live opportunities, quotes, invoices, and forecast context.
  - [x] Show the first explainable buckets for quote discount, quote expiry, stalled pipeline, and overdue cash.
- [x] **21.2 Profitability Drill-Down UX**
  - [x] Add clearer drill-down paths from each leakage bucket into the affected records and commercial workflow.
  - [x] Keep the explanation tied to real records instead of only aggregate cards.
- [x] **21.3 Remediation Paths**
  - [x] Surface the best next workflow for each leakage bucket, such as quote review, pipeline rescue, or collections follow-up.
  - [x] Reuse existing record, activity, and collections surfaces instead of inventing a separate assistant shell.
- [x] **21.4 Proof + Storytelling**
  - [x] Add buyer-facing proof around protected forecast, leakage concentration, and recovered exposure.
  - [x] Keep the UX commercially legible for demos and operator reviews.
- [x] **21.5 Demo + UAT**
  - [x] Add runbooks and scenario coverage for leakage review, drill-down, and remediation handoff.
  - [x] Validate the flow with real tenant-shaped data rather than synthetic UI-only mocks.
- [x] **21.6 Polish + Release Readiness**
  - [x] Tighten performance, empty/error states, and responsive handling for the new intelligence surfaces.
  - [x] Keep generalized agent-platform scope and ERP-style sprawl out of this phase.

### Deliverables

- [x] Tenant-facing leakage and profitability workspace tied to live CRM-to-cash data.
- [x] Explainable drill-downs from executive leakage metrics into operational actions.
- [x] Demo-ready commercial story showing how Nexo helps protect revenue, not just report it.

### Notes

- This phase deepens the existing revenue intelligence workspace instead of creating a separate finance app.
- Collections remains part of the story, but the goal here is protected revenue and prioritization, not ERP-depth accounting.

### 2026-04-01 (Phase 21 Kickoff)

- Opened the next tenant UX phase around revenue leakage and profitability intelligence once collections workflow depth was complete.
- The first implementation target is a leakage pressure surface that combines forecast, quote, pipeline, and collections pressure into one buyer-visible view.

### 2026-04-01 (Phase 21 Leakage Pressure Slice)

- Added the first tenant-side revenue leakage surface to `/revenue/intelligence`, with leakage buckets, exposure totals, ratio-to-forecast, and top-pressure records.
- Kept the first slice intentionally narrow and explainable by deriving it from the opportunities, quotes, and invoices the page already trusts rather than inventing a new opaque score.

### 2026-04-02 (Phase 21 Backend-Aligned Leakage Drill-Down)

- Wired the tenant leakage surface to the shared backend leakage contract when available so approval-backlog and late-stage-unquoted pressure now appear without maintaining a second frontend-only profitability model.
- Added direct record drill-down from leakage pressure rows so users can move from summary pressure into the affected quote, invoice, or pipeline workspace immediately.

### 2026-04-02 (Phase 21 Remediation Workflow Slice)

- Added prioritized remediation cards and per-bucket workflow actions to `/revenue/intelligence` so sellers and managers can move from leakage detection into the right quote, opportunity, collections, or exception workflow without guessing the next step.
- Kept the handoff model tied to existing tenant workflows instead of inventing a separate assistant shell, which keeps the surface grounded in the product users already know.

### 2026-04-02 (Phase 21 Collections Coupling Surface)

- Added a collections-plus-margin coupling strip to `/revenue/intelligence` so overdue cash can be read alongside promise risk, dispute pressure, escalation, and concession-linked accounts.
- Kept the operator story commercially legible by surfacing coupled overdue exposure, missed promises, and discounted-account cash pressure without opening a separate finance shell.

### 2026-04-02 (Phase 21 Proof + Export Surface)

- Added a buyer-facing proof strip to `/revenue/intelligence` so tenant operators can read protected forecast, recovery opportunity, active recovery, and leakage concentration as one commercial story instead of a pile of isolated KPIs.
- Added direct CSV export from the tenant intelligence page so leadership and demo reviewers can take the same proof metrics into offline review without recreating the story manually.

### 2026-04-02 (Phase 21 Validation + Readiness Prep)

- Added leakage demo and UAT runbooks for tenant-side review, drill-down, remediation handoff, and export validation so live tenant-shaped sign-off can run against a repeatable script.
- Tightened the tenant intelligence surface with intentional top-level unavailable/no-data states plus a reset path when the current slice filters away all revenue records.

### 2026-04-02 (Phase 21 Automated Leakage UAT Harness)

- Added `scripts/leakage-uat.mjs` plus `npm run uat:leakage(:dry)` so the leakage workspace now has an executable UAT path for route reachability, dashboard/report alignment, remediation metadata, proof signals, and CSV export.
- The harness writes repeatable evidence into `docs/runs/<date>/leakage-uat/` and gives QA a dry-run scaffold before credentials or live tenant-shaped data are available.
- Kept `21.5` open until the scripted checks run live against real tenant-shaped data and the new intelligence surface gets explicit release sign-off.

### 2026-04-02 (Phase 21 Release Polish Slice)

- Tightened the tenant revenue-intelligence workspace with non-blocking filter/refresh transitions, a source-readiness panel that honestly shows fallback leakage mode and missing feeds, and mobile-safe card layouts for the new drill-down tables.
- Closed `21.6` after local `lint`, `build`, and `typecheck` passed; `21.5` remains open until the scripted leakage UAT runs live against real tenant-shaped data.

### 2026-04-03 (Phase 21 Live UAT + Sign-Off)

- Ran the tenant leakage UAT live against the deployed tenant app and captured evidence under `docs/runs/2026-04-03/leakage-uat/`.
- Closed `21.5` after live drill-down, remediation, proof, and export checks passed against tenant-shaped data on the deployed surface.

---

## Phase 22: Buyer Intent + Account Heat UX (In Progress)

### Why This Phase Exists

- Revenue leakage explains downside pressure, but sellers still need a faster read on which accounts are heating up, cooling off, or shifting into collections-aware risk.
- The tenant app already has the CRM-to-cash signals needed for that read across opportunities, quotes, meetings, invoices, and collections state.
- This phase turns those signals into an explainable account-heat workspace with clear next actions and exportable proof.

### Tasks

- [x] **22.1 Account Heat Workspace**
  - [x] Add a dedicated tenant workspace for buyer intent and account heat.
  - [x] Keep the surface tied to existing CRM-to-cash signals instead of introducing a parallel telemetry model.
- [x] **22.2 Filtered Ranking + Drill-Down**
  - [x] Show ranked accounts with filters for owner, heat band, intent profile, and search.
  - [x] Keep direct drill-down into the account record and current sales/revenue workspaces.
- [x] **22.3 Suggested Next Actions**
  - [x] Surface recommended next actions and route hints for quote follow-up, re-engagement, and collections review.
  - [x] Reuse existing operational workflows instead of inventing a new assistant shell.
- [x] **22.4 Export + Demo Surface**
  - [x] Add an on-screen demo story plus breakdowns for intent and next-workflow mix.
  - [x] Add CSV export from the same account-heat contract for offline leadership and demo review.
- [ ] **22.5 Validation + UAT**
  - [x] Add runbooks and scripted UAT for route reachability, filtered ranking, story metadata, and export.
  - [ ] Capture live tenant sign-off with real credentials and business-owner review.
- [x] **22.6 Broader Signal Ingestion**
  - [x] Prepare future behavioral signal ingestion only after the CRM-native heat model proves useful.
  - [x] Keep generalized agent-shell and ERP-style scope out of this phase.

### Deliverables

- [x] Explainable tenant workspace for which accounts are heating up, cooling off, or sliding into collections watch.
- [x] Clear next-action routing from account heat into existing account, opportunity, quote, and collections workflows.
- [x] Demo-ready and export-ready account-momentum story without a second reporting surface.

### Notes

- This phase intentionally starts with CRM-native heat and intent signals rather than external behavioral telemetry.
- The goal is a commercially legible account-momentum view, not a generic lead-scoring platform.

### 2026-04-02 (Phase 22 Kickoff)

- Opened the buyer-intent and account-heat UX phase after the first revenue leakage surface was in place.
- The first implementation target was a seller-friendly account-heat workspace backed by the new tenant-scoped backend contract.

### 2026-04-02 (Phase 22 Account Heat Workspace Slice)

- Added `src/app/(app)/sales/account-heat/page.tsx`, `src/lib/account-heat-api.ts`, and `src/types/account-heat.ts` to render the first tenant account-heat workspace from live CRM-to-cash data.
- Wired the new workspace into the sales navigation and command center so sellers and managers can move into ranked account momentum without leaving the existing sales shell.

### 2026-04-02 (Phase 22 Export + Demo Surface)

- Added a demo-story panel, intent/action breakdowns, and CSV export to `/sales/account-heat` so buyer-intent review is presentation-ready without turning the page into a generic BI surface.
- Kept the on-screen narrative and CSV export tied to the same backend account-heat contract for consistency.

### 2026-04-02 (Phase 22 Automated Account Heat UAT Harness)

- Added `scripts/account-heat-uat.mjs` plus `npm run uat:account-heat(:dry)` and the runbooks under `docs/runs/2026-04-02/account-heat-demo/` and `docs/runs/2026-04-02/account-heat-uat/`.
- Kept `22.5` open until the scripted checks run live against tenant-shaped data with real tenant-owner sign-off.

### 2026-04-02 (Phase 22 Signal Coverage Slice)

- Added a signal-coverage strip to `/sales/account-heat` so the workspace now shows which CRM-native feeds are active today and which external behavioral sources remain intentionally planned.
- Kept the surface focused on readiness and scope control rather than inventing a broader agent shell before the current model is proven live.

### 2026-04-03 (Phase 22 Live Credentialed UAT)

- Ran the tenant account-heat UAT live against the deployed tenant app and captured evidence under `docs/runs/2026-04-03/account-heat-uat/`.
- Kept `22.5` open because business-owner review remains the last honest sign-off step even though the scripted live checks passed with real tenant credentials.

---

## Phase 23: Trust & Security Control Center UX (Complete)

### Why This Phase Exists

- Nexo now has stronger security posture data on the backend, but tenant admins still need a fast way to understand their trust posture without reading raw policy tables.
- The product already includes configuration-heavy security screens; what was missing is a lightweight posture summary with clear recommendations and recent security activity.
- This phase turns security posture into a usable tenant-facing trust center that supports the platform-governance wedge with buyer-visible confidence.

### Tasks

- [x] **23.1 Tenant Trust Center Workspace**
  - [x] Add a dedicated tenant trust-center page that summarizes score, risk, checks, recommendations, and recent activity.
  - [x] Keep the surface explainable and grounded in current Nexo controls rather than inventing a generic cybersecurity dashboard.
- [x] **23.2 Security Activity Drill-Down**
  - [x] Add deeper audit and recovery drill-down from trust warnings into the existing security/compliance workflows.
  - [x] Preserve tenant-safe routing into current policy, SSO, and allowlist tooling.
- [x] **23.3 Remediation Routing**
  - [x] Attach clearer next-step routes from trust checks into policy, SSO, temporary-access, and allowlist actions.
  - [x] Keep remediation inside existing workflows rather than creating a second security shell.
- [x] **23.4 Trust Proof + Export**
  - [x] Add buyer-friendly proof, export, or share surfaces for tenant trust posture reviews.
  - [x] Reuse the existing trust contract instead of forking the story into a separate BI view.
- [x] **23.5 Validation + UAT**
  - [x] Add scripted validation and runbooks for tenant trust-center route, posture, and remediation flows.
  - [x] Capture honest live sign-off with real tenant credentials.
- [x] **23.6 Release Story + Sign-Off**
  - [x] Fold the trust center into the release/demo story for the governance wedge.
  - [x] Keep the phase tight and avoid widening into a generalized agent shell or SIEM-like surface.

### Deliverables

- [x] Tenant-facing trust-center workspace for posture score, recommendations, and recent security activity.
- [x] Remediation-ready trust story that routes into existing admin security workflows.
- [x] Demo/release-ready tenant trust posture surface.

### Notes

- This phase adds a tenant-facing trust layer on top of existing controls; it does not replace the existing security configuration workspaces.
- The goal is operator clarity and buyer confidence, not a broad security-analytics product.

### 2026-04-02 (Phase 23 Tenant Trust Center Slice)

- Added `src/app/(app)/admin/security/page.tsx`, `src/lib/trust-center-api.ts`, and `src/types/trust-center.ts` so tenant admins now have a dedicated trust-center page in the admin workspace.
- The first slice surfaces score, grade, risk, trust checks, recommendations, and recent security activity from the backend trust-center contract, while keeping the UI tied to Nexo-native security controls.

### 2026-04-02 (Phase 23 Temporary Access Review Surface)

- Extended the tenant trust center with review-required grant metrics plus a dedicated temporary-access review panel so admins can see which grants need attention because of missing reason or extended duration.
- Kept the UI attached to the same trust-center contract rather than splitting temporary-access review into a second security page.

### 2026-04-02 (Phase 23 Remediation + Evidence Routing Slice)

- Added trust-check and grant-alert routing so tenant admins can jump directly from warnings into `/admin/permissions` or `/admin/audit` instead of treating the trust center as a dead-end summary page.
- This closes `23.2` while leaving broader remediation proof/export and validation work open in the later trust-center tasks.

### 2026-04-02 (Phase 23 Trust Export Slice)

- Added tenant trust-center CSV download from the same backend trust contract so posture reviews can be exported without opening a second reporting surface.
- This closes `23.4` while validation/UAT and the release-story slice remain open.

### 2026-04-02 (Phase 23 Validation + Demo Readiness Slice)

- Added `scripts/trust-center-uat.mjs`, `npm run uat:trust-center(:dry)`, and the runbook under `docs/runs/2026-04-02/trust-center-uat/` so the tenant trust center now has a repeatable validation path for route reachability, posture contract, remediation routing, temporary-access review, and CSV export.
- Added `docs/runs/2026-04-02/trust-center-demo/README.md` so the trust-center release/demo story is explicit and stays tied to the governance wedge instead of drifting into generic security-platform language.
- Marked `23.3` complete to match the earlier remediation-routing implementation, closed `23.6`, and left the live-sign-off half of `23.5` open on purpose.

### 2026-04-02 (Phase 23 Trust Depth Extension)

- Extended the tenant trust-center metrics with grant provenance, approval-drift, and automation-risk posture so admins can see self-issued access, overdue approvals, webhook exposure, and unstable workflow jobs without leaving the current security workspace.
- Renamed the recent-activity story to `Recent Trust Activity` so the page now honestly covers policy, temporary-access, approvals, and automation evidence from the shared backend trust contract.

### 2026-04-03 (Phase 23 Live UAT + Sign-Off)

- Ran the tenant trust-center UAT live against the deployed tenant app and captured evidence under `docs/runs/2026-04-03/trust-center-uat/`.
- Closed `23.5` after live posture, remediation routing, temporary-access review, and export checks passed with real tenant credentials.

---

## Blockers

1. Live-tenant business-owner validation is still credentials-dependent even though tenant-host release readiness and local tenant-backed Phase 16 UAT are now complete.

---

## Cross-Repo Completion Plan (March 2026)

### Master Phase Tracker (Frontend Scope)

| Phase | Frontend Focus | Status |
|-------|----------------|--------|
| Phase 0: Program Setup | Shared roadmap alignment, API contract sync, CI parity | COMPLETE |
| Phase 1: Critical Stability | MFA/email UX reliability, error handling, retries, observability surfaces | COMPLETE |
| Phase 2: Existing Product Gaps | Service app UX, email/files UX, dashboard builder UX, branding/theming UX | COMPLETE |
| Phase 3: Superadmin Power Features | Permission studio UX for role matrix, temporary grants, and audit replay | COMPLETE |
| Phase 4: Differentiator Wave 1 | AI revenue copilot UX, what-if simulator UX, smart deal room UX | COMPLETE |
| Phase 5: Differentiator Wave 2 | Relationship graph UX, playbook marketplace UX, benchmarking UX | COMPLETE |
| Phase 6: Optimization + Hardening | Performance tuning, table virtualization, cache strategy, test expansion | COMPLETE |
| Phase 7: Release Readiness | UAT closure, performance gates, production rollout readiness | IN PROGRESS |
| Phase 8: Contact-Centric Meetings | Contact-aware scheduling, attendee invites, timeline parity, delivery visibility | COMPLETE |

### Execution Checklist (Frontend)

- [x] **Phase 0: Program Setup**
  - [x] 0.1 Align milestone tracking with backend and admin portal
  - [x] 0.2 Sync and pin API contracts for all new modules
  - [x] 0.3 Ensure CI parity (lint, typecheck, test, build) on protected branches

- [x] **Phase 1: Critical Stability**
  - [x] 1.1 Harden login/MFA flows for retry-safe and actionable error states
  - [x] 1.2 Add resilient email/MFA UX feedback and fallback messaging
  - [x] 1.3 Add post-deploy smoke navigation checks for auth and core pages
  - [x] 1.4 Improve monitoring/diagnostics surfaces for operational failures

- [x] **Phase 2: Existing Product Gaps**
  - [x] 2.1 Complete Phase 5.8 Email and Files UX once backend routes are finalized
  - [x] 2.2 Deliver Service App UX (case intake, queues, console, SLA, dashboards)
  - [x] 2.3 Deliver Dashboard Builder UX (widgets, layout, sharing)
  - [x] 2.4 Deliver Branding/Theming UX (tenant brand controls and previews)

- [x] **Phase 3: Superadmin Power Features**
  - [x] 3.1 Add role-permission matrix management UX
  - [x] 3.2 Add temporary elevated permission grant UX with expiry controls
  - [x] 3.3 Add permission audit replay viewer for superadmin investigations

- [x] **Phase 4: Differentiator Wave 1**
  - [x] 4.1 Build AI revenue copilot workspace with explainable recommendations
  - [x] 4.2 Expand simulator UX for full scenario compare and impact review
  - [x] 4.3 Build smart deal room UX combining deal/revenue/approval/activity context

- [x] **Phase 5: Differentiator Wave 2**
  - [x] 5.1 Build relationship intelligence graph views and interaction drill-down
  - [x] 5.2 Build playbook marketplace browse/install/clone UX
  - [x] 5.3 Build privacy-safe benchmarking dashboards by segment and cohort

- [x] **Phase 6: Optimization + Hardening**
  - [x] 6.1 Fix large-table overflow and add virtualization for users/lists
  - [x] 6.2 Optimize data fetch/caching strategy for high-traffic dashboards
  - [x] 6.3 Expand frontend test coverage (critical flows + regression paths)
  - [x] 6.4 Resolve remaining hook dependency and stability warnings

- [ ] **Phase 7: Release Readiness**
  - [ ] 7.1 Execute full UAT pass across roles and modules
  - [ ] 7.2 Pass performance budgets for key pages and interactions
  - [ ] 7.3 Complete release checklist with rollback and smoke validation

- [x] **Phase 8: Contact-Centric Meetings**
  - [x] 8.1 Add contact-aware meeting forms and attendee selection coverage
  - [x] 8.2 Build account/contact/opportunity meeting scheduling entry points
  - [x] 8.3 Add invite delivery state, resend/cancel actions, and timeline visibility
  - [x] 8.4 Validate multi-contact, timezone, permission, and no-email fallback scenarios

---

## Next Steps

1. Capture the remaining business-owner review for Phase 22 account heat on the deployed tenant app and then close the last tenant validation-only item.
2. Keep the `2026-04-03` live UAT artifacts current if leakage, account-heat, or trust-center UX changes materially before release.
3. Keep broad marketplace UX, generalized agent-studio scope, and ERP-style platform sprawl out of the next wave unless buyer evidence proves they are needed.

## 2026-04-02 CI runner cleanup hardening

- Changed: Hardened the VPS deploy workflow with a 15G self-hosted disk preflight, explicit Buildx builder removal, wildcard temp Docker-config cleanup, and self-hosted deploy workspace cleanup.
- Why: Prevent orphaned CI Docker state from filling the shared VPS disk and blocking later deploys.
- Status: Workflow updated and YAML-validated locally.
- Next: Watch the next self-hosted deploy and confirm no new `buildx_buildkit_*` leftovers remain on the runner.
- Risks: The job now fails fast when the VPS runner drops below the disk threshold instead of attempting a partial deploy.
