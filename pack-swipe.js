// Pointer Events cover touch, pen and mouse without parallel touch listeners.
export function initPackSwipe(button, { canStart, onOpen, onIdle = () => {} }) {
  let drag = null, suppressClick = false;
  const threshold = 60;
  const clearPreview = () => {
    button.classList.remove('dragging');
    for (const key of ['--tear-x', '--tear-y', '--tear-angle']) button.style.removeProperty(key);
  };
  button.addEventListener('pointerdown', event => {
    if (!canStart() || drag || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    suppressClick = false;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 };
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const x = event.clientX - drag.x, y = event.clientY - drag.y;
    drag.distance = Math.hypot(x, y);
    if (drag.distance < 6) return;
    suppressClick = true;
    button.classList.add('dragging');
    const scale = Math.min(1, 120 / drag.distance);
    button.style.setProperty('--tear-x', `${(x * scale).toFixed(1)}px`);
    button.style.setProperty('--tear-y', `${(y * scale).toFixed(1)}px`);
    button.style.setProperty('--tear-angle', `${Math.max(-18, Math.min(18, x * .12)).toFixed(1)}deg`);
  });
  function finish(event, cancelled = false) {
    if (!drag || event.pointerId !== drag.id) return;
    const current = drag;
    drag = null;
    if (button.hasPointerCapture(current.id)) button.releasePointerCapture(current.id);
    if (!cancelled && current.distance >= threshold && canStart()) {
      // Keep the last position for the first opening keyframe: no snap back.
      button.classList.remove('dragging');
      onOpen();
    } else {
      clearPreview();
      onIdle();
    }
  }
  button.addEventListener('pointerup', event => finish(event));
  button.addEventListener('pointercancel', event => finish(event, true));
  button.addEventListener('lostpointercapture', event => finish(event, true));
  button.addEventListener('click', event => {
    if (suppressClick && event.detail !== 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    suppressClick = false;
  }, true);
  return { isDragging: () => drag !== null, reset: () => { drag = null; suppressClick = false; clearPreview(); } };
}
