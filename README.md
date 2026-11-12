# 🥬 Lettuce Guess

**Play:** https://prorick.github.io/lettuce-guess/

A fresh five-letter word puzzle every day. You get six tries to guess the word, and after each guess the tiles tell you how close you were:

- 🟩 **lettuce green**: right letter, right spot (the tile also gets a little leaf)
- 🟨 **yellow squash**: the letter is in the word, but somewhere else (the tile also gets a seed)
- 🟫 **crouton tan**: the letter isn't in the word

Everyone gets the same daily puzzle, and a new one arrives at local midnight. Once you've finished today's, win or lose, you can keep playing random words just for fun. Random rounds don't count toward your stats or streak.

## How it's built

- **Vue 3 + TypeScript + Vite**. Every component keeps its styles in `<style scoped>`. The only global stylesheet is [`src/styles/base.css`](src/styles/base.css), which holds the color tokens and fonts.
- **Static site on GitHub Pages**: a GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) type-checks, tests, builds, and deploys every push to `main`.
- **No backend**: today's puzzle is computed from the date, and your progress and stats live in your browser's `localStorage`.
- **Word lists from [SCOWL](http://wordlist.aspell.net/)**: 2,045 common words can be the answer, and 11,110 words are accepted as guesses. [`scripts/build-wordlists.mjs`](scripts/build-wordlists.mjs) regenerates both lists; [`scripts/wordlist-blocklist.txt`](scripts/wordlist-blocklist.txt) keeps slurs and unpleasant words out. SCOWL's copyright notice ships with the site at [`public/licenses/SCOWL-COPYRIGHT.txt`](public/licenses/SCOWL-COPYRIGHT.txt).

```
src/
├── game/          # pure logic: scoring, daily puzzle, stats, storage, one round of play
│   └── __tests__/ # Vitest suite
├── components/    # Vue SFCs, each with scoped CSS
├── words/         # generated answer + guess lists (don't hand-edit)
└── styles/base.css
```

## Develop

```bash
npm install
npm run dev        # local dev server
just gate          # the full gate: record checks + type-check + tests + production build
```

`npm test` runs the unit tests in the `America/New_York` time zone on purpose, so the tests for the daylight-saving-time switch cover a real 23-hour day and a real 25-hour day.

## Why it's built this way

Every design decision was made deliberately and is written down in [`docs/adr/`](docs/adr/):

| ADR | Decision |
|---|---|
| [0001](docs/adr/0001-which-words-count-answers-and-valid-guesses.md) | Everyday five-letter English words, from SCOWL |
| [0002](docs/adr/0002-puzzle-cadence-daily-shared-puzzle-or-unlimited-play.md) | One shared daily puzzle, then random rounds for fun |
| [0003](docs/adr/0003-build-test-and-deploy-stack-for-vue-on-github-pages.md) | Vite + Vue 3 + TS, GitHub Pages; the name and the salad palette |

Made by Prothit with Tessera 5.5 (Claude Opus 5.5), using the [ADRs4AI human-AI collaboration template](https://github.com/ADRs4AI/human-ai-collaboration-template-A).
