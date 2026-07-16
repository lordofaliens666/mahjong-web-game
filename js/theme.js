// Table color themes + persisted per-device settings (theme, bot speed).
export const PALETTES = {
  jade: {
    ink: '#302b1a', cream: '#f4f1e8', card: '#f2f0e8', bg: '#eae6da',
    plum: '#613c4e', 'plum-dark': '#4a2d3d', olive: '#7c8850', 'olive-light': '#9fa764',
    gold: '#c9a24a', brown: '#816a60',
  },
  amethyst: {
    ink: '#2e1f38', cream: '#f5f1f8', card: '#f1eef7', bg: '#e8e3ee',
    plum: '#5b3a75', 'plum-dark': '#432a58', olive: '#7d6aa8', 'olive-light': '#a594c9',
    gold: '#c9a24a', brown: '#7a6a8a',
  },
  crimson: {
    ink: '#341c1c', cream: '#f8efe9', card: '#f7ece7', bg: '#f0e4de',
    plum: '#8a2e2e', 'plum-dark': '#661f1f', olive: '#c17a3e', 'olive-light': '#d69b5f',
    gold: '#d9a441', brown: '#8a5a45',
  },
  ocean: {
    ink: '#1c2e30', cream: '#eaf2f2', card: '#eef3f4', bg: '#e2e8ea',
    plum: '#2d5f6b', 'plum-dark': '#1f4650', olive: '#4a8a7a', 'olive-light': '#6fada0',
    gold: '#c9a24a', brown: '#5a7880',
  },
};

export const THEME_LABEL = { jade: 'Jade', amethyst: 'Amethyst', crimson: 'Crimson', ocean: 'Ocean' };

const SETTINGS_KEY = 'mahjongSettings';
const DEFAULT_SETTINGS = { theme: 'jade', botSpeed: 'normal' };

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

export function applyTheme(name) {
  const palette = PALETTES[name] || PALETTES.jade;
  const root = document.documentElement.style;
  for (const [key, value] of Object.entries(palette)) root.setProperty(`--${key}`, value);
}

export function applySavedTheme() {
  applyTheme(getSettings().theme);
}

export function botDelayMultiplier() {
  return { slow: 1.8, normal: 1, fast: 0.4 }[getSettings().botSpeed] || 1;
}
