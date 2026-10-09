import { APP_VERSION } from './version.js?v=1.1.0';
import { initCardMotion } from './card-motion.js?v=1.1.0';
import { initUpdater } from './updater.js?v=1.1.0';

const scene = document.getElementById('scene');
const open = document.getElementById('open');
const reset = document.getElementById('reset');
const motion = document.getElementById('motion');
const card = document.getElementById('card');
const lift = document.getElementById('card-lift');
const instruction = document.getElementById('instruction');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let state = 'closed';
const wait = ms => new Promise(resolve => setTimeout(resolve, reducedMotion.matches ? 0 : ms));

initCardMotion(card, motion, document.getElementById('motion-hint'));
// The helper controls sensor availability. Keep its button out of the closed view.
const sensorAvailable = !motion.hidden;
motion.hidden = true;

function showCard() {
  state = 'opened';
  scene.className = 'scene opened';
  lift.inert = false;
  instruction.textContent = 'Mové la carta para ver el reflejo';
  reset.hidden = false;
  motion.hidden = !sensorAvailable || reducedMotion.matches;
  window.dispatchEvent(new Event('abridor-idle'));
}

open.addEventListener('click', async () => {
  if (state !== 'closed') return;
  state = 'opening';
  open.disabled = true;
  instruction.textContent = 'Abriendo…';
  scene.classList.add('opening');
  await wait(650);
  scene.classList.add('revealing');
  await wait(1200);
  showCard();
});

reset.addEventListener('click', () => {
  state = 'closed';
  scene.className = 'scene';
  lift.inert = true;
  open.disabled = false;
  reset.hidden = true;
  motion.hidden = true;
  instruction.textContent = 'Tocá la esquina de arriba';
  card.dispatchEvent(new Event('cardchange'));
  open.focus({ preventScroll: true });
});

// Restore the revealed card after an automatic update instead of interrupting it.
try {
  if (sessionStorage.getItem('abridor-reveal') === 'opened') showCard();
  sessionStorage.removeItem('abridor-reveal');
} catch {}

initUpdater(APP_VERSION, {
  isBusy: () => state === 'opening',
  saveState: () => { try { sessionStorage.setItem('abridor-reveal', state); } catch {} }
});
