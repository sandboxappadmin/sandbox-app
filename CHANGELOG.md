# Changelog

All notable changes to Sandbox App will be documented here.

## [0.1.0] - 2026-09-19

### Added
- Monorepo scaffold (Next.js + MUI, NestJS, Prisma)
- PostgreSQL database on Neon with full niche-isolated multi-tenant schema
- Authentication via Clerk, synced to internal Account/User tables via webhook
- Desktop screen with niche tiles, light MUI theme, header (avatar/notifications/settings)
- Niche-install flow: clicking a tile creates or opens an isolated NicheInstall workspace

## [0.2.0] - 2026-09-19

### Added
- Niche dashboard shell: collapsible sidebar navigation (Dashboard, Contacts, Pipelines, Workflows, Settings)
- Contacts screen: full CRUD (create, edit, delete) backed by real Prisma data, with delete-safety check for linked opportunities
- Pipelines screen: kanban board (Pipeline → Stage → Opportunity) with drag-and-drop between stages
- Full CRUD for Opportunities (create, edit, delete) with hover-to-reveal actions
- Trello-style click-and-drag canvas panning for the pipeline board
- Empty pipeline stages auto-collapse by default; auto-expand on drop or new card

### Fixed
- Layout overflow bug causing horizontal page scroll instead of contained kanban scroll
- Hydration mismatch from dnd-kit accessibility attributes (resolved via client-only rendering)

## [0.3.0] - 2026-09-20

### Added
- Full automation engine: BullMQ + Upstash Redis queue, NestJS worker processing jobs
- Workflow builder UI: create workflows with a trigger + ordered action steps, active/inactive toggle
- Contact Created trigger wired end-to-end to real workflow execution
- ADD_TAG action fully functional (creates/applies tags via Prisma)
- WAIT step support (re-enqueues remaining steps as a delayed job)
- SEND_EMAIL/SEND_SMS steps stubbed (log only) pending SendGrid/Twilio integration

### Fixed
- Critical bug: Queue and Worker sharing one Redis connection silently blocked job consumption
- Critical bug: NestJS doesn't auto-load .env files (unlike Next.js), causing worker to run with undefined credentials
- Removed broken @nestjs/observe telemetry module (placeholder credentials caused repeated auth errors)

## [0.3.1] - 2026-09-20

### Added
- Tags column on Contacts screen: view, add (with autocomplete), and remove tags inline
- Automated tags from Workflows (e.g. "Hot Lead") are now visible directly on the contact record

## [0.3.2] - 2026-09-20

### Added
- Stage Changed trigger for Workflows, with optional "only this specific stage" targeting
- Dragging an opportunity between pipeline stages now fires matching active workflows
- Workflow list now shows a readable trigger summary (e.g. "Moved to 'Qualified'") instead of just the raw trigger type

## [0.4.0] - 2026-09-20

### Added
- Settings page per niche workspace: rename workspace, manage tags (add/delete), manage custom field definitions (Text/Number/Date/Boolean/Dropdown)
- Permanent niche category label shown alongside the custom workspace name (sidebar + Settings), so renaming a workspace never obscures which niche it belongs to

### Fixed
- Removed deprecated `alignItems` direct prop usage on MUI Stack components (moved to sx)

## [0.5.0] - 2026-09-20

### Added
- Super Admin panel at /admin, gated by SUPER_ADMIN_EMAILS allow-list (independent of per-account roles)
- Platform Overview: real-time counts (accounts, users, niche workspaces, contacts, workflows) plus niche-type breakdown
- Accounts screen: read-only list of every tenant account, owner email, user count, and installed niches
- Discreet admin entry point (shield icon) in Desktop header, visible only to allow-listed users

### Fixed
- Split Accounts DataGrid into a Client Component (same pattern as Contacts) to resolve a server/client boundary error

