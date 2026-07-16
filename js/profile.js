const STATS_KEY = 'mahjongProfileStats';
const DEFAULT_STATS = { gamesPlayed: 0, gamesWon: 0 };

export function getStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? { ...DEFAULT_STATS, ...JSON.parse(raw) } : { ...DEFAULT_STATS };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function recordRoundResult(won) {
  const stats = getStats();
  stats.gamesPlayed += 1;
  if (won) stats.gamesWon += 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

function resetStats() {
  localStorage.removeItem(STATS_KEY);
}

export function mountProfileModal() {
  const trigger = document.getElementById('nav-avatar-btn');
  if (!trigger) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <h2>Guest Player</h2>
      <p class="modal-sub">You're playing as East — no account needed for this prototype.</p>
      <div class="modal-section">
        <div class="modal-section-label">Lifetime Stats</div>
        <div id="profile-stats"></div>
      </div>
      <div class="modal-actions" style="justify-content:space-between">
        <button class="btn-text" id="profile-reset" type="button">Reset stats</button>
        <button class="btn btn-primary" id="profile-close" type="button">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  function renderStats() {
    const stats = getStats();
    const winRate = stats.gamesPlayed ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    overlay.querySelector('#profile-stats').innerHTML = `
      <div class="stat-row"><span>Rounds played</span><span>${stats.gamesPlayed}</span></div>
      <div class="stat-row"><span>Rounds won</span><span>${stats.gamesWon}</span></div>
      <div class="stat-row"><span>Win rate</span><span>${winRate}%</span></div>
    `;
  }

  trigger.addEventListener('click', () => { renderStats(); overlay.classList.add('show'); });
  overlay.querySelector('#profile-close').addEventListener('click', () => overlay.classList.remove('show'));
  overlay.querySelector('#profile-reset').addEventListener('click', () => { resetStats(); renderStats(); });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('show'); });
}
