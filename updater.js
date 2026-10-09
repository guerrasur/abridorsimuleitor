// Adapted from guerrasur/suiload-web/web/device.js: automatic checks + safe reload.
export function initUpdater(current, { isBusy = () => false, saveState = () => {} } = {}) {
  const button = document.getElementById('update');
  const message = document.getElementById('update-status');
  document.getElementById('version').textContent = `v${current}`;
  let checking = false, available = null, reloading = false;
  const valid = value => typeof value === 'string' && /^\d+\.\d+\.\d+$/.test(value);
  function newer(candidate) {
    if (!valid(candidate) || !valid(current)) return false;
    const a = candidate.split('.').map(Number), b = current.split('.').map(Number);
    for (let i = 0; i < 3; i++) { if (a[i] !== b[i]) return a[i] > b[i]; }
    return false;
  }
  function apply() {
    if (!available || reloading || isBusy()) return;
    // Avoid reload loops if a CDN publishes version.json before the HTML/assets.
    try { if (sessionStorage.getItem('abridor-update-attempt') === available) {
      message.textContent = 'La nueva versión todavía se está publicando. Volvé a actualizar en unos momentos.';
      return;
    } } catch {}
    reloading = true;
    saveState();
    try { sessionStorage.setItem('abridor-update-attempt', available); } catch {}
    const url = new URL(location.href);
    url.searchParams.set('v', available);
    location.replace(url.href);
  }
  async function check(manual = false) {
    if (checking || reloading) return;
    checking = true;
    button.disabled = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      if (manual) { try { sessionStorage.removeItem('abridor-update-attempt'); } catch {} }
      const url = new URL('./version.json', location.href);
      url.searchParams.set('t', Date.now());
      const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('Version unavailable');
      const release = await response.json();
      if (!valid(release.version)) throw new Error('Invalid version');
      if (newer(release.version)) {
        available = release.version;
        message.textContent = isBusy() ? 'Se actualizará al terminar de abrir el sobre.' : 'Actualizando…';
        apply();
      } else if (manual) message.textContent = `Ya tenés la última versión (v${current}).`;
    } catch { if (manual) message.textContent = 'No se pudo buscar la actualización. Revisá la conexión.'; }
    finally { clearTimeout(timeout); checking = false; button.disabled = false; }
  }
  try { if (sessionStorage.getItem('abridor-update-attempt') === current) sessionStorage.removeItem('abridor-update-attempt'); } catch {}
  button.addEventListener('click', () => check(true));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  window.addEventListener('online', () => check());
  window.addEventListener('abridor-idle', apply);
  setInterval(() => { if (!document.hidden) check(); }, 5 * 60 * 1000);
  check();
}
