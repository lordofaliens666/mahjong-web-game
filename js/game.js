import { MahjongGame, SEATS } from './engine.js';
import { chooseDiscard } from './bot.js';
import { createTileElement, sortHand } from './tiles.js';
import { botDelayMultiplier } from './theme.js';
import { recordRoundResult } from './profile.js';
import { AMERICAN_PATTERNS } from './american.js';

const SEAT_FULL = { E: 'East', S: 'South', W: 'West', N: 'North' };
const RULESET_LABEL = { singapore: 'Singapore', hongkong: 'Hong Kong', american: 'American' };
const ruleset = localStorage.getItem('mahjongRuleset') || 'singapore';

let game;
let awaitingHumanDiscard = false;
let awaitingSelfWinDecision = false;

const els = {
  wallCount: document.getElementById('wall-count'),
  tiles: { S: document.getElementById('tiles-S'), W: document.getElementById('tiles-W'), N: document.getElementById('tiles-N'), E: document.getElementById('tiles-E') },
  melds: { S: document.getElementById('meld-S'), W: document.getElementById('meld-W'), N: document.getElementById('meld-N'), E: document.getElementById('meld-E') },
  tags: { S: document.getElementById('tag-S'), W: document.getElementById('tag-W'), N: document.getElementById('tag-N'), E: document.getElementById('tag-E') },
  discardPile: document.getElementById('discard-pile'),
  handHint: document.getElementById('hand-hint'),
  actionRow: document.getElementById('action-row'),
  btnPass: document.getElementById('btn-pass'),
  btnChi: document.getElementById('btn-chi'),
  btnPong: document.getElementById('btn-pong'),
  btnKong: document.getElementById('btn-kong'),
  btnWin: document.getElementById('btn-win'),
  logList: document.getElementById('log-list'),
  scoresList: document.getElementById('scores-list'),
  roundOver: document.getElementById('round-over'),
  roundOverTitle: document.getElementById('round-over-title'),
  roundOverDesc: document.getElementById('round-over-desc'),
  btnPlayAgain: document.getElementById('btn-play-again'),
  tableBrand: document.getElementById('table-brand'),
  patternsSection: document.getElementById('patterns-section'),
  patternsList: document.getElementById('patterns-list'),
};

function delay(ms) { return new Promise((res) => setTimeout(res, ms * botDelayMultiplier())); }

function setupRulesetUi() {
  els.tableBrand.textContent = `Jade Parlour · ${RULESET_LABEL[ruleset]}`;
  if (ruleset !== 'american') return;
  els.patternsSection.classList.add('show');
  els.patternsList.innerHTML = '';
  for (const pattern of AMERICAN_PATTERNS) {
    const row = document.createElement('div');
    row.className = 'pattern-row';
    row.innerHTML = `<span>${pattern.name}</span><span class="pts">${pattern.points}</span>`;
    els.patternsList.appendChild(row);
  }
}

function render() {
  els.wallCount.textContent = `Wall: ${game.wall.length} left`;

  for (const seat of SEATS) {
    const player = game.players[seat];
    els.tiles[seat].innerHTML = '';
    if (seat === 'E') {
      for (const tile of sortHand(player.hand)) {
        const el = createTileElement(tile, { w: 42, h: 58 });
        if (awaitingHumanDiscard) {
          el.style.cursor = 'pointer';
          el.addEventListener('click', () => onHumanDiscard(tile.id));
          el.addEventListener('mouseenter', () => { el.style.transform = 'translateY(-6px)'; });
          el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        }
        els.tiles[seat].appendChild(el);
      }
    } else {
      for (let i = 0; i < player.hand.length; i++) {
        const el = createTileElement({ kind: 'dot' }, { w: 26, h: 36, faceDown: true });
        if (seat === 'W') el.style.transform = 'rotate(90deg)';
        if (seat === 'N') el.style.transform = 'rotate(-90deg)';
        els.tiles[seat].appendChild(el);
      }
    }

    els.melds[seat].innerHTML = '';
    for (const meld of player.melds) {
      const group = document.createElement('div');
      group.className = 'meld-group';
      for (const t of meld.tiles) group.appendChild(createTileElement(t, { w: 24, h: 33 }));
      els.melds[seat].appendChild(group);
    }

    const isTurn = game.currentSeat === seat && !game.roundOver;
    els.tags[seat].classList.toggle('turn', isTurn);
    const label = seat === 'E' ? 'You' : player.name;
    els.tags[seat].querySelector('span').textContent = `${label} · ${SEAT_FULL[seat]}${isTurn ? ' (turn)' : ''}`;
  }

  els.discardPile.innerHTML = '';
  for (const { tile } of game.discardPile.slice(-24)) {
    els.discardPile.appendChild(createTileElement(tile, { w: 30, h: 42 }));
  }

  els.logList.innerHTML = '';
  for (const line of game.log.slice(-8)) {
    const div = document.createElement('div');
    div.textContent = line;
    els.logList.appendChild(div);
  }
  els.logList.scrollTop = els.logList.scrollHeight;

  els.scoresList.innerHTML = '';
  for (const seat of SEATS) {
    const player = game.players[seat];
    const row = document.createElement('div');
    row.className = 'score-row';
    const label = seat === 'E' ? 'You' : player.name;
    const cls = player.score > 0 ? 'pos' : player.score < 0 ? 'neg' : '';
    row.innerHTML = `<span>${label}</span><span class="${cls}">${player.score > 0 ? '+' : ''}${player.score}</span>`;
    els.scoresList.appendChild(row);
  }

  renderActionRow();
}

function renderActionRow() {
  const pending = game.pendingCall;
  const show = !!pending || awaitingSelfWinDecision;
  els.actionRow.style.display = show ? 'flex' : 'none';
  els.btnPass.style.display = show ? 'inline-block' : 'none';
  els.btnChi.style.display = pending?.options?.chi ? 'inline-block' : 'none';
  els.btnPong.style.display = pending?.options?.pong ? 'inline-block' : 'none';
  els.btnKong.style.display = pending?.options?.kong ? 'inline-block' : 'none';
  els.btnWin.style.display = (pending?.options?.win || awaitingSelfWinDecision) ? 'inline-block' : 'none';
  els.handHint.textContent = awaitingHumanDiscard ? 'Your turn — tap a tile to discard' : '';
}

async function takeTurn() {
  if (game.roundOver) { showRoundOver(); return; }
  const seat = game.currentSeat;
  const player = game.players[seat];
  const draw = game.drawForCurrent();
  render();
  if (game.roundOver) { showRoundOver(); return; }

  if (draw.selfWin) {
    if (player.isHuman) {
      awaitingSelfWinDecision = true;
      render();
      return;
    }
    game.declareSelfWin();
    render();
    showRoundOver();
    return;
  }

  if (player.isHuman) {
    awaitingHumanDiscard = true;
    render();
    return;
  }

  await delay(700);
  const tile = chooseDiscard(player.hand);
  await performDiscard(seat, tile.id);
}

async function performDiscard(seat, tileId) {
  const result = game.discard(seat, tileId);
  render();
  if (game.roundOver) { showRoundOver(); return; }
  if (result.type === 'continue') { await delay(500); await takeTurn(); return; }
  if (result.type === 'call') { await afterCall(result.seat); return; }
  // 'awaiting-human-call' just waits for the player to click an action button
}

async function afterCall(seat) {
  render();
  const player = game.players[seat];
  if (seat === 'E') {
    awaitingHumanDiscard = true;
    render();
    return;
  }
  await delay(700);
  const tile = chooseDiscard(player.hand);
  await performDiscard(seat, tile.id);
}

function afterHumanCallResult(result) {
  render();
  if (!result || game.roundOver) { showRoundOver(); return; }
  if (result.type === 'continue') { delay(500).then(takeTurn); }
  else if (result.type === 'call') { afterCall(result.seat); }
}

function onHumanDiscard(tileId) {
  if (!awaitingHumanDiscard) return;
  awaitingHumanDiscard = false;
  performDiscard('E', tileId);
}

function onBtnPass() {
  if (awaitingSelfWinDecision) {
    awaitingSelfWinDecision = false;
    awaitingHumanDiscard = true;
    render();
    return;
  }
  if (game.pendingCall) afterHumanCallResult(game.resolveHumanCall('pass'));
}

function onBtnWin() {
  if (awaitingSelfWinDecision) {
    awaitingSelfWinDecision = false;
    game.declareSelfWin();
    showRoundOver();
    return;
  }
  if (game.pendingCall?.options?.win) afterHumanCallResult(game.resolveHumanCall('win'));
}

function onBtnPong() {
  if (game.pendingCall?.options?.pong) afterHumanCallResult(game.resolveHumanCall('pong'));
}

function onBtnKong() {
  if (game.pendingCall?.options?.kong) afterHumanCallResult(game.resolveHumanCall('kong'));
}

function onBtnChi() {
  const chi = game.pendingCall?.options?.chi;
  if (chi?.length) afterHumanCallResult(game.resolveHumanCall('chi', chi[0]));
}

function showRoundOver() {
  awaitingHumanDiscard = false;
  awaitingSelfWinDecision = false;
  render();
  const ro = game.roundOver;
  if (ro.type === 'draw') {
    els.roundOverTitle.textContent = 'Wall Exhausted';
    els.roundOverDesc.textContent = 'No one completed a hand this round. Scores are unchanged.';
    recordRoundResult(false);
  } else {
    const winner = game.players[ro.winnerSeat];
    const label = ro.winnerSeat === 'E' ? 'You' : winner.name;
    els.roundOverTitle.textContent = ro.winnerSeat === 'E' ? 'You Win!' : `${label} Wins`;
    const how = ro.isSelfDraw ? 'by self-draw' : 'off a discard';
    els.roundOverDesc.textContent = ruleset === 'american'
      ? `${label} won ${how} — "${ro.patternName || 'Hand'}", ${ro.points} points.`
      : `${label} won ${how} — ${ro.tai} ${ro.label || 'tai'}, ${ro.points} points.`;
    recordRoundResult(ro.winnerSeat === 'E');
  }
  els.roundOver.classList.add('show');
}

function startRound() {
  const previousScores = game ? Object.fromEntries(SEATS.map((s) => [s, game.players[s].score])) : null;
  game = new MahjongGame(ruleset);
  if (previousScores) for (const s of SEATS) game.players[s].score = previousScores[s];
  awaitingHumanDiscard = false;
  awaitingSelfWinDecision = false;
  els.roundOver.classList.remove('show');
  render();
  takeTurn();
}

els.btnPass.addEventListener('click', onBtnPass);
els.btnWin.addEventListener('click', onBtnWin);
els.btnPong.addEventListener('click', onBtnPong);
els.btnKong.addEventListener('click', onBtnKong);
els.btnChi.addEventListener('click', onBtnChi);
els.btnPlayAgain.addEventListener('click', startRound);

setupRulesetUi();
startRound();
