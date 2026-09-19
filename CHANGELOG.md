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