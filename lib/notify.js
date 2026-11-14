// Avisos por Telegram (opcional)

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const ETIQUETA = {
  sin_web: 'sin web', red_social: 'solo redes', caida: 'web caída', mejorable: 'web mejorable',
  ok: 'web ok', no_verificable: 'revisar', pendiente: 'analizando',
};

export async function enviarTelegram(cfg, texto) {
  if (!cfg.telegramToken || !cfg.telegramChatId) throw new Error('Falta configurar el bot de Telegram');
  const res = await fetch(`https://api.telegram.org/bot${cfg.telegramToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: cfg.telegramChatId, text: texto, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(json.description || `Telegram respondió ${res.status}`);
}

export function textoNuevosLeads(etiquetaBusqueda, leads) {
  const top = [...leads].sort((a, b) => b.prioridad - a.prioridad).slice(0, 10);
  const lineas = top.map((l, i) => {
    const rating = l.rating ? ` · ${String(l.rating).replace('.', ',')}⭐ (${l.resenas})` : '';
    return `${i + 1}. <b>${esc(l.nombre)}</b> — ${ETIQUETA[l.webCheck?.categoria] || ''}${rating} · prioridad ${l.prioridad}\n<a href="${esc(l.mapsUrl)}">Ver en Maps</a>`;
  });
  const extra = leads.length > top.length ? `\n…y ${leads.length - top.length} más en la app.` : '';
  return `🔔 <b>ClientFind</b>\n${leads.length} lead(s) nuevo(s) en «${esc(etiquetaBusqueda)}»\n\n${lineas.join('\n\n')}${extra}`;
}
