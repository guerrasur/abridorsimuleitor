import { generateCharacter, isCharacter, normalizeCharacter, renderCharacter, characterName, characterDescription, TRAITS } from './characters.js?v=1.3.0';
import { APP_VERSION } from './version.js?v=1.3.0';
import { initCardMotion } from './card-motion.js?v=1.3.0';
import { initUpdater } from './updater.js?v=1.3.0';

const scene = document.getElementById('scene');
const open = document.getElementById('open');
const reset = document.getElementById('reset');
const motion = document.getElementById('motion');
const card = document.getElementById('card');
const lift = document.getElementById('card-lift');
const instruction = document.getElementById('instruction');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let state = 'closed';
let character = null;
function paintCharacter() {
  document.getElementById('character-art').innerHTML = renderCharacter(character);
  document.getElementById('character-name').textContent = characterName(character);
  const t = character.traits;
  document.getElementById('character-traits').textContent = `${TRAITS.skin[t.skin]} · ${TRAITS.head[t.head]} · ${TRAITS.outfit[t.outfit]}`;
  card.setAttribute('aria-label', `${characterName(character)}. ${characterDescription(character)}`);
  card.title = characterDescription(character);
}
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
  character = generateCharacter();
  paintCharacter();
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
  const saved = normalizeCharacter(JSON.parse(sessionStorage.getItem('abridor-character') || 'null')); 
  if (sessionStorage.getItem('abridor-reveal') === 'opened') {
    character = isCharacter(saved) ? saved : generateCharacter();
    paintCharacter();
    showCard();
  }
  sessionStorage.removeItem('abridor-reveal');
} catch {}

initUpdater(APP_VERSION, {
  isBusy: () => state === 'opening',
  saveState: () => { try { sessionStorage.setItem('abridor-reveal', state); sessionStorage.setItem('abridor-character', JSON.stringify(character)); } catch {} }
});
