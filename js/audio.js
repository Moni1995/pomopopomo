/* ================================================= */
/* AUDIO — Web Audio API oscillator-based sounds     */
/* ================================================= */

let audioCtx = null;

function getAC() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  } catch (e) {
    return null;
  }
}

/**
 * Short click sound for UI feedback.
 */
export function playTick() {
  try {
    const c = getAC();
    if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(600, c.currentTime);
    g.gain.setValueAtTime(.08, c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .05);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + .05);
  } catch (e) { /* browser blocked AudioContext */ }
}

/**
 * Resume a suspended AudioContext (must be called from a user gesture).
 */
export function resumeAudio() {
  try {
    const c = getAC();
    if (c && c.state === 'suspended') c.resume();
  } catch (e) { /* ignored */ }
}

/**
 * Longer chime/ring for timer completion.
 */
export function playRing() {
  try {
    const c = getAC();
    if (!c) return;
    [880, 1100, 880].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, c.currentTime + i * .25);
      g.gain.setValueAtTime(.3, c.currentTime + i * .25);
      g.gain.exponentialRampToValueAtTime(.01, c.currentTime + i * .25 + .2);
      o.connect(g);
      g.connect(c.destination);
      o.start(c.currentTime + i * .25);
      o.stop(c.currentTime + i * .25 + .25);
    });
  } catch (e) { /* browser blocked AudioContext */ }
}
