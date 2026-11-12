<!-- adr template version: "adr 3.12.0" -->
<!--
adr teaching map: the example is not the teaching — these are the up-links from this file to what teaches its form; load them rather than winging it. (Sibling: the template-version marker dates the mold this file was minted from.)
  skill: adr-authoring
  mcp: adrs4ai
  plugin: adr@adrs4ai
-->

# Which words count: answers and valid guesses

- **Date**: 2026-11-11
- **Iteration**: 3
- **Status**: Accepted
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
- Status: answered
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
5 letter English Word. Do not do CS specific words as I want it to be accessible to my friends! <!-- literal placeholder — parser-significant, do not paraphrase -->

---

### QST-ANSWER-SOURCE: Where should the list of everyday five-letter answers come from?
- Status: answered
- Why asking: QST-GUESS-POOL settled that answers are ordinary five-letter English words, so friends without a CS background can play. The game needs two lists. One is a short list of *common* words that can be the answer, so nobody loses to `XYSTI`. The other is a long list of every real five-letter word, so guesses aren't rejected unfairly. Where the answer list comes from decides how much pruning you'll do, what license note the repo carries, and whether the game's content is actually ours.
- Need: pick a letter (or override — any shape answers)

Options:
- **A — Build our own from SCOWL**: SCOWL is a long-standing, permissively licensed English word list that ranks words by how common they are. Guesses: every five-letter word up to a broad commonness level (roughly 8–10k words). Answers: only the most common level (estimated ~2,000 words, over five years of daily puzzles). I filter out plurals, proper nouns, and anything offensive, and you skim the final list for words your friends wouldn't know. The source and its license are recorded in the repo.
- **B — Adopt an existing open-source list**: Use a five-letter "common words" list someone has already published on GitHub under a permissive license. Faster, but quality and origin vary, and many such lists are actually copies of the original game's list (option C) with a new license slapped on.
- **C — Reuse the original game's answer list**: It circulates widely online and is well curated. But it is the New York Times' curated content, so using it undercuts the "own name, own look" choice in ADR-0003 (QST-PUBLIC-NAME) and carries the same takedown risk.

**Recommendation**: (by Tessera 5.5, Claude Opus 5.5, 2026-11-11)

**A — Build our own from SCOWL.** *Rationale*: QST-PUBLIC-NAME chose an original identity, and the answer list is the game's main content, so it should be ours too. SCOWL's commonness levels map directly onto the two lists we need. "Common enough to be an answer" becomes a threshold we can tune, not a judgment made 2,000 times. ~2,000 answers also outlasts any realistic run of daily puzzles plus random play (ADR-0002). *Confidence*: 0.8 — because I know SCOWL's design and license terms from its documentation, but I haven't downloaded it yet, and the ~2,000 and 8–10k counts are estimates I'll measure before committing to them. *If wrong*: if the most-common level turns out too small or too stuffy once measured, I widen the threshold and you skim more, still A. If its license terms turn out not to fit a public site → **B**, with a provenance check before adopting any list.

**ANS:** (by prorick)
Go with A! Love it!

---

## Decision

### Context

What length are the words, which can be the answer, and what counts as a valid guess. The founding brief asked for computer-science answers (ARRAY, STACK…).

### Chosen: Five-letter everyday English words (Prothit's override of B, 2026-11-11)

**Rationale**: Prothit's ANS: *"5 letter English Word. Do not do CS specific words as I want it to be accessible to my friends!"* The audience is friends, not CS students, so being playable matters more than the theme. I recommended B to keep the CS twist in the answers. The override keeps B's shape (two lists: a short answer list and a broad guess list) and swaps CS terms for everyday English.

**Trade-offs accepted**: The CS twist from the founding brief is gone. The game's identity now comes from its name and look (ADR-0003, QST-PUBLIC-NAME) and its daily-then-random flow (ADR-0002), not from its vocabulary.

### Consequences
- Two word lists ship in the bundle: common answers and broad valid guesses. Where they come from is QST-ANSWER-SOURCE.
- The board is fixed at five tiles wide, so there's no variable-length layout.
- Duplicate-letter scoring is still the first thing the tests pin down (Explicitation item 3).

### Chosen (answer source): A — Build our own from SCOWL (Prothit, 2026-11-11)

**Rationale**: The ANS on QST-ANSWER-SOURCE was *"Go with A! Love it!"*. Answers come from SCOWL's most common levels and guesses from its broad levels. Plurals, proper nouns, and offensive words are filtered out of the answers. A script in the repo regenerates both lists, so the threshold stays tunable and the result reproducible. Measured sizes and the license note are recorded at implementation (Iteration 4).

---

## Open Follow-ups

- [x] ~~**How to curate CS answers**~~: moot. QST-GUESS-POOL dropped CS terms.
- [ ] **Plurals as answers** (`BOOKS`, `CARDS`): my lean is still no. They're cheap filler, and players feel cheated when the answer is just a pluralized four-letter word. They stay valid as *guesses*.
- [ ] **CS words as an optional pack later?** Prothit dropped them for accessibility, not because they were unwanted. A themed bonus pack in random mode could bring them back without affecting the daily puzzle. Parked; raise only if Prothit brings it up.
- [ ] **Duplicate-letter scoring** gets tests before the board is built (Fourth and Fifth Directives): guess `ATTIC` against `STACK`, and answers with repeated letters such as `SPEED` and `LLAMA`.

---

## Action Items

- [ ] Once QST-ANSWER-SOURCE is answered: generate both lists, measure their sizes, and give Prothit the answer list to skim — Owner: Tessera 5.5
- [ ] Record the word-list source and its license in the repo — Owner: Tessera 5.5

---

## Iterations

### Iteration 1 (2026-11-11)
- Trigger: Prothit's founding brief, which asked which decisions to settle before writing code
- Contributors: Tessera 5.5 (Claude Opus 5.5)
- Changes: Initial draft: one question (QST-GUESS-POOL) with four options and a recommendation; curation follow-ups noted
- Outcome: Draft

### Iteration 2 (2026-11-11)
- Trigger: Prothit answered QST-GUESS-POOL (via the ADR Manager panel)
- Contributors: Prothit (decision), Tessera 5.5 (Claude Opus 5.5; recording and follow-up)
- Changes: Recorded the override (five-letter everyday English, no CS words) in Decision; marked the CS curation follow-up moot; minted QST-ANSWER-SOURCE, since common-word answers need a source; added a parked note about an optional CS pack
- Outcome: Draft (stays Draft until QST-ANSWER-SOURCE is answered)

### Iteration 3 (2026-11-11)
- Trigger: Prothit answered QST-ANSWER-SOURCE: A
- Contributors: Prothit (decision), Tessera 5.5 (Claude Opus 5.5; recording)
- Changes: Recorded the SCOWL choice in Decision
- Outcome: Draft → Accepted

---

## Links

- Related ADRs: [ADR-0002 — puzzle cadence](0002-puzzle-cadence-daily-shared-puzzle-or-unlimited-play.md) (how fast the answer list gets used up), [ADR-0003 — build/test/deploy stack](0003-build-test-and-deploy-stack-for-vue-on-github-pages.md)
