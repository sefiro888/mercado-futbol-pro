// =============================================================================
// Banderas por país.
//
// IMPORTANTE: los emojis de bandera (🇪🇸) NO se renderizan en Windows
// (Microsoft no incluye esos glifos: se ven como "ES"). Por eso usamos
// imágenes SVG reales servidas por flagcdn.com — se ven igual en todas las
// plataformas, son ligeras y no requieren clave. Ver componente <Flag />.
//
// Aquí solo mapeamos nombre de país (en español) → código ISO de flagcdn.
// =============================================================================

const ISO = {
  // Europa occidental
  España: 'es',
  Francia: 'fr',
  Inglaterra: 'gb-eng',
  Escocia: 'gb-sct',
  Gales: 'gb-wls',
  'Irlanda del Norte': 'gb-nir',
  Irlanda: 'ie',
  Italia: 'it',
  Alemania: 'de',
  Portugal: 'pt',
  'Países Bajos': 'nl',
  Bélgica: 'be',
  Suiza: 'ch',
  Austria: 'at',
  Luxemburgo: 'lu',
  // Europa norte
  Noruega: 'no',
  Suecia: 'se',
  Dinamarca: 'dk',
  Finlandia: 'fi',
  Islandia: 'is',
  // Europa este / balcanes
  Croacia: 'hr',
  Serbia: 'rs',
  Eslovenia: 'si',
  Eslovaquia: 'sk',
  'República Checa': 'cz',
  Polonia: 'pl',
  Hungría: 'hu',
  Rumanía: 'ro',
  Bulgaria: 'bg',
  Ucrania: 'ua',
  Rusia: 'ru',
  Grecia: 'gr',
  Turquía: 'tr',
  Albania: 'al',
  Kosovo: 'xk',
  'Bosnia y Herzegovina': 'ba',
  Montenegro: 'me',
  'Macedonia del Norte': 'mk',
  Georgia: 'ge',
  Armenia: 'am',
  // Sudamérica
  Argentina: 'ar',
  Brasil: 'br',
  Uruguay: 'uy',
  Colombia: 'co',
  Chile: 'cl',
  Perú: 'pe',
  Ecuador: 'ec',
  Paraguay: 'py',
  Venezuela: 've',
  Bolivia: 'bo',
  // Norte / Centroamérica
  'Estados Unidos': 'us',
  Canadá: 'ca',
  México: 'mx',
  'Costa Rica': 'cr',
  Panamá: 'pa',
  Honduras: 'hn',
  Jamaica: 'jm',
  // África
  Nigeria: 'ng',
  Senegal: 'sn',
  Marruecos: 'ma',
  Argelia: 'dz',
  Túnez: 'tn',
  Egipto: 'eg',
  Ghana: 'gh',
  'Costa de Marfil': 'ci',
  Camerún: 'cm',
  Malí: 'ml',
  Guinea: 'gn',
  Gambia: 'gm',
  'Burkina Faso': 'bf',
  'RD del Congo': 'cd',
  Congo: 'cg',
  Angola: 'ao',
  'Cabo Verde': 'cv',
  Gabón: 'ga',
  Togo: 'tg',
  Benín: 'bj',
  'Guinea-Bisáu': 'gw',
  Mozambique: 'mz',
  Zimbabue: 'zw',
  Sudáfrica: 'za',
  Zambia: 'zm',
  // Asia / Oceanía
  Japón: 'jp',
  'Corea del Sur': 'kr',
  Australia: 'au',
  Uzbekistán: 'uz',
  Irán: 'ir',
  Israel: 'il',
  'Arabia Saudí': 'sa',
  Catar: 'qa',
  'Nueva Zelanda': 'nz',
}

/** Código ISO de flagcdn para un país, o null si no se conoce. */
export function flagCode(country) {
  if (!country) return null
  return ISO[country] || null
}
