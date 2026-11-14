// Analiza el "sitio web" que un negocio tiene en Google Maps y detecta oportunidades de venta.

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

// Dominios que NO son una web propia
const SOCIAL = [
  ['instagram.com', 'Instagram'], ['instagr.am', 'Instagram'],
  ['facebook.com', 'Facebook'], ['fb.com', 'Facebook'], ['fb.me', 'Facebook'], ['m.me', 'Messenger'],
  ['wa.me', 'WhatsApp'], ['whatsapp.com', 'WhatsApp'], ['wa.link', 'WhatsApp'],
  ['linktr.ee', 'Linktree'], ['beacons.ai', 'Beacons'], ['taplink.cc', 'Taplink'], ['linkin.bio', 'Linkin.bio'],
  ['bio.link', 'Bio.link'], ['campsite.bio', 'Campsite'],
  ['tiktok.com', 'TikTok'], ['youtube.com', 'YouTube'], ['twitter.com', 'X/Twitter'], ['x.com', 'X/Twitter'],
  ['linkedin.com', 'LinkedIn'], ['pinterest.com', 'Pinterest'],
  ['google.com', 'Google'], ['goo.gl', 'Google'], ['g.page', 'Google'],
];

// Plataformas de reservas: el negocio ya usa algo digital, pero no tiene web propia
const RESERVAS = [
  ['agendapro.com', 'AgendaPro'], ['agendapro.cl', 'AgendaPro'], ['booksy.com', 'Booksy'], ['fresha.com', 'Fresha'],
  ['reservo.cl', 'Reservo'], ['weibook.co', 'Weibook'], ['encuadrado.com', 'Encuadrado'], ['setmore.com', 'Setmore'],
  ['calendly.com', 'Calendly'], ['simplybook.me', 'SimplyBook'], ['treatwell.com', 'Treatwell'], ['doctoralia.cl', 'Doctoralia'],
  ['reservaenlinea.cl', 'Reserva en línea'], ['meitre.com', 'Meitre'], ['tuagenda.cl', 'TuAgenda'], ['easycancha.com', 'EasyCancha'],
  ['agendaweb.cl', 'AgendaWeb'], ['agendapro.co', 'AgendaPro'], ['bookingfor.me', 'Booking'], ['wodbuster.com', 'WodBuster'],
];

// Plataformas de pedidos/ventas: venden por terceros pagando comisión
const VENTAS = [
  ['pedidosya.cl', 'PedidosYa'], ['pedidosya.com', 'PedidosYa'], ['rappi.cl', 'Rappi'], ['rappi.com', 'Rappi'],
  ['ubereats.com', 'Uber Eats'], ['didi-food.com', 'DiDi Food'], ['didifood.com', 'DiDi Food'], ['justo.cl', 'Justo'],
  ['mercadolibre.cl', 'Mercado Libre'], ['cornershopapp.com', 'Cornershop'], ['olaclick.com', 'OlaClick'],
];

export const PLATAFORMA_POR_NOMBRE = Object.fromEntries([
  ...RESERVAS.map(([, n]) => [n, 'reservas']),
  ...VENTAS.map(([, n]) => [n, 'ventas']),
]);

// Sitios de Google Business: Google los cerró en 2024, hoy no funcionan
const DEAD_HOSTS = [
  ['business.site', 'La web que tenían con Google ("business.site") dejó de existir: Google cerró ese servicio en 2024'],
  ['negocio.site', 'La web que tenían con Google ("negocio.site") dejó de existir: Google cerró ese servicio en 2024'],
];

const FREE_HOSTS = [
  ['wixsite.com'], ['wix.com'], ['blogspot.com'], ['weebly.com'], ['wordpress.com'], ['godaddysites.com'],
  ['jimdosite.com'], ['jimdo.com'], ['site123.me'], ['webnode.cl'], ['webnode.com'], ['webnode.es'],
  ['mystrikingly.com'], ['strikingly.com'], ['carrd.co'], ['sites.google.com'], ['negocio.cl'], ['ueniweb.com'],
  ['square.site'], ['ola.click'], ['tiendanube.com'], ['mitiendanube.com'], ['jumpseller.com'],
];

const PARKED = [
  'domain is for sale', 'this domain is for sale', 'buy this domain', 'este dominio está a la venta',
  'este dominio esta a la venta', 'dominio en venta', 'sedoparking', 'parkingcrew', 'domain parking',
  'hugedomains', 'is parked', 'dominio estacionado', 'domain has expired', 'el dominio ha expirado',
];
const SUSPENDED = [
  'account suspended', 'this account has been suspended', 'cuenta suspendida', 'esta cuenta ha sido suspendida',
  'sitio suspendido', 'website is suspended', 'hosting suspendido',
];
const UNDER_CONSTRUCTION = [
  'under construction', 'en construcción', 'en construccion', 'coming soon', 'próximamente', 'proximamente',
  'sitio en mantenimiento', 'modo mantenimiento', 'maintenance mode', 'estamos trabajando en nuestro sitio',
  'website coming soon', 'launching soon',
];
const DEFAULT_PAGES = [
  'index of /', 'default web site page', 'welcome to nginx', 'apache2 ubuntu default page', 'apache2 debian default page',
  'future home of something quite cool', 'it works!', 'web server\'s default page', 'test page for the apache',
];

const TLS_RE = /CERT|SSL|TLS|SELF_SIGNED|UNABLE_TO_VERIFY|ERR_TLS/i;

function hostOf(u) {
  try { return new URL(u).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; }
}
function matchHost(host, list) {
  return list.find(([d]) => host === d || host.endsWith(`.${d}`));
}

export function clasificarEnlace(uri) {
  if (!uri || !uri.trim()) return { tipo: 'sin_web' };
  let u = uri.trim();
  if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
  const host = hostOf(u);
  if (!host) return { tipo: 'sin_web' };
  const rv = matchHost(host, RESERVAS);
  if (rv) return { tipo: 'plataforma', red: rv[1], tipoPlataforma: 'reservas', url: u, host };
  const vt = matchHost(host, VENTAS);
  if (vt) return { tipo: 'plataforma', red: vt[1], tipoPlataforma: 'ventas', url: u, host };
  const s = matchHost(host, SOCIAL);
  if (s) return { tipo: 'red_social', red: s[1], url: u, host };
  const d = matchHost(host, DEAD_HOSTS);
  if (d) return { tipo: 'muerta', motivo: d[1], url: u, host };
  return { tipo: 'web', url: u, host };
}

function codigoError(e) {
  if (e?.name === 'AbortError') return 'TIMEOUT';
  return e?.cause?.code || e?.code || e?.cause?.message || e?.message || 'ERROR';
}

const HEADERS = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'es-CL,es;q=0.9,en;q=0.5',
};

// Sigue redirecciones a mano: si alguna lleva a una red social, se detiene ahí (no hace falta cargarla).
async function leerPagina(url, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  const t0 = Date.now();
  try {
    let actual = url;
    let res;
    for (let salto = 0; salto < 8; salto++) {
      res = await fetch(actual, { redirect: 'manual', signal: ctrl.signal, headers: HEADERS });
      const loc = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && loc) {
        await res.body?.cancel?.().catch(() => {});
        actual = new URL(loc, actual).href;
        const host = hostOf(actual);
        if (matchHost(host, SOCIAL) || matchHost(host, RESERVAS) || matchHost(host, VENTAS) || matchHost(host, DEAD_HOSTS))
          return { ok: true, status: res.status, finalUrl: actual, ms: Date.now() - t0, html: '', headers: res.headers };
        continue;
      }
      break;
    }
    let html = '';
    const ct = res.headers.get('content-type') || 'text/html';
    if (res.body && /html|text|xml/i.test(ct)) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        html += dec.decode(value, { stream: true });
        if (total > 600_000) { await reader.cancel().catch(() => {}); break; }
      }
    } else {
      await res.body?.cancel?.().catch(() => {});
    }
    return { ok: true, status: res.status, finalUrl: actual, ms: Date.now() - t0, html, headers: res.headers };
  } catch (e) {
    return { ok: false, error: codigoError(e), ms: Date.now() - t0 };
  } finally {
    clearTimeout(t);
  }
}

let internetCache = { at: 0, ok: true };
async function hayInternet() {
  if (Date.now() - internetCache.at < 60_000) return internetCache.ok;
  const r = await leerPagina('https://www.google.com/generate_204', 6000);
  internetCache = { at: Date.now(), ok: r.ok };
  return r.ok;
}

export async function pagespeed(url, apiKey) {
  const q = new URLSearchParams({ url, strategy: 'mobile', category: 'performance' });
  if (apiKey) q.set('key', apiKey);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 90_000);
  try {
    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`, { signal: ctrl.signal });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
    const score = json?.lighthouseResult?.categories?.performance?.score;
    return typeof score === 'number' ? Math.round(score * 100) : null;
  } finally {
    clearTimeout(t);
  }
}

const P = (texto, corto, peso) => ({ texto, corto, peso });

function resultado(base, categoria, extra = {}) {
  const problemas = extra.problemas || [];
  return {
    ...base,
    categoria,
    problemas,
    resumen: extra.resumen || problemas.map((p) => p.texto).slice(0, 2).join(' · '),
    ...extra,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Devuelve { categoria, resumen, problemas[], ... }
 * categorias: sin_web | red_social | caida | mejorable | ok | no_verificable
 */
export async function analizarWeb(uri, { pagespeedKey, conPagespeed = false } = {}) {
  const c = clasificarEnlace(uri);
  const base = { url: c.url || uri || '', host: c.host || '' };

  if (c.tipo === 'sin_web') return resultado(base, 'sin_web', { resumen: 'No tiene página web en Google' });
  if (c.tipo === 'red_social')
    return resultado(base, 'red_social', { red: c.red, resumen: `Su "sitio web" en Google es ${c.red}` });
  if (c.tipo === 'plataforma')
    return resultado(base, 'plataforma', {
      red: c.red, tipoPlataforma: c.tipoPlataforma,
      resumen: c.tipoPlataforma === 'reservas' ? `Usa ${c.red} para reservas, sin web propia` : `Vende por ${c.red}, sin web propia`,
    });
  if (c.tipo === 'muerta')
    return resultado(base, 'caida', { motivoCaida: 'google_site', problemas: [P(c.motivo, 'su web de Google dejó de existir', 5)] });

  const problemas = [];
  let r = await leerPagina(c.url);

  // Certificado SSL malo: intentamos por http
  if (!r.ok && TLS_RE.test(r.error)) {
    problemas.push(P('Certificado de seguridad (SSL) inválido o vencido: el navegador muestra "No seguro"', 'el navegador la marca como "No segura"', 4));
    const alt = c.url.replace(/^https:/i, 'http:');
    if (alt !== c.url) { const r2 = await leerPagina(alt); if (r2.ok) r = r2; }
  }

  if (!r.ok) {
    if (!(await hayInternet()))
      return resultado(base, 'no_verificable', { resumen: 'Sin conexión a internet al analizar. Vuelve a intentarlo.', error: r.error });
    const e = r.error;
    let motivo;
    if (/ENOTFOUND/.test(e)) motivo = 'El dominio no existe o expiró: la página no carga';
    else if (/EAI_AGAIN/.test(e))
      return resultado(base, 'no_verificable', { resumen: 'Falla temporal de DNS. Vuelve a analizar más tarde.', error: e });
    else if (e === 'TIMEOUT') motivo = 'La página no responde (se demora demasiado o está caída)';
    else if (/ECONNREFUSED|ECONNRESET|EHOSTUNREACH|ENETUNREACH/.test(e)) motivo = 'El servidor rechaza la conexión: la página está caída';
    else if (TLS_RE.test(e)) motivo = 'Certificado SSL inválido y la página no carga sin https';
    else motivo = `La página no carga (${e})`;
    return resultado(base, 'caida', { error: e, ms: r.ms, problemas: [...problemas, P(motivo, 'su página web no está cargando', 5)] });
  }

  const finalHost = hostOf(r.finalUrl);
  const pFinal = matchHost(finalHost, RESERVAS) || matchHost(finalHost, VENTAS);
  if (pFinal) {
    const tipoPlataforma = PLATAFORMA_POR_NOMBRE[pFinal[1]];
    return resultado(base, 'plataforma', {
      red: pFinal[1], tipoPlataforma, finalUrl: r.finalUrl,
      resumen: tipoPlataforma === 'reservas' ? `Su web redirige a ${pFinal[1]} (reservas)` : `Su web redirige a ${pFinal[1]}`,
    });
  }
  const sFinal = matchHost(finalHost, SOCIAL);
  if (sFinal)
    return resultado(base, 'red_social', { red: sFinal[1], finalUrl: r.finalUrl, resumen: `Su web redirige a ${sFinal[1]}` });
  const dFinal = matchHost(finalHost, DEAD_HOSTS);
  if (dFinal)
    return resultado(base, 'caida', { motivoCaida: 'google_site', problemas: [P(dFinal[1], 'su web de Google dejó de existir', 5)] });

  const server = (r.headers?.get('server') || '').toLowerCase();
  const protegido = /cloudflare|sucuri|akamai|ddos|imperva|incapsula/.test(server) || r.headers?.get('cf-ray');
  if (r.status === 429 || ([401, 403, 503].includes(r.status) && protegido) || [401, 403].includes(r.status))
    return resultado(base, 'no_verificable', {
      httpStatus: r.status, finalUrl: r.finalUrl,
      resumen: 'La web bloquea visitas automáticas. Revísala a mano.',
    });
  if (r.status >= 400) {
    const motivo = r.status === 404 ? 'La página da error 404 (no encontrada)'
      : r.status >= 500 ? `Error del servidor (${r.status}): la página no funciona` : `La página responde con error ${r.status}`;
    return resultado(base, 'caida', { httpStatus: r.status, finalUrl: r.finalUrl, problemas: [...problemas, P(motivo, 'su página web muestra un error', 5)] });
  }

  // ---- Análisis del contenido ----
  const html = r.html || '';
  const low = html.toLowerCase();
  const texto = low
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const corta = texto.length < 3000;

  if (corta && PARKED.some((k) => texto.includes(k)))
    return resultado(base, 'caida', { finalUrl: r.finalUrl, motivoCaida: 'parked', problemas: [P('El dominio está estacionado o en venta: no hay sitio', 'su página web no carga: el dominio está en venta o sin sitio', 5)] });
  if (corta && SUSPENDED.some((k) => texto.includes(k)))
    return resultado(base, 'caida', { finalUrl: r.finalUrl, problemas: [P('El hosting está suspendido: la web no se ve', 'su página web está suspendida', 5)] });
  if (corta && DEFAULT_PAGES.some((k) => texto.includes(k)))
    return resultado(base, 'caida', { finalUrl: r.finalUrl, problemas: [P('Muestra la página por defecto del hosting: no hay sitio publicado', 'su página web está vacía', 5)] });
  if (texto.length < 2500 && UNDER_CONSTRUCTION.some((k) => texto.includes(k)))
    return resultado(base, 'caida', { finalUrl: r.finalUrl, problemas: [P('La web está "en construcción" / sin contenido', 'su página web sigue "en construcción"', 5)] });

  const https = /^https:/i.test(r.finalUrl);
  if (!https && !problemas.length) {
    const r2 = await leerPagina(r.finalUrl.replace(/^http:/i, 'https:'), 8000);
    if (!(r2.ok && r2.status < 400))
      problemas.push(P('No usa https: el navegador la marca como "No segura"', 'el navegador la marca como "No segura"', 4));
  }

  const responsive = /<meta[^>]+name\s*=\s*["']?viewport/i.test(html);
  if (!responsive) problemas.push(P('No está adaptada a celulares (sin diseño responsive)', 'no se ve bien en celulares', 4));

  const free = matchHost(finalHost, FREE_HOSTS);
  if (free) problemas.push(P(`Usa un dominio gratuito (${finalHost}), se ve poco profesional`, 'usa un dominio gratuito en vez de uno propio', 2));

  if (r.ms > 4500) problemas.push(P(`Carga lenta (${(r.ms / 1000).toFixed(1)} s)`, 'carga lento', 2));

  const anios = [...low.matchAll(/(?:©|&copy;|&#169;|copyright)\s*(?:\d{4}\s*[-–]\s*)?((?:19|20)\d{2})/g)].map((m) => +m[1]);
  const anioMax = anios.length ? Math.max(...anios) : null;
  const anioActual = new Date().getFullYear();
  if (anioMax && anioMax <= anioActual - 3)
    problemas.push(P(`Parece desactualizada (© ${anioMax})`, 'se ve desactualizada', 2));

  if (low.includes('.swf') || low.includes('shockwave-flash'))
    problemas.push(P('Usa Flash (tecnología que ya no funciona)', 'usa tecnología obsoleta', 4));

  if (!/<title[^>]*>\s*[^<\s][^<]*<\/title>/i.test(html)) problemas.push(P('No tiene título (malo para aparecer en Google)', 'no está optimizada para Google', 1));
  if (!/<meta[^>]+name\s*=\s*["']?description/i.test(html)) problemas.push(P('Sin descripción para Google (SEO básico)', 'no está optimizada para Google', 1));
  if (!/wa\.me|api\.whatsapp\.com|whatsapp:\/\/|web\.whatsapp\.com|wa\.link/i.test(low))
    problemas.push(P('No tiene botón de WhatsApp', 'no tiene un botón de WhatsApp para que les escriban', 1));

  let ps = null;
  if (conPagespeed) {
    try {
      ps = await pagespeed(r.finalUrl, pagespeedKey);
      if (ps !== null && ps < 50) problemas.push(P(`Rendimiento en celular muy bajo (PageSpeed ${ps}/100)`, 'es muy lenta en celulares', 3));
      else if (ps !== null && ps < 70) problemas.push(P(`Rendimiento en celular mejorable (PageSpeed ${ps}/100)`, 'podría cargar más rápido en celulares', 1));
    } catch (e) {
      ps = null;
      console.warn('PageSpeed falló:', e.message);
    }
  }

  problemas.sort((a, b) => b.peso - a.peso);
  const peso = problemas.reduce((s, p) => s + p.peso, 0);
  return resultado(base, peso >= 4 ? 'mejorable' : 'ok', {
    problemas,
    peso,
    httpStatus: r.status,
    ms: r.ms,
    finalUrl: r.finalUrl,
    https,
    responsive,
    pagespeed: ps,
    resumen: problemas.length ? problemas.slice(0, 2).map((p) => p.texto).join(' · ') : 'La web se ve bien',
  });
}
