// Coordinates are converted to scene pixels, including compact viewport scaling.
export function initCardPull(target, { canStart, onPull, onRelease, onCancel }) {
  let drag = null;
  const measure = event => {
    const raw = Math.max(0, (drag.y - event.clientY) / drag.scale);
    drag.raw = raw;
    drag.pull = raw <= 130 ? raw : 130 + 60 * (1 - Math.exp(-(raw - 130) / 100));
    target.classList.toggle('pull-ready', raw >= 80);
    onPull(drag.pull);
  };
  function release() {
    const current = drag; drag = null;
    target.classList.remove('pulling', 'pull-ready');
    if (current && target.hasPointerCapture(current.id)) target.releasePointerCapture(current.id);
    return current;
  }
  target.addEventListener('pointerdown', event => {
    if (!canStart() || drag || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.stopImmediatePropagation(); event.preventDefault();
    const scene = target.parentElement;
    drag = { id: event.pointerId, y: event.clientY, raw: 0, pull: 0,
      scale: scene.getBoundingClientRect().width / scene.offsetWidth || 1 };
    target.classList.add('pulling');
    target.setPointerCapture(event.pointerId);
  }, true);
  target.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    event.stopImmediatePropagation(); event.preventDefault(); measure(event);
  }, true);
  function finish(event, cancelled) {
    if (!drag || event.pointerId !== drag.id) return;
    event.stopImmediatePropagation();
    if (!cancelled) measure(event);
    const current = release();
    if (!cancelled && current.raw >= 80) onRelease(current.pull);
    else onCancel(current.pull);
  }
  target.addEventListener('pointerup', e => finish(e, false), true);
  target.addEventListener('pointercancel', e => finish(e, true), true);
  target.addEventListener('lostpointercapture', e => finish(e, true), true);
  const cancel = () => { if (drag) { const current = release(); onCancel(current.pull); } };
  window.addEventListener('blur', cancel);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
  target.addEventListener('keydown', event => {
    if (canStart() && !drag && !event.repeat && ['Enter', ' '].includes(event.key)) {
      event.preventDefault(); onRelease(0);
    }
  });
  return { isDragging: () => drag !== null, reset: release };
}
