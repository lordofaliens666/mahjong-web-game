// Simplified Singapore-style mahjong engine: 4 sets + 1 pair win shape,
// chi/pong/kong calling, basic tai scoring. Runs entirely client-side vs 3 bots.
import { buildWall, shuffle, tileName } from './tiles.js';

export const SEATS = ['E', 'S', 'W', 'N'];
export const SEAT_NAME = { E: 'You', S: 'Amir', W: 'Su Mei', N: 'Farid' };
export const SEAT_WIND = { E: '東', S: '南', W: '西', N: '北' };

function seatAfter(seat) {
  return SEATS[(SEATS.indexOf(seat) + 1) % 4];
}

function countsOf(tiles) {
  const counts = new Array(34).fill(0);
  for (const t of tiles) if (t.typeIndex >= 0) counts[t.typeIndex]++;
  return counts;
}

// Recursively tries to break `counts` into `setsNeeded` triplets/sequences.
// noSeq disables the sequence branch, used to detect an all-triplets hand.
function canFormSets(counts, setsNeeded, noSeq) {
  if (setsNeeded === 0) return counts.every((c) => c === 0);
  const i = counts.findIndex((c) => c > 0);
  if (i === -1) return false;
  if (counts[i] >= 3) {
    counts[i] -= 3;
    if (canFormSets(counts, setsNeeded - 1, noSeq)) { counts[i] += 3; return true; }
    counts[i] += 3;
  }
  if (!noSeq) {
    const suitEnd = i < 9 ? 8 : i < 18 ? 17 : i < 27 ? 26 : -1;
    if (suitEnd !== -1 && i + 2 <= suitEnd && counts[i + 1] > 0 && counts[i + 2] > 0) {
      counts[i]--; counts[i + 1]--; counts[i + 2]--;
      if (canFormSets(counts, setsNeeded - 1, noSeq)) { counts[i]++; counts[i + 1]++; counts[i + 2]++; return true; }
      counts[i]++; counts[i + 1]++; counts[i + 2]++;
    }
  }
  return false;
}

function canWinShape(concealedTiles, meldsCount, noSeq) {
  const counts = countsOf(concealedTiles);
  for (let i = 0; i < 34; i++) {
    if (counts[i] >= 2) {
      counts[i] -= 2;
      if (canFormSets(counts, 4 - meldsCount, noSeq)) { counts[i] += 2; return true; }
      counts[i] += 2;
    }
  }
  return false;
}

function canPong(player, tile) {
  return player.hand.filter((t) => t.typeIndex === tile.typeIndex).length >= 2;
}
function canKong(player, tile) {
  return player.hand.filter((t) => t.typeIndex === tile.typeIndex).length >= 3;
}
function chiOptions(player, tile) {
  if (tile.typeIndex == null || tile.typeIndex < 0 || tile.typeIndex >= 27) return [];
  const suitBase = Math.floor(tile.typeIndex / 9) * 9;
  const n = tile.typeIndex - suitBase + 1;
  const has = (num) => player.hand.some((t) => t.typeIndex === suitBase + num - 1);
  const opts = [];
  if (n >= 3 && has(n - 2) && has(n - 1)) opts.push([n - 2, n - 1, n]);
  if (n >= 2 && n <= 8 && has(n - 1) && has(n + 1)) opts.push([n - 1, n, n + 1]);
  if (n <= 7 && has(n + 1) && has(n + 2)) opts.push([n, n + 1, n + 2]);
  return opts.map((seq) => seq.map((num) => suitBase + num - 1));
}

function taiToPoints(tai) {
  return tai * 10;
}

export class MahjongGame {
  constructor() {
    this.wall = shuffle(buildWall());
    this.discardPile = [];
    this.log = [];
    this.roundOver = null; // {type:'win', winner, tai, points} | {type:'draw'}
    this.pendingCall = null; // {seat:'E', tile, discarderSeat, options}
    this.currentSeat = 'E';
    this.players = {};
    for (const seat of SEATS) {
      this.players[seat] = {
        seat,
        name: SEAT_NAME[seat],
        isHuman: seat === 'E',
        hand: [],
        melds: [],
        flowers: [],
        discards: [],
        score: 0,
      };
    }
    this._deal();
  }

  addLog(msg) {
    this.log.push(msg);
    if (this.log.length > 200) this.log.shift();
  }

  _drawReplacementsForFlowers(player) {
    while (true) {
      const last = player.hand[player.hand.length - 1];
      if (!last || last.kind !== 'flower') break;
      player.hand.pop();
      player.flowers.push(last);
      const next = this.wall.shift();
      if (!next) break;
      player.hand.push(next);
    }
  }

  _deal() {
    for (let round = 0; round < 13; round++) {
      for (const seat of SEATS) this.players[seat].hand.push(this.wall.shift());
    }
    for (const seat of SEATS) {
      const player = this.players[seat];
      // pull out any flowers dealt in the initial hand and replace them
      let flower;
      while ((flower = player.hand.find((t) => t.kind === 'flower'))) {
        player.hand.splice(player.hand.indexOf(flower), 1);
        player.flowers.push(flower);
        const next = this.wall.shift();
        if (next) player.hand.push(next);
        else break;
      }
    }
  }

  // Draws a tile for the current seat. Returns {tile, selfWin, wallEmpty}.
  drawForCurrent() {
    const player = this.players[this.currentSeat];
    let tile = this.wall.shift();
    while (tile && tile.kind === 'flower') {
      player.flowers.push(tile);
      this.addLog(`${player.name} drew a flower (${tileName(tile)})`);
      tile = this.wall.shift();
    }
    if (!tile) {
      this.roundOver = { type: 'draw' };
      return { tile: null, selfWin: false, wallEmpty: true };
    }
    player.hand.push(tile);
    const selfWin = canWinShape(player.hand, player.melds.length, false);
    return { tile, selfWin, wallEmpty: false };
  }

  declareSelfWin() {
    const player = this.players[this.currentSeat];
    this._finishRound(player, true, null);
  }

  // Removes tileId from seat's hand, discards it, then resolves calls.
  discard(seat, tileId) {
    const player = this.players[seat];
    const idx = player.hand.findIndex((t) => t.id === tileId);
    if (idx === -1) return null;
    const [tile] = player.hand.splice(idx, 1);
    this.discardPile.push({ tile, seat });
    player.discards.push(tile);
    this.addLog(`${player.name} discarded ${tileName(tile)}`);
    return this._resolveDiscard(tile, seat);
  }

  _resolveDiscard(tile, discarderSeat) {
    const options = {};
    for (const seat of SEATS) {
      if (seat === discarderSeat) continue;
      const p = this.players[seat];
      const opts = {};
      if (canWinShape(p.hand.concat([tile]), p.melds.length, false)) opts.win = true;
      if (canKong(p, tile)) opts.kong = true;
      if (canPong(p, tile)) opts.pong = true;
      if (seat === seatAfter(discarderSeat)) {
        const chi = chiOptions(p, tile);
        if (chi.length) opts.chi = chi;
      }
      if (Object.keys(opts).length) options[seat] = opts;
    }

    const rotation = SEATS.slice(SEATS.indexOf(discarderSeat) + 1).concat(SEATS.slice(0, SEATS.indexOf(discarderSeat)));
    const winSeats = rotation.filter((s) => options[s]?.win);
    const kongSeats = rotation.filter((s) => options[s]?.kong);
    const pongSeats = rotation.filter((s) => options[s]?.pong);
    const chiSeats = rotation.filter((s) => options[s]?.chi);

    let claimant = null;
    if (winSeats.length) claimant = { seat: winSeats[0], action: 'win' };
    else if (kongSeats.length) claimant = { seat: kongSeats[0], action: 'kong' };
    else if (pongSeats.length) claimant = { seat: pongSeats[0], action: 'pong' };
    else if (chiSeats.length) claimant = { seat: chiSeats[0], action: 'chi', chiOptions: options[chiSeats[0]].chi };

    if (!claimant) {
      this.currentSeat = seatAfter(discarderSeat);
      return { type: 'continue', nextSeat: this.currentSeat };
    }

    if (claimant.seat === 'E') {
      this.pendingCall = { seat: 'E', tile, discarderSeat, options: options.E };
      return { type: 'awaiting-human-call', options: options.E };
    }

    // Bots auto-decide: always take win/pong/kong, ~50% take chi.
    if (claimant.action === 'chi' && Math.random() >= 0.5) {
      this.currentSeat = seatAfter(discarderSeat);
      return { type: 'continue', nextSeat: this.currentSeat };
    }
    return this._applyCall(claimant.seat, claimant.action, tile, discarderSeat, claimant.chiOptions?.[0]);
  }

  // Called by UI after a human sees an awaiting-human-call prompt.
  resolveHumanCall(action, chiTriple) {
    const call = this.pendingCall;
    this.pendingCall = null;
    if (!call || action === 'pass') {
      this.currentSeat = seatAfter(call.discarderSeat);
      return { type: 'continue', nextSeat: this.currentSeat };
    }
    return this._applyCall(call.seat, action, call.tile, call.discarderSeat, chiTriple);
  }

  _applyCall(seat, action, tile, discarderSeat, chiTriple) {
    const player = this.players[seat];
    // remove the claimed tile from the discard pile
    this.discardPile.pop();

    if (action === 'win') {
      player.hand.push(tile);
      this._finishRound(player, false, discarderSeat);
      return { type: 'win', seat };
    }

    if (action === 'pong' || action === 'kong') {
      const need = action === 'pong' ? 2 : 3;
      const used = [];
      for (let i = player.hand.length - 1; i >= 0 && used.length < need; i--) {
        if (player.hand[i].typeIndex === tile.typeIndex) { used.push(player.hand[i]); player.hand.splice(i, 1); }
      }
      player.melds.push({ type: action, tiles: [...used, tile], from: discarderSeat });
      this.addLog(`${player.name} called ${action.toUpperCase()} on ${tileName(tile)}`);
      this.currentSeat = seat;
      if (action === 'kong') {
        const replacement = this.wall.pop();
        if (replacement) player.hand.push(replacement);
      }
      return { type: 'call', action, seat };
    }

    if (action === 'chi') {
      const triple = chiTriple;
      const used = [];
      for (const typeIndex of triple) {
        if (typeIndex === tile.typeIndex && !used.includes(tile)) continue;
        const idx = player.hand.findIndex((t) => t.typeIndex === typeIndex && !used.includes(t));
        if (idx !== -1) used.push(player.hand[idx]);
      }
      for (const t of used) player.hand.splice(player.hand.indexOf(t), 1);
      player.melds.push({ type: 'chi', tiles: [...used, tile], from: discarderSeat });
      this.addLog(`${player.name} called CHI on ${tileName(tile)}`);
      this.currentSeat = seat;
      return { type: 'call', action, seat };
    }
    return null;
  }

  _finishRound(winner, isSelfDraw, discarderSeat) {
    const allTiles = winner.hand.concat(winner.melds.flatMap((m) => m.tiles));
    let tai = 1;
    if (isSelfDraw) tai += 1;
    if (winner.melds.length === 0) tai += 1;

    const kinds = new Set(allTiles.filter((t) => t.typeIndex >= 0).map((t) => t.kind));
    const suitKinds = [...kinds].filter((k) => k === 'dot' || k === 'bam' || k === 'char');
    const hasHonor = kinds.has('wind') || kinds.has('dragon');
    if (suitKinds.length === 1 && kinds.size <= (hasHonor ? 2 : 1)) tai += hasHonor ? 3 : 6;

    if (winner.melds.every((m) => m.type !== 'chi') && canWinShape(winner.hand, winner.melds.length, true)) {
      tai += 3;
    }

    const counts = countsOf(allTiles);
    for (let i = 31; i <= 33; i++) if (counts[i] >= 3) tai += 1; // dragon triplet
    const seatWindIndex = 27 + SEATS.indexOf(winner.seat);
    if (counts[seatWindIndex] >= 3) tai += 1; // own seat wind triplet

    const points = taiToPoints(tai);
    if (isSelfDraw) {
      for (const seat of SEATS) {
        if (seat === winner.seat) continue;
        this.players[seat].score -= points;
        winner.score += points;
      }
    } else {
      this.players[discarderSeat].score -= points * 3;
      winner.score += points * 3;
    }
    this.addLog(`${winner.name} won${isSelfDraw ? ' by self-draw' : ''} — ${tai} tai (${isSelfDraw ? points : points * 3} pts)`);
    this.roundOver = { type: 'win', winnerSeat: winner.seat, isSelfDraw, tai, points: isSelfDraw ? points : points * 3 };
  }
}
