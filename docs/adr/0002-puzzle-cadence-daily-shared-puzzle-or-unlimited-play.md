<!-- adr template version: "adr 3.12.0" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs4ai
  plugin: adr@adrs4ai
-->

# Puzzle cadence: daily shared puzzle or unlimited play

- **Date**: 2026-11-11
- **Iteration**: 2
- **Status**: Accepted
- **Deciders**: Prothit (human), Tessera 5.5 (AI)

**TL;DR**: Decide whether everyone gets the same puzzle each day or plays random words on demand. This choice sets the game's state model and how fast the answer list gets used up.

---

## Originating Context

**Source**: Human brief in conversation, 2026-11-11 (Prothit's founding message). It asks for a variant of the genre with CS-word answers, hosted free on GitHub Pages. The brief doesn't mention cadence. I'm raising it because it's the biggest structural choice the brief leaves open.

**Agency Grant**: Explore options and recommend; Prothit decides.

---

## Explicitation

**What I understand**:

1. **Cadence decides the state model.** A daily puzzle needs a mapping from date to puzzle, saved progress so a page refresh doesn't wipe today's board, and stats or streaks across days. Unlimited play needs a random pick and a "new game" button.
2. **Cadence and list size interact.** With ~200 curated answers (ADR-0001), a daily game lasts about six months before repeating. Unlimited play can go through the whole list in a long afternoon.
3. **Static hosting means there is no server.** Whatever we choose, the answer is computed in the browser, so a determined player can always read it out of the JavaScript.

**Assumptions**:

- No accounts and no backend. Anything that persists lives in the player's browser (`localStorage`).
- GitHub Pages serves static files only, so we can't hide answers behind an API.

**Confirm**: Prothit, the question below.

---

## Questions

### QST-CADENCE: Should the game offer one shared puzzle per day, unlimited random puzzles, or both?
- Status: answered
- Why asking: This shapes most of the game's code beyond scoring: what's saved between visits, what the end-of-game screen offers, and how to test "today's" puzzle. The game is a static site on GitHub Pages (no server), and its answers come from a hand-curated list of a few hundred CS words (ADR-0001). That finite list is part of the trade-off.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — Daily, shared**: One puzzle per calendar day, the same for every player. It's computed from the date: days since launch pick an entry in a fixed, shuffled answer list. Progress and stats are saved in the browser. This creates the "did you get today's?" conversation and shareable results. Players get one puzzle a day, and tests need a way to force the date.
- **B — Unlimited**: Each game picks a random answer, and "Play again" starts another. The state is simplest (only optional stats persist between games) and it's good for practice. But there's no shared puzzle to talk about, and with a ~200-word list players will see repeats quickly.
- **C — Both**: Daily is the main mode, plus a practice mode with random answers. They share one engine and differ only in where the answer comes from. This adds UI (a mode switch) and two sets of stats.

**Recommendation**: (by Tessera 5.5, Claude Opus 5.5, 2026-11-11)

**A — Daily, shared**, with the answer source behind a single function so B can be added later in an afternoon. *Rationale*: Daily fits static hosting well. The puzzle is a pure function of the date, so every player sees the same one without any backend. The curated CS list is finite and pruned by hand, and a daily cadence uses it at the pace it was written for. Isolating "where does the answer come from" from day one keeps C cheap without building it now. *Confidence*: 0.65 — because this is mostly about what kind of game you want people to have, which is your call more than an engineering one. The engineering differences between A, B, and C are small. *If wrong*: if the game is mainly for you and classmates to play in bursts (a class demo, say), unlimited serves that better → **B**. If you want both modes at launch → **C**.

**ANS:** (by Prothit)
C is best, do daily for the first game. Then allow the user to play another random word for fun.

---

### QST-RANDOM-UNLOCK: When does random play open up, and does it count toward stats?
- Status: unanswered
- Why asking: QST-CADENCE chose both modes: "do daily for the first game. Then allow the user to play another random word for fun." I read that as random play opening *after* today's daily is finished. I want to confirm that before building the end-of-game screen, because it decides whether there's a mode switch on the home screen and whether random games can affect the daily streak.
- Need: pick a letter (or override — any shape answers); a quick "A" confirms my reading

Options:
- **A — After the daily, win or lose; just for fun**: The home screen is always today's daily. Once it's finished (won or out of guesses), the result screen offers "Play a random word", and each random game ends with "Another one?". Random games don't count toward daily stats or streaks and aren't saved.
- **B — Any time, via a mode switch**: A Daily / Random toggle is always visible, so random play is available even before the daily. More freedom, but someone could warm up on random words first, and the home screen gets busier.
- **C — Only after *winning* the daily**: Random play is a reward for solving today's puzzle. A player who misses the daily has to wait until tomorrow.

**Recommendation**: (by Tessera 5.5, Claude Opus 5.5, 2026-11-11)

**A — After the daily, win or lose; just for fun.** *Rationale*: This is the most literal reading of your answer ("daily for the first game. Then… another random word"). Keeping random games out of stats matches "for fun" and means the daily streak can't be inflated by practice. The UI also stays one screen deep: no toggle until it's needed. *Confidence*: 0.85 — because the reading follows your wording closely, but "first game" could also mean "the default", which would point to B. *If wrong*: if you meant random should be available whenever someone wants it → **B**. If random play should feel earned → **C**.

**ANS:** (by Prothit)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

### Context

Whether players get one shared puzzle per day, random puzzles on demand, or both, on a static site with no server.

### Chosen: C — Both, daily first (Prothit, 2026-11-11)

**Rationale**: Prothit's ANS: *"C is best, do daily for the first game. Then allow the user to play another random word for fun."* That's my recommended A plus the random mode I had planned for later. Since both modes share one engine and differ only in where the answer comes from, building C from the start costs little more than A did.

**Trade-offs accepted**: More UI than daily alone, namely an end-of-game screen that branches into random play. Exactly when random play unlocks is QST-RANDOM-UNLOCK.

### Consequences
- One game engine, two answer sources: `answerFor(date)` for the daily and `randomAnswer()` for random play.
- Today's daily is saved in the browser so a refresh doesn't wipe it. Random games are not saved (pending QST-RANDOM-UNLOCK).
- Answer-list exhaustion is no longer a concern. ADR-0001's switch to everyday English gives an estimated ~2,000 answers, far more than the ~200 CS terms assumed in Explicitation item 2.
- **Day boundary — adopting my lean unless Prothit objects**: local midnight, with the puzzle number counting local days since launch.

---

## Open Follow-ups

- [x] **Day boundary**: adopted local midnight (see Consequences). Nobody objected when it was raised in Iteration 1; reopen if friends in other time zones find it confusing.
- [ ] **Spoilers**: the answer list ships in the JavaScript bundle, and only a server could fully hide it. My lean is to store the list in shuffled order so reading the file doesn't reveal *today's* word at a glance, and not to spend effort on obfuscation beyond that.
- [ ] **Share text** (the emoji grid players paste to friends): after v1, if A or C.

---

## Action Items

- [ ] Put "pick today's answer" behind one function (`answerFor(date)` or `randomAnswer()`) so cadence changes stay local — Owner: Tessera 5.5 (at scaffolding)

---

## Iterations

### Iteration 1 (2026-11-11)
- Trigger: Prothit's founding brief, which asked which decisions to settle before writing code
- Contributors: Tessera 5.5 (Claude Opus 5.5)
- Changes: Initial draft: QST-CADENCE with three options and a recommendation; day-boundary and spoiler follow-ups noted
- Outcome: Draft

### Iteration 2 (2026-11-11)
- Trigger: Prothit answered QST-CADENCE (via the ADR Manager panel)
- Contributors: Prothit (decision), Tessera 5.5 (Claude Opus 5.5; recording and follow-up)
- Changes: Recorded C (daily first, then random for fun) in Decision; minted QST-RANDOM-UNLOCK to confirm how I read "first game"; adopted the local-midnight day boundary
- Outcome: Draft → Accepted (the cadence is decided; QST-RANDOM-UNLOCK refines how it works, not whether)

---

## Links

- Related ADRs: [ADR-0001 — which words count](0001-which-words-count-answers-and-valid-guesses.md) (list size sets how long a daily game lasts), [ADR-0003 — build/test/deploy stack](0003-build-test-and-deploy-stack-for-vue-on-github-pages.md)
