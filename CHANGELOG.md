# Changelog

All notable changes to Sandbox App will be documented here.

## [0.10.0] - 2026-09-21

### Added
- Per-account SMSGate credentials: each account now connects its own SMSGate API key in Account Settings, instead of the whole platform sharing one global key
- New `@repo/crypto` package (AES-256-GCM) for encrypting API keys at rest — SmsProviderCredential stores only the encrypted value, never plaintext, and the UI never redisplays a saved key
- SMS Provider section in Account Settings: connect, replace, or disconnect an SMSGate API key, with a clear Connected/Not Connected status
- Workflow worker's SEND_SMS step now looks up and decrypts the contact's own account's SMSGate credential at send time; if an account hasn't connected SMSGate yet, the step is skipped with a log message rather than falling back to any shared key

### Fixed
- Account Settings page had no header or way back to the Desktop — added the shared DesktopHeader (with a back button) to this page, matching the pattern already used by the Super Admin panel
- Account Settings page was missing the active-account enforcement check (assertActiveAccount) that other account-level pages already have

### Learned
- Established a standing checklist for new pages going forward: does it live inside an existing layout/shell with navigation, or does it need an explicit way back wired in — this gap was caught by testing, not by review
- Prisma's "Already in sync, no schema change found" during migrate dev is a real signal the schema file itself wasn't actually edited/saved yet, not just a stale-client issue — worth checking the file directly before assuming it's the Windows EPERM problem again

## [0.9.0] - 2026-09-21

### Added
- Real SMS sending for SEND_SMS workflow steps via SMSGate (Android SIM-based gateway), replacing the previous stub/log-only implementation
- New `@repo/sms` package wrapping SMSGate's HTTP API, following the same pattern as `@repo/email`
- Workflow builder's Send SMS step now sends for real — helper text updated to reflect this instead of the old "Twilio comes later" placeholder

### Known limitations
- Messages reach SMSGate successfully and show status QUEUED in both our logs and the SMSGate dashboard, but final phone delivery is unconfirmed pending SIM card credit/load on the sending device — this is a carrier/device issue, not an application bug
- No delivery-status webhook wired up yet — currently we only know a message was accepted by SMSGate, not whether it was actually delivered to the recipient's phone

### Learned
- Chose an Android SIM-based SMS gateway (SMSGate) over Twilio for this stage of the project — avoids per-message fees, monthly number rental, and multi-week A2P 10DLC registration, at the cost of relying on a single physical device's uptime and carrier balance

## [0.8.0] - 2026-09-20

### Added
- Super Admin: real account actions — suspend, reactivate, and soft-delete, replacing the previously read-only Accounts panel
- Account status enforcement across the app: suspended or deleted accounts are blocked from Desktop, niche workspaces, and Account Settings, and redirected to a dedicated "Account Unavailable" page with a sign-out option
- `AccountStatus` field added to Account (ACTIVE / SUSPENDED / DELETED), defaulting existing accounts to ACTIVE

### Fixed
- Desktop page previously had no account-status check at all, meaning a suspended account's owner could still reach their niche tiles even after being suspended

### Learned
- Soft-delete (status flag) chosen over a real destructive delete for Account — a hard delete would cascade through every NicheInstall, Contact, Pipeline, and Workflow underneath a tenant with no way back
- On Windows, a running dev server (or VS Code's Prisma extension) can lock query_engine-windows.dll.node, causing EPERM on `prisma generate` — fully stopping all node processes first resolves it

## [0.7.0] - 2026-09-20

### Added
- Custom field values now render and save on the Contact form (Text/Number/Date/Boolean/Dropdown), matching the definitions configured in per-niche Settings
- Server-side revalidation of submitted custom field values against the niche's live CustomFieldDefinition list before persisting, preventing stale or tampered keys/types from being written to the Contact record

### Fixed
- Sending domain "Refresh" button was calling Resend's verify() (which re-triggers DNS verification and resets status to pending) instead of a read-only status check — domains would flip back to "Pending" every time a user checked on an already-verified domain

## [0.6.1] - 2026-09-20

### Fixed
- Emails were silently failing to deliver due to an SPF PermError — the sending subdomain (mail.snbxpro.com) already had SPF records configured for an existing GHL/Mailgun setup, and Resend's added SPF record conflicted with it
- Resolved by dedicating a separate, unused subdomain (app.snbxpro.com) exclusively to Sandbox App's email sending
- Switched sender address from noreply@ to hello@ per Resend's deliverability guidance

### Learned
- When a domain is already used for email elsewhere (any ESP), always verify a fresh, dedicated subdomain for a new sending service rather than reusing an existing one — SPF only supports one record per exact hostname

## [0.6.0] - 2026-09-20

### Added
- Real email sending via Resend for SEND_EMAIL workflow steps
- Subject field added to the Send Email step config in the workflow builder

### Fixed
- Worker now correctly checks Resend's response for errors instead of only catching thrown exceptions, which previously caused failed sends to be logged as successful

### Known limitations
- Currently sending from Resend's shared test domain (onboarding@resend.dev) — can only deliver to the Resend account's own signup email until a custom domain is verified; expect spam-folder placement until then

## [0.5.1] - 2026-09-20

### Added
- Niche-specific default pipeline stages for all 7 niches (e.g. Coaching gets "Discovery Call Booked", Real Estate gets "Showing Scheduled")
- Confirmed multi-tenant + niche isolation holds correctly under real usage: separate contacts, pipelines, and stage sets per niche workspace on the same account

## [0.5.0] - 2026-09-20

### Added
- Super Admin panel at /admin, gated by SUPER_ADMIN_EMAILS allow-list (independent of per-account roles)
- Platform Overview: real-time counts (accounts, users, niche workspaces, contacts, workflows) plus niche-type breakdown
- Accounts screen: read-only list of every tenant account, owner email, user count, and installed niches
- Discreet admin entry point (shield icon) in Desktop header, visible only to allow-listed users

### Fixed
- Split Accounts DataGrid into a Client Component (same pattern as Contacts) to resolve a server/client boundary error

## [0.4.0] - 2026-09-20

### Added
- Settings page per niche workspace: rename workspace, manage tags (add/delete), manage custom field definitions (Text/Number/Date/Boolean/Dropdown)
- Permanent niche category label shown alongside the custom workspace name (sidebar + Settings), so renaming a workspace never obscures which niche it belongs to

### Fixed
- Removed deprecated `alignItems` direct prop usage on MUI Stack components (moved to sx)

## [0.3.2] - 2026-09-20

### Added
- Stage Changed trigger for Workflows, with optional "only this specific stage" targeting
- Dragging an opportunity between pipeline stages now fires matching active workflows
- Workflow list now shows a readable trigger summary (e.g. "Moved to 'Qualified'") instead of just the raw trigger type

## [0.3.1] - 2026-09-20

### Added
- Tags column on Contacts screen: view, add (with autocomplete), and remove tags inline
- Automated tags from Workflows (e.g. "Hot Lead") are now visible directly on the contact record

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

## [0.1.0] - 2026-09-19

### Added
- Monorepo scaffold (Next.js + MUI, NestJS, Prisma)
- PostgreSQL database on Neon with full niche-isolated multi-tenant schema
- Authentication via Clerk, synced to internal Account/User tables via webhook
- Desktop screen with niche tiles, light MUI theme, header (avatar/notifications/settings)
- Niche-install flow: clicking a tile creates or opens an isolated NicheInstall workspace