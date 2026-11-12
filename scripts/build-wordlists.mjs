#!/usr/bin/env node
// build-wordlists.mjs — regenerate Lettuce Guess's two word lists from SCOWL.
//
// Context: ADR-0001 (QST-GUESS-POOL → five-letter everyday English;
// QST-ANSWER-SOURCE → build our own from SCOWL). SCOWL ranks English words by
// commonness in "size levels" (10 = most common … 95 = obscure). We cut:
//   ANSWERS  = levels ≤ 35, minus plurals / -ed forms / blocklisted words
//              (common enough that a friend without a dictionary can get it)
//   GUESSES  = levels ≤ 80 (generous, so real words are rarely rejected)
//
// Usage (SCOWL is NOT vendored — download the release and point at final/):
//   curl -L -o scowl.tar.gz https://downloads.sourceforge.net/project/wordlist/SCOWL/2020.12.07/scowl-2020.12.07.tar.gz
//   tar xzf scowl.tar.gz
//   npm run words -- path/to/scowl-2020.12.07/final
//
// Output: src/words/answers.ts, src/words/guesses.ts (generated — don't hand-edit;
// to drop a word, add it to scripts/wordlist-blocklist.txt and re-run).
//
// ⚠ The answers are stored in a seeded-shuffled order, and the daily puzzle is
// "answers[(puzzleNumber - 1) % length]" (src/game/daily.ts). Regenerating with a
// different blocklist or threshold CHANGES WHICH WORD FALLS ON WHICH DAY — fine
// before launch, disruptive after. Post-launch, prefer to append rather than
// regenerate (see ADR-0002, Open Follow-ups).

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const finalDir = process.argv[2]
if (!finalDir || !existsSync(join(finalDir, 'english-words.10'))) {
  console.error('usage: npm run words -- <path to scowl-*/final>')
  process.exit(2)
}

const LEVELS = [10, 20, 35, 40, 50, 55, 60, 70, 80]
const ANSWER_MAX = 35
const GUESS_MAX = 80
// english = common to all spellings; american + british_variant_1 so that both
// COLOR-style and COLOUR-style spellings are accepted as guesses.
const FAMILIES = ['english-words', 'american-words', 'british_variant_1-words']
const SEED = 20261111 // launch date; fixes the shuffled answer order

function readLevel(level) {
  const words = []
  for (const fam of FAMILIES) {
    const f = join(finalDir, `${fam}.${level}`)
    if (!existsSync(f)) continue
    // SCOWL ships ISO-8859-1; accented words are discarded by the /^[a-z]{5}$/ filter anyway.
    for (const w of readFileSync(f, 'latin1').split('\n')) {
      // Lowercase-only also drops proper nouns (capitalised in SCOWL).
      if (/^[a-z]{5}$/.test(w)) words.push(w)
    }
  }
  return words
}

const upTo = (max) => new Set(LEVELS.filter((l) => l <= max).flatMap(readLevel))
const guessSet = upTo(GUESS_MAX)
const answerCandidates = upTo(ANSWER_MAX)

// Base-word lookup for inflection detection: any SCOWL word of any length ≤ 80.
const allWords = new Set()
for (const l of LEVELS) {
  for (const fam of FAMILIES) {
    const f = join(finalDir, `${fam}.${l}`)
    if (!existsSync(f)) continue
    for (const w of readFileSync(f, 'latin1').split('\n')) if (/^[a-z]+$/.test(w)) allWords.add(w)
  }
}

// Plurals / third-person -s and past-tense -ed of a shorter base word make weak
// answers ("BOOKS" is just "BOOK"). They stay valid as guesses. ADR-0001 follow-up.
function isInflection(w) {
  if (w.endsWith('ss')) return false // class, glass, dress
  if (w.endsWith('s')) {
    if (allWords.has(w.slice(0, -1))) return true // books
    if (w.endsWith('es') && allWords.has(w.slice(0, -2))) return true // boxes
    if (w.endsWith('ies') && allWords.has(w.slice(0, -3) + 'y')) return true // spies
  }
  if (w.endsWith('ed')) {
    if (allWords.has(w.slice(0, -1))) return true // baked → bake
    if (allWords.has(w.slice(0, -2))) return true // added → add
    if (w.endsWith('ied') && allWords.has(w.slice(0, -3) + 'y')) return true // cried → cry
  }
  return false
}

// Blocklist: [everywhere] words are neither answers nor accepted guesses;
// [answers-only] words stay typeable but never become the daily answer.
const blockedEverywhere = new Set()
const blockedAsAnswer = new Set()
let section = null
for (const raw of readFileSync(join(ROOT, 'scripts', 'wordlist-blocklist.txt'), 'utf8').split('\n')) {
  const line = raw.replace(/#.*/, '').trim().toLowerCase()
  if (!line) continue
  if (line === '[everywhere]' || line === '[answers-only]') { section = line; continue }
  if (section === '[everywhere]') blockedEverywhere.add(line)
  else if (section === '[answers-only]') blockedAsAnswer.add(line)
  else throw new Error(`blocklist word "${line}" is outside a [section]`)
}

const answers = [...answerCandidates]
  .filter((w) => !isInflection(w) && !blockedEverywhere.has(w) && !blockedAsAnswer.has(w))
  .sort()
const answerSet = new Set(answers)
// Every answer must be guessable; guesses.ts stores only the EXTRA words to keep the bundle small.
const extraGuesses = [...guessSet].filter((w) => !blockedEverywhere.has(w) && !answerSet.has(w)).sort()

// Deterministic shuffle (mulberry32 + Fisher–Yates) so the file's order
// doesn't reveal today's word at a glance (ADR-0002, Spoilers follow-up).
function mulberry32(a) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(SEED)
const shuffled = [...answers]
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1))
  ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
}

const header = (what) =>
  `// GENERATED by scripts/build-wordlists.mjs from SCOWL 2020.12.07 — do not edit by hand.\n` +
  `// ${what}\n` +
  `// Word data © Kevin Atkinson and contributors; see public/licenses/SCOWL-COPYRIGHT.txt (served with the site).\n`

writeFileSync(
  join(ROOT, 'src/words/answers.ts'),
  header(`${shuffled.length} answers (SCOWL levels ≤ ${ANSWER_MAX}, inflections + blocklist removed), seeded-shuffled.`) +
    `export const ANSWERS: readonly string[] = ${JSON.stringify(shuffled.join(' '))}.split(' ')\n`,
)
writeFileSync(
  join(ROOT, 'src/words/guesses.ts'),
  header(`${extraGuesses.length} extra valid guesses (SCOWL levels ≤ ${GUESS_MAX}) beyond the answers.`) +
    `export const EXTRA_GUESSES: readonly string[] = ${JSON.stringify(extraGuesses.join(' '))}.split(' ')\n`,
)
writeFileSync(join(ROOT, 'public/licenses/SCOWL-COPYRIGHT.txt'), readFileSync(join(finalDir, '..', 'Copyright'), 'latin1'))

console.log(`answers: ${shuffled.length}  extra guesses: ${extraGuesses.length}  total valid: ${shuffled.length + extraGuesses.length}`)
