// Independent layers: adding a trait does not require drawing every combination.
export const TRAITS = Object.freeze({
  head: ['Cuadrada', 'Ovalada', 'Triangular', 'Diamante', 'Ancha', 'Asimétrica'],
  skin: ['Azul eléctrico', 'Rojo', 'Lima', 'Violeta', 'Rosa', 'Naranja', 'Turquesa', 'Amarillo'],
  hair: ['Rayos', 'Antenas', 'Nube', 'Cresta', 'Tentáculos', 'Flequillo geométrico', 'Calvo'],
  hairColor: ['Negro', 'Blanco', 'Rosa', 'Lima', 'Azul'],
  eyes: ['Cíclope', 'Tres ojos', 'Espirales', 'Estrellas', 'Desparejos', 'Visor'],
  nose: ['Triángulo', 'Resorte', 'Trompeta', 'Cuadrado', 'Larga'],
  mouth: ['Dientes piano', 'Zigzag', 'Óvalo', 'Sonrisa lateral', 'Cierre'],
  outfit: ['Rayas', 'Overol', 'Traje', 'Estrella', 'Damero', 'Chaleco'],
  outfitColor: ['Rosa', 'Azul', 'Lima', 'Rojo', 'Violeta', 'Amarillo']
});
const SKIN = ['#2457ff', '#ff3030', '#b8ef22', '#9747ff', '#ff73b5', '#ff8624', '#19d9bd', '#ffdc22'];
const HAIR = ['#000', '#fff', '#ff73b5', '#b8ef22', '#2457ff'];
const CLOTH = ['#ff73b5', '#2457ff', '#b8ef22', '#ff3030', '#9747ff', '#ffdc22'];
const FIRST = ['Zig', 'Momo', 'Krum', 'Pipa', 'Bongo', 'Ñuki', 'Glup', 'Zaz', 'Toto', 'Rulo'];
const LAST = ['Voltio', 'Satélite', 'Diente', 'Resorte', 'Órbita', 'Chispa', 'Cubito', 'Tornado', 'Confeti', 'Tuerca'];
function randomIndex(length) {
  const limit = Math.floor(4294967296 / length) * length;
  const bytes = new Uint32Array(1);
  do { crypto.getRandomValues(bytes); } while (bytes[0] >= limit);
  return bytes[0] % length;
}
export function generateCharacter(pick = randomIndex) {
  const traits = Object.fromEntries(Object.entries(TRAITS).map(([key, values]) => [key, pick(values.length)]));
  return { schema: 1, traits, first: pick(FIRST.length), last: pick(LAST.length) };
}
export function isCharacter(value) {
  return value?.schema === 1 && Object.entries(TRAITS).every(([key, list]) => Number.isInteger(value.traits?.[key]) && value.traits[key] >= 0 && value.traits[key] < list.length)
    && Number.isInteger(value.first) && value.first >= 0 && value.first < FIRST.length
    && Number.isInteger(value.last) && value.last >= 0 && value.last < LAST.length;
}
export function characterName(value) { return `${FIRST[value.first]} ${LAST[value.last]}`; }
export function characterDescription(value) {
  return Object.entries(TRAITS).map(([key, list]) => `${({head:'Cabeza',skin:'Piel',hair:'Pelo',hairColor:'Color de pelo',eyes:'Ojos',nose:'Nariz',mouth:'Boca',outfit:'Ropa',outfitColor:'Color de ropa'})[key]}: ${list[value.traits[key]]}`).join(' · ');
}
export function renderCharacter(value) {
  if (!isCharacter(value)) throw new Error('Personaje inválido');
  const t = value.traits, skin = SKIN[t.skin], hair = HAIR[t.hairColor], cloth = CLOTH[t.outfitColor];
  const heads = [
    '<rect x="66" y="54" width="108" height="105" rx="7"/>',
    '<ellipse cx="120" cy="107" rx="51" ry="57"/>',
    '<path d="M120 48 181 155H59Z"/>',
    '<path d="m120 45 62 62-62 61-62-61Z"/>',
    '<rect x="54" y="67" width="132" height="85" rx="29"/>',
    '<path d="m74 51 91 15 18 57-38 39-68-12-22-49Z"/>'
  ];
  const hairs = [
    '<path d="m69 67-13-32 30 17 2-37 23 31 22-36 6 38 30-20-10 36Z"/>',
    '<path d="M92 65V29m55 36V24" fill="none" stroke-width="8"/><circle cx="92" cy="24" r="10"/><rect x="136" y="9" width="22" height="22"/>',
    '<path d="M66 69C35 46 60 22 80 36 73 9 106 10 115 28c13-24 42-13 39 6 30-4 39 30 12 37Z"/>',
    '<path d="m102 65 3-47 17 14 15-19 4 54Z"/>',
    '<path d="M71 65C42 4 103 12 87 45m24 17c-7-57 37-58 24-14m18 18c51-61 63-1 24-13" fill="none" stroke-width="12"/>',
    '<path d="M65 66V40h108v33l-25-18-12 28-25-28-15 26-14-20Z"/>',
    ''
  ];
  const eyes = [
    '<ellipse cx="120" cy="95" rx="26" ry="17" fill="#fff"/><circle cx="123" cy="95" r="8" fill="#000"/>',
    '<g fill="#fff"><circle cx="85" cy="97" r="13"/><circle cx="120" cy="85" r="13"/><circle cx="155" cy="97" r="13"/></g><g fill="#000"><circle cx="88" cy="98" r="5"/><circle cx="120" cy="85" r="5"/><circle cx="152" cy="98" r="5"/></g>',
    '<g fill="#fff"><circle cx="91" cy="95" r="18"/><circle cx="149" cy="95" r="18"/></g><path d="M91 95c-8-7 10-13 10 0 0 16-25 13-22-3m70 3c-8-7 10-13 10 0 0 16-25 13-22-3" fill="none"/>',
    '<path d="m89 77 6 12 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2Zm61 0 6 12 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2Z" fill="#fff"/>',
    '<circle cx="89" cy="94" r="19" fill="#fff"/><rect x="139" y="85" width="25" height="18" fill="#fff"/><circle cx="92" cy="94" r="7" fill="#000"/><path d="m144 89 14 10m0-10-14 10"/>',
    '<rect x="70" y="80" width="100" height="29" rx="4" fill="#000"/><path d="m85 102 17-15m5 15 17-15m5 15 17-15" stroke="#fff"/>'
  ];
  const noses = [
    '<path d="m120 100 11 24h-22Z" fill="#fff"/>',
    '<path d="m117 105 12 4-13 5 13 5-12 5" fill="none"/>',
    '<path d="m116 109 28-7v23l-28-8Z" fill="#fff"/>',
    '<rect x="111" y="108" width="18" height="18" fill="#fff"/>',
    '<path d="m117 103 7 22h-23" fill="none"/>'
  ];
  const mouths = [
    '<rect x="98" y="135" width="44" height="15" fill="#fff"/><path d="M106 135v15m9-15v15m10-15v15m9-15v15" stroke-width="2"/>',
    '<path d="m97 141 10-8 9 12 10-12 12 8" fill="none"/>',
    '<ellipse cx="120" cy="141" rx="15" ry="9" fill="#000"/>',
    '<path d="M101 135q27 28 40-4" fill="none"/><path d="m138 130 7 3"/>',
    '<path d="M97 140h46m-39-5v10m9-10v10m9-10v10m9-10v10" fill="none" stroke-width="2"/>'
  ];
  const clothes = [
    '<path d="M83 189h74m-78 17h82m-79 17h76m-72 17h68" fill="none" stroke="#000" stroke-width="9"/>',
    '<path d="M94 176v27h52v-27m-52 25-8 45h68l-8-45Z" fill="#000"/><circle cx="100" cy="200" r="4" fill="#fff"/><circle cx="140" cy="200" r="4" fill="#fff"/>',
    '<path d="m97 175 23 28 22-28-8 37 18 34H88l18-34Z" fill="#000"/><path d="m112 176 8 8 8-8-8 29Z" fill="#fff"/>',
    '<path d="m120 183 9 18 20 3-14 14 4 20-19-10-19 10 4-20-14-14 20-3Z" fill="#fff"/>',
    '<path d="M88 184h16v16H88Zm32 0h16v16h-16Zm-16 16h16v16h-16Zm32 0h16v16h-16Zm-48 16h16v16H88Zm32 0h16v16h-16Zm-16 16h16v14h-16Z" fill="#000" stroke="none"/>',
    '<path d="m96 175 18 16-9 55H82l-3-61Zm48 0-18 16 9 55h23l3-61Z" fill="#000"/><circle cx="120" cy="213" r="3" fill="#000"/><circle cx="120" cy="230" r="3" fill="#000"/>'
  ];
  // One shared body silhouette, irrespective of head shape and clothing.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300" aria-hidden="true" focusable="false"><g stroke="#000" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><g fill="${skin}"><path d="M109 146h22v35h-22Z"/><path d="m85 179-20 12-10 49 12 5 24-47m64-19 20 12 10 49-12 5-24-47"/><circle cx="59" cy="245" r="10"/><circle cx="181" cy="245" r="10"/></g><path d="M88 235h64l-5 44h-19l-8-30-8 30H93Z" fill="#000"/><path d="M92 276h20v14H83v-8Zm36 0h20l9 6v8h-29Z" fill="#fff"/><path d="m99 173-20 13 5 60h72l5-60-20-13-21 6Z" fill="${cloth}"/>${clothes[t.outfit]}<g fill="${skin}"><ellipse cx="63" cy="109" rx="10" ry="14"/><ellipse cx="177" cy="109" rx="10" ry="14"/>${heads[t.head]}</g><g fill="${hair}" stroke="#000">${hairs[t.hair]}</g>${eyes[t.eyes]}${noses[t.nose]}${mouths[t.mouth]}</g></svg>`;
}
