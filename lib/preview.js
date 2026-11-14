// Genera una maqueta de landing page para mostrarle al negocio "así podría verse tu web".

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const TEMAS = [
  {
    id: 'fitness', kw: /gimnas|gym|crossfit|yoga|pilates|box\b|dojo|danza|baile|artes marciales|entrenamiento/i,
    color: '#B91C1C', fondo: '#FEF2F2', icono: '💪', eslogan: 'Entrena con nosotros y supera tus metas',
    cta: 'Pide tu clase de prueba', seccion: 'Planes y clases',
    items: [['Clases grupales', 'Horarios para todos, con profes que te acompañan.'], ['Entrenamiento personalizado', 'Un plan a tu medida y seguimiento real.'], ['Planes mensuales', 'Precios claros, sin letra chica.']],
    sobre: 'Somos una comunidad que entrena en serio y en buena onda.',
  },
  {
    id: 'comida', kw: /restaur|caf[eé]|cafeter|\bbar\b|pub|panader|pasteler|sangu|pizz|sushi|comida|cocina|helad|empanad|parrill|burger|hamburg|cevich|picada|fuente de soda|food|bakery|coffee|churrasc|completo|dulcer|chocolat|bebid|cervec|vino|botiller/i,
    color: '#C2410C', fondo: '#FFF7ED', icono: '🍽️', eslogan: 'Sabores que se recuerdan',
    cta: 'Pedir por WhatsApp', seccion: 'Nuestra carta',
    items: [['Especialidades de la casa', 'Los platos que nos hicieron conocidos en el barrio.'], ['Menú del día', 'Preparado fresco, todos los días.'], ['Para llevar y delivery', 'Pide y retira, o te lo llevamos a tu casa.']],
    sobre: 'Cocinamos con ingredientes frescos y la misma receta de siempre.',
  },
  {
    id: 'belleza', kw: /peluquer|barber|est[eé]tic|spa\b|u[ñn]as|manicur|sal[oó]n|belleza|maquill|ceja|pesta[ñn]|depila|masaje|tatu|tattoo/i,
    color: '#9D174D', fondo: '#FDF2F8', icono: '✂️', eslogan: 'Tu mejor versión empieza aquí',
    cta: 'Agendar hora', seccion: 'Servicios',
    items: [['Cortes y peinados', 'Estilo actual, asesoría personalizada.'], ['Color y tratamientos', 'Productos de calidad para cuidar tu pelo.'], ['Manos, pies y más', 'Un momento para ti, sin apuro.']],
    sobre: 'Un espacio cómodo, con profesionales que escuchan lo que quieres.',
  },
  {
    id: 'salud', kw: /dent|odonto|cl[ií]nic|m[eé]dic|kinesi|psic|veterin|[oó]ptic|farmac|laborator|nutri|podolog|fonoaud|salud|centro m/i,
    color: '#0F766E', fondo: '#F0FDFA', icono: '🩺', eslogan: 'Cuidamos de ti con dedicación',
    cta: 'Reservar hora', seccion: 'Atenciones',
    items: [['Consultas', 'Atención cercana y a tiempo.'], ['Tratamientos', 'Profesionales con experiencia y equipamiento actualizado.'], ['Convenios y formas de pago', 'Pregúntanos por las opciones disponibles.']],
    sobre: 'Te atendemos con calidez, explicando cada paso.',
  },
  {
    id: 'auto', kw: /taller|mec[aá]nic|automotr|neum[aá]tic|vulcaniz|lubric|lavado de auto|desabollad|repuesto|autolavado|car wash|motos/i,
    color: '#1D4ED8', fondo: '#EFF6FF', icono: '🔧', eslogan: 'Tu auto en buenas manos',
    cta: 'Cotizar por WhatsApp', seccion: 'Servicios',
    items: [['Mantención y diagnóstico', 'Revisamos tu vehículo y te explicamos todo.'], ['Reparaciones', 'Trabajo garantizado y repuestos de calidad.'], ['Presupuesto sin compromiso', 'Escríbenos y te cotizamos al tiro.']],
    sobre: 'Trabajo honesto, precios claros y plazos que se cumplen.',
  },
  {
    id: 'tienda', kw: /tienda|ferreter|almac[eé]n|minimarket|botiller|librer|jugueter|florer|boutique|ropa|calzado|bazar|distribuid|market|store|shop|mueble|deport|regal|mascot|pet ?shop|joyer|perfum|electr[oó]nic|celular|computa|bicicl|vivero|papeler/i,
    color: '#047857', fondo: '#ECFDF5', icono: '🛍️', eslogan: 'Todo lo que buscas, cerca de ti',
    cta: 'Consultar stock', seccion: 'Productos',
    items: [['Lo más vendido', 'Los productos favoritos de nuestros clientes.'], ['Novedades', 'Llegan cosas nuevas todas las semanas.'], ['Despacho y retiro', 'Compra por WhatsApp y retira o recibe en casa.']],
    sobre: 'Atención de barrio, buenos precios y variedad.',
  },
];

const DEFAULT_TEMA = {
  id: 'servicio', color: '#4338CA', fondo: '#EEF2FF', icono: '⭐', eslogan: 'Calidad y confianza en cada trabajo',
  cta: 'Cotizar por WhatsApp', seccion: 'Servicios',
  items: [['Nuestro servicio principal', 'Lo que mejor hacemos, con garantía.'], ['Atención personalizada', 'Escuchamos lo que necesitas.'], ['Cotización sin costo', 'Escríbenos y te respondemos rápido.']],
  sobre: 'Nos importa hacer bien las cosas y que vuelvas.',
};

export function temaPara(lead) {
  const txt = `${lead.rubroGoogle || ''} ${(lead.busquedas || []).map((b) => b.rubro).join(' ')} ${lead.nombre || ''}`;
  return TEMAS.find((t) => t.kw.test(txt)) || DEFAULT_TEMA;
}

const DIAS = { lunes: 'Lunes', martes: 'Martes', 'miércoles': 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', 'sábado': 'Sábado', domingo: 'Domingo' };

/**
 * @param {object} lead
 * @param {object} cfg
 * @param {object} opts { conFotos: boolean }
 */
export function renderLanding(lead, cfg, { conFotos = true } = {}) {
  const t = temaPara(lead);
  const comuna = lead.busquedas?.[0]?.comuna || '';
  const rating = lead.rating ? String(lead.rating).replace('.', ',') : '';
  const fotos = conFotos ? (lead.fotos || []).slice(0, 4) : [];
  const fotoUrl = (f, w = 1400) => `/api/photo?name=${encodeURIComponent(f.name)}&w=${w}`;
  const autores = [...new Set(fotos.flatMap((f) => (f.autores || []).map((a) => a.nombre)).filter(Boolean))];
  const wa = lead.esMovil && lead.waNumber
    ? `https://wa.me/${lead.waNumber}?text=${encodeURIComponent(`Hola ${lead.nombre}, vi su página web y quería consultar...`)}`
    : null;
  const tel = lead.telefonoIntl ? `tel:${lead.telefonoIntl.replace(/\s/g, '')}` : null;
  const ctaHref = wa || tel || '#contacto';
  const ig = lead.webCheck?.red === 'Instagram' ? lead.web : null;
  const anio = new Date().getFullYear();
  const heroBg = fotos[0]
    ? `linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.7)), url('${fotoUrl(fotos[0])}') center/cover`
    : `radial-gradient(1200px 500px at 80% -10%, ${t.color}cc, transparent), linear-gradient(135deg, ${t.color}, #111827)`;

  const horario = (lead.horario || []).map((h) => {
    const [dia, ...resto] = h.split(':');
    return `<li><span>${esc(DIAS[dia.trim().toLowerCase()] || dia)}</span><span>${esc(resto.join(':').trim())}</span></li>`;
  }).join('');

  const galeria = fotos.length > 1
    ? `<section class="galeria wrap">${fotos.slice(1).map((f) => `<img loading="lazy" src="${fotoUrl(f, 800)}" alt="Foto de ${esc(lead.nombre)}">`).join('')}</section>
       ${autores.length ? `<p class="wrap atrib">Fotos: ${esc(autores.join(', '))} · vía Google Maps</p>` : ''}`
    : '';

  const cinta = `<div class="cinta">✨ Maqueta de muestra para <b>${esc(lead.nombre)}</b> · creada por <b>${esc(cfg.miNegocio || 'tu diseñadora web')}</b>${cfg.miInstagram ? ` · @${esc(cfg.miInstagram)}` : ''}</div>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(lead.nombre)} · ${esc(t.eslogan)}</title>
<meta name="description" content="${esc(lead.nombre)}${comuna ? ` en ${esc(comuna)}` : ''}. ${esc(t.eslogan)}.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --c: ${t.color}; --f: ${t.fondo}; --t: #111827; --m: #4b5563; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Inter, system-ui, sans-serif; color: var(--t); background: #fff; line-height: 1.6; }
  a { color: inherit; }
  .wrap { width: min(1100px, 92%); margin: 0 auto; }
  .cinta { background: #111827; color: #f9fafb; text-align: center; font-size: 13px; padding: 8px 12px; }
  header.nav { position: absolute; left: 0; right: 0; z-index: 2; }
  header.nav .wrap { display: flex; align-items: center; justify-content: space-between; padding: 22px 0; color: #fff; }
  .logo { font-family: Fraunces, serif; font-weight: 800; font-size: 22px; letter-spacing: -.01em; }
  .nav a.btn { padding: 10px 18px; font-size: 14px; }
  .hero { background: ${heroBg}; color: #fff; min-height: 88vh; display: flex; align-items: flex-end; position: relative; }
  .hero .wrap { padding: 140px 0 80px; }
  .badge { display: inline-flex; gap: 8px; align-items: center; background: rgba(255,255,255,.14); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,.25); border-radius: 999px; padding: 6px 14px; font-size: 14px; margin-bottom: 20px; }
  h1 { font-family: Fraunces, serif; font-size: clamp(40px, 7vw, 84px); line-height: 1.02; letter-spacing: -.02em; max-width: 14ch; }
  .hero p.sub { font-size: clamp(17px, 2.2vw, 21px); opacity: .92; margin: 18px 0 32px; max-width: 46ch; }
  .btn { display: inline-flex; align-items: center; gap: 8px; background: var(--c); color: #fff; text-decoration: none; padding: 15px 26px; border-radius: 999px; font-weight: 600; border: 0; box-shadow: 0 10px 30px -10px var(--c); transition: transform .15s; }
  .btn:hover { transform: translateY(-2px); }
  .btn.sec { background: transparent; border: 1.5px solid rgba(255,255,255,.7); box-shadow: none; margin-left: 10px; }
  section { padding: 90px 0; }
  .eyebrow { color: var(--c); font-weight: 600; text-transform: uppercase; letter-spacing: .12em; font-size: 13px; }
  h2 { font-family: Fraunces, serif; font-size: clamp(30px, 4vw, 46px); line-height: 1.1; margin: 8px 0 18px; letter-spacing: -.01em; }
  .sobre { display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; align-items: center; }
  .sobre p { color: var(--m); font-size: 18px; }
  .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .stat { background: var(--f); border-radius: 20px; padding: 26px; }
  .stat b { display: block; font-family: Fraunces, serif; font-size: 40px; color: var(--c); line-height: 1; }
  .stat span { color: var(--m); font-size: 14px; }
  .items { background: var(--f); }
  .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-top: 34px; }
  .card { background: #fff; border-radius: 22px; padding: 30px; box-shadow: 0 1px 0 rgba(0,0,0,.04), 0 20px 40px -30px rgba(0,0,0,.35); }
  .card .ico { width: 46px; height: 46px; border-radius: 14px; background: var(--f); display: grid; place-items: center; font-size: 22px; margin-bottom: 16px; }
  .card h3 { font-size: 19px; margin-bottom: 6px; }
  .card p { color: var(--m); }
  .galeria { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 0; margin-top: -40px; }
  .galeria img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 18px; }
  .atrib { font-size: 12px; color: #9ca3af; margin-top: 8px; }
  .info { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
  .box { border: 1px solid #e5e7eb; border-radius: 22px; padding: 30px; }
  .box h3 { margin-bottom: 14px; }
  .horario { list-style: none; }
  .horario li { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e5e7eb; }
  .horario li span:last-child { color: var(--m); }
  .cta-final { background: #111827; color: #fff; text-align: center; border-radius: 32px; padding: 70px 30px; }
  .cta-final h2 { color: #fff; }
  .cta-final p { opacity: .8; margin-bottom: 26px; }
  footer { text-align: center; color: #9ca3af; font-size: 14px; padding: 40px 0 60px; }
  .wa-float { position: fixed; right: 22px; bottom: 22px; width: 60px; height: 60px; border-radius: 50%; background: #25D366; display: grid; place-items: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,.35); z-index: 9; }
  .wa-float svg { width: 32px; height: 32px; fill: #fff; }
  @media (max-width: 820px) {
    .sobre, .info, .grid3 { grid-template-columns: 1fr; }
    .galeria { grid-template-columns: 1fr 1fr; }
    .btn.sec { margin: 12px 0 0; }
    .nav a.btn { display: none; }
  }
</style>
</head>
<body>
${cinta}
<header class="nav"><div class="wrap"><div class="logo">${esc(lead.nombre)}</div><a class="btn" href="${esc(ctaHref)}">${esc(t.cta)}</a></div></header>

<section class="hero">
  <div class="wrap">
    ${rating ? `<div class="badge">★ ${rating} · ${lead.resenas} reseñas en Google</div>` : `<div class="badge">${t.icono} ${esc(lead.rubroGoogle || t.seccion)}${comuna ? ` en ${esc(comuna)}` : ''}</div>`}
    <h1>${esc(lead.nombre)}</h1>
    <p class="sub">${esc(t.eslogan)}${comuna ? `, en el corazón de ${esc(comuna)}` : ''}.</p>
    <a class="btn" href="${esc(ctaHref)}">${esc(t.cta)} →</a>
    <a class="btn sec" href="#info">Horarios y ubicación</a>
  </div>
</section>

${galeria}

<section>
  <div class="wrap sobre">
    <div>
      <div class="eyebrow">Quiénes somos</div>
      <h2>Hola, somos ${esc(lead.nombre)}</h2>
      <p>${esc(t.sobre)} ${comuna ? `Atendemos a vecinos de ${esc(comuna)} y alrededores` : 'Te esperamos'}${rating ? `, y nuestros clientes nos respaldan con ${rating} estrellas en Google` : ''}.</p>
    </div>
    <div class="stats">
      ${rating ? `<div class="stat"><b>${rating}★</b><span>calificación en Google</span></div>` : ''}
      ${lead.resenas ? `<div class="stat"><b>${lead.resenas}+</b><span>reseñas de clientes</span></div>` : ''}
      <div class="stat"><b>${t.icono}</b><span>${esc(lead.rubroGoogle || t.seccion)}</span></div>
      ${comuna ? `<div class="stat"><b>📍</b><span>${esc(comuna)}</span></div>` : ''}
    </div>
  </div>
</section>

<section class="items">
  <div class="wrap">
    <div class="eyebrow">${esc(t.seccion)}</div>
    <h2>Lo que te ofrecemos</h2>
    <div class="grid3">
      ${t.items.map(([h, p], i) => `<div class="card"><div class="ico">${['✦', '◆', '●'][i]}</div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}
    </div>
  </div>
</section>

<section id="info">
  <div class="wrap info">
    <div class="box">
      <h3>🕒 Horarios</h3>
      ${horario ? `<ul class="horario">${horario}</ul>` : '<p>Escríbenos para conocer nuestros horarios.</p>'}
    </div>
    <div class="box" id="contacto">
      <h3>📍 Dónde estamos</h3>
      <p>${esc(lead.direccionCompleta || lead.direccion)}</p>
      <p style="margin:18px 0"><a class="btn" href="${esc(lead.mapsUrl)}" target="_blank" rel="noopener">Cómo llegar</a></p>
      ${lead.telefono ? `<p>📞 <a href="${esc(tel)}">${esc(lead.telefono)}</a></p>` : ''}
      ${ig ? `<p>📸 <a href="${esc(ig)}" target="_blank" rel="noopener">Síguenos en Instagram</a></p>` : ''}
    </div>
  </div>
</section>

<section>
  <div class="wrap cta-final">
    <h2>¿Conversamos?</h2>
    <p>Escríbenos y te respondemos a la brevedad.</p>
    <a class="btn" href="${esc(ctaHref)}">${esc(t.cta)} →</a>
  </div>
</section>

<footer>© ${anio} ${esc(lead.nombre)} · Sitio de muestra diseñado por ${esc(cfg.miNegocio || '')}</footer>
${wa ? `<a class="wa-float" href="${esc(wa)}" aria-label="WhatsApp"><svg viewBox="0 0 32 32"><path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.5.7 4.8 1.9 6.8L3 29l6.8-2.1c1.9 1.1 4.1 1.7 6.3 1.7 7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23c-2 0-3.9-.6-5.6-1.6l-.4-.2-4 1.2 1.3-3.9-.3-.4a10.3 10.3 0 0 1-1.6-5.5C5.4 9.9 10.1 5.3 16 5.3s10.6 4.6 10.6 10.3S21.9 26 16 26zm5.8-7.7c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.6 8.6 0 0 1-4.3-3.7c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.8 1.2 3.2 1.4 3.5 2.4 3.6 5.8 5c2.2.9 3 1 4 .8.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.3z"/></svg></a>` : ''}
</body>
</html>`;
}
