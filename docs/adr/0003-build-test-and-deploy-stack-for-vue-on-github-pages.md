<!-- adr template version: "adr 3.12.0" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs4ai
  plugin: adr@adrs4ai
-->

# Build, test, and deploy stack for Vue on GitHub Pages

- **Date**: 2026-11-11
- **Iteration**: 3
- **Status**: Accepted
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
- Status: answered
- Why asking: The brief fixes Vue, scoped CSS (styles that stay inside each component), and free hosting on GitHub Pages. The toolchain around them decides how the code is written (TypeScript or JavaScript), what command is the test gate before every commit, and how a commit becomes a live site. All of that has to be settled before scaffolding.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — Vite + Vue 3 + TypeScript**: Scaffold with `npm create vue@latest`. Components are `.vue` files with `<script setup lang="ts">` and `<style scoped>`. Vitest runs unit tests (scoring, guess validation, date → puzzle). A GitHub Actions workflow runs the gate and deploys with GitHub's official Pages actions. Gate: type-check + tests + production build.
- **B — Vite + Vue 3, plain JavaScript**: Same as A without TypeScript. Less ceremony and one fewer thing to learn, but the gate has no type-check, so a mistyped tile state (`'presnt'`) shows up as a wrong-colored tile instead of an error.
- **C — No build step**: Vue loads from a CDN in a plain `index.html`, and `.vue` files are compiled in the browser by `vue3-sfc-loader` to get scoped styles. Nothing to install, and Pages serves the repo as-is. But it's an unusual path, first load is slower, and tests still need their own setup.

**Recommendation**: (by Tessera 5.5, Claude Opus 5.5, 2026-11-11)

**A — Vite + Vue 3 + TypeScript.** *Rationale*: Vite with `@vitejs/plugin-vue` is the toolchain Vue's own scaffold (`create-vue`) sets up, so scoped CSS works with no configuration. Vitest shares Vite's config, so the tests exercise the same compiled code the site ships. TypeScript pays off specifically in the scoring code: a tile type of `'correct' | 'present' | 'absent'` turns a typo into a compile error instead of a gray tile. The official Pages deploy (`configure-pages` → `upload-pages-artifact` → `deploy-pages`) keeps built files out of the repo, with no `gh-pages` branch to maintain. *Confidence*: 0.8 — because this is the mainstream path and I've checked each piece against the brief's constraints (scoped CSS, free Pages). The open variable is your comfort with TypeScript, which I don't know yet. *If wrong*: if TypeScript gets in the way of you reading and steering the code (you're the decider, and code you can't read is code you can't decide about) → **B**. If you want zero tooling and will accept a weaker test gate → **C**.

**ANS:** (by Prothit)
I agree with A, but I already have an existing github page, so how can I work around that? Please take a look.

---

## Decision

### Context

The brief fixes Vue, scoped CSS, and free GitHub Pages. The toolchain around them was open, and Prothit asked how this fits alongside the GitHub Page they already have.

### Chosen: A — Vite + Vue 3 + TypeScript (Prothit, 2026-11-11)

**Rationale**: Prothit agreed with the recommendation, which keeps its reasoning: scoped CSS works out of the box, Vitest shares Vite's config, and the tile-state type catches typos at compile time.

**The existing GitHub Page — checked, nothing to work around** (Tessera 5.5, 2026-11-11, via `gh api`):
- The existing page is the **user site**: repo `prorick/prorick.github.io`, served at the root `https://prorick.github.io/`, built by its own Actions workflow, with no custom domain.
- GitHub serves **project sites** alongside it, each at `https://prorick.github.io/<repo>/`. Seven already coexist with it: `CSE110Lab1-`, `fa21-cse110-lab3`, `Lab2`, `Lab5_Starter`, `Lab6_Starter`, `Lab7_Starter`, `Lab9_Starter`. This game becomes the eighth. The user site is never touched.
- The one collision to check for is a top-level folder in the user site with the same name as this repo. There is none: the user site's top level is `.github`, `public`, `src`, `index.html`, `vite.config.js`, plus package files.
- One thing to know for later: if the user site ever gets a custom domain, project sites move under it too (`<domain>/<repo>/`). Nothing breaks, but the game's URL would change.

**Trade-offs accepted**: TypeScript is one more thing to learn; Prothit took that on knowingly.

### Consequences
- Vite's `base` is `/<repo-name>/`. It's written once and read everywhere, because the repo name may change (QST-GAME-NAME).
- `just gate` grows: type-check, unit tests, production build.
- Deploys use the official Pages actions, so this repo needs its Pages source set to "GitHub Actions" (Action Items).

### Chosen (name and look): "Lettuce Guess", repo `lettuce-guess` (Prothit, 2026-11-11)

**Rationale**: The ANS on QST-GAME-NAME was *"Go with A! I love Lettuce Guess! Make the site aesthetic. lettuce green color for correct letter. yellow squash color for correct letter in wrong spot. Should be lettuce-guess."* So the name is **Lettuce Guess**, the repo is renamed `prorick/lettuce-guess`, and the URL is `https://prorick.github.io/lettuce-guess/`, which makes Vite's `base` `/lettuce-guess/`.

**Name check** (promised in the Recommendation, done 2026-11-11 before renaming): a web search found no established game called "Lettuce Guess". GitHub has three empty repos with that name, none with any stars, and `prorick/lettuce-guess` was free.

**Palette**: lettuce green for the right letter in the right spot and yellow squash for the right letter in the wrong spot, as Prothit specified. For a letter not in the word, I'm using a warm crouton tan instead of a neutral gray. The board sits on a cream "salad bowl" background with rounded, leaf-soft tiles. Color is never the only signal: tiles also carry an accessible label and a small corner mark.

**A doubt worth recording** (Secondary Directive): green and yellow are also the original game's feedback colors. Those two colors are a genre convention, not anyone's trademark, and Prothit chose them, so we keep them. The rest of the look (shades, background, tile shape, mascot, type) is deliberately different, so the game reads as Lettuce Guess rather than a reskin.

---

## Open Follow-ups

### QST-PUBLIC-NAME: What is the game called in public, and how different from the original should it look?
- Status: answered
- Why asking: "Wordle" is a New York Times trademark. Right now the repo name, the URL it produces (`prorick.github.io/wordle-with-records/`), and any page title would carry it. The NYT has reportedly sent takedown notices to Wordle clones hosted on GitHub. Separately from the legal risk, an original name gives the CS twist its own identity. The same goes for the look: a grid of colored tiles is a genre convention, but copying the original's exact palette and header is imitation, not a variant.
- Need: pick a letter (or override — any shape answers); if A, a name or a direction for one

Options:
- **A — Original name, own palette**: Pick our own name (a CS pun, say), keep or rename the repo, and design our own tile palette. That's also a chance to make the colors distinguishable for color-blind players by default rather than as a setting.
- **B — Keep "Wordle" in the name**: Something like "CS Wordle". Instantly understood, but it puts the trademark on a public URL and invites a takedown.
- **C — Plain descriptive name**: Something like "CS Word Guess". Safe and clear, but forgettable.

**Recommendation**: (by Tessera 5.5, Claude Opus 5.5, 2026-11-11)

**A — Original name, own palette.** *Rationale*: The repo will publish to a public URL, so the name is visible from the first deploy. An original name costs one decision now, while renaming later means changing the repo, the URL, and the build's base path (Explicitation item 2). An original palette also lets us choose accessible colors on purpose instead of inheriting someone else's. *Confidence*: 0.85 — because the trademark is clear, though how actively it's enforced today is something I'm reporting, not something I've verified. *If wrong*: if this stays a private class exercise that's never shared outside class, the exposure mostly goes away, and a working name is fine → **C**.

**ANS:** (by Prothit)
Let's go with A! Come up with a trendy cute name for our game

---

### QST-GAME-NAME: Which name, and should the GitHub repo be renamed to match?
- Status: answered
- Why asking: QST-PUBLIC-NAME chose an original name and palette and asked me for "a trendy cute name". Here's a shortlist, each with the look it suggests. The repo is currently called `wordle-with-records`, and that name becomes the public URL (`prorick.github.io/wordle-with-records/`). Renaming is cheap now, before GitHub Pages is switched on, and fiddly later. Answers are everyday five-letter English words (ADR-0001), so the name doesn't need to be CS-flavored.
- Need: pick a letter (or override — any shape answers, including your own name), plus yes/no on renaming the repo to match

Options:
- **A — Lettuce**: "Lettuce guess" (*let us guess*). A salad-bowl palette: leaf green for the right letter in the right spot, carrot orange for a letter that's in the word but misplaced, crouton tan for a letter that isn't in it, with a small mark on each tile so color is never the only signal. A tiny lettuce-leaf mascot. URL: `prorick.github.io/lettuce/`.
- **B — Guessling**: a little guess, like a duckling. Soft pastels and a round, bouncy feel; a chick mascot that cheers or droops. URL: `/guessling/`.
- **C — Hunch**: one syllable, "trust your hunch". Cooler and moodier: plum, teal, and sand on a dark board. URL: `/hunch/`.
- **D — Tilly**: *tile* turned into a character. Each tile has a tiny face that reacts as letters are scored. URL: `/tilly/`.

**Recommendation**: (by Tessera 5.5, Claude Opus 5.5, 2026-11-11)

**A — Lettuce, and yes, rename the repo to `lettuce`.** *Rationale*: The pun says what you do in the game, which is guess. It also brings a whole visual identity (the salad palette) that is clearly not the original's look, which was the point of QST-PUBLIC-NAME. It's short and easy to type as a URL. Renaming the repo now, while Pages is still off, means the first public URL is the permanent one (Decision → Consequences: `base` is written once). *Confidence*: 0.6 — because naming is taste and the taste is yours. I also haven't yet checked whether any of these names already belong to a well-known game; I'll check the one you pick before renaming anything. *If wrong*: if a food theme feels off, or the name check turns up a clash → **B**, which is just as cute without committing to a theme. If you want to keep the current URL for now, say "no rename"; nothing in the code depends on it.

**ANS:** (by prorick)
Go with A! I love Lettuce Guess! Make the site aesthetic. lettuce green color for correct letter. yellow squash color for correct letter in wrong spot. Should be lettuce-guess.

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

### Iteration 2 (2026-11-11)
- Trigger: Prothit answered QST-STACK (A, with a question about their existing GitHub Page) and QST-PUBLIC-NAME (A, "come up with a trendy cute name")
- Contributors: Prothit (decisions), Tessera 5.5 (Claude Opus 5.5; Pages investigation, recording, name shortlist)
- Changes: Recorded A in Decision with the Pages finding (user site at the root, project sites at sub-paths, eight will coexist, no folder clash, so nothing to work around); minted QST-GAME-NAME with four names and the repo-rename question
- Outcome: Draft → Accepted (the stack is decided; QST-GAME-NAME settles the URL, not the toolchain)

### Iteration 3 (2026-11-11)
- Trigger: Prothit answered QST-GAME-NAME: Lettuce Guess, `lettuce-guess`, lettuce green and squash yellow
- Contributors: Prothit (decision), Tessera 5.5 (Claude Opus 5.5; name check, recording)
- Changes: Recorded the name, repo, URL, and palette in Decision, with the name-check result and the green/yellow doubt
- Outcome: Accepted (unchanged)

---

## Links

- Related ADRs: [ADR-0001 — which words count](0001-which-words-count-answers-and-valid-guesses.md), [ADR-0002 — puzzle cadence](0002-puzzle-cadence-daily-shared-puzzle-or-unlimited-play.md)
- Related code: `justfile` (`gate` recipe), `CLAUDE.md` (Fifth Directive)
