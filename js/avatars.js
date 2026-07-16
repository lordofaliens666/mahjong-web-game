// Profile icons: five flowers with deep roots in Cantonese/Lingnan culture —
// plum, orchid and chrysanthemum are three of the classical "Four Gentlemen" 四君子,
// kapok is Guangzhou's city flower ("Hero Flower" 英雄花), and bauhinia is Hong Kong's emblem.
const AVATAR_KEY = 'mahjongAvatarIcon';

export const AVATAR_OPTIONS = [
  { id: 'plum', name: 'Plum Blossom', hanzi: '梅花', petals: 5, petalColor: '#d88a9a', centerColor: '#c9a24a', shape: 'round' },
  { id: 'orchid', name: 'Orchid', hanzi: '蘭花', petals: 5, petalColor: '#8a6bb0', centerColor: '#f4f1e8', shape: 'narrow' },
  { id: 'chrysanthemum', name: 'Chrysanthemum', hanzi: '菊花', petals: 16, petalColor: '#e0b23a', centerColor: '#8a5a2a', shape: 'thin' },
  { id: 'kapok', name: 'Kapok', hanzi: '木棉花', petals: 5, petalColor: '#c0392b', centerColor: '#f4d35e', shape: 'broad' },
  { id: 'bauhinia', name: 'Bauhinia', hanzi: '洋紫荊', petals: 5, petalColor: '#b0499a', centerColor: '#f4f1e8', shape: 'curved' },
];

const SHAPE_BUILDERS = {
  round: (angle, color) => `<ellipse cx="32" cy="17" rx="9" ry="15" fill="${color}" transform="rotate(${angle} 32 32)"/>`,
  narrow: (angle, color) => `<ellipse cx="32" cy="15" rx="5" ry="17" fill="${color}" transform="rotate(${angle} 32 32)"/>`,
  thin: (angle, color) => `<ellipse cx="32" cy="13" rx="2.5" ry="19" fill="${color}" transform="rotate(${angle} 32 32)"/>`,
  broad: (angle, color) => `<ellipse cx="32" cy="18" rx="11" ry="14" fill="${color}" transform="rotate(${angle} 32 32)"/>`,
  curved: (angle, color) => `<path d="M32 32 C 27 21, 19 15, 32 5 C 45 15, 37 21, 32 32 Z" fill="${color}" transform="rotate(${angle} 32 32)"/>`,
};

export function avatarSVG(option) {
  const petals = [];
  for (let i = 0; i < option.petals; i++) {
    const angle = (360 / option.petals) * i;
    petals.push(SHAPE_BUILDERS[option.shape](angle, option.petalColor));
  }
  return `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">${petals.join('')}<circle cx="32" cy="32" r="6" fill="${option.centerColor}"/></svg>`;
}

export function getAvatarId() {
  try {
    return localStorage.getItem(AVATAR_KEY) || AVATAR_OPTIONS[0].id;
  } catch {
    return AVATAR_OPTIONS[0].id;
  }
}

export function setAvatarId(id) {
  try { localStorage.setItem(AVATAR_KEY, id); } catch { /* storage unavailable */ }
}

export function getAvatarOption(id = getAvatarId()) {
  return AVATAR_OPTIONS.find((o) => o.id === id) || AVATAR_OPTIONS[0];
}
