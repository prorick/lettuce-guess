<!-- adr template version: "adr 3.12.0" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs4ai
  plugin: adr@adrs4ai
-->

# Which words count: answers and valid guesses

- **Date**: 2026-11-11
- **Iteration**: 1
- **Status**: Draft
- **Deciders**: Prothit (human), Tessera 5.5 (AI)

**TL;DR**: Settle the word rules before writing code: how long the words are, where answers come from, and what the game accepts as a guess.

---

## Originating Context

**Source**: Human brief in conversation, 2026-11-11 (Prothit's founding message):

> The project is a Wordle variant — guess the word, colored feedback per letter — with a twist: the answers are computer science words (ARRAY, STACK, QUEUE, CACHE, TOKEN…). […] Before you write any code: what are the 2–3 decisions we should settle first?

**Agency Grant**: Explore options and recommend; Prothit decides.

---

## Explicitation

**What I understand**:

1. **The twist is in the answer list.** Everything else in the genre (a grid of tiles, colors for each letter, a limited number of guesses) is convention. What makes this game ours is which words can be the answer, so that list is the product's main content and is curated by hand.
2. **Accepting a guess is a separate decision from picking an answer.** It decides whether a dictionary ships in the bundle, what "not in word list" means, and whether players can use ordinary English words to narrow down a CS answer.
3. **Scoring is not a decision, but it is a known hazard.** Duplicate letters need a two-pass algorithm. Example: guess `ATTIC` against answer `STACK` must color one `T` and leave the other gray. This is the first behavior the test suite will pin down, whatever is decided here.

**Assumptions**:

- The five example words are all five letters. I read that as a hint, not a rule, and option D below tests it.
- Answers are A–Z only. No digits or punctuation (so no `C++`, no `IPV6`).
- I draft a candidate answer list and Prothit prunes it. Nothing is scraped automatically.

**Confirm**: Prothit, the question below.

---

## Questions

### QST-GUESS-POOL: Which words can be answers, and which words does the game accept as guesses?
- Status: unanswered
- Why asking: This decides what data the game ships (one curated list, or a curated list plus a dictionary), how many tiles wide the board is, and what happens when a player types a word we don't know. The answers are meant to be computer-science terms (ARRAY, STACK, QUEUE, CACHE, TOKEN…). The open question is how far that theme extends into what players may *guess*, and whether words must be five letters.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — CS-only, five letters**: Answers and guesses both come from one curated list of about 150–250 five-letter CS terms. Smallest bundle, purest theme. But players can only guess CS words. They can't open with a common English word like CRANE, and after two or three guesses the remaining candidates are few enough to work out from memory.
- **B — CS answers, broad guesses, five letters**: Answers come from the curated CS list. A guess is accepted if it is in that list *or* in a general English five-letter word list (a public-domain list such as ENABLE, roughly 8–9k words, est. ~20 KB gzipped). There are two lists to maintain, but play feels like the familiar genre and the CS theme shows up in what the answer turns out to be.
- **C — Any five letters**: Answers are curated, and any five A–Z letters count as a guess. No dictionary at all. But nonsense guesses like `AEIOU` become the best strategy, which flattens the puzzle.
- **D — Variable length**: Answers are CS terms of 4–7 letters (HEAP, LAMBDA, POINTER), the board shows the length up front, and guesses are checked against CS and English lists of that length. This is the most CS-flavored option, since many of the best terms aren't five letters, but board layout, word lists, and tests all have to handle every length.

**Recommendation**: (by Tessera 5.5, Claude Opus 5.5, 2026-11-11)

**B — CS answers, broad guesses, five letters.** *Rationale*: All five of your examples are five letters, and there are plenty of five-letter CS terms to run daily for months: ARRAY, STACK, QUEUE, CACHE, TOKEN, GRAPH, MUTEX, TUPLE, REGEX, PROXY, SHARD, NONCE, LEXER, RADIX, and more. I'll draft ~200 candidates for you to prune. With B the theme lives in the answers, where it's a nice surprise, and players who think in everyday English aren't penalized. A's restricted guess pool makes the game shorter and more frustrating rather than more CS-flavored. D is a real thematic improvement but roughly triples what the first build has to handle. It can come later as a separate mode once the five-letter engine is tested. *Confidence*: 0.75 — because the trade-off is about how the game feels to play, which I'm reasoning about rather than having playtested, and B's bundle-size cost is my estimate from list length, not a measurement. *If wrong*: if playtesting shows people mostly guess CS words anyway, the English list is dead weight → **A**. If the five-letter limit cuts out the terms that make the game feel like *yours* (POINTER, LAMBDA, BINARY…) → **D**.

**ANS:** (by Prothit)
[Fill this in]   <!-- literal placeholder — parser-significant, do not paraphrase -->

---

## Decision

*Pending QST-GUESS-POOL.*

---

## Open Follow-ups

- [ ] **How to curate answers** (decided when the draft list goes to Prothit; doesn't block the question above): are language keywords and abbreviations fair answers (`ASYNC`, `CONST`, `DEQUE`, `CHMOD`)? My lean: allow words a CS sophomore would *say out loud* in class. Exclude pure abbreviations and proper nouns (`LINUX`, `MYSQL`).
- [ ] **Plurals as answers** (`BYTES`, `NODES`): my lean is no. They're cheap filler and make the list feel padded.
- [ ] **Duplicate-letter scoring** gets tests before the board is built (Fourth and Fifth Directives): `ATTIC`/`STACK`, and `QUEUE` as an answer.

---

## Action Items

- [ ] Draft ~200 candidate answers, matching whichever length is chosen, for Prothit to prune — Owner: Tessera 5.5 (after QST-GUESS-POOL is answered)
- [ ] If B or D: choose the English guess list and record its license in the repo — Owner: Tessera 5.5

---

## Iterations

### Iteration 1 (2026-11-11)
- Trigger: Prothit's founding brief, which asked which decisions to settle before writing code
- Contributors: Tessera 5.5 (Claude Opus 5.5)
- Changes: Initial draft: one question (QST-GUESS-POOL) with four options and a recommendation; curation follow-ups noted
- Outcome: Draft

---

## Links

- Related ADRs: [ADR-0002 — puzzle cadence](0002-puzzle-cadence-daily-shared-puzzle-or-unlimited-play.md) (how fast the answer list gets used up), [ADR-0003 — build/test/deploy stack](0003-build-test-and-deploy-stack-for-vue-on-github-pages.md)
