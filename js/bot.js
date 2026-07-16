// Heuristic bot discard choice: keep triplets/pairs and sequence-adjacent
// tiles, discard the most isolated tile in hand.
export function chooseDiscard(hand) {
  const counts = {};
  for (const t of hand) counts[t.typeIndex] = (counts[t.typeIndex] || 0) + 1;

  function score(t) {
    let s = 0;
    const c = counts[t.typeIndex];
    if (c >= 3) s += 100;
    else if (c === 2) s += 60;
    if (t.typeIndex != null && t.typeIndex >= 0 && t.typeIndex < 27) {
      const suitBase = Math.floor(t.typeIndex / 9) * 9;
      const pos = t.typeIndex - suitBase;
      for (const d of [-2, -1, 1, 2]) {
        const idx = pos + d;
        if (idx >= 0 && idx < 9 && counts[suitBase + idx]) s += Math.abs(d) === 1 ? 18 : 8;
      }
    } else if (c === 1) {
      s -= 5;
    }
    return s;
  }

  let worst = hand[0];
  let worstScore = Infinity;
  for (const t of hand) {
    const s = score(t);
    if (s < worstScore) { worstScore = s; worst = t; }
  }
  return worst;
}
