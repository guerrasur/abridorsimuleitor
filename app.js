import { initPackSwipe } from './pack-swipe.js?v=1.6.0';
import { generateCharacter, isCharacter, normalizeCharacter, renderCharacter, characterName, characterDescription, TRAITS } from './characters.js?v=1.6.0';
import { APP_VERSION } from './version.js?v=1.6.0';
import { initCardMotion } from './card-motion.js?v=1.6.0';
import { initUpdater } from './updater.js?v=1.6.0';

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
    // The card rises; the opaque wrapper drops completely beyond the viewport.
    const rise = Math.max(35, Math.min(135, scene.getBoundingClientRect().top - 35));
    const drop = window.innerHeight * 2 + 420;
    const animations = [
      lift.animate([
        { transform: 'translateY(30px) scale(.94)', opacity: 1, offset: 0 },
        { transform: `translateY(${-rise}px) scale(.98) rotate(-2deg)`, opacity: 1, offset: .62 },
        { transform: 'translateY(0) scale(1) rotate(0deg)', opacity: 1, offset: 1 }
      ], { duration: 1450, easing: 'cubic-bezier(.22,.8,.25,1)', fill: 'forwards' }),
      ...['.envelope-front', '.envelope-back'].map(selector => scene.querySelector(selector).animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1, offset: 0 },
        { transform: 'translateY(18px) rotate(0deg)', opacity: 1, offset: .35 },
        { transform: 'translateY(155px) rotate(4deg)', opacity: 1, offset: .65 },
        { transform: `translateY(${drop}px) rotate(16deg)`, opacity: 1, offset: 1 }
      ], { duration: 1450, easing: 'cubic-bezier(.45,0,.8,.45)', fill: 'forwards' }))
    ];
    await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
    showCard();
    animations.forEach(animation => animation.cancel());
  } else {
    await wait(1200);
    showCard();
  }
}

const swipe = initPackSwipe(open, {
  canStart: () => state === 'closed',
  onOpen: openPack,
  onIdle: () => window.dispatchEvent(new Event('abridor-idle'))
});
open.addEventListener('click', openPack);

reset.addEventListener('click', () => {
  state = 'closed';
  swipe.reset();
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
  isBusy: () => state === 'opening' || swipe.isDragging(),
  saveState: () => { try { sessionStorage.setItem('abridor-reveal', state); sessionStorage.setItem('abridor-character', JSON.stringify(character)); } catch {} }
});
