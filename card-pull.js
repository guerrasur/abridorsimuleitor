export function initCardPull(target, { canStart, onPull, onRelease, onCancel }) {
  let drag = null;
  target.addEventListener('pointerdown', event => {
    if (!canStart() || drag || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.stopImmediatePropagation();
    drag = { id: event.pointerId, y: event.clientY, pull: 0 };
    target.setPointerCapture(event.pointerId);
  }, true);
  target.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    event.stopImmediatePropagation();
    drag.pull = Math.max(0, Math.min(240, drag.y - event.clientY));
    onPull(drag.pull);
  }, true);
  function finish(event, cancelled) {
    if (!drag || event.pointerId !== drag.id) return;
    const current = drag; drag = null;
    if (target.hasPointerCapture(current.id)) target.releasePointerCapture(current.id);
    if (!cancelled && current.pull >= 80) onRelease(current.pull);
    else onCancel();
  }
  target.addEventListener('pointerup', e => finish(e, false), true);
  target.addEventListener('pointercancel', e => finish(e, true), true);
  target.addEventListener('lostpointercapture', e => finish(e, true), true);
  target.addEventListener('keydown', event => {
    if (canStart() && ['Enter', ' '].includes(event.key)) { event.preventDefault(); onRelease(0); }
  });
  return { isDragging: () => drag !== null };
}
