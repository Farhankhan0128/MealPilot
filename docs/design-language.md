# MealPilot Design Language

MealPilot now uses a Carbon-inspired open product design language adapted for a Swiggy MCP operations portal. The implementation keeps the dependency surface light, uses first-party React and CSS, and follows Carbon's 2x grid, accessible controls, neutral product surfaces, restrained color, clear hierarchy, and predictable enterprise navigation.

Official references:

- Carbon Design System: `https://carbondesignsystem.com/`
- Carbon 2x Grid: `https://carbondesignsystem.com/elements/2x-grid/overview/`
- Carbon GitHub: `https://github.com/carbon-design-system/carbon`

## Brand System

- Logo asset: `src/assets/mealpilot-logo.svg`
- Mark: a route, plate, and commerce signal inside a dark precision tile.
- Usage: header, sidebar, and footer through the `MealPilotLogo` component in `src/App.tsx`.
- Brand tone: premium operations portal, not a marketing landing page.

## Layout Principles

- The app is a portal shell with sticky top navigation, a reviewer workspace sidebar, and anchor navigation for Planner, Recommendations, Launch Center, Production Evidence, Demo Studio, and Ops.
- Desktop uses a wide 2-column workspace and 12-column evidence grids for dense scanning.
- Tablet collapses the sidebar into stacked operational panels and keeps evidence cards in two-column groups.
- Mobile uses a compact header, a Sheet-like navigation drawer, full-width CTAs, one-column evidence cards, and non-overlapping text blocks.
- The action bar remains visible on desktop and becomes static on mobile to avoid occluding content.

## Component Rules

- Buttons use icon plus text for critical actions and icon-only mobile affordances only where the label is available through visible nearby text.
- Status values use left-accented rows: green for healthy, yellow for watch/manual input, red for blocked.
- Cards are 8px radius, flat, and information-dense.
- Cards are not nested inside other decorative cards; panels use full-width sections and repeated cards only for repeated evidence.
- Long evidence lists use compact rows with wrapping labels and fixed trailing statuses.
- Confirmation dialogs support backdrop and Escape dismissal and keep explicit commercial confirmation copy visible.

## Interaction Contract

Every visible CTA must either:

- call a typed API helper from `src/api/mealpilotApi.ts`,
- change local state with visible feedback,
- navigate to a named in-page section, or
- open a documented external URL/mailto.

The app shows `actionNotice` feedback after successful side effects such as OAuth start, builder packet export, reminder scheduling, group member addition, privacy export, support report generation, substitutions, removals, and confirmations. Errors are rendered in the `error-strip` rather than failing silently.

## Verification

The UI contract is covered in `src/App.test.tsx`:

- plan creation and guarded confirmation,
- portal shell and mobile navigation,
- OAuth tab opening,
- builder packet export,
- schedule reminder feedback,
- group member feedback,
- privacy export feedback,
- support report feedback.

Run:

```bash
npm test -- --run src/App.test.tsx
npm run lint
npm run build
```
