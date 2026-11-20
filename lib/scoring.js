// Prioridad (0-100) y frase para el mensaje de contacto.
// El cálculo vive en public/prioridad.js para que la interfaz pueda explicar el mismo número.
export { calcularPrioridad } from '../public/prioridad.js';

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
