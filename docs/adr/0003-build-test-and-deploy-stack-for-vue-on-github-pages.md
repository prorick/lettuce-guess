<!-- adr template version: "adr 3.12.0" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs4ai
  plugin: adr@adrs4ai
-->

# Build, test, and deploy stack for Vue on GitHub Pages

- **Date**: 2026-11-11
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Prothit (human), Tessera 5.5 (AI)

**TL;DR**: Pick the toolchain that compiles Vue single-file components with scoped CSS, runs the tests that gate every commit, and publishes the site to GitHub Pages.

---

## Originating Context

**Source**: Human brief in conversation, 2026-11-11 (Prothit's founding message):

> I want it hosted free on GitHub Pages, built with Vue using scoped CSS so styles stay component-local.

**Agency Grant**: Vue, scoped CSS, and GitHub Pages are fixed by the brief. The toolchain around them is open; Prothit decides.

---

## Explicitation

**What I understand**:

1. **Scoped CSS needs a compile step.** `<style scoped>` belongs to Vue's Single-File Components (`.vue` files). The SFC compiler (via `@vitejs/plugin-vue`) rewrites each component's selectors with a per-component attribute, and that rewrite is what keeps the styles local. Vue loaded from a CDN can compile templates in the browser but not SFC styles. Without a build step, scoped CSS needs a runtime SFC loader.
2. **GitHub Pages serves from a sub-path.** The site will live at `https://prorick.github.io/wordle-with-records/`, so the build has to know the base path `/wordle-with-records/`. Otherwise the page deploys and every asset 404s.
3. **The test runner becomes the commit gate.** Under the Fifth Directive, the test command goes into `just gate`, so it has to run headless both in a terminal and in CI.
4. **"Component-local" is the default, not an absolute.** A parent's scoped styles still reach a child component's root element. Theme-wide things (page background, color tokens, font) still need one small global stylesheet. That's fine, but it's worth knowing before we find it by surprise.

**Assumptions**:

- Node is available locally (v24.21.0, checked 2026-11-11).
- The repo stays public. GitHub Pages is free for public repos; Pages from a private repo needs a paid plan.

**Confirm**: Prothit, the question below.

---

## Questions

### QST-STACK: Which toolchain should build, test, and deploy the Vue app?
- Status: unanswered
- Why asking: The brief fixes Vue, scoped CSS (styles that stay inside each component), and free hosting on GitHub Pages. The toolchain around them decides how the code is written (TypeScript or JavaScript), what command is the test gate before every commit, and how a commit becomes a live site. All of that has to be settled before scaffolding.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — Vite + Vue 3 + TypeScript**: Scaffold with `npm create vue@latest`. Components are `.vue` files with `<script setup lang="ts">` and `<style scoped>`. Vitest runs unit tests (scoring, guess validation, date → puzzle). A GitHub Actions workflow runs the gate and deploys with GitHub's official Pages actions. Gate: type-check + tests + production build.
- **B — Vite + Vue 3, plain JavaScript**: Same as A without TypeScript. Less ceremony and one fewer thing to learn, but the gate has no type-check, so a mistyped tile state (`'presnt'`) shows up as a wrong-colored tile instead of an error.
- **C — No build step**: Vue loads from a CDN in a plain `index.html`, and `.vue` files are compiled in the browser by `vue3-sfc-loader` to get scoped styles. Nothing to install, and Pages serves the repo as-is. But it's an unusual path, first load is slower, and tests still need their own setup.

**Recommendation**: (by Tessera 5.5, Claude Opus 5.5, 2026-11-11)

**A — Vite + Vue 3 + TypeScript.** *Rationale*: Vite with `@vitejs/plugin-vue` is the toolchain Vue's own scaffold (`create-vue`) sets up, so scoped CSS works with no configuration. Vitest shares Vite's config, so the tests exercise the same compiled code the site ships. TypeScript pays off specifically in the scoring code: a tile type of `'correct' | 'present' | 'absent'` turns a typo into a compile error instead of a gray tile. The official Pages deploy (`configure-pages` → `upload-pages-artifact` → `deploy-pages`) keeps built files out of the repo, with no `gh-pages` branch to maintain. *Confidence*: 0.8 — because this is the mainstream path and I've checked each piece against the brief's constraints (scoped CSS, free Pages). The open variable is your comfort with TypeScript, which I don't know yet. *If wrong*: if TypeScript gets in the way of you reading and steering the code (you're the decider, and code you can't read is code you can't decide about) → **B**. If you want zero tooling and will accept a weaker test gate → **C**.

**ANS:** (by Prothit)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

*Pending QST-STACK.*

---

## Open Follow-ups

### QST-PUBLIC-NAME: What is the game called in public, and how different from the original should it look?
- Status: deferred — doesn't block scaffolding; must be answered before the first public deploy
- Why asking: "Wordle" is a New York Times trademark. Right now the repo name, the URL it produces (`prorick.github.io/wordle-with-records/`), and any page title would carry it. The NYT has reportedly sent takedown notices to Wordle clones hosted on GitHub. Separately from the legal risk, an original name gives the CS twist its own identity. The same goes for the look: a grid of colored tiles is a genre convention, but copying the original's exact palette and header is imitation, not a variant.
- Need: pick a letter (or override — any shape answers); if A, a name or a direction for one

Options:
- **A — Original name, own palette**: Pick our own name (a CS pun, say), keep or rename the repo, and design our own tile palette. That's also a chance to make the colors distinguishable for color-blind players by default rather than as a setting.
- **B — Keep "Wordle" in the name**: Something like "CS Wordle". Instantly understood, but it puts the trademark on a public URL and invites a takedown.
- **C — Plain descriptive name**: Something like "CS Word Guess". Safe and clear, but forgettable.

**Recommendation**: (by Tessera 5.5, Claude Opus 5.5, 2026-11-11)

**A — Original name, own palette.** *Rationale*: The repo will publish to a public URL, so the name is visible from the first deploy. An original name costs one decision now, while renaming later means changing the repo, the URL, and the build's base path (Explicitation item 2). An original palette also lets us choose accessible colors on purpose instead of inheriting someone else's. *Confidence*: 0.85 — because the trademark is clear, though how actively it's enforced today is something I'm reporting, not something I've verified. *If wrong*: if this stays a private class exercise that's never shared outside class, the exposure mostly goes away, and a working name is fine → **C**.

**ANS:** (by Prothit)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

- [ ] **Concern**: the template's own `README.md`, `QUICK-START.md`, `CITATION.cff`, and `.zenodo.json` still describe the *template*, not this game. The citation files especially would make this repo look citable as the methodology itself. Replace `README.md` when the game has a name, and ask before touching the citation files.

---

## Action Items

- [ ] Scaffold per the chosen option, set Vite `base` to the repo path, and add the app's checks to the `gate` recipe in `justfile` — Owner: Tessera 5.5 (after QST-STACK)
- [ ] Turn on GitHub Pages (Settings → Pages → Source: GitHub Actions) — Owner: Prothit (a repo-settings click, which is yours to make)

---

## Iterations

### Iteration 1 (2026-11-11)
- Trigger: Prothit's founding brief, which asked which decisions to settle before writing code
- Contributors: Tessera 5.5 (Claude Opus 5.5)
- Changes: Initial draft: QST-STACK with three options and a recommendation; QST-PUBLIC-NAME raised as a deferred question (blocks the first deploy, not the code)
- Outcome: Draft

---

## Links

- Related ADRs: [ADR-0001 — which words count](0001-which-words-count-answers-and-valid-guesses.md), [ADR-0002 — puzzle cadence](0002-puzzle-cadence-daily-shared-puzzle-or-unlimited-play.md)
- Related code: `justfile` (`gate` recipe), `CLAUDE.md` (Fifth Directive)
