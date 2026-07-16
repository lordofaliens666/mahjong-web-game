// American-style mahjong hand patterns: an original, simplified set (not the
// copyrighted NMJL card) capturing the flavor of pattern-matching wins with
// Joker wildcards, since a real American hand is judged against a fixed card
// of named patterns rather than a generic "4 sets + pair" shape.
const SUIT_INDEX = { dot: 0, bam: 1, char: 2 };
const ALL_SUITS = [0, 1, 2];
const ALL_WINDS = [0, 1, 2, 3];
const ALL_DRAGONS = [0, 1, 2];
const NUMBERS_1_9 = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const AMERICAN_PATTERNS = [
  {
    name: 'Four Winds, One Dragon', points: 40,
    vars: { D: ALL_DRAGONS },
    slots: [
      { kind: 'pung', category: 'wind', windIndex: 0 },
      { kind: 'pung', category: 'wind', windIndex: 1 },
      { kind: 'pung', category: 'wind', windIndex: 2 },
      { kind: 'pung', category: 'wind', windIndex: 3 },
      { kind: 'pair', category: 'dragon', dragonVar: 'D' },
    ],
  },
  {
    name: 'Three Dragons', points: 35,
    vars: { W: ALL_WINDS, S: ALL_SUITS },
    slots: [
      { kind: 'pung', category: 'dragon', dragonIndex: 0 },
      { kind: 'pung', category: 'dragon', dragonIndex: 1 },
      { kind: 'pung', category: 'dragon', dragonIndex: 2 },
      { kind: 'pung', category: 'wind', windVar: 'W' },
      { kind: 'pair', category: 'anysuit', number: 8, suitVar: 'S' },
    ],
  },
  {
    name: 'Like Numbers', points: 30,
    vars: { N: NUMBERS_1_9, W: ALL_WINDS, D: ALL_DRAGONS },
    slots: [
      { kind: 'pung', category: 'dot', numberVar: 'N' },
      { kind: 'pung', category: 'bam', numberVar: 'N' },
      { kind: 'pung', category: 'char', numberVar: 'N' },
      { kind: 'pung', category: 'wind', windVar: 'W' },
      { kind: 'pair', category: 'dragon', dragonVar: 'D' },
    ],
  },
  {
    name: 'Triple Run', points: 30,
    vars: { S: [1, 2, 3, 4, 5, 6, 7], D: ALL_DRAGONS, W: ALL_WINDS },
    slots: [
      { kind: 'run', suit: 'dot', numberVar: 'S' },
      { kind: 'run', suit: 'bam', numberVar: 'S' },
      { kind: 'run', suit: 'char', numberVar: 'S' },
      { kind: 'pung', category: 'dragon', dragonVar: 'D' },
      { kind: 'pair', category: 'wind', windVar: 'W' },
    ],
  },
  {
    name: 'Suit Straight', points: 35,
    vars: { S: ALL_SUITS, W: ALL_WINDS, D: ALL_DRAGONS },
    slots: [
      { kind: 'run', suit: 'anysuit', suitVar: 'S', number: 1 },
      { kind: 'run', suit: 'anysuit', suitVar: 'S', number: 4 },
      { kind: 'run', suit: 'anysuit', suitVar: 'S', number: 7 },
      { kind: 'pung', category: 'wind', windVar: 'W' },
      { kind: 'pair', category: 'dragon', dragonVar: 'D' },
    ],
  },
  {
    name: '2468', points: 25,
    vars: { S1: ALL_SUITS, S2: ALL_SUITS, S3: ALL_SUITS, S4: ALL_SUITS, S5: ALL_SUITS },
    slots: [
      { kind: 'pung', category: 'anysuit', number: 2, suitVar: 'S1' },
      { kind: 'pung', category: 'anysuit', number: 4, suitVar: 'S2' },
      { kind: 'pung', category: 'anysuit', number: 6, suitVar: 'S3' },
      { kind: 'pung', category: 'anysuit', number: 8, suitVar: 'S4' },
      { kind: 'pair', category: 'anysuit', number: 2, suitVar: 'S5' },
    ],
  },
  {
    name: '1357 & 9', points: 25,
    vars: { S1: ALL_SUITS, S2: ALL_SUITS, S3: ALL_SUITS, S4: ALL_SUITS, S5: ALL_SUITS },
    slots: [
      { kind: 'pung', category: 'anysuit', number: 1, suitVar: 'S1' },
      { kind: 'pung', category: 'anysuit', number: 3, suitVar: 'S2' },
      { kind: 'pung', category: 'anysuit', number: 5, suitVar: 'S3' },
      { kind: 'pung', category: 'anysuit', number: 7, suitVar: 'S4' },
      { kind: 'pair', category: 'anysuit', number: 9, suitVar: 'S5' },
    ],
  },
  {
    name: 'Double Honors', points: 30,
    vars: { W1: ALL_WINDS, W2: ALL_WINDS, D1: ALL_DRAGONS, D2: ALL_DRAGONS, S: ALL_SUITS },
    slots: [
      { kind: 'pung', category: 'wind', windVar: 'W1' },
      { kind: 'pung', category: 'wind', windVar: 'W2' },
      { kind: 'pung', category: 'dragon', dragonVar: 'D1' },
      { kind: 'pung', category: 'dragon', dragonVar: 'D2' },
      { kind: 'pair', category: 'anysuit', number: 5, suitVar: 'S' },
    ],
  },
  {
    name: 'Terminals', points: 30,
    vars: { S1: ALL_SUITS, S2: ALL_SUITS, S3: ALL_SUITS, W: ALL_WINDS, D: ALL_DRAGONS },
    slots: [
      { kind: 'pung', category: 'anysuit', number: 1, suitVar: 'S1' },
      { kind: 'pung', category: 'anysuit', number: 9, suitVar: 'S2' },
      { kind: 'pung', category: 'wind', windVar: 'W' },
      { kind: 'pung', category: 'dragon', dragonVar: 'D' },
      { kind: 'pair', category: 'anysuit', number: 1, suitVar: 'S3' },
    ],
  },
  {
    name: 'Seven Pairs', points: 30, special: 'sevenPairs',
    description: 'Seven pairs of any tiles.',
  },
];

function resolveWind(slot, assignment) { return slot.windIndex !== undefined ? slot.windIndex : assignment[slot.windVar]; }
function resolveDragon(slot, assignment) { return slot.dragonIndex !== undefined ? slot.dragonIndex : assignment[slot.dragonVar]; }
function resolveSuit(slot, assignment) {
  if (slot.suitIndex !== undefined) return slot.suitIndex;
  if (slot.suit && slot.suit !== 'anysuit') return SUIT_INDEX[slot.suit];
  return assignment[slot.suitVar];
}
function resolveNumber(slot, assignment) { return slot.number !== undefined ? slot.number : assignment[slot.numberVar]; }

function slotUnits(slot, assignment) {
  if (slot.kind === 'run') {
    const suitIdx = resolveSuit(slot, assignment);
    const start = resolveNumber(slot, assignment);
    const base = suitIdx * 9;
    return [base + start - 1, base + start, base + start + 1];
  }
  let typeIndex;
  if (slot.category === 'wind') typeIndex = 27 + resolveWind(slot, assignment);
  else if (slot.category === 'dragon') typeIndex = 31 + resolveDragon(slot, assignment);
  else typeIndex = resolveSuit(slot, assignment) * 9 + (resolveNumber(slot, assignment) - 1);
  const size = slot.kind === 'pair' ? 2 : 3;
  return new Array(size).fill(typeIndex);
}

function buildReq(pattern, assignment) {
  const req = new Array(34).fill(0);
  for (const slot of pattern.slots) {
    for (const idx of slotUnits(slot, assignment)) req[idx]++;
  }
  return req;
}

function* cartesian(varNames, vars) {
  if (varNames.length === 0) { yield {}; return; }
  const [first, ...rest] = varNames;
  for (const value of vars[first]) {
    for (const restAssignment of cartesian(rest, vars)) {
      yield { [first]: value, ...restAssignment };
    }
  }
}

// Jokers may fill any shortfall anywhere (a simplification vs. real house
// rules, which usually forbid jokers in the pair) — see rules.html.
function matchesWithJokers(have, req) {
  for (let i = 0; i < 34; i++) if (have[i] > req[i]) return false;
  return true;
}

function isSevenPairs(have, jokerCount) {
  let pairs = 0;
  let jokersNeeded = 0;
  for (let i = 0; i < 34; i++) {
    pairs += Math.floor(have[i] / 2);
    if (have[i] % 2 === 1) jokersNeeded += 1;
  }
  if (jokersNeeded > jokerCount) return false;
  const leftoverJokers = jokerCount - jokersNeeded;
  if (leftoverJokers % 2 !== 0) return false;
  return pairs + jokersNeeded + leftoverJokers / 2 === 7;
}

// tiles: flat array of concealed + exposed-meld tile objects (14 total).
export function matchAmericanHand(tiles) {
  const have = new Array(34).fill(0);
  let jokerCount = 0;
  for (const t of tiles) {
    if (t.kind === 'joker') jokerCount += 1;
    else if (t.typeIndex >= 0) have[t.typeIndex] += 1;
  }

  for (const pattern of AMERICAN_PATTERNS) {
    if (pattern.special === 'sevenPairs') {
      if (isSevenPairs(have, jokerCount)) return pattern;
      continue;
    }
    const varNames = Object.keys(pattern.vars || {});
    for (const assignment of cartesian(varNames, pattern.vars || {})) {
      if (matchesWithJokers(have, buildReq(pattern, assignment))) return pattern;
    }
  }
  return null;
}
