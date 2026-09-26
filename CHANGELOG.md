# Changelog

All notable changes to Sandbox App will be documented here.

## [0.25.0] - 2026-09-26

### Added
- Real estate Listings: a proper Property entity (address, price, bedrooms, bathrooms, square footage, status) replacing generic custom fields for tracking properties — visible only in Real Estate workspaces
- Opportunities can now optionally reference a specific Listing

### Fixed
- A duplicate navItems declaration in NicheShell.tsx caused a build error after adding the Listings nav item conditionally
- TZ=Asia/Manila added to both apps/web and apps/api on Render, fixing booking times displaying 8 hours off (server defaulted to UTC)

### Learned
- A stale PowerShell session with temporary production DATABASE_URL/DIRECT_URL overrides still active can silently redirect a later, unrelated local migrate dev command at production instead of local dev — confirmed this happened with add_listings landing on production ahead of the intended local-first sequence. Always verify a fresh terminal's actual env before running migration commands, and never reuse a terminal that had production credentials temporarily set
- Upstash Redis's free tier (500,000 commands/month) can be exhausted by a continuously-polling BullMQ worker well before expected — upgraded to Pay-as-you-go to remove the hard cap

## [0.24.0] - 2026-09-25

### Added
- Public self-service appointment booking: each niche workspace gets a shareable booking link where leads pick an open time slot themselves, no login required
- Workspace availability hours configurable per day of week, from Settings
- APPOINTMENT_BOOKED workflow trigger is now functional — another dormant trigger type that's existed unused since the project's earliest version
- Internal Appointments page listing upcoming bookings, with cancellation
- Double-booking protection: the booking action re-verifies a slot is still open at the moment of submission, not just when the page loaded

### Learned
- Since local and production databases are now separate, every schema migration needs a manual prisma migrate deploy against production afterward, using temporarily-scoped environment variables in a fresh terminal — this is now a standing two-step habit for any future schema change until Render's Pre-Deploy Command becomes available on a paid tier

## [0.23.0] - 2026-09-25

### Added
- Public lead-capture form: each niche workspace gets a unique, shareable link where anyone can submit their info without logging in, automatically creating a new Contact
- FORM_SUBMITTED workflow trigger is now functional — a dormant trigger type that's existed unused in the schema since the project's very first version
- Basic spam protection on the lead form: a honeypot field plus a submission rate limit per workspace
- Shareable link surfaced directly on the Contacts page with a one-click copy button

### Learned
- Rather than add a migration for a single optional "message" field on lead submissions, stored it inside the existing customFields JSON column under a reserved key — a pragmatic tradeoff to avoid schema churn for one low-stakes field

## [0.22.0] - 2026-09-25

### Added
- CSV contact import: upload a CSV, map its columns to app fields (including custom fields) with auto-guessed mapping based on header names, and import in bulk with duplicate detection by email
- Reused the existing custom-field validation logic from manual contact creation, so imported values go through the same validation as manually-entered ones

### Fixed
- A stray useState call landed at module scope instead of inside the component during editing, causing an "Invalid hook call" error — moved inside the actual component body
- CsvImportDialog was accidentally nested inside the contact edit Dialog's closing tags instead of being a sibling element

### Learned
- A newly-added npm dependency can have its package.json entry committed correctly while npm install still silently fails to create it in node_modules if run at the wrong time or interrupted — worth directly checking Test-Path node_modules\<package> rather than assuming a "successful-looking" install actually completed

## [0.21.0] - 2026-09-24

### Added
- Data export: account owners and admins can download a complete JSON export of their account's data (contacts, pipelines, workflows, tickets, messages) directly from Account Settings
- Data deletion requests: submitting a request creates a ticket routed to the existing support queue, with a notification sent to all admins — closes the gap between what the Privacy Policy promises and what tooling actually exists

### Learned
- Reused the existing ticket + notification system for deletion requests rather than building a separate admin surface, since it's a rare action that doesn't need its own dedicated queue

## [0.20.0] - 2026-09-24

### Added
- Team invitations: account owners can invite teammates by email with a role (Admin or Agent), sent via email with a signed, expiring invite link
- Role-based access control: Owner (full access, including billing), Admin (account settings, not billing), Agent (CRM data only) — enforced both on server actions and by hiding inaccessible UI (Team, Account Settings icons) for lower-privileged roles
- Clerk webhook now checks for a pending invitation before creating a new account, so an invited teammate joins the existing workspace instead of getting their own separate one

### Fixed
- Discovered that local and production databases can drift out of sync after tonight's dev/prod database split — a migration run locally never reaches production automatically. Applied the missing add_invitations migration to production manually via a scoped, temporary env override
- Invite page now detects when someone is already signed into an existing Clerk session and shows a clear explanation instead of a confusing "no database user found" error

### Learned
- Render's Pre-Deploy Command (which would automate running migrations before each deploy) requires a paid Starter plan — free tier requires manually running prisma migrate deploy against production after every schema change until upgrading
- A brace mismatch introduced while editing a function with nested conditionals can silently produce "Return statement is not allowed here" or "Expected '}', got '<eof>'" — worth pasting the full file back for review rather than patching blind when these appear
- Clerk only fires user.created for genuinely new identities — an email that already has any Clerk account (even from unrelated earlier testing) will just log in silently instead of triggering account-creation logic, which can look identical to a webhook failure until checked directly

## [0.19.1] - 2026-09-23

### Added
- Basic rate limiting on user-generated content: 5 new suggestions/day, 5 new tickets/day, 20 ticket replies/hour per user — implemented via simple timestamp-based database counts, no new infrastructure needed

### Learned
- PayMongo refunds cannot be tested in Test mode at all — only live transactions are eligible for refund via their API or dashboard. Refund tooling is deliberately deferred until going live with real PayMongo Live mode + Clerk Production, since it can't be verified working any earlier than that

## [0.19.0] - 2026-09-23

### Added
- Error monitoring via Sentry, covering apps/web (browser, server, and edge runtime errors), with source map uploads wired into the deploy process for readable production stack traces

### Learned
- Sentry's free Developer plan requires no credit card at signup — new accounts get a 14-day trial of paid features automatically, then quietly settle onto the permanent free tier (5,000 errors/month) with no action needed and no risk of surprise billing
- Chose to skip routing browser error reports through the Next.js server (avoiding ad-blocker interference) in favor of sending directly to Sentry, to avoid adding load to a free-tier hosting plan — an acceptable tradeoff at current scale

## [0.18.0] - 2026-09-23

### Added
- Terms of Service and Privacy Policy pages, referencing the Philippines' Data Privacy Act of 2012, linked from the homepage footer
- Payment receipts now sent for every successful subscription payment, via our own Resend domain — works reliably regardless of payment method

### Fixed
- PayMongo's built-in send_email_receipt only worked for payment methods that capture a billing email during their own flow (GCash, Maya) — QRPh's static code-scan flow never attaches a billing email to the underlying payment record, so no receipt could ever be sent that way. Replaced with our own receipt email sent directly from the webhook, using the account owner's known email, which works identically across all payment methods
- Local development now uses a separate, isolated Neon database instead of sharing the production database

### Learned
- PayMongo's checkout-session-level billing.email and the underlying Payment record's own billing snapshot are two different things — setting one doesn't guarantee the other is populated, and this varies by payment method in ways not fully documented
- Since Clerk and PayMongo webhooks are only reachable at the production URL, testing billing/payment flows can no longer be done on localhost now that dev and production databases are separated — these changes require a real deploy to test

## [0.17.1] - 2026-09-22

### Fixed
- Local development now uses a separate, isolated Neon database instead of sharing the production database — local testing, migrations, and debugging scripts can no longer accidentally affect real customer data
- Production's database connection is unchanged; only local .env files were updated

### Learned
- Since the Clerk webhook is registered against the production domain, new signups always create Account/User rows in production regardless of which database a local dev server points to — local test accounts now need to be seeded manually (or via a second Clerk webhook pointed at a local tunnel) rather than created through normal signup

## [0.17.0] - 2026-09-22

### Added
- Unified Contact timeline: a single chronological view of every Email and SMS sent to a contact, reachable via a new "Messages" action on the Contacts list
- Manual one-off Email and SMS sending directly from a contact's timeline, in addition to automated workflow sends
- Workflow-triggered emails and SMS now log into this same timeline automatically, so automated and manual outreach show up together in one place
- New sendEmail function in @repo/email, giving the web app a proper shared path to Resend instead of duplicating raw SDK calls

### Fixed
- Redesigned the original Conversation/Message schema, which had never been implemented (planned only) and was missing a body field entirely, plus grouped conversations by channel instead of by contact
- ContactsClient.tsx had a useRouter() hook call sitting outside any component function (module-level), causing an "Invalid hook call" error — moved inside the actual component body

### Learned
- SMSGate has no webhook and no message-status lookup endpoint at all — delivery confirmation isn't achievable with this provider as it stands, closed out honestly rather than building something that doesn't actually verify anything
- Building an in-house Android SMS gateway is viable via sideloaded APK distribution (same model SMSGate itself uses) but would require becoming the phone's default SMS handler to ever publish on the Play Store — scoped and deliberately deferred as a future dedicated project
- A stale Prisma Client can survive even a targeted .prisma cache clear in some cases; removing node_modules/@prisma/client entirely (not just node_modules/.prisma) is the more reliable full reset when a

## [0.16.0] - 2026-09-22

### Added
- Real notification system: in-app notifications for ticket replies (both directions — support replying to customer, customer replying back to support), suggestion status changes, and upcoming trial/subscription renewals
- Notification bell now shows a live unread count and a dropdown of recent notifications, replacing the earlier disabled placeholder
- Daily scheduled renewal check (via a BullMQ repeatable job in apps/api) that notifies account owners within 3 days of their trial or subscription ending
- Super Admin: manual "Run Renewal Check Now" trigger and an "Edit Renewal Date" action per account, for testing without waiting on real time to pass
- Account Settings now shows the account's actual trial end date or renewal date, with a Subscribe/Renew button
- Dismissible renewal countdown banner shown across the app within 7 days of trial/subscription end, linking to Account Settings

### Fixed
- Early renewal (paying again while still within an active paid period) now correctly stacks a fresh 30 days onto whatever time remained, instead of discarding it and starting a new 30-day period from the payment date
- Converting from trial to paid correctly starts the real 30-day period from the moment of payment, rather than being affected by trial-stacking logic
- PayMongo webhook now calls revalidatePath after updating a subscription, so the Super Admin panel and Account Settings reflect the change immediately instead of showing stale cached data
- New ticket / new ticket reply from a customer now correctly notifies all Super Admins — this direction was missing entirely in the first pass, so admins had no way to know a new ticket existed except by manually checking the queue

### Learned
- A webhook whose code was edited but never committed/pushed produces a very convincing "it's not working" symptom — the log output itself (an old log message format still appearing) was the clearest signal that new code wasn't actually deployed, more reliable than inferring from behavior alone
- Adding 30 days is not the same as adding one calendar month — crossing a 31-day month will land one day "short" of the naive expectation; this is the mathematically correct, consistent behavior for a flat 30-day billing period and was kept as-is rather than switched to calendar-month arithmetic

## [0.15.0] - 2026-09-22

### Added
- New home page / marketing landing page, replacing the plain placeholder — includes a live interactive demo of niche-specific pipeline stages, pricing, and how-it-works sections
- Super Admin: Force Subscription Expired action, for testing the renewal flow on an ACTIVE account without waiting a real 30-day period

### Fixed
- Critical billing bug: assertActiveAccount granted unconditional access to any ACTIVE subscription, never checking whether currentPeriodEnd had actually passed — since PayMongo's e-wallet methods don't auto-renew, this meant any customer who paid once would have kept permanent free access indefinitely. Now correctly redirects to a renewal prompt once the paid period lapses.
- trial-expired page now shows accurate copy ("Renew Now" / period-ended messaging) when reached via a lapsed subscription, rather than always showing trial-specific language

### Learned
- An enforcement check that handles every status except the "happy path" status is easy to miss in review — ACTIVE looked like the safe, done case, but was actually the one path with no real check behind it at all

## [0.14.0] - 2026-09-22

### Added
- PayMongo Checkout Session integration for subscription payments — ₱299/month flat plan, supporting GCash, GrabPay, Maya, QRPh, and ShopeePay
- New @repo/paymongo package: creates checkout sessions, verifies webhook signatures (handles both of PayMongo's documented signature formats defensively)
- Webhook handler (checkout_session.payment.paid) activates a Subscription (status ACTIVE, 30-day currentPeriodEnd) by matching reference_number back to the paying account
- Trial Expired page now has a real "Subscribe Now" button instead of a placeholder
- Billing success/cancel pages
- Super Admin: Force Trial Expired action, for testing the expired-trial flow without waiting 14 real days

### Fixed
- PayMongo webhook route was created inside apps/api (a plain NestJS worker with no Next.js routing) instead of apps/web, and missing the src/app/ prefix entirely — meant the endpoint returned a 404 the whole time, which silently explained every failed webhook delivery attempt
- billing/success and billing/cancel pages failed to build (Server Component passing a component reference to a Client Component) — fixed by marking both 'use client'
- Corrected ShopeePay's payment_method_types identifier from a guessed shopeepay to the actual shopee_pay, confirmed directly via PayMongo's own "retrieve merchant payment methods" endpoint rather than continued guessing

### Learned
- PayMongo e-wallet methods (GCash, Maya, GrabPay) don't support automatic recurring billing the way cards do — subscription renewal here means generating a fresh checkout session when payment is due, not an auto-charge
- PayMongo's Test mode and Live mode are two entirely separate configurations sharing one dashboard — a webhook registered in Live mode will never receive Test mode events, and vice versa, mirroring the same lesson learned earlier with Clerk's Development vs Production instances
- git log --all -- <path> returning nothing is a definitive way to confirm a file was never actually committed, cutting through confusion when a file visibly exists in the editor but isn't reaching a deployed environment
- When guessing at a third-party API's enum/identifier strings is unavoidable, build in a way to verify directly against the provider's own API (as done here via PayMongo's merchant capabilities endpoint) rather than relying on scattered examples alone

## [0.13.0] - 2026-09-21

### Added
- Subscription model with 14-day free trial: new signups get a real trial window (TRIALING status, trialEndsAt) created automatically alongside their Account via the Clerk webhook
- Access enforcement extended (assertActiveAccount) to block access once a trial expires, redirecting to a dedicated Trial Expired page with a sign-out option
- Super Admin: Grant Free Access (COMP status, bypasses trial/payment indefinitely) and Revert to Trial actions on any account, shown as row actions in the Accounts panel
- Subscription status column in the Super Admin Accounts panel

### Fixed
- All pre-existing accounts backfilled to COMP status so the new trial-expiry enforcement couldn't retroactively lock out accounts that existed before this feature shipped
- admin/tickets/[ticketId]/page.tsx was querying with findMany (listing all tickets) instead of findUnique for the single ticket being viewed — likely copy-pasted from the ticket list page and never caught since next dev doesn't run a full type-check
- Missing handleRevertToTrial handler in AccountsClient.tsx, dropped when a full-file update overwrote an earlier incremental edit

### Learned
- Clerk's webhook now points at the production domain, so local-only testing can no longer trigger real webhook-driven account creation — any signup, local or live, hits the same deployed webhook code, meaning webhook changes must be deployed before they can be tested at all
- Clerk explicitly does not support migrating users from a Development instance to a Production instance — existing test accounts would be stranded, not carried over, so this switch is being deliberately deferred until closer to a real paid launch alongside PayMongo
- Gmail-style plus-addressing (email+test1@gmail.com) is a fast way to generate unlimited distinct test signups without needing new real email addresses or deleting/recreating accounts

## [0.12.0] - 2026-09-21

### Added
- Feedback & Suggestions board: customers can submit ideas, upvote/un-vote others' submissions, and filter by status (Open, Planned, In Progress, Shipped, Declined); visible to all logged-in customers across accounts
- Support ticketing: customers can open tickets and reply in a threaded conversation, scoped strictly to their own account; replying to a resolved/closed ticket automatically reopens it
- Super Admin: Suggestions panel (change status per suggestion, sorted by vote count) and Tickets panel (shared queue across all accounts, sorted oldest-first, reply as support, change ticket status)
- Header navigation entries for Feedback and Support, alongside the existing Settings/Admin icons

### Fixed
- Admin ticket queue now orders oldest-first (first-in-first-out), rather than most-recently-updated, so support tickets get handled fairly in submission order

### Learned
- Kept feedback/suggestions and support tickets as separate models rather than merging with the earlier planned Conversation/Message design — both are "a thread tied to something," but one is public/cross-tenant (suggestions) and the other is private/per-account (tickets and future CRM conversations), which matters enough to keep them structurally distinct

## [0.11.0] - 2026-09-21

### Added
- First production deployment: apps/web and apps/api both live on Render, using free-tier Web Services
- Custom domains connected: app.snbxpro.com (web) and api.snbxpro.com (api), both with Render-issued SSL
- Keep-alive cron ping (cron-job.org) keeping the API/worker service awake, since Render's free tier has no true always-on Background Worker option
- Clerk webhook repointed from local ngrok tunnel to production domain, confirmed working end-to-end with a fresh sign-up
- Full workflow smoke test (Add Tag, Send Email, Send SMS) confirmed passing on the live production URLs, including SMS sending from the cloud-hosted worker rather than local dev

### Fixed
- @repo/database missing postinstall hook for prisma generate, invisible locally but broke every fresh install (surfaced first on Render's clean checkout)
- turbo.json build task missing dist/** in outputs, so apps/api's build wasn't cacheable
- Four Prisma Json field writes failing next build's stricter type check once Prisma Client was actually being generated correctly
- ContactsClient.tsx using a deprecated MUI TextField prop (InputLabelProps → slotProps)

### Learned
- Render's free tier has no Background Worker service type — only free Web Services (which sleep after 15 min idle) and paid Background Workers ($7+/month). A free Web Service plus an external keep-alive ping is a reasonable workaround for a staging deploy, not a substitute for a real always-on worker in production
- Vercel's serverless execution model can't host a persistent BullMQ worker at all, regardless of tier — this ruled out ever putting apps/api there
- A CNAME record can't coexist with other record types (TXT/MX) at the same hostname — this is why app.snbxpro.com and email.snbxpro.com needed to stay as separate, dedicated subdomains
- Clerk Development instances work fine on any domain, not just localhost — a Production instance (which requires a domain you control with DNS access) isn't needed just to get a working staging deploy
- next build runs a full TypeScript type-check that next dev skips entirely — several real type errors sat invisible in the codebase until the first actual production build

## [0.10.3] - 2026-09-21

### Fixed
- Four Prisma Json field writes (SendingDomain.records in two places, Contact.customFields in two places) failed next build's TypeScript check once the Prisma Client was actually being generated on a fresh install — the underlying data was always valid JSON at runtime, but our plain object/array types didn't structurally satisfy Prisma's strict InputJsonValue type. Added narrow, deliberate casts at each write site rather than loosening types elsewhere.

### Learned
- next build always runs a full TypeScript check; next dev does not — so a type error can sit silently in a file for weeks of local development and only surface the first time the project is actually built for deploy

## [0.10.2] - 2026-09-21

### Fixed
- @repo/database was missing a postinstall hook to run prisma generate — this was invisible in local dev since the Prisma Client was regenerated manually throughout development, but caused Render's fresh checkout to build against an ungenerated client, surfacing as implicit-any TypeScript errors on every callback touching Prisma query results
- turbo.json's build task only declared .next/** as output, so Turborepo couldn't detect or cache apps/api's dist/** build output
- ContactsClient.tsx used MUI's deprecated InputLabelProps prop on the custom field DATE input, replaced with slotProps

### Learned
- A monorepo build that only ever ran locally (with manual prisma generate calls in between) can hide a missing postinstall step indefinitely — a genuinely fresh checkout, like a new CI/deploy environment, is what actually exposes it
- Render's free Web Service tier doesn't support a true always-on background worker; apps/api's persistent BullMQ worker needs to run inside a Web Service with an external keep-alive ping, or move to a paid Background Worker instance later

## [0.10.1] - 2026-09-21

### Fixed
- Notification bell in the header no longer looks functional when it isn't — replaced the badge/count with a disabled, tooltipped placeholder ("Notifications — coming soon") until a real notification system exists
- ADD_TAG workflow step failed silently when the contact wasn't found — now logs a clear message like the other action types already did

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