/* ================================================= */
/* THEMES — Theme selection and mode switching       */
/* ================================================= */

/**
 * Array of available themes. Each entry has:
 *   id     — theme identifier used in CSS class names
 *   name   — display name with emoji
 *   colors — array of 3 preview swatch colors [accent, secondary, background]
 */
export const THEMES = [
  { id: 'tomato',  name: '\u{1F345} Tomato',       colors: ['#D94F30', '#FFF0E0', '#1a0a04'] },
  { id: 'neo',     name: '\u26A1 Neobrutalism',     colors: ['#e94560', '#ffd93d', '#1a1a2e'] },
  { id: 'term',    name: '\u{1F4BB} Terminal',      colors: ['#00ff41', '#0a0a0a', '#ffff00'] },
  { id: 'cyber',   name: '\u{1F303} Cyberpunk',     colors: ['#00ffff', '#ff00ff', '#0a0014'] },
  { id: 'dracula', name: '\u{1F9DB} Dracula',       colors: ['#ff79c6', '#bd93f9', '#282a36'] },
  { id: 'nord',    name: '\u2744\uFE0F Nord',       colors: ['#88c0d0', '#a3be8c', '#2e3440'] },
  { id: 'solar',   name: '\u2600\uFE0F Solarized',  colors: ['#cb4b16', '#268bd2', '#002b36'] },
  { id: 'candy',   name: '\u{1F36C} Candy',         colors: ['#ff6bcb', '#66eea0', '#1e1030'] },
  { id: 'hacker',  name: '\u{1F47E} Hacker',        colors: ['#ff0000', '#00ff00', '#000000'] },
];

/** Current theme ID (persisted in localStorage). */
export let curTheme = localStorage.getItem('pomo_theme') || 'tomato';
export function setCurTheme(val) { curTheme = val; }

/** Current mode: 'dark' or 'light' (persisted in localStorage). */
export let curMode = localStorage.getItem('pomo_mode') || 'dark';
export function setCurMode(val) { curMode = val; }

/**
 * Apply the current theme + mode to the document body.
 * Sets the appropriate CSS class, persists to localStorage,
 * and triggers a chart re-render via setTimeout.
 *
 * The default theme (tomato-dark) uses :root variables so no class is needed.
 * All other combinations use body.{themeId}-{mode} CSS classes.
 */
export function applyTheme() {
  document.body.className = '';
  if (!(curTheme === 'tomato' && curMode === 'dark')) {
    document.body.className = curTheme + '-' + curMode;
  }
  localStorage.setItem('pomo_theme', curTheme);
  localStorage.setItem('pomo_mode', curMode);
}

/**
 * Render the theme option grid inside the theme modal.
 * Highlights the currently selected theme and updates mode toggle buttons.
 */
export function renderThemeGrid() {
  document.getElementById('theme-grid').innerHTML = THEMES.map(t => `
    <div class="theme-option ${curTheme === t.id ? 'active' : ''}" data-action="set-theme" data-id="${t.id}">
      <div class="theme-option-name">${t.name}</div>
      <div class="theme-option-preview">${t.colors.map(c => `<span style="background:${c};"></span>`).join('')}</div>
    </div>`).join('');
  document.getElementById('mode-dark').classList.toggle('active', curMode === 'dark');
  document.getElementById('mode-light').classList.toggle('active', curMode === 'light');
}
