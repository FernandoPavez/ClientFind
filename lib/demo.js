// Datos ficticios para probar la app sin API key de Google.

function seeded(str) {
  let h = 2166136261;
  for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}

const PREFIJOS = ['Don', 'Doña', 'El Rincón de', 'La Casa de', 'Donde', 'Los Sabores de', 'Estudio', 'Taller', 'Centro', 'Mundo'];
const NOMBRES = ['Pepe', 'Rosita', 'Lucho', 'Carmen', 'Tito', 'Maite', 'Juanito', 'Violeta', 'Nacho', 'Pili', 'Manolo', 'Cata', 'Beto', 'Lula'];

// Casos de ejemplo para mostrar cada tipo de oportunidad
const CASOS = [
  { web: '', check: { categoria: 'sin_web', resumen: 'No tiene página web en Google', problemas: [] } },
  { web: '', check: { categoria: 'sin_web', resumen: 'No tiene página web en Google', problemas: [] } },
  { web: 'https://www.instagram.com/demo_negocio/', check: { categoria: 'red_social', red: 'Instagram', resumen: 'Su "sitio web" en Google es Instagram', problemas: [] } },
  { web: 'https://agendapro.com/cl/sucursal/demo', check: { categoria: 'plataforma', red: 'AgendaPro', tipoPlataforma: 'reservas', resumen: 'Usa AgendaPro para reservas, sin web propia', problemas: [] } },
  { web: 'https://www.pedidosya.cl/restaurantes/santiago/demo', check: { categoria: 'plataforma', red: 'PedidosYa', tipoPlataforma: 'ventas', resumen: 'Vende por PedidosYa, sin web propia', problemas: [] } },
  { web: 'https://wa.me/56912345678', check: { categoria: 'red_social', red: 'WhatsApp', resumen: 'Su "sitio web" en Google es WhatsApp', problemas: [] } },
  { web: 'https://demo-negocio.business.site/', check: { categoria: 'caida', motivoCaida: 'google_site', host: 'demo-negocio.business.site', problemas: [{ texto: 'La web que tenían con Google ("business.site") dejó de existir: Google cerró ese servicio en 2024', corto: 'su web de Google dejó de existir', peso: 5 }] } },
  { web: 'http://www.negociodemo-expirado.cl', check: { categoria: 'caida', host: 'negociodemo-expirado.cl', problemas: [{ texto: 'El dominio no existe o expiró: la página no carga', corto: 'su página web no está cargando', peso: 5 }] } },
  { web: 'http://www.negociodemo-antiguo.cl', check: { categoria: 'mejorable', host: 'negociodemo-antiguo.cl', peso: 10, https: false, responsive: false, problemas: [
    { texto: 'No usa https: el navegador la marca como "No segura"', corto: 'el navegador la marca como "No segura"', peso: 4 },
    { texto: 'No está adaptada a celulares (sin diseño responsive)', corto: 'no se ve bien en celulares', peso: 4 },
    { texto: 'Parece desactualizada (© 2017)', corto: 'se ve desactualizada', peso: 2 },
  ] } },
  { web: 'https://negociodemo.wixsite.com/inicio', check: { categoria: 'mejorable', host: 'negociodemo.wixsite.com', peso: 5, https: true, responsive: true, problemas: [
    { texto: 'Usa un dominio gratuito (negociodemo.wixsite.com), se ve poco profesional', corto: 'usa un dominio gratuito en vez de uno propio', peso: 2 },
    { texto: 'Carga lenta (5.2 s)', corto: 'carga lento', peso: 2 },
    { texto: 'No tiene botón de WhatsApp', corto: 'no tiene un botón de WhatsApp para que les escriban', peso: 1 },
  ] } },
  { web: 'https://www.negociodemo-moderno.cl', check: { categoria: 'ok', host: 'negociodemo-moderno.cl', peso: 1, https: true, responsive: true, problemas: [
    { texto: 'No tiene botón de WhatsApp', corto: 'no tiene un botón de WhatsApp para que les escriban', peso: 1 },
  ], resumen: 'No tiene botón de WhatsApp' } },
];

export function demoSearch(rubro, comuna, max = 20) {
  const rnd = seeded(`${rubro}|${comuna}`.toLowerCase());
  const n = Math.min(max, 12 + Math.floor(rnd() * 6));
  const tipo = rubro.replace(/s$/i, '').replace(/^\w/, (c) => c.toUpperCase());
  const out = [];
  for (let i = 0; i < n; i++) {
    const caso = CASOS[Math.floor(rnd() * CASOS.length)];
    const nombre = `${tipo} ${PREFIJOS[Math.floor(rnd() * PREFIJOS.length)]} ${NOMBRES[Math.floor(rnd() * NOMBRES.length)]}`;
    const movil = rnd() > 0.25;
    const num = movil ? `569${String(10000000 + Math.floor(rnd() * 9000) * 10000 + Math.floor(rnd() * 10000))}` : `562${String(20000000 + Math.floor(rnd() * 1000) * 10000 + Math.floor(rnd() * 10000))}`;
    const resenas = Math.floor(Math.pow(rnd(), 2) * 600);
    const id = `demo_${Math.abs([...`${rubro}${comuna}${i}`].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)).toString(36)}`;
    out.push({
      id,
      demo: true,
      nombre,
      rubroGoogle: tipo,
      direccion: `Av. Ejemplo ${100 + Math.floor(rnd() * 9000)}, ${comuna}`,
      direccionCompleta: `Av. Ejemplo, ${comuna}, Región Metropolitana, Chile`,
      telefono: movil ? `9 ${num.slice(3, 7)} ${num.slice(7)}` : `(2) ${num.slice(3, 7)} ${num.slice(7)}`,
      telefonoIntl: `+${num}`,
      waNumber: num,
      esMovil: movil,
      web: caso.web,
      mapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${rubro} ${comuna}`)}`,
      rating: resenas ? Math.round((3.4 + rnd() * 1.6) * 10) / 10 : null,
      resenas,
      estadoNegocio: 'OPERATIONAL',
      horario: ['lunes: 10:00–20:00', 'martes: 10:00–20:00', 'miércoles: 10:00–20:00', 'jueves: 10:00–20:00', 'viernes: 10:00–21:00', 'sábado: 11:00–21:00', 'domingo: Cerrado'],
      fotos: [],
      location: null,
      _demoCheck: { url: caso.web, host: '', ...structuredClone(caso.check) },
    });
  }
  return out;
}
