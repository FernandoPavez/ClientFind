// Prioridad (0-100) y frase para el mensaje de contacto.

const BASE = { sin_web: 45, red_social: 42, plataforma: 38, caida: 45, mejorable: 22, no_verificable: 8, ok: 0, pendiente: 0 };

export function calcularPrioridad(lead) {
  const w = lead.webCheck || {};
  if (lead.estadoNegocio === 'CLOSED_PERMANENTLY') return 0;
  let s = BASE[w.categoria] ?? 0;
  if (w.categoria === 'mejorable') s += Math.min(18, (w.peso || 0) * 2);

  // Reputación y contacto suman más cuando la oportunidad es clara
  const factor = { sin_web: 1, red_social: 1, plataforma: 1, caida: 1, mejorable: 0.8, no_verificable: 0.5, ok: 0.25 }[w.categoria] ?? 0.5;
  const resenas = lead.resenas || 0;
  let extra = Math.min(25, Math.round(Math.log10(resenas + 1) * 10)); // 10→10, 100→20, 300+→25
  const r = lead.rating || 0;
  extra += r >= 4.5 ? 10 : r >= 4.0 ? 6 : r >= 3.5 ? 2 : 0;
  extra += lead.esMovil ? 12 : lead.telefono ? 5 : 0;
  s += extra * factor;
  if (lead.estadoNegocio === 'CLOSED_TEMPORARILY') s -= 25;
  return Math.max(0, Math.min(100, Math.round(s)));
}

export function fraseProblema(lead) {
  const w = lead.webCheck || {};
  const host = w.host ? ` (${w.host})` : '';
  switch (w.categoria) {
    case 'sin_web':
      return 'no tienen página web';
    case 'red_social':
      return `el enlace de "sitio web" en Google los lleva a ${w.red || 'una red social'}, pero no tienen una página web propia`;
    case 'plataforma':
      return w.tipoPlataforma === 'reservas'
        ? `usan ${w.red} para las reservas, pero no tienen una página web propia`
        : `venden a través de ${w.red}, pero no tienen una página web propia`;
    case 'caida':
      if (w.motivoCaida === 'google_site')
        return 'la página web que tenían con Google dejó de funcionar (Google cerró ese servicio), así que hoy el enlace no lleva a ninguna parte';
      {
        const corto = w.problemas?.find((p) => p.peso >= 5)?.corto || 'su página web no está cargando';
        return corto.startsWith('su página web') ? corto.replace(/^su página web/, `su página web${host}`) : corto;
      }
    case 'mejorable': {
      const cortos = [...new Set((w.problemas || []).filter((p) => p.peso >= 2).map((p) => p.corto))].slice(0, 2);
      return cortos.length
        ? `su página web se podría mejorar: ${cortos.join(' y ')}`
        : 'su página web se podría mejorar bastante';
    }
    default:
      return 'su presencia web se podría potenciar';
  }
}
