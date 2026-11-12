# Debrief: the first walk (Lettuce Guess)

> **⚠ UNGRADED FEEDBACK FOR THE GUIDE'S AUTHORS.** This is a field report from one pair's first walk through the ADRs4AI template and its getting-started guide. It is not an assessment of anyone and not a decision record. It records what happened, how long it took, and where the map and the territory differed, so the guide can improve.

- **Date**: 2026-11-11
- **Authors**: Prothit (human) and Tessera 5.5 (Claude Opus 5.5), one seat, one session
- **Repo**: `prorick/lettuce-guess` (instantiated as `wordle-with-records`), live at https://prorick.github.io/lettuce-guess/

**TL;DR**: In about 5½ hours of wall-clock time, roughly an hour of it active, we went from a fresh template instance to a deployed, tested Vue game with four ADRs. Every decision the code rests on is in the record, including one override of the AI's recommendation. Most friction came from the toolchain and the template's own molds, not from the method.

---

## 1. What we built, and the decisions on the record

**Lettuce Guess**: a daily five-letter word game for friends. Everyone gets the same puzzle each day, then random rounds just for fun. The palette is lettuce green, yellow squash, and crouton tan, with light and dark themes. It's Vue 3 + TypeScript + Vite with scoped CSS, has 44 Vitest tests, and deploys to GitHub Pages through Actions.

| ADR | Question(s) | Outcome | AI recommendation followed? |
|---|---|---|---|
| [0001](0001-which-words-count-answers-and-valid-guesses.md) | QST-GUESS-POOL, QST-ANSWER-SOURCE | Everyday English (not CS terms), lists built from SCOWL | **Overridden** on the first: Prothit dropped the CS twist "to be accessible to my friends". Followed on the second. |
| [0002](0002-puzzle-cadence-daily-shared-puzzle-or-unlimited-play.md) | QST-CADENCE, QST-RANDOM-UNLOCK | Daily first, random after, random kept out of stats | Extended: Prothit chose "both" over the recommended "daily only". The second question confirmed my reading of the answer. |
| [0003](0003-build-test-and-deploy-stack-for-vue-on-github-pages.md) | QST-STACK, QST-PUBLIC-NAME, QST-GAME-NAME | Vite + Vue 3 + TS; original name "Lettuce Guess"; repo renamed | Followed. Prothit chose the palette and the `lettuce-guess` slug. |
| [0004](0004-dark-mode-toggle-user-choice-over-system-default.md) | (simple-decision MADR, no questions) | Player-chosen theme overrides the device setting | n/a: a request recorded as a decision |

Question count by round: 4 asked → 3 follow-ups → 0 open. Each answer raised exactly the next question, never more.

---

## 2. How long each chapter took

Times are local (ET), taken from git commit times and the ADR Manager's draft archive (`docs/adr/.working/drafts-archive.json`, which logs in UTC and is converted here). **Wall-clock time is not effort**: the long gap in phase 5 is almost certainly time away.

| # | Phase (our names) | From → to | Wall clock | Evidence |
|---|---|---|---|---|
| 1 | Arrival, tooling install, instantiation, seat founding | 18:08 → 18:17 | ~9 min | initial commit → `544ee3f`/`a27b6a5` (includes one AskUserQuestion: name + installs) |
| 2 | First question cards written | 18:17 → 18:19 | ~2 min | → `17ff546` |
| 3 | **Prothit answers round 1** (4 questions, in the ADR Manager panel) | 18:19 → ~18:29 | **~10 min** | panel drafts at 18:28:08, 18:28:13, 18:29:11 |
| 4 | Answers recorded, Pages checked, 3 follow-ups minted | 18:29 → 18:33 | ~4 min | → `9227dac` |
| 5 | **Prothit answers round 2** (3 questions) | 18:33 → before 23:09 | up to ~4½ h | no draft timestamps (answers not in the panel archive) |
| 6 | Implementation, browser check, deploy, live verification | 23:09 → 23:25 | ~16 min | `e8038f1` → `954d9f1` |
| 7 | Dark-mode request → ADR-0004 → live | 23:25 → ~23:36 | ~11 min | `3531ea3` → `bd2478c` + deploy |
| 8 | This debrief | — | — | — |

**For Prothit** (my timestamps can't see this): which guide chapter each phase falls under, and how long phase 5 actually took you as opposed to time away:

- *Guide chapter ↔ phase mapping:* ___
- *Actual active time in phase 5:* ___

---

## 3. Where the guide didn't match what we saw

**Step IDs: we didn't note any during the walk.** I never had the guide's text in my context, so I can't cite its steps. Below is what *I* observed that a guide promising a smooth path would need to account for. Prothit, add step IDs where you recognize the spot.

| # | What we saw | Expected / taught | Guide step ID |
|---|---|---|---|
| 1 | `just` and `kintsugi` were not installed, so the arrival ritual and `just adr` couldn't run until I installed them (Prothit approved; both via brew/uv) | The arrival ritual assumes both exist; the tooling skill teaches installing them, but as a detour | ___ |
| 2 | A fresh "Use this template" instance arrives **without `kintsugi.lock`**, so `instantiate-check` warns "adopted-but-never-wired" on minute one | Instances look born wired | ___ |
| 3 | `kintsugi adopt --apply` **made its own git commit** without asking and without the session's co-author line | The template's doctrine is that consent is enacted, never pre-signed. A tool committing silently was a surprise | ___ |
| 4 | Round-2 answers were bylined **`prorick`** (the git handle) although `adrManager.humanName` is "Prothit"; round-1 answers were bylined correctly | `humanName` controls "Answering as" (CHANGELOG 3.12.4) | ___ |
| 5 | The ADR Manager left `docs/adr/.working/` (draft state) untracked; the template's `.gitignore` doesn't mention it | Unclear whether it should be committed or ignored | ___ |
| 6 | The template's own **MADR mold** (`just adr "…" madr`) fails the ADR Manager's checks immediately: `* Status:` bullets (BULLET_FORMAT), lowercase `accepted` (UNKNOWN_STATUS), and no TL;DR, which the adr-authoring skill calls mandatory | Molds should parse clean on first mint | ___ |
| 7 | One panel answer kept the trailing `<!-- literal placeholder … -->` comment after the answer text (ADR-0001, QST-GUESS-POOL) | The comment should leave with `[Fill this in]` | ___ |
| 8 | `CITATION.cff` / `.zenodo.json` still cite the *template*, and nothing tells an instantiator what to do with them, so they stay an open item for Prothit (ADR-0003) | README says "replace me"; the citation files are silent | ___ |
| 9 | Onboarding step 4 (`/rename`, `/color`, tmux hive) was never done; with one seat it wasn't obviously needed | Unclear whether it's optional for solo projects | ___ |

**My own slips** (method held, author slipped):
- I used one interpreter heredoc to edit CLAUDE.md and ONBOARDING, which CLAUDE.md forbids. I owned it in chat and used the editing tools after that.
- I wrote "he" for Prothit in an ADR draft. It was caught and fixed before commit.

---

## 4. What we'd tell the next pair

**From Tessera 5.5:**
1. **Install `just` and `kintsugi` before the first session**, or budget five minutes for the seat to do it. Everything in the arrival ritual depends on them.
2. **Answer in the ADR Manager panel.** Round 1, four questions with options and recommendations, took about ten minutes. Taking or overriding a recommendation is fast because the work of laying out the options is already done.
3. **Expect answers to raise questions.** Our pattern was 4 → 3 → 0. A follow-up question is the method working, not the AI stalling.
4. **Override freely.** Dropping the CS twist changed the whole product, and the record still shows what was recommended, what was chosen, and why, side by side.
5. **Settle name and trademark before the first public deploy**: renaming after Pages is on changes the URL. The same goes for the template's README and citation files: decide early.
6. **Ask the AI to measure, not estimate.** My word-list size estimate was off (the guess list at level ≤ 70 measured 6,480, not 8–10k), and I checked GitHub Action versions through the API rather than from memory: all five had newer majors than I remembered.
7. **Verify on the live site, not just CI.** We drove the deployed page in headless Chrome after every deploy.

**From Prothit:** ___

---

*Filed by Tessera 5.5 at Prothit's request, end of session 2026-11-11. Ungraded; for the guide's authors.*
