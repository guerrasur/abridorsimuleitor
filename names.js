// Top 20 for Argentina, all names together (no gender filter).
// Sources consulted 2026-10-09:
// https://forebears.io/argentina/forenames
// https://forebears.io/argentina/surnames
// This is the Forebears ranking, not a current RENAPER census.
export const SOURCE_NAMES = Object.freeze(['María','Juan','José','Carlos','Jorge','Luis','Miguel','Ana','Héctor','Ramón','Silvia','Rosa','Roberto','Oscar','Daniel','Norma','Marta','Mario','Claudia','Pedro']);
export const SOURCE_SURNAMES = Object.freeze(['González','Rodríguez','Gómez','Fernández','López','Díaz','Martínez','Pérez','García','Sánchez','Romero','Sosa','Torres','Álvarez','Ruiz','Ramírez','Flores','Benítez','Acosta','Medina']);
export function splitName(value) {
  const letters = Array.from(value.normalize('NFC'));
  const middle = Math.ceil(letters.length / 2);
  return [letters.slice(0, middle).join(''), letters.slice(middle).join('')];
}
const names = SOURCE_NAMES.map(splitName), surnames = SOURCE_SURNAMES.map(splitName);
export const NAME_BLOCKS = Object.freeze([
  Object.freeze(names.map(parts => parts[0])),
  Object.freeze(names.map(parts => parts[1])),
  Object.freeze(surnames.map(parts => parts[0])),
  Object.freeze(surnames.map(parts => parts[1]))
]);
export function generateNameParts(pick) { return NAME_BLOCKS.map(block => pick(block.length)); }
export function validNameParts(parts) {
  return Array.isArray(parts) && parts.length === 4 && parts.every((index, i) => Number.isInteger(index) && index >= 0 && index < NAME_BLOCKS[i].length);
}
export function assembleName(parts) {
  if (!validNameParts(parts)) throw new Error('Bloques de nombre inválidos');
  const pieces = parts.map((index, i) => NAME_BLOCKS[i][index]);
  const capitalize = value => { const lower = value.toLocaleLowerCase('es-AR'); return lower[0].toLocaleUpperCase('es-AR') + lower.slice(1); };
  return `${capitalize(pieces[0] + pieces[1])} ${capitalize(pieces[2] + pieces[3])}`;
}
