import { PALETTES, THEME_LABEL, applyTheme, getSettings, saveSettings } from './theme.js';

export function mountSettingsModal() {
  const trigger = document.getElementById('nav-settings-btn');
  if (!trigger) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <h2>Settings</h2>
      <p class="modal-sub">Changes apply immediately and are saved on this device.</p>
      <div class="modal-section">
        <div class="modal-section-label">Table Theme</div>
        <div class="swatch-row" id="theme-swatches"></div>
      </div>
      <div class="modal-section">
        <div class="modal-section-label">Bot Speed</div>
        <div class="segmented" id="bot-speed-control">
          <button type="button" data-speed="slow">Slow</button>
          <button type="button" data-speed="normal">Normal</button>
          <button type="button" data-speed="fast">Fast</button>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" id="settings-close" type="button">Done</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const swatchRow = overlay.querySelector('#theme-swatches');
  for (const key of Object.keys(PALETTES)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.title = THEME_LABEL[key] || key;
    btn.style.background = `linear-gradient(135deg, ${PALETTES[key].plum}, ${PALETTES[key].olive})`;
    btn.dataset.theme = key;
    btn.addEventListener('click', () => {
      applyTheme(key);
      saveSettings({ theme: key });
      renderActiveStates();
    });
    swatchRow.appendChild(btn);
  }

  overlay.querySelectorAll('#bot-speed-control button').forEach((btn) => {
    btn.addEventListener('click', () => {
      saveSettings({ botSpeed: btn.dataset.speed });
      renderActiveStates();
    });
  });

  function renderActiveStates() {
    const settings = getSettings();
    swatchRow.querySelectorAll('.swatch').forEach((el) => el.classList.toggle('active', el.dataset.theme === settings.theme));
    overlay.querySelectorAll('#bot-speed-control button').forEach((el) => el.classList.toggle('active', el.dataset.speed === settings.botSpeed));
  }

  trigger.addEventListener('click', () => { renderActiveStates(); overlay.classList.add('show'); });
  overlay.querySelector('#settings-close').addEventListener('click', () => overlay.classList.remove('show'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('show'); });
}
