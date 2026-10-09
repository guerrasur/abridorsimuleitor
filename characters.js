import { generateNameParts, validNameParts, assembleName } from './names.js?v=1.6.0';
// Independent layers: adding a trait does not require drawing every combination.
export const TRAITS = Object.freeze({
  head: ['Cuadrada', 'Ovalada', 'Triangular', 'Diamante', 'Ancha', 'Asimétrica', 'Redonda', 'Corazón', 'Mandíbula', 'Pera'],
  skin: ['Azul eléctrico', 'Rojo', 'Lima', 'Violeta', 'Rosa', 'Naranja', 'Turquesa', 'Amarillo'],
  hair: ['Rayos', 'Antenas', 'Nube', 'Cresta', 'Tentáculos', 'Flequillo geométrico', 'Calvo', 'Raya lateral', 'Rulos', 'Dos rodetes', 'Largo', 'Copete'],
  hairColor: ['Negro', 'Blanco', 'Rosa', 'Lima', 'Azul'],
  eyes: ['Cíclope', 'Tres ojos', 'Espirales', 'Estrellas', 'Desparejos', 'Visor', 'Almendrados', 'Redondos', 'Entrecerrados', 'Guiño', 'Puntos', 'Caídos'],
  nose: ['Triángulo', 'Resorte', 'Trompeta', 'Cuadrado', 'Larga', 'Botón', 'Gancho', 'Dos puntos'],
  mouth: ['Dientes piano', 'Zigzag', 'Óvalo', 'Sonrisa lateral', 'Cierre', 'Sonrisa', 'Labios', 'Seria', 'Colmillo', 'Sorpresa'],
  outfit: ['Rayas', 'Overol', 'Traje', 'Estrella', 'Damero', 'Chaleco', 'Campera', 'Cuello alto', 'Luna', 'Bolsillo'],
  outfitColor: ['Rosa', 'Azul', 'Lima', 'Rojo', 'Violeta', 'Amarillo'],
  brows: ['Rectas', 'Arqueadas', 'Enojadas', 'Cortas', 'Una ceja', 'Sin cejas'],
  ears: ['Redondas', 'Puntiagudas', 'Pequeñas', 'Lóbulos'],
  glasses: ['Sin lentes', 'Sin lentes', 'Sin lentes', 'Redondos', 'Cuadrados', 'Estrechos'],
  facialHair: ['Sin barba', 'Sin barba', 'Sin barba', 'Bigote', 'Perilla', 'Patillas'],
  accessory: ['Ninguno', 'Ninguno', 'Pecas', 'Rubor', 'Aro', 'Curita'],
  eyeSpacing: ['Juntos', 'Medios', 'Separados']
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
  return { schema: 3, traits, nameParts: generateNameParts(pick) };
}
function validTraits(value) {
  return Object.entries(TRAITS).every(([key, list]) => Number.isInteger(value.traits?.[key]) && value.traits[key] >= 0 && value.traits[key] < list.length);
}
export function isCharacter(value) {
  return value?.schema === 3 && validTraits(value)
    && (validNameParts(value.nameParts) || (typeof value.legacyName === 'string' && value.legacyName.length > 0 && value.legacyName.length < 60));
}
export function characterName(value) { return value.legacyName || assembleName(value.nameParts); }
export function characterDescription(value) {
  return Object.entries(TRAITS).map(([key, list]) => `${({head:'Cabeza',skin:'Piel',hair:'Pelo',hairColor:'Color de pelo',eyes:'Ojos',nose:'Nariz',mouth:'Boca',outfit:'Ropa',outfitColor:'Color de ropa',brows:'Cejas',ears:'Orejas',glasses:'Lentes',facialHair:'Barba',accessory:'Detalle',eyeSpacing:'Separación de ojos'})[key]}: ${list[value.traits[key]]}`).join(' · ');
}

// Preserve the appearance and name of cards already revealed by older versions.
export function normalizeCharacter(value) {
  if (isCharacter(value)) return value;
  if (![1, 2].includes(value?.schema)) return null;
  const traits = value.schema === 1 ? { ...value.traits, brows: 0, ears: 0, glasses: 0, facialHair: 0, accessory: 0, eyeSpacing: 1 } : value.traits;
  if (!Number.isInteger(value.first) || value.first < 0 || value.first >= FIRST.length
    || !Number.isInteger(value.last) || value.last < 0 || value.last >= LAST.length) return null;
  const upgraded = { schema: 3, traits, legacyName: `${FIRST[value.first]} ${LAST[value.last]}` };
  return isCharacter(upgraded) ? upgraded : null;
}
export function renderCharacter(value) {
  if (!isCharacter(value)) throw new Error('Personaje inválido');
  const t=value.traits, skin=SKIN[t.skin], hair=HAIR[t.hairColor], cloth=CLOTH[t.outfitColor];
  // Every face uses the same landmarks. Heads change around them, not through them.
  const heads=[
    'M76 44H164Q180 44 180 63V136Q180 165 153 165H87Q60 165 60 136V63Q60 44 76 44Z',
    'M120 40C157 40 180 61 180 96 180 140 153 167 120 167S60 140 60 96C60 61 83 40 120 40Z',
    'M82 44H158Q187 44 181 78L162 137Q151 167 120 167T78 137L59 78Q53 44 82 44Z',
    'M120 40Q143 40 160 59L181 91Q185 109 169 131L143 160Q120 174 97 160L71 131Q55 109 59 91L80 59Q97 40 120 40Z',
    'M83 48H157Q190 48 190 84V119Q190 158 153 162H87Q50 158 50 119V84Q50 48 83 48Z',
    'M81 43Q111 37 158 52 184 65 180 111 170 159 137 165L94 159Q55 145 58 101L62 65Q66 50 81 43Z',
    'M120 40C158 40 184 67 184 103S158 166 120 166 56 139 56 103 82 40 120 40Z',
    'M120 50C90 25 53 49 59 88L70 126Q86 151 120 168 154 151 170 126L181 88C187 49 150 25 120 50Z',
    'M87 43H153Q179 43 180 73V119L162 153Q155 167 120 167T78 153L60 119V73Q61 43 87 43Z',
    'M120 40Q162 40 165 79L179 116Q190 167 120 167T61 116L75 79Q78 40 120 40Z'
  ];
  const head=heads[t.head];
  const ears=[
    '<ellipse cx="58" cy="108" rx="12" ry="17"/><ellipse cx="182" cy="108" rx="12" ry="17"/>',
    '<path d="m65 100-27-13 13 39 15-4m109-22 27-13-13 39-15-4"/>',
    '<circle cx="59" cy="109" r="9"/><circle cx="181" cy="109" r="9"/>',
    '<path d="M64 96c-27-16-26 36-9 36 11 0 12-17 9-36m112 0c27-16 26 36 9 36-11 0-12-17-9-36"/>'
  ];
  // Scalp fill is clipped to each head, so hair stays attached on every shape.
  const hairFront=[
    '<path d="M45 40h150v43l-24-13-16 12-20-19-18 18-19-17-18 15-35-8Z"/>',
    '<path d="M48 35h144v34Q120 49 48 69Z"/>',
    '<path d="M45 31h150v49q-17-14-29-3-14-20-28-8-19-23-32-8-18-11-31 13-20-9-30 6Z"/>',
    '<path d="M48 30h144v32Q147 47 137 60v20h-34V60Q85 47 48 62Z"/>',
    '<path d="M45 35h150v36q-20-6-29 6-16-12-32-6-18-14-28 0-17-9-28 6-20-13-33-6Z"/>',
    '<path d="M45 30h150v55l-35-26-14 28-27-30-23 28-13-26-38 25Z"/>',
    '',
    '<path d="M45 28h150v44q-36-36-59-11-29 28-71 31L45 97Z"/>',
    '<path d="M45 30h150v54q-16-19-31-4-12-24-26-7-19-22-34-7-15-13-29 14-15-11-30 4Z"/>',
    '<path d="M45 25h150v46q-45-30-75-8-31-22-75 8Z"/>',
    '<path d="M45 30h150v115h-18V73q-33-37-57-16-31-21-57 16v72H45Z"/>',
    '<path d="M45 30h150v37q-39-37-48-8-10 31-50 23L76 63 45 77Z"/>'
  ];
  const crowns=[
    '<path d="m66 54 3-31 23 18 11-28 21 28 21-30 7 33 27-12-5 32Z"/>',
    '<path d="M91 53V22m57 31V19" fill="none"/><circle cx="91" cy="18" r="8"/><circle cx="148" cy="15" r="8"/>',
    '<path d="M63 56c-19-26 0-39 19-28-3-24 28-24 35-6 18-23 40-9 37 6 25-9 42 18 24 34Z"/>',
    '<path d="m104 57 1-39 14 9 18-17 3 46Z"/>',
    '<path d="M72 54Q48 7 84 23q21 10 15 30m19-4Q121 1 144 17q16 17 8 33m17 5q24-29 26-7" fill="none" stroke-width="9"/>',
    '<path d="M67 53q-5-24 20-27h63q27 0 27 28Z"/>','',
    '<path d="M62 57Q65 22 119 24q54-8 60 34Z"/>',
    '<path d="M60 60c-19-12-12-29 5-26-4-19 19-27 29-12 12-24 38-16 39-1 23-19 44-4 42 12 22-4 27 23 7 29Z"/>',
    '<circle cx="69" cy="45" r="22"/><circle cx="171" cy="45" r="22"/>',
    '<path d="M60 66q-8-43 60-43t60 43v89l-17-7V67H77v81l-17 7Z"/>',
    '<path d="M61 62Q56 33 96 32c-13-23 29-34 49-17 22 12 35 20 34 49Z"/>'
  ];
  const pupil='<circle cx="0" cy="0" r="5" fill="#111" stroke="none"/><circle cx="1.5" cy="-2" r="1.5" fill="#fff" stroke="none"/>';
  const eyeParts=[
    '', '', '<circle r="13" fill="#fff"/><path d="M0 0c-6-5 8-9 8 0 0 11-18 9-17-2" fill="none"/>',
    '<path d="m0-13 4 8 9 1-6 7 1 9-8-5-8 5 1-9-6-7 9-1Z" fill="#fff"/>','', '',
    '<path d="M-16 0Q0-16 16 0 0 14-16 0Z" fill="#fff"/>'+pupil,
    '<ellipse rx="12" ry="15" fill="#fff"/>'+pupil,
    '<path d="M-13 0Q0-7 13 0" fill="none"/>', '',
    '<ellipse rx="5" ry="7" fill="#111" stroke="none"/>',
    '<path d="M-14-3Q0-10 14 3 0 18-14-3Z" fill="#fff"/>'+pupil
  ];
  const distance=[23,29,34][t.eyeSpacing];
  let eyes='';
  if(t.eyes===0) eyes='<ellipse cx="120" cy="99" rx="25" ry="16" fill="#fff"/><circle cx="120" cy="99" r="7" fill="#111"/>';
  else if(t.eyes===1) eyes=[[-distance,100],[0,87],[distance,100]].map(([x,y])=>`<g transform="translate(${120+x} ${y})"><circle r="10" fill="#fff"/>${pupil}</g>`).join('');
  else if(t.eyes===4) eyes=`<g transform="translate(${120-distance} 98)"><circle r="15" fill="#fff"/>${pupil}</g><g transform="translate(${120+distance} 98)"><ellipse rx="9" ry="12" fill="#fff"/>${pupil}</g>`;
  else if(t.eyes===5) eyes='<rect x="72" y="85" width="96" height="27" rx="8" fill="#111"/><path d="m86 102 12-11m13 11 12-11m12 11 12-11" stroke="#fff"/>';
  else if(t.eyes===9) eyes=`<g transform="translate(${120-distance} 98)"><ellipse rx="12" ry="14" fill="#fff"/>${pupil}</g><path d="M${120+distance-12} 100q12-12 24 0" fill="none"/>`;
  else eyes=[-distance,distance].map(x=>`<g transform="translate(${120+x} 99)">${eyeParts[t.eyes]}</g>`).join('');
  const brows=[
    '<path d="M77 78h26m34 0h26"/>','<path d="M77 79q13-14 26-2m34 0q13-12 26 2"/>',
    '<path d="m77 75 26 8m34 0 26-8"/>','<path d="M85 78h13m44 0h13"/>','<path d="M77 78q43-14 86 0"/>',''
  ];
  const noses=[
    '<path d="m120 108 9 18h-18Z" fill="'+skin+'"/>','<path d="m117 112 10 3-10 4 10 4-10 4" fill="none"/>',
    '<path d="m116 114 23-5v18l-23-5Z" fill="'+skin+'"/>','<rect x="113" y="113" width="14" height="13" rx="3" fill="'+skin+'"/>',
    '<path d="m117 110 7 17h-15" fill="none"/>','<path d="M113 121q7-9 14 0" fill="none"/>',
    '<path d="M118 109v10q19 9-1 10" fill="none"/>','<path d="M114 123h1m10 0h1" fill="none"/>'
  ];
  const mouths=[
    '<rect x="100" y="139" width="40" height="12" rx="4" fill="#fff"/><path d="M110 139v12m10-12v12m10-12v12" stroke-width="1.5"/>',
    '<path d="m100 144 9-5 10 9 10-9 11 5" fill="none"/>','<ellipse cx="120" cy="144" rx="12" ry="8" fill="#111"/>',
    '<path d="M104 140q24 22 34-3" fill="none"/>','<path d="M102 145h36m-30-4v8m8-8v8m8-8v8m8-8v8" fill="none" stroke-width="2"/>',
    '<path d="M103 139q17 20 34 0" fill="none"/>','<path d="M104 144q8-9 16-2 8-7 16 2-16 14-32 0Z" fill="#111"/>',
    '<path d="M106 145h28" fill="none"/>','<path d="M102 142q18 18 36 0Z" fill="#111"/><path d="m128 142 4 9 4-9Z" fill="#fff"/>',
    '<ellipse cx="120" cy="145" rx="7" ry="9" fill="#111"/>'
  ];
  const clothes=[
    '<path d="M86 200h68m-67 13h66m-65 13h64m-62 13h60" stroke="#111" stroke-width="6"/>',
    '<path d="M96 184v26h48v-26m-48 24-7 40h62l-7-40Z" fill="#111"/><circle cx="101" cy="209" r="3" fill="#fff"/><circle cx="139" cy="209" r="3" fill="#fff"/>',
    '<path d="m99 185 21 25 21-25-8 30 17 33H90l17-33Z" fill="#111"/><path d="m114 187 6 6 6-6-6 22Z" fill="#fff"/>',
    '<path d="m120 202 7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2Z" fill="#fff"/>',
    '<path d="M91 200h14v14H91Zm28 0h14v14h-14Zm-14 14h14v14h-14Zm28 0h14v14h-14Zm-42 14h14v14H91Zm28 0h14v14h-14Z" fill="#111" stroke="none"/>',
    '<path d="m98 185 16 13-10 50H87l-4-52Zm44 0-16 13 10 50h17l4-52Z" fill="#111"/>',
    '<path d="M120 190v58m-21-58-6 13 14 7m34-20 6 13-14 7m-40 21h14m26 0h14" fill="none"/>',
    '<path d="M108 176h24v18h-24Z" fill="'+cloth+'"/><path d="M108 185h24" fill="none"/>',
    '<path d="M127 203c-24-8-30 29-5 31 11 0 17-6 19-12-21 7-28-11-14-19Z" fill="#fff"/>',
    '<path d="M129 210h18v17q-9 12-18 0Z" fill="#fff"/>'
  ];
  const facialHair=['','','','<path d="M120 129q-10-10-21 4 10 10 21 0 11 10 21 0-11-14-21-4Z"/>','<path d="m111 157 9-4 9 4-9 15Z"/>','<path d="M63 99h9v37l-9-8Zm105 0h9v29l-9 8Z"/>'];
  const glasses=['','','', '<circle cx="91" cy="100" r="19"/><circle cx="149" cy="100" r="19"/><path d="M110 99h20M62 96l10 3m96 0 10-3"/>','<rect x="72" y="84" width="39" height="31" rx="6"/><rect x="129" y="84" width="39" height="31" rx="6"/><path d="M111 96h18M62 96h10m96 0h10"/>','<rect x="73" y="92" width="38" height="17" rx="5"/><rect x="129" y="92" width="38" height="17" rx="5"/><path d="M111 98h18"/>'];
  const detail=['','','<g fill="#111" stroke="none"><circle cx="79" cy="123" r="2"/><circle cx="88" cy="127" r="2"/><circle cx="81" cy="132" r="2"/><circle cx="161" cy="123" r="2"/><circle cx="152" cy="127" r="2"/><circle cx="159" cy="132" r="2"/></g>','<g fill="#fff" stroke="none" opacity=".4"><ellipse cx="84" cy="126" rx="11" ry="6"/><ellipse cx="156" cy="126" rx="11" ry="6"/></g>','<circle cx="184" cy="127" r="7" fill="#ffdc22"/>','<g transform="rotate(-25 154 124)"><rect x="140" y="119" width="28" height="10" rx="3" fill="#fff"/><path d="M151 120v8m6-8v8" stroke-width="1"/></g>'];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 310" aria-hidden="true" focusable="false"><defs><clipPath id="head-mask"><path d="${head}"/></clipPath><clipPath id="shirt-mask"><path d="M101 184Q88 184 80 200L85 251H155l5-51q-8-16-21-16Z"/></clipPath></defs><g stroke="#111" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M94 244h52l-3 44h-17l-6-30-6 30H97Z" fill="#111"/><path d="M95 285h19v12H86q-2-9 9-12Zm31 0h19q11 3 9 12h-28Z" fill="#fff"/><g fill="${skin}"><path d="M110 155h20v36h-20Z"/><path d="M85 197q-13 14-17 40m87-40q13 14 17 40" fill="none" stroke="${skin}" stroke-width="14"/><ellipse cx="66" cy="243" rx="9" ry="11"/><ellipse cx="174" cy="243" rx="9" ry="11"/></g><path d="M101 184Q88 184 80 200L85 251H155l5-51q-8-16-21-16Z" fill="${cloth}"/><g clip-path="url(#shirt-mask)">${clothes[t.outfit]}</g><path d="M107 184q13 12 26 0" fill="none"/><g fill="${hair}">${crowns[t.hair]}</g><g fill="${skin}">${ears[t.ears]}<path d="${head}"/></g><g clip-path="url(#head-mask)" fill="${hair}">${hairFront[t.hair]}</g><g fill="none" stroke="${hair}" stroke-width="4">${brows[t.brows]}</g>${eyes}<g fill="none">${noses[t.nose]}</g>${detail[t.accessory]}${mouths[t.mouth]}<g fill="${hair}" stroke="${hair}">${facialHair[t.facialHair]}</g><g fill="none" stroke-width="3">${glasses[t.glasses]}</g></g></svg>`;
}
