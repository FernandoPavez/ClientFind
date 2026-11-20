// ClientFind — interfaz
import { desglosePrioridad, bandaPrioridad } from './prioridad.js';

const RUBROS = ['restaurantes', 'cafeterías', 'peluquerías', 'barberías', 'centros de estética', 'manicure', 'veterinarias', 'ferreterías', 'talleres mecánicos', 'dentistas', 'panaderías', 'pastelerías', 'botillerías', 'minimarkets', 'florerías', 'gimnasios', 'ópticas', 'lavanderías', 'imprentas', 'tiendas de ropa', 'sushi', 'pizzerías', 'kinesiólogos', 'psicólogos', 'jardines infantiles', 'colegios particulares', 'abogados', 'contadores', 'inmobiliarias', 'tatuajes', 'vulcanizaciones', 'mueblerías', 'pet shops', 'electricistas', 'cerrajerías'];
const COMUNAS = ['Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'Lo Barnechea', 'Ñuñoa', 'La Reina', 'Peñalolén', 'Macul', 'La Florida', 'Puente Alto', 'San Miguel', 'San Joaquín', 'La Cisterna', 'El Bosque', 'La Granja', 'La Pintana', 'San Ramón', 'Lo Espejo', 'Pedro Aguirre Cerda', 'Estación Central', 'Maipú', 'Cerrillos', 'Quinta Normal', 'Lo Prado', 'Pudahuel', 'Cerro Navia', 'Renca', 'Quilicura', 'Conchalí', 'Huechuraba', 'Recoleta', 'Independencia', 'San Bernardo', 'Buin', 'Paine', 'Colina', 'Lampa', 'Talagante', 'Peñaflor', 'Melipilla', 'Pirque', 'San José de Maipo'];

const CAT = {
  sin_web: 'Sin web', red_social: 'Solo redes', plataforma: 'Plataforma', caida: 'Web caída', mejorable: 'Web mejorable',
  ok: 'Web OK', no_verificable: 'Revisar a mano', pendiente: 'Analizando…',
};
const OPORTUNIDADES = ['sin_web', 'red_social', 'plataforma', 'caida', 'mejorable', 'no_verificable', 'pendiente'];
const ESTADOS = [
  ['nuevo', 'Nuevo'], ['contactado', 'Contactado'], ['respondio', 'Respondió'], ['reunion', 'Reunión / propuesta'],
  ['ganado', 'Cliente 🎉'], ['perdido', 'Perdido'], ['no_contactar', 'No contactar'],
];
const NOMBRE_ESTADO = Object.fromEntries(ESTADOS);

const S = {
  config: null, leads: [], stats: null, busquedas: [], tab: null, abierto: null, pollTimer: null, mostrar: 60,
  f: { texto: '', categoria: 'oportunidades', estado: 'por_contactar', busqueda: '', orden: 'prioridad', soloWa: false },
};
const FILTROS_INICIALES = { texto: '', categoria: 'oportunidades', busqueda: '', orden: 'prioridad', soloWa: false };

// ---------- utilidades ----------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const h = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const fmtRating = (r) => (r == null ? '' : String(r).replace('.', ','));
const fecha = (iso) => (iso ? new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '');
const diasDesde = (iso) => (iso ? Math.floor((Date.now() - Date.parse(iso)) / 864e5) : null);

async function api(path, opts = {}) {
  const init = { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } };
  if (init.body && typeof init.body !== 'string') init.body = JSON.stringify(init.body);
  const res = await fetch(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

function toast(msg, { error = false, accion, alHacer, ms = accion ? 9000 : 4500 } = {}) {
  const el = document.createElement('div');
  el.className = `toast${error ? ' error' : ''}`;
  if (error) el.setAttribute('role', 'alert');
  el.innerHTML = `<span>${h(msg)}</span>`;
  if (accion) {
    const b = document.createElement('button');
    b.textContent = accion;
    b.onclick = () => { alHacer?.(); el.remove(); };
    el.append(b);
  }
  $('#toasts').append(el);
  setTimeout(() => el.remove(), ms);
}

function necesitaSeguimiento(l) {
  if (l.estado !== 'contactado' || !l.ultimoContacto) return false;
  return diasDesde(l.ultimoContacto) >= (S.config?.diasSeguimiento || 3);
}

// Etapas del trabajo diario: qué hacer con cada lead, no su estado exacto (ese está en la fila y en el detalle).
const GRUPOS = [
  ['por_contactar', 'Por contactar', (l) => l.estado === 'nuevo'],
  ['seguimiento', 'Toca seguimiento', necesitaSeguimiento],
  ['en_curso', 'En curso', (l) => ['contactado', 'respondio', 'reunion'].includes(l.estado) && !necesitaSeguimiento(l)],
  ['cerrados', 'Cerrados', (l) => ['ganado', 'perdido', 'no_contactar'].includes(l.estado)],
  ['todos', 'Todos', () => true],
];
const EN_GRUPO = Object.fromEntries(GRUPOS.map(([k, , fn]) => [k, fn]));

// ---------- mensajes ----------
const PLANTILLAS = [
  ['sin_web', 'Sin web'],
  ['red_social', 'Solo redes sociales (Instagram, Facebook, WhatsApp…)'],
  ['reservas', 'Usa plataforma de reservas (AgendaPro, Booksy…)'],
  ['ventas', 'Vende por plataforma de pedidos (PedidosYa, Rappi…)'],
  ['caida', 'Web caída'],
  ['mejorable', 'Web mejorable'],
  ['primerContacto', 'General (otros casos)'],
  ['seguimiento', 'Seguimiento'],
];
const NOMBRE_PLANTILLA = Object.fromEntries(PLANTILLAS);

function plantillaAuto(l) {
  if (l.contactos) return 'seguimiento';
  const w = l.webCheck || {};
  if (w.categoria === 'plataforma') return w.tipoPlataforma === 'ventas' ? 'ventas' : 'reservas';
  if (['sin_web', 'red_social', 'caida', 'mejorable'].includes(w.categoria)) return w.categoria;
  return 'primerContacto';
}
const tieneB = (key) => !!S.config?.plantillas?.[`${key}_B`]?.trim();
function varianteAuto(l, key) {
  if (!tieneB(key)) return 'A';
  let x = 7;
  for (const ch of `${l.id}${key}`) x = (x * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(x) % 2 ? 'B' : 'A';
}
function etiquetaPlantilla(codigo) {
  if (!codigo) return '—';
  if (codigo === 'manual') return 'Otro medio / sin plantilla';
  const [k, v] = codigo.split(':');
  return `${NOMBRE_PLANTILLA[k] || k}${v === 'B' ? ' · versión B' : v === 'A' && tieneB(k) ? ' · versión A' : ''}`;
}

function variables(lead) {
  const c = S.config || {};
  const comuna = lead.busquedas?.[0]?.comuna || '';
  const buenaFama = lead.rating >= 4.3 && lead.resenas >= 15;
  return {
    nombre: lead.nombre,
    mi_nombre: c.miNombre || '',
    mi_negocio: c.miNegocio || '',
    mi_instagram: c.miInstagram ? `@${c.miInstagram}` : '',
    rubro: (lead.busquedas?.[0]?.rubro || lead.rubroGoogle || '').toLowerCase(),
    comuna,
    en_comuna: comuna ? ` en ${comuna}` : '',
    rating: fmtRating(lead.rating),
    resenas: lead.resenas || 0,
    reputacion: buenaFama ? ` con ${fmtRating(lead.rating)}⭐ y ${lead.resenas} reseñas (¡felicitaciones!)` : '',
    // «ayer», «hace 4 días»: cuándo fue el último mensaje, para que el seguimiento no diga «hace unos días» si fue ayer
    cuando: lead.ultimoContacto ? haceDias(diasDesde(lead.ultimoContacto)) : 'hace unos días',
    problema: lead.webCheck?.frase || 'no tienen página web',
    plataforma: lead.webCheck?.red || 'red social',
  };
}
// Devuelve { texto, codigo } — codigo identifica plantilla y versión, para las estadísticas
function mensaje(lead, key, version) {
  key ||= plantillaAuto(lead);
  version ||= varianteAuto(lead, key);
  const p = S.config?.plantillas || {};
  const tpl = (version === 'B' ? p[`${key}_B`] : p[key]) || p.primerContacto || '';
  const v = variables(lead);
  return { texto: tpl.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m)), codigo: `${key}:${version}` };
}

// ---------- carga de datos ----------
async function cargarTodo() {
  const [config, data, b] = await Promise.all([api('/api/config'), api('/api/leads'), api('/api/busquedas')]);
  S.config = config;
  S.leads = data.leads;
  S.stats = data.stats;
  S.busquedas = b.busquedas;
}

async function refrescarLeads() {
  const data = await api('/api/leads');
  S.leads = data.leads;
  S.stats = data.stats;
  render();
  vigilarPendientes();
}

function vigilarPendientes() {
  clearTimeout(S.pollTimer);
  if (S.stats?.pendientes > 0) S.pollTimer = setTimeout(() => refrescarLeads().catch(() => {}), 2500);
}

function actualizarLead(lead, stats) {
  const i = S.leads.findIndex((l) => l.id === lead.id);
  if (i >= 0) S.leads[i] = lead; else S.leads.push(lead);
  if (stats) S.stats = stats;
}

// ---------- render general ----------
function render() {
  document.body.dataset.tab = S.tab || '';
  renderTop();
  $$('#tabs button').forEach((b) => {
    b.classList.toggle('activo', b.dataset.tab === S.tab);
    if (b.dataset.tab === S.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  $$('.vista').forEach((v) => { v.hidden = v.id !== `vista-${S.tab}`; });
  $('#cuenta-leads').textContent = S.leads.length || '';
  const aviso = $('#aviso-demo');
  if (S.config?.modoDemo) {
    aviso.hidden = false;
    aviso.innerHTML = S.config.tieneApiKey
      ? '🧪 <b>Modo demo activo:</b> los negocios que aparecen son ficticios. Desactívalo en <a href="#" data-ir="config">Configuración</a> para buscar de verdad.'
      : '🧪 <b>Modo demo:</b> los negocios que aparecen son ficticios. Para buscar en Google Maps de verdad, agrega tu API key en <a href="#" data-ir="config">Configuración</a> (los pasos están en docs/INSTALACION.md).';
  } else aviso.hidden = true;
  if (S.tab === 'leads') renderLeads();
  if (S.tab === 'automaticas') renderAuto();
  if (S.tab === 'resultados') renderResultados();
}

function renderTop() {
  const s = S.stats || {};
  const uso = s.usoMes || {};
  const chips = [];
  if (s.demo) chips.push('<span class="chip-top demo">Modo demo</span>');
  const sobre = s.contactadosHoy >= s.limiteDiario;
  chips.push(`<span class="chip-top chip-hoy ${sobre ? 'alerta' : ''}" title="Contactos enviados hoy / límite diario">Hoy <b>${s.contactadosHoy || 0}/${s.limiteDiario || 0}</b> mensajes</span>`);
  if (s.seguimientos) chips.push(`<button class="chip-top alerta" data-seg="1" title="Contactados hace varios días sin respuesta"><b>${s.seguimientos}</b> por seguir</button>`);
  if (s.pendientes) chips.push(`<span class="chip-top">Analizando <b>${s.pendientes}</b> webs…</span>`);
  if (!s.demo) {
    const usadas = uso.textSearch || 0;
    const lleno = usadas >= s.limiteMensualBusquedas * 0.9;
    chips.push(`<span class="chip-top ${lleno ? 'alerta' : ''}" title="Llamadas a Google este mes / tu límite gratis. Google regala 1.000 al mes; la app se detiene antes.">Google <b>${usadas}/${s.limiteMensualBusquedas}</b> llamadas${uso.fotos ? ` · <b>${uso.fotos}/${s.limiteMensualFotos}</b> fotos` : ''}</span>`);
  }
  $('#chips-top').innerHTML = chips.join('');
}

// ---------- vista leads ----------
// Filtros de la barra (todo menos la etapa): se usan también para que los conteos del pipeline cuadren con la lista.
function pasaFiltros(l) {
  const f = S.f;
  const txt = f.texto.trim().toLowerCase();
  const cat = l.webCheck?.categoria || 'pendiente';
  if (f.categoria === 'oportunidades' && !OPORTUNIDADES.includes(cat)) return false;
  if (!['oportunidades', 'todas'].includes(f.categoria) && cat !== f.categoria) return false;
  if (f.busqueda && !l.busquedas?.some((b) => b.etiqueta === f.busqueda)) return false;
  if (f.soloWa && !l.esMovil) return false;
  if (txt && !`${l.nombre} ${l.direccion} ${l.notas} ${l.rubroGoogle}`.toLowerCase().includes(txt)) return false;
  return true;
}
const hayFiltros = () => Object.entries(FILTROS_INICIALES).some(([k, v]) => S.f[k] !== v);

function limpiarFiltros() {
  Object.assign(S.f, FILTROS_INICIALES);
  $('#f-texto').value = '';
  $('#f-categoria').value = FILTROS_INICIALES.categoria;
  $('#f-busqueda').value = '';
  $('#f-orden').value = FILTROS_INICIALES.orden;
  $('#f-wa').checked = false;
  S.mostrar = 60;
  renderLeads();
}

function filtrar() {
  const f = S.f;
  const enGrupo = EN_GRUPO[f.estado] || EN_GRUPO.todos;
  let ls = S.leads.filter((l) => enGrupo(l) && pasaFiltros(l));
  const ord = {
    prioridad: (a, b) => b.prioridad - a.prioridad || b.resenas - a.resenas,
    resenas: (a, b) => b.resenas - a.resenas,
    rating: (a, b) => (b.rating || 0) - (a.rating || 0) || b.resenas - a.resenas,
    recientes: (a, b) => (b.creado || '').localeCompare(a.creado || ''),
    nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
  }[f.orden];
  return ls.sort(ord);
}

function renderPipeline() {
  const visibles = S.leads.filter(pasaFiltros);
  $('#pipeline').innerHTML = GRUPOS.map(([k, n, fn]) => {
    const c = visibles.filter(fn).length;
    const urgente = k === 'seguimiento' && c > 0;
    return `<button class="pipe${urgente ? ' seg' : ''}${S.f.estado === k ? ' activo' : ''}" data-estado="${k}" aria-pressed="${S.f.estado === k}">${h(n)}<b>${c}</b></button>`;
  }).join('');
}

function porQue(l) {
  const w = l.webCheck || {};
  const partes = [`${CAT[w.categoria || 'pendiente']}${w.red ? `: ${w.red}` : ''}`];
  if (l.resenas) partes.push(`${l.resenas} reseñas`);
  if (l.rating) partes.push(`nota ${fmtRating(l.rating)}`);
  partes.push(l.esMovil ? 'tiene WhatsApp' : l.telefono ? 'solo teléfono fijo' : 'sin teléfono');
  return partes.join(' · ');
}

const signo = (n) => `${n >= 0 ? '+' : '−'}${Math.abs(Math.round(n))}`;
// «Prioridad 92 de 100, alta. Sin web +45, 420 reseñas +25, …»: lo que explica el número al pasar el mouse o con lector de pantalla
function explicacionPrioridad(l) {
  const { partes } = desglosePrioridad(l);
  return `Prioridad ${l.prioridad} de 100 (${bandaPrioridad(l.prioridad)}). ${partes.map((p) => `${p.texto} ${signo(p.puntos)}`).join(' · ')}`;
}

// Íconos dibujados con el mismo trazo del riel (2px, puntas redondas)
const svg = (d, extra = '') => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const ICO = {
  estrella: svg('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>', 'style="fill:currentColor;stroke:none"'),
  cerrar: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  recargar: svg('<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>'),
  rayo: svg('<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>'),
};

const haceDias = (d) => (d == null ? '' : d <= 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`);

// Situación del contacto, visible en la fila en todos los tamaños: [clase, texto] o null si aún no se contacta
function lineaEstado(l) {
  const dias = diasDesde(l.ultimoContacto);
  const hace = haceDias(dias);
  switch (l.estado) {
    case 'nuevo': return null;
    case 'contactado': {
      // Copia corta: cabe en una línea del renglón sin cortar cuándo toca seguir
      if (necesitaSeguimiento(l)) return ['seg', `Seguir hoy · escrito ${hace}`];
      if (dias == null) return ['contactado', 'Contactado'];
      const faltan = (S.config?.diasSeguimiento || 3) - dias;
      const Hace = hace.charAt(0).toUpperCase() + hace.slice(1);
      return ['contactado', faltan > 0 ? `${Hace} · seguir en ${faltan} ${faltan === 1 ? 'día' : 'días'}` : `Contactado ${hace}`];
    }
    case 'respondio': return ['ok', 'Respondió'];
    case 'reunion': return ['ok', 'Reunión / propuesta'];
    case 'ganado': return ['ok', 'Cliente'];
    case 'perdido': return ['cerrado', 'Perdido'];
    case 'no_contactar': return ['cerrado', 'Pidió no ser contactado'];
    default: return null;
  }
}

function filaLead(l, foco = false) {
  const cat = l.webCheck?.categoria || 'pendiente';
  const det = cat === 'pendiente' ? '' : (l.webCheck?.resumen || '');
  const rating = l.rating ? `${ICO.estrella}<span class="sr">Nota </span>${fmtRating(l.rating)} <small>(${l.resenas})</small>` : '<span class="muted">sin reseñas</span>';
  // Envío rápido desde la fila solo para el primer mensaje o cuando toca seguimiento:
  // así no se le vuelve a escribir en frío a alguien ya contactado.
  const seg = necesitaSeguimiento(l);
  const puedeEscribir = l.estado === 'nuevo' || seg;
  const waBtn = !puedeEscribir ? '' : l.esMovil
    ? `<button class="btn wa chico" data-wa="${h(l.id)}" title="${seg ? 'Abrir WhatsApp con el mensaje de seguimiento' : 'Abrir WhatsApp con el mensaje listo'}">${seg ? 'Seguimiento' : 'WhatsApp'}</button>`
    : `<button class="btn chico" data-copiar="${h(l.id)}" title="${seg ? 'Copiar mensaje de seguimiento' : 'Copiar mensaje'}">Copiar</button>`;
  const linea = lineaEstado(l);
  const enEspera = !puedeEscribir;
  const sinAbrir = !l.visto && l.estado === 'nuevo';
  const tachado = ['perdido', 'no_contactar'].includes(l.estado);
  return `<div class="lead${enEspera ? ' en-espera' : ''}${tachado ? ' tachado' : ''}${foco ? ' foco' : ''}" data-id="${h(l.id)}">
    <div class="prio ${bandaPrioridad(l.prioridad)}" title="${h(explicacionPrioridad(l))}" role="img" aria-label="${h(explicacionPrioridad(l))}">${l.prioridad}</div>
    <div style="min-width:0">
      <div class="nom"><button type="button" class="nom-btn" data-abrir="${h(l.id)}" title="${h(l.nombre)}">${sinAbrir ? '<span class="punto-nuevo" title="Aún no lo abres" aria-hidden="true"></span><span class="sr">Sin abrir: </span>' : ''}${h(l.nombre)}</button></div>
      <div class="sub">${h(l.rubroGoogle || l.busquedas?.[0]?.rubro || '')}${l.direccion ? ` · ${h(l.direccion)}` : ''}</div>
      ${linea ? `<div class="estado-linea est-${linea[0]}">${h(linea[1])}</div>` : ''}
    </div>
    <div class="rating c-rating">${rating}</div>
    <div class="c-web" style="min-width:0">
      <span class="web-chip cat-${cat}">${CAT[cat]}${l.webCheck?.red ? `: ${h(l.webCheck.red)}` : ''}</span>
      ${det ? `<div class="det">${h(det)}</div>` : ''}
    </div>
    <div class="c-estado"><select class="estado-sel" data-estado-lead="${h(l.id)}" aria-label="Estado de ${h(l.nombre)}">${ESTADOS.map(([k, n]) => `<option value="${k}" ${l.estado === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <div class="acc">${waBtn}<a class="btn chico" href="${h(l.mapsUrl)}" target="_blank" rel="noopener" data-stop="1" title="Abrir en Google Maps">Maps</a></div>
    ${foco ? `<p class="porque"><b>Escríbele primero.</b>${h(porQue(l))}</p>` : ''}
  </div>`;
}

// En el celular los filtros van plegados: el botón dice cuántos están activos para no esconder por qué faltan leads.
function renderContadorFiltros() {
  const f = S.f;
  const n = [f.categoria !== 'oportunidades', !!f.busqueda, f.orden !== 'prioridad', f.soloWa].filter(Boolean).length;
  const el = $('#n-filtros');
  el.hidden = !n;
  el.textContent = n || '';
}

// Firma de la libreta: los mensajes del día en palotes, de cinco en cinco, hasta el límite diario.
function renderDia() {
  const s = S.stats || {};
  const hechos = s.contactadosHoy || 0;
  const limite = Math.max(1, s.limiteDiario || 25);
  const total = Math.max(limite, hechos);
  const grupos = [];
  for (let g = 0; g * 5 < total; g++) {
    const marcas = [];
    for (let i = g * 5; i < Math.min(total, g * 5 + 5); i++) marcas.push(`<i${i < hechos ? ' class="hecho"' : ''}></i>`);
    const completo = Math.min(hechos, (g + 1) * 5) - g * 5 >= 5;
    grupos.push(`<span class="grupo${completo ? ' completo' : ''}${g * 5 >= limite ? ' extra' : ''}">${marcas.join('')}</span>`);
  }
  const lleno = hechos >= limite;
  const texto = lleno
    ? `Hoy · ${hechos} de ${limite}: llegaste al límite`
    : `Hoy · ${hechos} de ${limite} mensajes`;
  $('#dia').innerHTML = `<div class="dia-txt${lleno ? ' lleno' : ''}">${texto}</div><div class="palotes" role="img" aria-label="${hechos} de ${limite} mensajes enviados hoy">${grupos.join('')}</div>`;
}

function renderLeads() {
  renderPipeline();
  renderDia();
  $('#titulo-leads').textContent = GRUPOS.find(([k]) => k === S.f.estado)?.[1] || 'Leads';
  renderContadorFiltros();
  const etiquetas = [...new Set(S.leads.flatMap((l) => (l.busquedas || []).map((b) => b.etiqueta)))].sort();
  const sel = $('#f-busqueda');
  const actual = S.f.busqueda;
  sel.innerHTML = `<option value="">Todas las búsquedas</option>${etiquetas.map((e) => `<option ${e === actual ? 'selected' : ''}>${h(e)}</option>`).join('')}`;

  const ls = filtrar();
  const cont = $('#lista-leads');
  if (!S.leads.length) {
    cont.innerHTML = `<div class="vacio"><p>Todavía no tienes leads.</p><button class="btn primario" data-ir="buscar">Hacer mi primera búsqueda</button></div>`;
    return;
  }
  const limpiar = hayFiltros() ? '<button class="btn chico" data-limpiar="1">Limpiar filtros</button>' : '';
  $('#resumen-lista').innerHTML = ls.length
    ? `<span><b>${ls.length}</b> ${ls.length === 1 ? 'lead' : 'leads'}</span>${limpiar}`
    : '';
  if (!ls.length) {
    const vacios = {
      por_contactar: 'No te quedan leads por contactar. Haz una búsqueda nueva para encontrar más.',
      seguimiento: 'Nadie espera seguimiento hoy.',
      en_curso: 'No tienes conversaciones en curso.',
      cerrados: 'Todavía no cierras ningún lead.',
    };
    cont.innerHTML = `<div class="vacio"><p>${hayFiltros() ? 'Ningún lead coincide con estos filtros.' : h(vacios[S.f.estado] || 'No hay leads aquí.')}</p>${hayFiltros() ? '<button class="btn" data-limpiar="1">Limpiar filtros</button>' : ''}</div>`;
    return;
  }
  // El mejor lead pendiente se destaca solo cuando la lista está en su orden natural (por contactar, por prioridad, sin búsqueda de texto)
  const conFoco = S.f.estado === 'por_contactar' && S.f.orden === 'prioridad' && !S.f.texto.trim();
  cont.innerHTML = ls.slice(0, S.mostrar).map((l, i) => filaLead(l, conFoco && i === 0)).join('')
    + (ls.length > S.mostrar ? `<div class="mas"><button class="btn" data-mas="1">Mostrar más (${ls.length - S.mostrar} restantes)</button></div>` : '');
}

// ---------- drawer ----------
// Mientras el detalle está abierto, el resto de la página queda inerte: el teclado y el lector de pantalla se quedan dentro.
const fondoPagina = () => ['header.top', '#tabs', '#aviso-demo', 'main'].map((s) => $(s)).filter(Boolean);

function abrirLead(id) {
  const l = S.leads.find((x) => x.id === id);
  if (!l) return;
  if (!S.abierto) S.focoPrevio = id;
  S.abierto = id;
  if (!l.visto) api(`/api/leads/${encodeURIComponent(id)}`, { method: 'PATCH', body: { visto: true } }).then((r) => { actualizarLead(r.lead); if (S.tab === 'leads') renderLeads(); }).catch(() => {});
  renderDrawer();
  $('#drawer').hidden = false;
  $('#fondo-drawer').hidden = false;
  fondoPagina().forEach((el) => { el.inert = true; });
  $('#drawer-titulo')?.focus();
}
function cerrarDrawer() {
  if (!S.abierto) return;
  S.abierto = null;
  $('#drawer').hidden = true;
  $('#fondo-drawer').hidden = true;
  fondoPagina().forEach((el) => { el.inert = false; });
  // Vuelve el foco al negocio que se abrió, para seguir recorriendo la lista desde ahí
  const previo = S.focoPrevio && document.querySelector(`[data-abrir="${CSS.escape(S.focoPrevio)}"]`);
  S.focoPrevio = null;
  previo?.focus();
}

function renderDrawer() {
  const l = S.leads.find((x) => x.id === S.abierto);
  if (!l) return cerrarDrawer();
  const w = l.webCheck || {};
  const cat = w.categoria || 'pendiente';
  const auto = mensaje(l);
  const s = S.stats || {};
  const sobreLimite = s.contactadosHoy >= s.limiteDiario;
  const id = h(l.id);
  const focoDentro = $('#drawer').contains(document.activeElement) && document.activeElement !== $('#drawer');
  const webLink = l.web ? `<a href="${h(l.web)}" target="_blank" rel="noopener">${h(l.web.replace(/^https?:\/\/(www\.)?/, '').slice(0, 60))}</a>` : '<span class="muted">—</span>';

  $('#drawer').innerHTML = `
    <button class="cerrar" data-cerrar="1" aria-label="Cerrar detalle">${ICO.cerrar}</button>
    <h2 id="drawer-titulo" tabindex="-1">${h(l.nombre)}</h2>
    <p class="drawer-sub"><span class="muted">${h(l.rubroGoogle || '')}${l.demo ? ' · <b>DEMO</b>' : ''}</span><span class="web-chip cat-${cat}">${CAT[cat]}${w.red ? `: ${h(w.red)}` : ''}</span></p>
    <details class="prio-detalle">
      <summary>Prioridad <b>${l.prioridad}</b>/100 · ${bandaPrioridad(l.prioridad)}</summary>
      <ul>${desglosePrioridad(l).partes.map((p) => `<li><span>${h(p.texto)}</span><b>${signo(p.puntos)}</b></li>`).join('')}</ul>
      <p class="muted">Pesa más lo que más se nota en una venta: no tener web propia, tener buena reputación en Google y poder escribirles por WhatsApp.</p>
    </details>

    <section>
      <h3>Datos</h3>
      <dl class="info-grid">
        <dt>Dirección</dt><dd>${h(l.direccionCompleta || l.direccion)}</dd>
        <dt>Teléfono</dt><dd>${l.telefono ? `<a href="tel:${h((l.telefonoIntl || '').replace(/\s/g, ''))}">${h(l.telefono)}</a> ${l.esMovil ? '<span class="web-chip cat-sin_web">móvil · WhatsApp</span>' : '<span class="muted">(fijo)</span>'}` : '<span class="muted">No publicado</span>'}</dd>
        <dt>Google</dt><dd>${l.rating ? `${ICO.estrella}<span class="sr">Nota </span>${fmtRating(l.rating)} · ${l.resenas} reseñas · ` : ''}<a href="${h(l.mapsUrl)}" target="_blank" rel="noopener">Ver ficha en Maps</a></dd>
        <dt>Sitio web</dt><dd>${webLink}</dd>
        ${l.plantillaUsada ? `<dt>Mensaje usado</dt><dd>${h(etiquetaPlantilla(l.plantillaUsada))}</dd>` : ''}
        <dt>Búsquedas</dt><dd>${h((l.busquedas || []).map((b) => b.etiqueta).join(', '))}</dd>
        ${l.estadoNegocio === 'CLOSED_TEMPORARILY' ? '<dt>Ojo</dt><dd>Cerrado temporalmente según Google</dd>' : ''}
      </dl>
    </section>

    <section>
      <h3>Situación de su web</h3>
      <p style="margin:0">${h(w.resumen || (cat === 'pendiente' ? 'Analizando…' : ''))}</p>
      ${(w.problemas || []).length && !(w.problemas.length === 1 && w.problemas[0].texto === w.resumen) ? `<ul class="problemas">${w.problemas.map((p) => `<li>${h(p.texto)}</li>`).join('')}</ul>` : ''}
      ${w.checkedAt ? `<p class="muted" style="font-size:12.5px">Revisado: ${fecha(w.checkedAt)}${w.ms ? ` · respondió en ${(w.ms / 1000).toFixed(1)} s` : ''}${w.pagespeed != null ? ` · PageSpeed móvil ${w.pagespeed}/100` : ''}</p>` : ''}
      ${l.web && !l.demo ? `<div class="botones"><button class="btn chico" data-analizar="${id}">${ICO.recargar}Volver a analizar</button><button class="btn chico" data-analizar-ps="${id}" title="Mide la velocidad real en celular con Google PageSpeed (tarda ~30 s)">${ICO.rayo}Analizar con PageSpeed</button></div>` : ''}
    </section>

    <section>
      <h3>Mensaje ${l.contactos ? 'de seguimiento' : 'de primer contacto'}</h3>
      ${l.estado === 'no_contactar' ? '<p class="limite">Este negocio pidió no ser contactado. Respétalo.</p>' : `
      <select id="tipo-msg" style="margin:0 0 6px">
        ${PLANTILLAS.flatMap(([k, n]) => [`${k}:A`, ...(tieneB(k) ? [`${k}:B`] : [])].map((cod) => `<option value="${cod}" ${cod === auto.codigo ? 'selected' : ''}>${h(n)}${tieneB(k) ? (cod.endsWith('B') ? ' · versión B' : ' · versión A') : ''}${cod === auto.codigo ? ' (sugerida)' : ''}</option>`)).join('')}
      </select>
      <textarea id="txt-msg" rows="11">${h(auto.texto)}</textarea>
      <div class="botones">
        ${l.esMovil ? `<button class="btn wa" data-wa-drawer="${id}">Abrir en WhatsApp</button>` : ''}
        <button class="btn" data-copiar-drawer="${id}">Copiar mensaje</button>
        ${w.red === 'Instagram' && l.web ? `<a class="btn" href="${h(l.web)}" target="_blank" rel="noopener">Abrir su Instagram</a>` : ''}
        <button class="btn chico" data-marcar="${id}" title="Si lo contactaste por otro medio">Marcar como contactado</button>
      </div>
      ${!l.esMovil && l.telefono ? '<p class="muted" style="font-size:13px">Su teléfono parece fijo: mejor llamar o escribirle por Instagram/correo.</p>' : ''}
      ${sobreLimite ? `<p class="limite">Ya llegaste a tu límite de ${s.limiteDiario} contactos hoy. Seguir mandando mensajes en frío aumenta el riesgo de que WhatsApp bloquee tu número.</p>` : ''}`}
    </section>

    <section>
      <h3>Maqueta de muestra</h3>
      <p class="muted" style="margin-top:0">Una landing generada con sus datos para mostrarle "así podría verse tu web". Revísala y ajústala antes de enviarla.</p>
      <div class="botones">
        <a class="btn" href="/maqueta/${encodeURIComponent(l.id)}" target="_blank" rel="noopener">Ver maqueta</a>
        <a class="btn" href="/maqueta/${encodeURIComponent(l.id)}?descargar=1">Descargar HTML (sin fotos de Google)</a>
      </div>
    </section>

    <section>
      <h3>Seguimiento</h3>
      <label>Estado
        <select data-estado-lead="${id}">${ESTADOS.map(([k, n]) => `<option value="${k}" ${l.estado === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
      </label>
      <label>Notas <textarea id="txt-notas" rows="3" placeholder="ej: hablé con la dueña, llamar el jueves">${h(l.notas)}</textarea></label>
      <ul class="historial" style="margin-top:12px">${[...(l.historial || [])].reverse().map((x) => `<li><time>${fecha(x.fecha)}</time><span>${h(x.accion)}</span></li>`).join('')}</ul>
    </section>

    <section>
      <button class="btn peligro chico" data-borrar="${id}">Eliminar lead</button>
    </section>`;
  // Al redibujar (tras guardar algo) el elemento enfocado desaparece: el foco vuelve al título en vez de perderse
  if (focoDentro) $('#drawer-titulo').focus();
}

// ---------- acciones ----------
async function registrarContacto(id, medio, plantilla) {
  const r = await api(`/api/leads/${encodeURIComponent(id)}`, { method: 'PATCH', body: { registrarContacto: medio, plantilla } });
  actualizarLead(r.lead, r.stats);
  render();
  if (S.abierto === id) renderDrawer();
  const s = S.stats;
  toast(`Marcado como contactado (${s.contactadosHoy}/${s.limiteDiario} hoy)`, {
    accion: 'Deshacer',
    alHacer: async () => {
      const r2 = await api(`/api/leads/${encodeURIComponent(id)}`, { method: 'PATCH', body: { deshacerContacto: true } });
      actualizarLead(r2.lead, r2.stats);
      render();
      if (S.abierto === id) renderDrawer();
    },
  });
}

function abrirWhatsApp(l, texto, plantilla) {
  window.open(`https://wa.me/${l.waNumber}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
  registrarContacto(l.id, 'WhatsApp', plantilla).catch((e) => toast(e.message, { error: true }));
}

async function copiar(texto) {
  try { await navigator.clipboard.writeText(texto); toast('Mensaje copiado'); }
  catch { toast('No se pudo copiar automáticamente. Selecciona el texto y cópialo.', { error: true }); }
}

async function cambiarEstado(id, estado, sel) {
  if (sel) sel.disabled = true;
  try {
    const r = await api(`/api/leads/${encodeURIComponent(id)}`, { method: 'PATCH', body: { estado } });
    actualizarLead(r.lead, r.stats);
    if (estado === 'ganado') toast('¡Felicitaciones por el nuevo cliente! 🎉');
  } catch (e) {
    // El select ya muestra el valor nuevo: se vuelve a dibujar con el estado real guardado.
    toast(`No se guardó el cambio de estado: ${e.message}. Inténtalo de nuevo.`, { error: true, ms: 7000 });
  }
  render();
  if (S.abierto === id) renderDrawer();
}

async function analizar(id, pagespeed, boton) {
  boton.disabled = true;
  boton.textContent = pagespeed ? 'Midiendo con PageSpeed…' : 'Analizando…';
  try {
    const r = await api(`/api/leads/${encodeURIComponent(id)}/analizar`, { method: 'POST', body: { pagespeed } });
    actualizarLead(r.lead);
    render();
    renderDrawer();
    toast('Web analizada');
  } catch (e) {
    toast(e.message, { error: true });
    boton.disabled = false;
  }
}

// ---------- buscar ----------
async function buscar(ev) {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const body = { rubro: fd.get('rubro'), comuna: fd.get('comuna'), max: Number(fd.get('max')), guardar: fd.get('guardar') === 'on', cadaHoras: Number(fd.get('cadaHoras')) };
  const btn = $('#btn-buscar');
  btn.disabled = true;
  btn.textContent = 'Buscando en Google Maps…';
  $('#resultado-busqueda').innerHTML = '';
  try {
    const r = await api('/api/buscar', { method: 'POST', body });
    S.stats = r.stats;
    const total = r.resultados.reduce((s, x) => s + (x.nuevos || 0), 0);
    $('#resultado-busqueda').innerHTML = `<h2 style="margin:6px 0 12px">Resultado</h2><div class="resultado">${r.resultados.map((x) => x.error
      ? `<div class="res-card error"><b>${h(x.etiqueta)}</b><p>${h(x.error)}</p></div>`
      : `<div class="res-card"><b>${h(x.etiqueta)}</b><div><b class="n">${x.nuevos}</b> nuevos</div><div class="muted">${x.encontrados} encontrados · ${x.existentes} ya los tenías${x.cerrados ? ` · ${x.cerrados} cerrados` : ''}${x.demo ? ' · <b>demo</b>' : ''}</div></div>`).join('')}</div>
      ${total ? `<p>Estoy revisando la web de cada negocio en segundo plano. <button class="btn primario" data-ir="leads" data-filtro-busqueda="${h(r.resultados.length === 1 ? r.resultados[0].etiqueta : '')}">Ver los leads →</button></p>` : ''}
      ${body.guardar ? '<p class="muted">Guardada como búsqueda automática.</p>' : ''}`;
    if (body.guardar) S.busquedas = (await api('/api/busquedas')).busquedas;
    await refrescarLeads();
  } catch (e) {
    toast(e.message, { error: true, ms: 8000 });
  } finally {
    btn.disabled = false;
    btn.textContent = 'Buscar';
  }
}

// ---------- resultados ----------
const RESPONDIO = (l) => l.estado !== 'no_contactar' && (!!l.respondio || ['respondio', 'reunion', 'ganado'].includes(l.estado));
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

function agrupar(leads, clave) {
  const g = new Map();
  for (const l of leads) {
    const k = clave(l) || '—';
    const x = g.get(k) || { grupo: k, enviados: 0, respuestas: 0, reuniones: 0, clientes: 0, noContactar: 0 };
    x.enviados++;
    if (RESPONDIO(l) || l.estado === 'no_contactar') x.respuestas++;
    if (['reunion', 'ganado'].includes(l.estado)) x.reuniones++;
    if (l.estado === 'ganado') x.clientes++;
    if (l.estado === 'no_contactar') x.noContactar++;
    g.set(k, x);
  }
  const filas = [...g.values()].sort((a, b) => b.enviados - a.enviados);
  // marca la mejor tasa entre grupos con al menos 10 envíos
  const validos = filas.filter((f) => f.enviados >= 10);
  if (validos.length > 1) {
    const mejor = validos.reduce((a, b) => (pct(b.respuestas - b.noContactar, b.enviados) > pct(a.respuestas - a.noContactar, a.enviados) ? b : a));
    mejor.mejor = true;
  }
  return filas;
}

function tablaRes(titulo, filas, ayuda = '') {
  if (!filas.length) return '';
  return `<div class="panel"><h2>${h(titulo)}</h2>${ayuda ? `<p class="muted" style="margin-top:0">${ayuda}</p>` : ''}
    <table class="tabla-res"><thead><tr><th>Grupo</th><th class="num">Enviados</th><th class="num">Respuestas</th><th>Tasa de respuesta</th><th class="num">Reuniones</th><th class="num">Clientes</th></tr></thead>
    <tbody>${filas.map((f) => {
      const positivas = f.respuestas - f.noContactar;
      const t = pct(positivas, f.enviados);
      return `<tr class="${f.mejor ? 'mejor' : ''}"><td>${h(f.grupo)}</td><td class="num">${f.enviados}</td><td class="num">${positivas}${f.noContactar ? ` <small style="display:inline" title="Pidieron no ser contactados">(+${f.noContactar} no contactar)</small>` : ''}</td>
        <td><div style="display:flex;gap:8px;align-items:center"><div class="barra" style="flex:1"><i style="width:${t}%"></i></div><b>${t}%</b></div></td>
        <td class="num">${f.reuniones}</td><td class="num">${f.clientes}</td></tr>`;
    }).join('')}</tbody></table></div>`;
}

function renderResultados() {
  const contactados = S.leads.filter((l) => l.contactos > 0);
  const cont = $('#resultados');
  if (!contactados.length) {
    cont.innerHTML = '<div class="vacio"><p>Aquí verás qué mensajes, rubros y comunas responden más.<br>Empieza a contactar negocios desde Leads y vuelve en unos días.</p></div>';
    return;
  }
  const resp = contactados.filter((l) => RESPONDIO(l)).length;
  const noC = contactados.filter((l) => l.estado === 'no_contactar').length;
  const reun = contactados.filter((l) => ['reunion', 'ganado'].includes(l.estado)).length;
  const gan = contactados.filter((l) => l.estado === 'ganado').length;
  const semana = contactados.filter((l) => diasDesde(l.primerContactoFecha || l.ultimoContacto) < 7).length;
  const tipoWeb = (l) => {
    const w = l.webCheck || {};
    return w.categoria === 'plataforma' ? `Plataforma: ${w.red}` : w.categoria === 'red_social' ? `Solo redes: ${w.red}` : CAT[w.categoria] || '—';
  };
  cont.innerHTML = `
    <div class="kpis">
      <div class="kpi"><b>${contactados.length}</b><span>negocios contactados (${semana} esta semana)</span></div>
      <div class="kpi"><b>${pct(resp, contactados.length)}%</b><span>respondieron con interés (${resp})</span></div>
      <div class="kpi"><b>${reun}</b><span>reuniones o propuestas</span></div>
      <div class="kpi"><b>${gan}</b><span>clientes 🎉 · ${pct(gan, contactados.length)}% de cierre</span></div>
      <div class="kpi"><b>${noC}</b><span>pidieron no ser contactados (${pct(noC, contactados.length)}%)</span></div>
    </div>
    ${contactados.length < 30 ? '<p class="aviso" style="margin:0 0 18px">Todavía hay pocos datos. Con menos de ~30 envíos por grupo, las diferencias pueden ser casualidad: úsalo como pista, no como verdad.</p>' : ''}
    ${tablaRes('Por mensaje', agrupar(contactados, (l) => etiquetaPlantilla(l.plantillaUsada)), 'Cuenta el primer mensaje enviado a cada negocio. 🏆 = mejor tasa (con al menos 10 envíos).')}
    <div class="grid-res">
      ${tablaRes('Por rubro', agrupar(contactados, (l) => l.busquedas?.[0]?.rubro || l.rubroGoogle))}
      ${tablaRes('Por comuna', agrupar(contactados, (l) => l.busquedas?.[0]?.comuna || '—'))}
    </div>
    ${tablaRes('Por situación web', agrupar(contactados, tipoWeb))}
    <p class="muted">Marca el estado de cada lead (Respondió, Reunión, Cliente, No contactar) para que estas cifras sean reales.</p>`;
}

// ---------- automáticas ----------
function renderAuto() {
  const cont = $('#lista-auto');
  if (!S.busquedas.length) {
    cont.innerHTML = '<div class="vacio"><p>No tienes búsquedas automáticas todavía.</p></div>';
    return;
  }
  cont.innerHTML = S.busquedas.map((b) => {
    const r = b.ultimoResultado;
    const ultima = b.ultimaEjecucion ? `Última: ${fecha(b.ultimaEjecucion)}${r ? (r.error ? ` · ⚠️ ${h(r.error)}` : ` · ${r.nuevos} nuevos de ${r.encontrados}`) : ''}` : 'Aún no se ejecuta';
    return `<div class="auto-item">
      <div><b>${h(b.rubro)}</b>${b.comuna ? ` · ${h(b.comuna)}` : ''}<div class="muted" style="font-size:13px">${ultima}</div></div>
      <div class="ctrl">
        <label class="switch"><input type="checkbox" data-auto-on="${b.id}" ${b.auto ? 'checked' : ''}> Activa</label>
        <label class="switch">cada <input type="number" class="mini" min="1" value="${b.cadaHoras}" data-auto-horas="${b.id}"> h</label>
        <button class="btn chico" data-auto-correr="${b.id}">Ejecutar ahora</button>
        <button class="btn chico peligro" data-auto-borrar="${b.id}">Eliminar</button>
      </div>
    </div>`;
  }).join('');
}

// ---------- configuración ----------
function renderEditorPlantillas() {
  $('#editor-plantillas').innerHTML = PLANTILLAS.map(([k, n]) => `
    <div class="tpl">
      <label>${h(n)} <textarea name="tpl_${k}" rows="${k === 'seguimiento' ? 6 : 9}"></textarea></label>
      ${k === 'seguimiento' ? '' : `<details ${tieneB(k) ? 'open' : ''}><summary>Versión B (opcional, para comparar)</summary>
        <textarea name="tpl_${k}_B" rows="8" placeholder="Déjalo vacío para usar solo la versión A"></textarea></details>`}
    </div>`).join('');
}

function llenarConfig() {
  renderEditorPlantillas();
  const c = S.config;
  const f = $('#form-config');
  for (const el of f.elements) {
    if (!el.name) continue;
    if (el.name.startsWith('tpl_')) el.value = c.plantillas?.[el.name.slice(4)] || '';
    else if (el.type === 'checkbox') el.checked = !!c[el.name];
    else if (el.name in c) el.value = c[el.name] ?? '';
  }
  f.elements.demo.disabled = !!c.demoForzado;
}

async function guardarConfig(ev) {
  ev?.preventDefault();
  const f = $('#form-config');
  const body = { plantillas: {} };
  for (const el of f.elements) {
    if (!el.name) continue;
    if (el.name.startsWith('tpl_')) body.plantillas[el.name.slice(4)] = el.value;
    else if (el.type === 'checkbox') body[el.name] = el.checked;
    else if (el.type === 'number' || el.name === 'maxResultados') body[el.name] = Number(el.value);
    else body[el.name] = el.value;
  }
  if (body.regionCode) body.regionCode = body.regionCode.toUpperCase();
  try {
    S.config = await api('/api/config', { method: 'POST', body });
    S.stats = await api('/api/stats');
    llenarConfig();
    render();
    toast('Configuración guardada');
  } catch (e) { toast(e.message, { error: true }); }
}

// ---------- eventos ----------
function irA(tab) {
  S.tab = tab;
  location.hash = tab;
  if (tab === 'config') llenarConfig();
  render();
  window.scrollTo(0, 0);
}

document.addEventListener('click', async (ev) => {
  const t = ev.target.closest('[data-tab],[data-ir],[data-estado],[data-wa],[data-copiar],[data-id],[data-cerrar],[data-wa-drawer],[data-copiar-drawer],[data-marcar],[data-borrar],[data-analizar],[data-analizar-ps],[data-mas],[data-limpiar],[data-abrir],[data-seg],[data-auto-correr],[data-auto-borrar],.chip[data-rubro]');
  if (!t) return;
  const d = t.dataset;
  if (d.stop || t.tagName === 'SELECT' || ev.target.tagName === 'SELECT' || ev.target.tagName === 'OPTION') return;

  if (d.tab) return irA(d.tab);
  if (d.ir) {
    ev.preventDefault();
    if (d.filtroBusqueda !== undefined) { S.f.busqueda = d.filtroBusqueda; S.f.categoria = 'oportunidades'; S.f.estado = 'por_contactar'; }
    return irA(d.ir);
  }
  if (d.seg) { S.f.estado = 'seguimiento'; S.f.categoria = 'todas'; $('#f-categoria').value = 'todas'; return irA('leads'); }
  if (d.estado && t.classList.contains('pipe')) { S.f.estado = d.estado; S.mostrar = 60; return renderLeads(); }
  if (d.rubro) { $('#form-buscar').elements.rubro.value = d.rubro; $('#form-buscar').elements.comuna.focus(); return; }
  if (d.mas) { S.mostrar += 60; return renderLeads(); }
  if (d.limpiar) return limpiarFiltros();
  if (d.abrir) return abrirLead(d.abrir);

  if (d.wa) {
    ev.stopPropagation();
    const l = S.leads.find((x) => x.id === d.wa);
    const m = mensaje(l);
    return abrirWhatsApp(l, m.texto, m.codigo);
  }
  if (d.copiar) {
    ev.stopPropagation();
    const l = S.leads.find((x) => x.id === d.copiar);
    return copiar(mensaje(l).texto);
  }
  if (d.waDrawer) return abrirWhatsApp(S.leads.find((x) => x.id === d.waDrawer), $('#txt-msg').value, $('#tipo-msg').value);
  if (d.copiarDrawer) return copiar($('#txt-msg').value);
  if (d.marcar) return registrarContacto(d.marcar, 'otro medio', $('#tipo-msg')?.value).catch((e) => toast(e.message, { error: true }));
  if (d.analizar) return analizar(d.analizar, false, t);
  if (d.analizarPs) return analizar(d.analizarPs, true, t);
  if (d.borrar) {
    if (!confirm('¿Eliminar este lead? Si vuelve a salir en una búsqueda aparecerá como nuevo.')) return;
    await api(`/api/leads/${encodeURIComponent(d.borrar)}`, { method: 'DELETE' });
    S.leads = S.leads.filter((x) => x.id !== d.borrar);
    cerrarDrawer();
    return render();
  }
  if (d.cerrar) return cerrarDrawer();

  if (d.autoCorrer) {
    t.disabled = true; t.textContent = 'Ejecutando…';
    try {
      const r = await api(`/api/busquedas/${d.autoCorrer}/correr`, { method: 'POST' });
      S.busquedas = r.busquedas;
      toast(`${r.resultado.nuevos} leads nuevos`);
      await refrescarLeads();
    } catch (e) { toast(e.message, { error: true }); }
    return renderAuto();
  }
  if (d.autoBorrar) {
    if (!confirm('¿Eliminar esta búsqueda automática? (Los leads se mantienen)')) return;
    S.busquedas = (await api(`/api/busquedas/${d.autoBorrar}`, { method: 'DELETE' })).busquedas;
    return renderAuto();
  }

  if (d.id && t.classList.contains('lead')) {
    if (ev.target.closest('a,button,select')) return;
    return abrirLead(d.id);
  }
});

document.addEventListener('change', async (ev) => {
  const t = ev.target;
  if (t.dataset.estadoLead) return cambiarEstado(t.dataset.estadoLead, t.value, t);
  if (t.id === 'tipo-msg') {
    const l = S.leads.find((x) => x.id === S.abierto);
    const [k, v] = t.value.split(':');
    $('#txt-msg').value = mensaje(l, k, v).texto;
    return;
  }
  if (t.id === 'txt-notas') {
    try {
      const r = await api(`/api/leads/${encodeURIComponent(S.abierto)}`, { method: 'PATCH', body: { notas: t.value } });
      actualizarLead(r.lead);
      toast('Nota guardada');
    } catch (e) {
      toast(`No se guardó la nota: ${e.message}. Tu texto sigue en el cuadro; inténtalo de nuevo.`, { error: true, ms: 7000 });
    }
    return;
  }
  if (t.dataset.autoOn) {
    S.busquedas = (await api(`/api/busquedas/${t.dataset.autoOn}`, { method: 'PATCH', body: { auto: t.checked } })).busquedas;
    return renderAuto();
  }
  if (t.dataset.autoHoras) {
    S.busquedas = (await api(`/api/busquedas/${t.dataset.autoHoras}`, { method: 'PATCH', body: { cadaHoras: Number(t.value) } })).busquedas;
    return renderAuto();
  }
  if (t.id === 'f-categoria') S.f.categoria = t.value;
  if (t.id === 'f-busqueda') S.f.busqueda = t.value;
  if (t.id === 'f-orden') S.f.orden = t.value;
  if (t.id === 'f-wa') S.f.soloWa = t.checked;
  if (t.id?.startsWith('f-')) { S.mostrar = 60; renderLeads(); }
});

let tTexto;
$('#f-texto').addEventListener('input', (e) => {
  clearTimeout(tTexto);
  tTexto = setTimeout(() => { S.f.texto = e.target.value; S.mostrar = 60; renderLeads(); }, 150);
});

$('#btn-filtros').addEventListener('click', (e) => {
  const abierto = $('#filtros-extra').classList.toggle('abierto');
  e.currentTarget.setAttribute('aria-expanded', String(abierto));
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.abierto) cerrarDrawer(); });
$('#fondo-drawer').addEventListener('click', cerrarDrawer);
$('#form-buscar').addEventListener('submit', buscar);
$('#form-config').addEventListener('submit', guardarConfig);
$('#form-auto').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  try {
    S.busquedas = (await api('/api/busquedas', { method: 'POST', body: { rubro: fd.get('rubro'), comuna: fd.get('comuna'), cadaHoras: Number(fd.get('cadaHoras')), max: Number(fd.get('max')) } })).busquedas;
    ev.target.reset();
    renderAuto();
    toast('Búsqueda automática agregada. Se ejecutará en los próximos minutos.');
  } catch (e) { toast(e.message, { error: true }); }
});
$('#btn-telegram').addEventListener('click', async () => {
  await guardarConfig();
  try { await api('/api/telegram/probar', { method: 'POST' }); toast('Mensaje enviado: revisa tu Telegram'); }
  catch (e) { toast(`Telegram: ${e.message}`, { error: true, ms: 8000 }); }
});
$('#btn-tpl-reset').addEventListener('click', async () => {
  if (!confirm('¿Restaurar las plantillas originales? Perderás tus cambios.')) return;
  S.config = await api('/api/config', { method: 'POST', body: { resetPlantillas: true } });
  llenarConfig();
  toast('Plantillas restauradas');
});
$('#btn-borrar-demo').addEventListener('click', async () => {
  if (!confirm('¿Borrar todos los leads ficticios del modo demo?')) return;
  const r = await api('/api/leads-demo', { method: 'DELETE' });
  S.stats = r.stats;
  await refrescarLeads();
  toast('Leads de demo eliminados');
});

// ---------- inicio ----------
(async function iniciar() {
  $('#lista-rubros').innerHTML = RUBROS.map((r) => `<option value="${h(r)}">`).join('');
  $('#lista-comunas').innerHTML = [...new Set(COMUNAS)].map((c) => `<option value="${h(c)}">`).join('');
  $('#chips-rubros').innerHTML = RUBROS.slice(0, 18).map((r) => `<button type="button" class="chip" data-rubro="${h(r)}">${h(r)}</button>`).join('');
  try {
    await cargarTodo();
  } catch (e) {
    document.body.innerHTML = `<div class="vacio" style="margin:40px">No me pude conectar con el servidor. ¿Está abierta la ventana de "ClientFind"?<br><small>${h(e.message)}</small></div>`;
    return;
  }
  const hash = location.hash.slice(1);
  S.tab = ['buscar', 'leads', 'resultados', 'automaticas', 'config'].includes(hash) ? hash : (S.leads.length ? 'leads' : 'buscar');
  if (S.tab === 'config') llenarConfig();
  render();
  vigilarPendientes();
  setInterval(() => { if (!document.hidden && !S.abierto) refrescarLeads().catch(() => {}); }, 60_000);
})();

window.addEventListener('hashchange', () => {
  const t = location.hash.slice(1);
  if (t !== S.tab && ['buscar', 'leads', 'resultados', 'automaticas', 'config'].includes(t)) irA(t);
});
