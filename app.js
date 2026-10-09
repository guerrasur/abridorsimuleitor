import { CATALOG, pickCard, catalogCard } from './catalog.js?v=1.8.0';
import { initCardPull } from './card-pull.js?v=1.8.0';
import { initPackSwipe } from './pack-swipe.js?v=1.8.0';
import { generateCharacter, isCharacter, normalizeCharacter, renderCharacter, characterName, characterDescription, TRAITS } from './characters.js?v=1.8.0';
import { APP_VERSION } from './version.js?v=1.8.0';
import { initCardMotion } from './card-motion.js?v=1.8.0';
import { initUpdater } from './updater.js?v=1.8.0';

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
let browsing = false, previousCard = null, previousState = 'closed';
const album = document.getElementById('album');
const browseControls = document.getElementById('browse-controls');
const pose = amount => `translateY(${-110 - amount}px) scale(.96)`;
function paintCharacter() {
  document.getElementById('character-art').innerHTML = renderCharacter(character);
  document.getElementById('character-name').textContent = characterName(character);
  const number = String(character.number || 1).padStart(3, '0');
  document.getElementById('card-number').textContent = number;
  document.getElementById('card-label').textContent = `CARTA ${number}`;
  document.getElementById('catalog-position').textContent = `${number} / 089`;
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
  reset.hidden = browsing;
  album.disabled = false;
  motion.hidden = !sensorAvailable || reducedMotion.matches;
  window.dispatchEvent(new Event('abridor-idle'));
}

async function openPack() {
  if (state !== 'closed') return;
  state = 'opening';
  album.disabled = true;
  character = pickCard();
  paintCharacter();
  open.disabled = true;
  instruction.textContent = 'Abriendo…';
  scene.classList.add('opening');
  await wait(260);
  scene.classList.add('revealing');
  if (!reducedMotion.matches && typeof lift.animate === 'function') {
    const animation = lift.animate([
      { transform: 'translateY(30px) scale(.94)' },
      { transform: 'translateY(-116px) scale(.96)', offset: .78 },
      { transform: 'translateY(-110px) scale(.96)' }
    ], { duration: 620, easing: 'cubic-bezier(.22,.8,.25,1)', fill: 'forwards' });
    await animation.finished.catch(() => {});
    showPeek();
    animation.cancel();
  } else showPeek();
}

function showPeek() {
  state = 'peek';
  album.disabled = false;
  scene.className = 'scene peek';
  reset.hidden = true; motion.hidden = true; open.disabled = true;
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
  album.disabled = true;
  scene.className = 'scene extracting';
  lift.inert = true;
  if (!reducedMotion.matches && typeof lift.animate === 'function') {
    const drop = window.innerHeight * 2 + 420;
    const animations = [lift.animate([
      { transform: pose(pull), offset: 0 },
      { transform: pose(pull + 8), offset: .42 },
      { transform: 'translateY(4px) scale(1)', offset: .88 },
      { transform: 'translateY(0) scale(1)' }
    ], { duration: 760, easing: 'cubic-bezier(.22,.8,.25,1)', fill: 'forwards' }),
    ...['.envelope-front', '.envelope-back'].map(selector => scene.querySelector(selector).animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: 'translateY(430px) rotate(6deg)', opacity: 1, offset: .48 },
      { transform: `translateY(${drop}px) rotate(16deg)`, opacity: 1 }
    ], { duration: 650, easing: 'cubic-bezier(.42,0,.75,.5)', fill: 'forwards' }))];
    await Promise.all(animations.map(a => a.finished.catch(() => {})));
    lift.style.removeProperty('transform');
    showCard();
    animations.forEach(a => a.cancel());
  } else showCard();
}

const pull = initCardPull(lift, {
  canStart: () => state === 'peek',
  onPull: amount => { lift.style.transform = pose(amount); },
  onRelease: extractCard,
  onCancel: async amount => {
    state = 'returning';
    const animation = !reducedMotion.matches && lift.animate ? lift.animate([
      { transform: pose(amount) }, { transform: pose(-3), offset: .75 }, { transform: pose(0) }
    ], { duration: 280, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' }) : null;
    if (animation) await animation.finished.catch(() => {});
    lift.style.removeProperty('transform');
    animation?.cancel();
    showPeek();
  }
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
  pull.reset();
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

// A simple viewer, without collection ownership or album layout yet.
album.addEventListener('click', () => {
  if (!['closed', 'peek', 'opened'].includes(state) || pull.isDragging() || swipe.isDragging()) return;
  if (!browsing) {
    previousCard = character; previousState = state; browsing = true;
    character = catalogCard(character?.number) || CATALOG[0];
    album.textContent = 'Volver al sobre'; browseControls.hidden = false;
    paintCharacter(); showCard();
  } else {
    browsing = false; album.textContent = 'Ver personajes'; browseControls.hidden = true;
    character = previousCard;
    if (character) paintCharacter();
    if (previousState === 'peek') showPeek();
    else if (previousState === 'opened') showCard();
    else reset.click();
  }
});
for (const [id, step] of [['previous-character', -1], ['next-character', 1]]) {
  document.getElementById(id).addEventListener('click', () => {
    if (!browsing) return;
    character = CATALOG[(character.number - 1 + step + CATALOG.length) % CATALOG.length];
    paintCharacter(); card.dispatchEvent(new Event('cardchange'));
  });
}

// Restore the revealed card after an automatic update instead of interrupting it.
try {
  const saved = normalizeCharacter(JSON.parse(sessionStorage.getItem('abridor-character') || 'null')); 
  const savedState = sessionStorage.getItem('abridor-reveal');
  if (['opened', 'peek'].includes(savedState)) {
    character = catalogCard(saved?.number) || pickCard();
    paintCharacter();
    if (savedState === 'peek') showPeek(); else showCard();
  }
  sessionStorage.removeItem('abridor-reveal');
} catch {}

initUpdater(APP_VERSION, {
  isBusy: () => ['opening', 'extracting', 'returning'].includes(state) || swipe.isDragging() || pull.isDragging(),
  saveState: () => { try { sessionStorage.setItem('abridor-reveal', browsing ? previousState : state); sessionStorage.setItem('abridor-character', JSON.stringify(browsing ? previousCard : character)); } catch {} }
});
