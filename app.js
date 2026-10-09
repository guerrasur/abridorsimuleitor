import { initCardPull } from './card-pull.js?v=1.7.0';
import { initPackSwipe } from './pack-swipe.js?v=1.7.0';
import { generateCharacter, isCharacter, normalizeCharacter, renderCharacter, characterName, characterDescription, TRAITS } from './characters.js?v=1.7.0';
import { APP_VERSION } from './version.js?v=1.7.0';
import { initCardMotion } from './card-motion.js?v=1.7.0';
import { initUpdater } from './updater.js?v=1.7.0';

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

initCardMotion(card, motion, document.getElementById('motion-hint'), { getCard: () => state === 'opened' ? card : null });
// The helper controls sensor availability. Keep its button out of the closed view.
const sensorAvailable = !motion.hidden;
motion.hidden = true;

function showCard() {
  state = 'opened';
  scene.className = 'scene opened';
  lift.inert = false;
  lift.removeAttribute('role');
  lift.removeAttribute('tabindex');
  lift.style.removeProperty('transform');
  instruction.textContent = 'Mové la carta para ver el reflejo';
  reset.hidden = false;
  motion.hidden = !sensorAvailable || reducedMotion.matches;
  window.dispatchEvent(new Event('abridor-idle'));
}

async function openPack() {
  if (state !== 'closed') return;
  state = 'opening';
  character = generateCharacter();
  paintCharacter();
  open.disabled = true;
  instruction.textContent = 'Abriendo…';
  scene.classList.add('opening');
  await wait(480);
  scene.classList.add('revealing');
  if (!reducedMotion.matches && typeof lift.animate === 'function') {
    const animation = lift.animate([
      { transform: 'translateY(30px) scale(.94)' },
      { transform: 'translateY(-116px) scale(.96)', offset: .8 },
      { transform: 'translateY(-110px) scale(.96)' }
    ], { duration: 950, easing: 'cubic-bezier(.22,.8,.25,1)', fill: 'forwards' });
    await animation.finished.catch(() => {});
    showPeek();
    animation.cancel();
  } else showPeek();
}

function showPeek() {
  state = 'peek';
  scene.className = 'scene peek';
  lift.inert = false;
  lift.setAttribute('role', 'button');
  lift.setAttribute('tabindex', '0');
  lift.setAttribute('aria-label', 'Arrastrá la carta hacia arriba para sacarla');
  instruction.textContent = 'Arrastrá la carta hacia arriba para sacarla';
  window.dispatchEvent(new Event('abridor-idle'));
}

async function extractCard(pull = 0) {
  if (state !== 'peek') return;
  state = 'extracting';
  scene.className = 'scene extracting';
  lift.inert = true;
  if (!reducedMotion.matches && typeof lift.animate === 'function') {
    const drop = window.innerHeight * 2 + 420;
    const animations = [lift.animate([
      { transform: `translateY(${-110 - pull}px) scale(.96)` },
      { transform: 'translateY(0) scale(1)' }
    ], { duration: 900, easing: 'cubic-bezier(.22,.8,.25,1)', fill: 'forwards' }),
    ...['.envelope-front', '.envelope-back'].map(selector => scene.querySelector(selector).animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: 'translateY(80px) rotate(3deg)', opacity: 1, offset: .3 },
      { transform: `translateY(${drop}px) rotate(16deg)`, opacity: 1 }
    ], { duration: 900, easing: 'cubic-bezier(.45,0,.8,.45)', fill: 'forwards' }))];
    await Promise.all(animations.map(a => a.finished.catch(() => {})));
    showCard();
    animations.forEach(a => a.cancel());
  } else showCard();
}

const pull = initCardPull(lift, {
  canStart: () => state === 'peek',
  onPull: amount => { lift.style.transform = `translateY(${-110 - amount}px) scale(.96)`; },
  onRelease: extractCard,
  onCancel: () => { lift.style.removeProperty('transform'); window.dispatchEvent(new Event('abridor-idle')); }
});

const swipe = initPackSwipe(open, {
  canStart: () => state === 'closed',
  onOpen: openPack,
  onIdle: () => window.dispatchEvent(new Event('abridor-idle'))
});
open.addEventListener('click', openPack);

reset.addEventListener('click', () => {
  state = 'closed';
  swipe.reset();
  lift.style.removeProperty('transform');
  lift.removeAttribute('role');
  lift.removeAttribute('tabindex');
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
  const savedState = sessionStorage.getItem('abridor-reveal');
  if (['opened', 'peek'].includes(savedState)) {
    character = isCharacter(saved) ? saved : generateCharacter();
    paintCharacter();
    if (savedState === 'peek') showPeek(); else showCard();
  }
  sessionStorage.removeItem('abridor-reveal');
} catch {}

initUpdater(APP_VERSION, {
  isBusy: () => ['opening', 'extracting'].includes(state) || swipe.isDragging() || pull.isDragging(),
  saveState: () => { try { sessionStorage.setItem('abridor-reveal', state); sessionStorage.setItem('abridor-character', JSON.stringify(character)); } catch {} }
});
