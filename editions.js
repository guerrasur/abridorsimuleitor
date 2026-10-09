// Independent from character identity: all 89 cards have all three finishes.
export const EDITIONS = Object.freeze(['normal', 'rare', 'superrare']);
export const EDITION_LABELS = Object.freeze({ normal: 'Normal', rare: 'Rara', superrare: 'Superrara' });
export const validEdition = value => EDITIONS.includes(value) ? value : 'normal';
export function rollEdition() {
  const bytes = new Uint32Array(1), limit = Math.floor(4294967296 / 100) * 100;
  do { crypto.getRandomValues(bytes); } while (bytes[0] >= limit);
  const roll = bytes[0] % 100;
  return roll < 75 ? 'normal' : roll < 95 ? 'rare' : 'superrare';
}
