# Navigation & UX plan (Option A)

## Before
- **Dashboard** (overview, CRM, marketing, ops data all mixed together)
- **CRM**
- **Tasks**
- **Marketing**
- **Packages**
- **Voyages**
- **Sales**
- **Ops**

The current sidebar treats every surface as equal, which makes it hard for a new user to spot the primary flow (create a product, price it, assign work) among the supporting tools.

## After
### Primary flow (max 4)
1. **Dashboard** – landing pad; surfaces the happy-path CTA, stats, and alerts so teammates know where to start.
2. **Packages** – house the product drafts and published offers; the main place to create or edit a product.
3. **Pricing** – the wizard that turns a package into a quote; stays close to Packages and the happy path.
4. **Tasks** – operational follow-ups; a single click from the dashboard keeps work items visible.

### Secondary / Tools (More tools group)
- **CRM** – lead management stays accessible but grouped under a "More tools" label.
- **Marketing** – campaign view moved into the secondary group so it no longer competes with the happy path.
- **Voyages** – view and status of voyage records.
- **Sales** – bookings and sales lenses.
- **Ops** – operational projects related to packages.

## Sidebar updates
- Primary entries now live under a "Primary" header with only the four happy-path targets.
- Supporting routes are grouped under "More tools" so they are still reachable but visually de-emphasized.
- The header navigation shares the same primary set, keeping the desktop nav consistent with the sidebar.
- Active state logic stays untouched so the highlighted route continues to reflect the current page.

## UX polish
- The dashboard now spells out the happy path in helper text/card copy and surfaces a "Create product" CTA that links directly to `/packages/new`.
- Packages, Pricing, and Tasks pages each share a clear title + 1–2 sentence helper text so the page purpose is obvious at a glance.
- Empty states on lists (packs/tasks/ops) show the next action so new users immediately know what to do.
