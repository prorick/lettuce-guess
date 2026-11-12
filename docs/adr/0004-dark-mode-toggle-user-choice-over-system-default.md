<!-- adr template version: "adr-madr 3.12.0" -->
<!-- kept in deliberate homage to MADR — Markdown Architectural Decision Records, the lineage this template family descends from. This is the simple-decisions form: use it when a decision needs recording, not discussion. The deliberation-native form is adr.md. Mint with `just adr "<title>" madr`. (Ruling: QST-MADR-FATE, 2026-08-13 — "keeping the template, acknowledging it, is good form.") -->

# Dark mode toggle: the player's choice overrides the system default

- **Date**: 2026-11-11
- **Status**: Implemented
- **Deciders**: Prothit (request), Tessera 5.5 (Claude Opus 5.5; design)

**TL;DR**: Add a 🌙/☀️ button so any player can switch Lettuce Guess to dark or light. Until they choose, it follows their device, and their choice is remembered in their browser.

Technical Story: Prothit, after v1 went live: *"Can you also include a dark mode!"*

## Context and Problem Statement

v1 already had a dark theme (ADR-0003, Iteration 4), but it switched on **only** through the device's `prefers-color-scheme` setting. A player on a light-mode phone had no way to get it, and someone with a dark-mode laptop had no way to get light. The request is therefore a *control*, not a palette: how does a player pick a theme, and what happens before they do?

## Decision Drivers

* Players who never touch the button should keep getting what their device asks for, since that's the right default.
* A choice must survive reloads and must not flash the wrong theme on load.
* One header button, not a settings screen. The header is already tight at phone width (ADR-0003 palette and layout).
* Scoped CSS stays the rule (ADR-0003): theming must flow through the global tokens in `src/styles/base.css`, not through per-component media queries.

## Considered Options

* Two-state toggle (light ⇄ dark), defaulting to the device until first use
* Three-state cycle (system → light → dark)
* Leave it to the device setting (status quo)

## Decision Outcome

Chosen option: **"Two-state toggle, defaulting to the device until first use"**. It's the only option that gives a light-mode-phone player dark mode with one tap, and it never makes anyone reason about a "system" state on a button that only shows a sun or a moon.

### Positive Consequences

* The choice is saved per browser (`localStorage`, key `lettuce-guess:theme:v1`) and applied by a tiny inline script in `index.html` **before first paint**, so there's no flash of the wrong theme.
* The dark palette is now defined once in the tokens and selected by `<html data-theme>`. The two component-level `prefers-color-scheme` media queries (header title, result-sheet answer) become a `--brand` token, which also makes those components honor the toggle.

### Negative Consequences

* After someone picks a theme, there's no button to return to "follow my device". Clearing site data does it. If friends ask for that, a three-state cycle is the upgrade path.
* The dark token values now appear twice in `base.css` (once for "device is dark and no override", once for "override = dark"), because CSS can't OR a media query with an attribute selector. A comment there says to keep both in step.

## Open question

NOT: no open questions. Prothit asked for the feature; the shape (toggle vs. cycle) is a reversible UI call, recorded here with its upgrade path.

## Implementation (2026-11-11)

`src/theme.ts` (choice load/save, guarded like the game's storage) is covered by 5 tests in `src/__tests__/theme.test.ts`. The pre-paint script lives in `index.html`, the dark tokens and `--brand` in `src/styles/base.css`, and the moon/sun button in `AppHeader.vue`. On very narrow phones (≤ 360px) the mascot hides so the header still fits its three buttons. Verified in headless Chrome with `scripts/ephemeral/2026-11-11-check-theme-toggle.mjs`: a light-mode device switches to dark with one tap, the choice is applied before Vue mounts on reload (no flash), it switches back, and there's no overflow at 360px.

## Links

* Refines [ADR-0003](0003-build-test-and-deploy-stack-for-vue-on-github-pages.md) (the palette and the one-global-stylesheet rule)
