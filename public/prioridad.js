// Prioridad (0-100) de un lead y de dónde sale cada punto.
// Lo usan el servidor (lib/scoring.js) y la interfaz, para que el número y su explicación nunca se separen.

const BASE = { sin_web: 45, red_social: 42, plataforma: 38, caida: 45, mejorable: 22, no_verificable: 8, ok: 0, pendiente: 0 };
// Reputación y contacto suman más cuando la oportunidad es clara
const FACTOR = { sin_web: 1, red_social: 1, plataforma: 1, caida: 1, mejorable: 0.8, no_verificable: 0.5, ok: 0.25 };
const NOMBRE_CAT = {
  sin_web: 'Sin web', red_social: 'Solo redes', plataforma: 'Usa una plataforma', caida: 'Web caída',
  mejorable: 'Web mejorable', no_verificable: 'Web por revisar', ok: 'Web OK', pendiente: 'Web en análisis',
};

export function desglosePrioridad(lead) {
  const w = lead.webCheck || {};
  if (lead.estadoNegocio === 'CLOSED_PERMANENTLY') return { total: 0, partes: [{ texto: 'Cerrado permanentemente', puntos: 0 }] };
  const cat = w.categoria || 'pendiente';
  const factor = FACTOR[cat] ?? 0.5;
  const partes = [];

  let web = BASE[cat] ?? 0;
  if (cat === 'mejorable') web += Math.min(18, (w.peso || 0) * 2);
  partes.push({ texto: NOMBRE_CAT[cat] || cat, puntos: web });

  const resenas = lead.resenas || 0;
  const pResenas = Math.min(25, Math.round(Math.log10(resenas + 1) * 10)); // 10→10, 100→20, 300+→25
  if (pResenas) partes.push({ texto: `${resenas} ${resenas === 1 ? 'reseña' : 'reseñas'}`, puntos: pResenas * factor });

  const r = lead.rating || 0;
  const pRating = r >= 4.5 ? 10 : r >= 4.0 ? 6 : r >= 3.5 ? 2 : 0;
  if (pRating) partes.push({ texto: `Nota ${String(r).replace('.', ',')}`, puntos: pRating * factor });

  const pContacto = lead.esMovil ? 12 : lead.telefono ? 5 : 0;
  if (pContacto) partes.push({ texto: lead.esMovil ? 'Tiene WhatsApp' : 'Solo teléfono fijo', puntos: pContacto * factor });

  if (lead.estadoNegocio === 'CLOSED_TEMPORARILY') partes.push({ texto: 'Cerrado temporalmente', puntos: -25 });

  const suma = partes.reduce((s, p) => s + p.puntos, 0);
  return { total: Math.max(0, Math.min(100, Math.round(suma))), partes };
}

export const calcularPrioridad = (lead) => desglosePrioridad(lead).total;

// Bandas para leer la lista de un vistazo: el color acompaña a la palabra, nunca la reemplaza
export const bandaPrioridad = (p) => (p >= 75 ? 'alta' : p >= 50 ? 'media' : 'baja');
