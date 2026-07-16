// Tile palette + rendering, ported from the MahjongTile design component.
export const PLUM = '#613c4e';
export const PLUM_DARK = '#4a2d3d';
export const OLIVE = '#7c8850';
export const INK = '#302b1a';
export const CREAM = '#f4f1e8';
export const GOLD = '#c9a24a';

const NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const SUIT_LABEL = { dot: 'CIRCLES', bam: 'BAMBOO', char: 'MYRIAD', flower: 'FLOWER' };
const SUIT_NAME = { dot: 'Circles', bam: 'Bamboo', char: 'Myriad' };
const WIND_NAME = { '東': 'East', '南': 'South', '西': 'West', '北': 'North' };
const DRAGON_NAME = { '中': 'Red', '發': 'Green', '白': 'White' };
export const WIND_LABELS = ['東', '南', '西', '北'];
export const DRAGON_LABELS = ['中', '發', '白'];

// typeIndex 0-33 identifies the 34 matchable tile types (flowers have no typeIndex).
export function buildWall() {
  const tiles = [];
  let id = 0;
  ['dot', 'bam', 'char'].forEach((kind, si) => {
    for (let n = 1; n <= 9; n++) {
      for (let c = 0; c < 4; c++) {
        tiles.push({ id: id++, kind, n, label: '', typeIndex: si * 9 + (n - 1) });
      }
    }
  });
  WIND_LABELS.forEach((label, wi) => {
    for (let c = 0; c < 4; c++) tiles.push({ id: id++, kind: 'wind', n: wi + 1, label, typeIndex: 27 + wi });
  });
  DRAGON_LABELS.forEach((label, di) => {
    for (let c = 0; c < 4; c++) tiles.push({ id: id++, kind: 'dragon', n: di + 1, label, typeIndex: 31 + di });
  });
  for (let n = 1; n <= 8; n++) {
    tiles.push({ id: id++, kind: 'flower', n, label: '', typeIndex: -1 });
  }
  return tiles;
}

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function tileName(tile) {
  if (tile.kind === 'dot' || tile.kind === 'bam' || tile.kind === 'char') return `${tile.n} ${SUIT_NAME[tile.kind]}`;
  if (tile.kind === 'wind') return `${WIND_NAME[tile.label]} Wind`;
  if (tile.kind === 'dragon') return `${DRAGON_NAME[tile.label]} Dragon`;
  if (tile.kind === 'flower') return `Flower ${tile.n}`;
  return 'Tile';
}

const KIND_ORDER = { dot: 0, bam: 1, char: 2, wind: 3, dragon: 4, flower: 5 };
export function sortHand(tiles) {
  return [...tiles].sort((a, b) => {
    if (KIND_ORDER[a.kind] !== KIND_ORDER[b.kind]) return KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
    return a.n - b.n;
  });
}

export function createTileElement(tile, { w = 56, h = 76, faceDown = false } = {}) {
  const kind = tile.kind;
  const n = tile.n || 1;
  const label = tile.label || '';
  const scale = w / 56;
  const kindColor = { dot: PLUM, bam: OLIVE, char: INK, flower: GOLD }[kind] || PLUM;

  const root = document.createElement('div');
  root.className = 'mj-tile';
  root.style.cssText = `position:relative;width:${w}px;height:${h}px;border-radius:${6 * scale}px;background:linear-gradient(180deg,${CREAM} 0%,#eae5d6 100%);box-shadow:0 ${2 * scale}px 0 ${1 * scale}px rgba(48,43,26,0.28),0 ${2 * scale}px ${5 * scale}px rgba(48,43,26,0.35);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;flex:none;font-family:'Cormorant Garamond',Georgia,serif;`;

  if (faceDown) {
    const back = document.createElement('div');
    back.style.cssText = `position:absolute;inset:0;background:linear-gradient(145deg,${PLUM} 0%,${PLUM_DARK} 100%);`;
    const gem = document.createElement('div');
    gem.style.cssText = `position:absolute;width:${w * 0.34}px;height:${w * 0.34}px;background:${OLIVE};opacity:0.55;transform:translate(-50%,-50%) rotate(45deg);top:50%;left:50%;border-radius:${2 * scale}px;box-shadow:0 0 0 ${1.5 * scale}px rgba(244,241,232,0.35);`;
    root.append(back, gem);
    return root;
  }

  const innerBorder = document.createElement('div');
  innerBorder.style.cssText = `position:absolute;inset:${3 * scale}px;border:1px solid rgba(48,43,26,0.12);border-radius:${4 * scale}px;`;
  root.appendChild(innerBorder);

  const isNumeric = kind === 'dot' || kind === 'bam' || kind === 'char' || kind === 'flower';
  const isHonor = kind === 'wind' || kind === 'dragon';

  if (isNumeric) {
    const iconWrap = document.createElement('div');
    iconWrap.style.cssText = `display:flex;align-items:center;justify-content:center;height:${28 * scale}px;margin-top:${4 * scale}px;`;
    if (kind === 'dot') {
      const dot = document.createElement('div');
      dot.style.cssText = `width:${16 * scale}px;height:${16 * scale}px;border-radius:50%;background:${kindColor};box-shadow:inset 0 -${2 * scale}px ${3 * scale}px rgba(0,0,0,0.25);`;
      iconWrap.appendChild(dot);
    } else if (kind === 'bam') {
      const wrap = document.createElement('div');
      wrap.style.cssText = `display:flex;gap:${3 * scale}px;align-items:flex-end;`;
      for (let i = 0; i < 3; i++) {
        const bar = document.createElement('div');
        bar.style.cssText = `width:${5 * scale}px;height:${20 * scale}px;border-radius:${2 * scale}px;background:${kindColor};`;
        wrap.appendChild(bar);
      }
      iconWrap.appendChild(wrap);
    } else if (kind === 'char') {
      const glyph = document.createElement('div');
      glyph.style.cssText = `font-family:'Noto Serif SC',serif;font-weight:700;font-size:${24 * scale}px;color:${kindColor};line-height:1;`;
      glyph.textContent = NUMERALS[(n - 1) % 9] || '一';
      iconWrap.appendChild(glyph);
    } else if (kind === 'flower') {
      const fd = document.createElement('div');
      fd.style.cssText = `width:${18 * scale}px;height:${18 * scale}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e8caa0,${kindColor});`;
      iconWrap.appendChild(fd);
    }
    root.appendChild(iconWrap);

    const numeral = document.createElement('div');
    numeral.style.cssText = `font-family:'Cormorant Garamond',serif;font-weight:700;font-size:${15 * scale}px;color:${kindColor};margin-top:${2 * scale}px;line-height:1;`;
    numeral.textContent = String(n);
    root.appendChild(numeral);

    const suitLabel = document.createElement('div');
    suitLabel.style.cssText = `font-family:system-ui,sans-serif;font-size:${6.5 * scale}px;letter-spacing:0.12em;color:${INK};opacity:0.45;margin-top:${2 * scale}px;`;
    suitLabel.textContent = SUIT_LABEL[kind] || '';
    root.appendChild(suitLabel);
  } else if (isHonor) {
    let honorColor = PLUM;
    if (kind === 'dragon') {
      if (label === '發') honorColor = OLIVE;
      else if (label === '白') honorColor = 'transparent';
      else honorColor = PLUM_DARK;
    }
    const honorLabelText = kind === 'wind' ? 'WIND' : (label === '白' ? 'BLANK' : 'DRAGON');

    const honorGlyphEl = document.createElement('div');
    let style = `font-family:'Noto Serif SC',serif;font-weight:700;font-size:${30 * scale}px;color:${honorColor === 'transparent' ? 'rgba(48,43,26,0.28)' : honorColor};line-height:1;`;
    if (label === '白') {
      style += `border:${1.5 * scale}px solid rgba(48,43,26,0.3);width:${26 * scale}px;height:${26 * scale}px;display:flex;align-items:center;justify-content:center;border-radius:${3 * scale}px;`;
    }
    honorGlyphEl.style.cssText = style;
    honorGlyphEl.textContent = label === '白' ? '' : (label || '東');
    root.appendChild(honorGlyphEl);

    const honorLabelEl = document.createElement('div');
    honorLabelEl.style.cssText = `font-family:system-ui,sans-serif;font-size:${6.5 * scale}px;letter-spacing:0.12em;color:${INK};opacity:0.45;margin-top:${6 * scale}px;`;
    honorLabelEl.textContent = honorLabelText;
    root.appendChild(honorLabelEl);
  }

  return root;
}
