// ClientFind — servidor local
// Ejecuta:  node server.js      (o  node server.js --demo  para probar sin API key)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { Store, flushAll, ROOT } from './lib/db.js';
import { mergeConfig, mask, PLANTILLAS_ANTERIORES } from './lib/config.js';
import { textSearch, fetchPhoto } from './lib/places.js';
import { analizarWeb, PLATAFORMA_POR_NOMBRE } from './lib/webcheck.js';
import { calcularPrioridad, fraseProblema } from './lib/scoring.js';
import { demoSearch } from './lib/demo.js';
import { enviarTelegram, textoNuevosLeads } from './lib/notify.js';
import { renderLanding } from './lib/preview.js';
import { crearAuth } from './lib/auth.js';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT) || 3030;
const ARGS = new Set(process.argv.slice(2));

// ---------- Datos ----------
const configStore = new Store('config.json', {});
const leadsStore = new Store('leads.json', { leads: {} });
const searchesStore = new Store('busquedas.json', { busquedas: [] });
const statsStore = new Store('uso.json', { meses: {} });

// Modo en línea: se activa al definir la variable de entorno CLIENTFIND_PASSWORD (ej. en Hostinger)
const ONLINE = !!process.env.CLIENTFIND_PASSWORD;
if (ONLINE && process.env.CLIENTFIND_PASSWORD.length < 10) {
  console.error('\n  ⚠️  CLIENTFIND_PASSWORD debe tener al menos 10 caracteres.\n');
  process.exit(1);
}
const secretoStore = new Store('secreto.json', {});
if (!secretoStore.data.valor) { secretoStore.data.valor = crypto.randomBytes(32).toString('hex'); secretoStore.flush(); }
const auth = ONLINE ? crearAuth({ password: process.env.CLIENTFIND_PASSWORD, secreto: process.env.CLIENTFIND_SECRET || secretoStore.data.valor }) : null;

const cfg = () => {
  const c = mergeConfig(configStore.data);
  if (process.env.GOOGLE_API_KEY) c.googleApiKey = process.env.GOOGLE_API_KEY;
  return c;
};

// El nombre por defecto de versiones anteriores era un error: se corrige
if (configStore.data.miNombre === 'Catalina') { configStore.data.miNombre = 'Fernando'; configStore.save(); }
const modoDemo = () => ARGS.has('--demo') || cfg().demo || !cfg().googleApiKey;

const hoyLocal = (d = new Date()) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD en hora local
const mesLocal = () => hoyLocal().slice(0, 7);

function contarUso(tipo, n = 1) {
  const m = (statsStore.data.meses[mesLocal()] ||= {});
  m[tipo] = (m[tipo] || 0) + n;
  statsStore.save();
}

// ---------- Cola de análisis web ----------
function crearCola(concurrencia) {
  let activos = 0;
  const q = [];
  const siguiente = () => {
    while (activos < concurrencia && q.length) {
      const { fn, res, rej } = q.shift();
      activos++;
      Promise.resolve().then(fn).then(res, rej).finally(() => { activos--; siguiente(); });
    }
  };
  return {
    push: (fn) => new Promise((res, rej) => { q.push({ fn, res, rej }); siguiente(); }),
    get pendientes() { return q.length + activos; },
  };
}
const colaWeb = crearCola(5);

function recalcular(lead) {
  lead.prioridad = calcularPrioridad(lead);
  if (lead.webCheck && lead.webCheck.categoria !== 'pendiente') lead.webCheck.frase = fraseProblema(lead);
}

async function analizarLead(id, { conPagespeed } = {}) {
  const lead = leadsStore.data.leads[id];
  if (!lead) return;
  const c = cfg();
  let wc;
  if (lead.demo) {
    wc = { ...structuredClone(lead._demoCheck), checkedAt: new Date().toISOString() };
    wc.resumen ||= wc.problemas.slice(0, 2).map((p) => p.texto).join(' · ');
  } else {
    const usarPS = conPagespeed ?? c.pagespeedAuto;
    try {
      wc = await analizarWeb(lead.web, { pagespeedKey: c.googleApiKey, conPagespeed: usarPS });
    } catch (e) {
      wc = { categoria: 'no_verificable', resumen: `Error al analizar: ${e.message}`, problemas: [], checkedAt: new Date().toISOString() };
    }
    if (usarPS && wc.pagespeed != null) contarUso('pagespeed');
  }
  const actual = leadsStore.data.leads[id];
  if (!actual) return;
  actual.webCheck = wc;
  recalcular(actual);
  actual.actualizado = new Date().toISOString();
  leadsStore.save();
  return actual;
}

// Migración: plantillas guardadas que siguen siendo las originales de una versión anterior → usar las nuevas
(function migrarPlantillas() {
  const norm = (t) => String(t || '').replace(/\r\n/g, '\n').trim();
  const viejas = new Set(PLANTILLAS_ANTERIORES.map(norm));
  const p = configStore.data.plantillas;
  if (!p) return;
  let n = 0;
  for (const k of Object.keys(p)) if (viejas.has(norm(p[k]))) { delete p[k]; n++; }
  if (n) { configStore.save(); console.log(`  ↻ ${n} plantilla(s) actualizadas al nuevo texto`); }
})();

// Migración: leads guardados antes de existir la categoría "plataforma"
(function migrar() {
  let n = 0;
  for (const l of Object.values(leadsStore.data.leads)) {
    const w = l.webCheck;
    if (w?.categoria === 'red_social' && PLATAFORMA_POR_NOMBRE[w.red]) {
      w.categoria = 'plataforma';
      w.tipoPlataforma = PLATAFORMA_POR_NOMBRE[w.red];
      w.resumen = w.tipoPlataforma === 'reservas' ? `Usa ${w.red} para reservas, sin web propia` : `Vende por ${w.red}, sin web propia`;
      if (l._demoCheck) Object.assign(l._demoCheck, { categoria: w.categoria, tipoPlataforma: w.tipoPlataforma, resumen: w.resumen });
      n++;
    }
    if (l.webCheck && l.webCheck.categoria !== 'pendiente') recalcular(l);
  }
  if (n) { leadsStore.save(); console.log(`  ↻ ${n} lead(s) reclasificados como "plataforma de reservas/ventas"`); }
})();

// ---------- Búsqueda ----------
async function ejecutarBusqueda({ rubro, comuna, max, origen = 'manual' }) {
  const c = cfg();
  rubro = String(rubro || '').trim();
  comuna = String(comuna || '').trim();
  if (!rubro) throw new Error('Escribe un rubro (ej: "peluquerías")');
  max = Math.max(1, Math.min(60, Number(max) || c.maxResultados));
  const ubicacion = [comuna, c.ciudadPorDefecto].filter(Boolean).join(', ');
  const query = `${rubro} en ${ubicacion}`;
  const etiqueta = comuna ? `${rubro} · ${comuna}` : rubro;

  let lugares;
  if (!modoDemo()) {
    // Tope mensual para no salir nunca del tramo gratis de Google
    const usadas = statsStore.data.meses[mesLocal()]?.textSearch || 0;
    const disponibles = (Number(c.limiteMensualBusquedas) || 0) - usadas;
    if (disponibles <= 0)
      throw new Error(`Llegaste al límite mensual que configuraste (${c.limiteMensualBusquedas} llamadas a Google) para no pagar. Se reinicia el día 1 del próximo mes.`);
    max = Math.min(max, disponibles * 20);
  }
  if (modoDemo()) {
    lugares = demoSearch(rubro, comuna || 'Santiago', max);
  } else {
    lugares = await textSearch({ apiKey: c.googleApiKey, query, regionCode: c.regionCode, max, onCall: contarUso });
  }

  const ahora = new Date().toISOString();
  const nuevos = [];
  const aAnalizar = [];
  let existentes = 0;
  let cerrados = 0;
  for (const p of lugares) {
    if (p.estadoNegocio === 'CLOSED_PERMANENTLY') { cerrados++; continue; }
    const busqueda = { rubro, comuna, etiqueta };
    const ex = leadsStore.data.leads[p.id];
    if (ex) {
      existentes++;
      const webCambio = ex.web !== p.web;
      Object.assign(ex, p, { actualizado: ahora });
      if (!ex.busquedas.some((b) => b.etiqueta === etiqueta)) ex.busquedas.push(busqueda);
      const viejo = !ex.webCheck?.checkedAt || Date.now() - Date.parse(ex.webCheck.checkedAt) > 30 * 864e5;
      if (webCambio || viejo || ex.webCheck?.categoria === 'pendiente') {
        ex.webCheck = { categoria: 'pendiente' };
        aAnalizar.push(ex.id);
      }
      recalcular(ex);
    } else {
      const lead = {
        ...p,
        busquedas: [busqueda],
        estado: 'nuevo',
        notas: '',
        historial: [{ fecha: ahora, accion: `Encontrado en «${etiqueta}»` }],
        creado: ahora,
        actualizado: ahora,
        visto: false,
        webCheck: { categoria: 'pendiente' },
        prioridad: 0,
      };
      recalcular(lead);
      leadsStore.data.leads[p.id] = lead;
      nuevos.push(p.id);
      aAnalizar.push(p.id);
    }
  }
  leadsStore.save();

  const analisis = Promise.all(aAnalizar.map((id) => colaWeb.push(() => analizarLead(id))));

  // Aviso por Telegram cuando terminen los análisis
  analisis.then(async () => {
    const c2 = cfg();
    if (!c2.telegramToken || !c2.telegramChatId || !nuevos.length) return;
    if (origen !== 'auto' && !ARGS.has('--avisar-manual')) return;
    const buenos = nuevos.map((id) => leadsStore.data.leads[id]).filter((l) => l && l.prioridad >= c2.prioridadMinimaAviso);
    if (!buenos.length) return;
    try { await enviarTelegram(c2, textoNuevosLeads(etiqueta, buenos)); }
    catch (e) { console.warn('No se pudo avisar por Telegram:', e.message); }
  }).catch((e) => console.warn('Error en análisis:', e.message));

  return { query, etiqueta, encontrados: lugares.length, nuevos: nuevos.length, existentes, cerrados, demo: modoDemo(), analisis };
}

// ---------- Búsquedas automáticas ----------
async function revisarProgramadas() {
  for (const b of searchesStore.data.busquedas) {
    if (!b.auto) continue;
    const vence = (b.ultimaEjecucion ? Date.parse(b.ultimaEjecucion) : 0) + (b.cadaHoras || 24) * 3600e3;
    if (Date.now() < vence) continue;
    await correrGuardada(b, 'auto').catch((e) => console.warn(`Búsqueda automática «${b.rubro} · ${b.comuna}» falló:`, e.message));
  }
}

async function correrGuardada(b, origen) {
  b.ultimaEjecucion = new Date().toISOString();
  try {
    const r = await ejecutarBusqueda({ rubro: b.rubro, comuna: b.comuna, max: b.max, origen });
    b.ultimoResultado = { nuevos: r.nuevos, encontrados: r.encontrados, error: null };
    searchesStore.save();
    return r;
  } catch (e) {
    b.ultimoResultado = { nuevos: 0, encontrados: 0, error: e.message };
    searchesStore.save();
    throw e;
  }
}

// ---------- Estadísticas ----------
function estadisticas() {
  const c = cfg();
  const leads = Object.values(leadsStore.data.leads);
  const hoy = hoyLocal();
  const contactadosHoy = leads.filter((l) => (l.historial || []).some((h) => h.tipo === 'contacto' && hoyLocal(new Date(h.fecha)) === hoy)).length;
  const limiteSeguimiento = Date.now() - c.diasSeguimiento * 864e5;
  const seguimientos = leads.filter((l) => l.estado === 'contactado' && l.ultimoContacto && Date.parse(l.ultimoContacto) < limiteSeguimiento).length;
  const porCategoria = {};
  const porEstado = {};
  for (const l of leads) {
    const k = l.webCheck?.categoria || 'pendiente';
    porCategoria[k] = (porCategoria[k] || 0) + 1;
    porEstado[l.estado] = (porEstado[l.estado] || 0) + 1;
  }
  return {
    total: leads.length,
    porCategoria,
    porEstado,
    contactadosHoy,
    limiteDiario: c.limiteDiario,
    seguimientos,
    pendientes: colaWeb.pendientes,
    usoMes: statsStore.data.meses[mesLocal()] || {},
    limiteMensualBusquedas: c.limiteMensualBusquedas,
    limiteMensualFotos: c.limiteMensualFotos,
    demo: modoDemo(),
  };
}

// ---------- HTTP ----------
const MIME = { '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const PUBLIC = path.join(ROOT, 'public');

function enviar(res, status, data, headers = {}) {
  const body = typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': typeof data === 'object' && !Buffer.isBuffer(data) ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(body);
}

function leerCuerpo(req, limite = 2e6) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limite) { reject(new Error('Cuerpo demasiado grande')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(new Error('JSON inválido')); }
    });
    req.on('error', reject);
  });
}

function configPublica() {
  const c = cfg();
  return { ...c, googleApiKey: mask(c.googleApiKey), telegramToken: mask(c.telegramToken), tieneApiKey: !!c.googleApiKey, apiKeyEnServidor: !!process.env.GOOGLE_API_KEY, tieneTelegram: !!(c.telegramToken && c.telegramChatId), modoDemo: modoDemo(), demoForzado: ARGS.has('--demo'), online: ONLINE };
}

const CAMPOS_CONFIG = ['googleApiKey', 'demo', 'miNombre', 'miNegocio', 'miInstagram', 'miWhatsapp', 'regionCode', 'ciudadPorDefecto', 'maxResultados', 'limiteMensualBusquedas', 'limiteMensualFotos', 'limiteDiario', 'diasSeguimiento', 'pagespeedAuto', 'telegramToken', 'telegramChatId', 'prioridadMinimaAviso', 'plantillas'];
const ESTADOS = ['nuevo', 'contactado', 'respondio', 'reunion', 'ganado', 'perdido', 'no_contactar'];
const NOMBRE_ESTADO = { nuevo: 'Nuevo', contactado: 'Contactado', respondio: 'Respondió', reunion: 'Reunión / propuesta', ganado: 'Cliente 🎉', perdido: 'Perdido', no_contactar: 'No contactar' };

function csv(leads) {
  const cols = [
    ['Prioridad', (l) => l.prioridad], ['Nombre', (l) => l.nombre], ['Rubro', (l) => l.rubroGoogle], ['Búsqueda', (l) => l.busquedas.map((b) => b.etiqueta).join(' | ')],
    ['Dirección', (l) => l.direccionCompleta || l.direccion], ['Teléfono', (l) => l.telefonoIntl || l.telefono], ['Móvil (WhatsApp)', (l) => (l.esMovil ? 'sí' : 'no')],
    ['Rating', (l) => (l.rating ?? '').toString().replace('.', ',')], ['Reseñas', (l) => l.resenas], ['Sitio web en Google', (l) => l.web],
    ['Situación web', (l) => l.webCheck?.categoria], ['Detalle', (l) => l.webCheck?.resumen], ['Estado', (l) => NOMBRE_ESTADO[l.estado] || l.estado],
    ['Mensaje usado', (l) => l.plantillaUsada || ''], ['Respondió', (l) => (l.respondio ? 'sí' : '')],
    ['Notas', (l) => l.notas], ['Google Maps', (l) => l.mapsUrl], ['Encontrado', (l) => (l.creado ? hoyLocal(new Date(l.creado)) : '')],
  ];
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return '﻿' + [cols.map(([h]) => q(h)).join(';'), ...leads.map((l) => cols.map(([, f]) => q(f(l))).join(';'))].join('\r\n');
}

const slug = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

async function manejar(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;
  const m = req.method;

  // --- Respaldo: descargar e importar todos los datos ---
  if (p === '/api/respaldo' && m === 'GET') {
    const { googleApiKey, telegramToken, ...configSinSecretos } = configStore.data;
    const respaldo = { app: 'ClientFind', version: 1, exportado: new Date().toISOString(), leads: leadsStore.data.leads, busquedas: searchesStore.data.busquedas, uso: statsStore.data.meses, config: configSinSecretos };
    return enviar(res, 200, JSON.stringify(respaldo), { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="clientfind-respaldo-${hoyLocal()}.json"` });
  }
  if (p === '/api/respaldo' && m === 'POST') {
    const body = await leerCuerpo(req, 40e6);
    const r = body.respaldo;
    if (!r || r.app !== 'ClientFind' || typeof r.leads !== 'object' || !Array.isArray(r.busquedas)) return enviar(res, 400, { error: 'El archivo no es un respaldo de ClientFind.' });
    const reemplazar = body.modo === 'reemplazar';
    let leadsNuevos = 0;
    if (reemplazar) { leadsStore.data.leads = r.leads; leadsNuevos = Object.keys(r.leads).length; }
    else for (const [id, l] of Object.entries(r.leads)) if (!leadsStore.data.leads[id]) { leadsStore.data.leads[id] = l; leadsNuevos++; }
    if (reemplazar) searchesStore.data.busquedas = r.busquedas;
    else for (const b of r.busquedas) if (!searchesStore.data.busquedas.some((x) => x.id === b.id)) searchesStore.data.busquedas.push(b);
    for (const [mes, uso] of Object.entries(r.uso || {})) {
      const actual = (statsStore.data.meses[mes] ||= {});
      for (const [k, v] of Object.entries(uso)) actual[k] = Math.max(actual[k] || 0, Number(v) || 0);
    }
    if (r.config && typeof r.config === 'object') {
      const { googleApiKey, telegramToken, ...resto } = r.config;
      if (reemplazar || !configStore.data.plantillas) Object.assign(configStore.data, resto);
    }
    leadsStore.save(); searchesStore.save(); statsStore.save(); configStore.save();
    return enviar(res, 200, { ok: true, leadsNuevos, total: Object.keys(leadsStore.data.leads).length });
  }

  if (p === '/api/logout' && m === 'POST') {
    return enviar(res, 200, { ok: true }, { 'Set-Cookie': auth ? auth.cookieCerrar(esHttps(req)) : '' });
  }

  // --- API ---
  if (p === '/api/config' && m === 'GET') return enviar(res, 200, configPublica());
  if (p === '/api/config' && m === 'POST') {
    const body = await leerCuerpo(req);
    for (const k of CAMPOS_CONFIG) {
      if (!(k in body)) continue;
      if ((k === 'googleApiKey' || k === 'telegramToken') && String(body[k]).startsWith('••')) continue;
      if (k === 'plantillas') configStore.data.plantillas = { ...(configStore.data.plantillas || {}), ...body.plantillas };
      else configStore.data[k] = typeof body[k] === 'string' ? body[k].trim() : body[k];
    }
    if (body.resetPlantillas) delete configStore.data.plantillas;
    configStore.save();
    return enviar(res, 200, configPublica());
  }

  if (p === '/api/stats' && m === 'GET') return enviar(res, 200, estadisticas());

  if (p === '/api/leads' && m === 'GET') {
    const leads = Object.values(leadsStore.data.leads).map(({ _demoCheck, ...l }) => l);
    return enviar(res, 200, { leads, stats: estadisticas() });
  }

  if (p === '/api/buscar' && m === 'POST') {
    const body = await leerCuerpo(req);
    const comunas = String(body.comuna || '').split(',').map((s) => s.trim()).filter(Boolean);
    const lista = comunas.length ? comunas : [''];
    const resultados = [];
    for (const comuna of lista) {
      try {
        const { analisis, ...r } = await ejecutarBusqueda({ rubro: body.rubro, comuna, max: body.max });
        resultados.push(r);
      } catch (e) {
        resultados.push({ etiqueta: `${body.rubro} · ${comuna}`, error: e.message });
      }
    }
    if (body.guardar) {
      for (const comuna of lista) {
        const existe = searchesStore.data.busquedas.find((b) => b.rubro.toLowerCase() === String(body.rubro).trim().toLowerCase() && b.comuna.toLowerCase() === comuna.toLowerCase());
        if (existe) Object.assign(existe, { auto: true, cadaHoras: Number(body.cadaHoras) || 24 });
        else searchesStore.data.busquedas.push({ id: `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, rubro: String(body.rubro).trim(), comuna, max: Number(body.max) || cfg().maxResultados, auto: true, cadaHoras: Number(body.cadaHoras) || 24, ultimaEjecucion: new Date().toISOString(), creada: new Date().toISOString() });
      }
      searchesStore.save();
    }
    return enviar(res, 200, { resultados, stats: estadisticas() });
  }

  let mm;
  if ((mm = p.match(/^\/api\/leads\/([^/]+)$/))) {
    const id = decodeURIComponent(mm[1]);
    const lead = leadsStore.data.leads[id];
    if (!lead) return enviar(res, 404, { error: 'Lead no encontrado' });
    if (m === 'DELETE') { delete leadsStore.data.leads[id]; leadsStore.save(); return enviar(res, 200, { ok: true }); }
    if (m === 'PATCH') {
      const body = await leerCuerpo(req);
      const ahora = new Date().toISOString();
      if (body.estado && ESTADOS.includes(body.estado) && body.estado !== lead.estado) {
        lead.historial.push({ fecha: ahora, accion: `Estado: ${NOMBRE_ESTADO[lead.estado]} → ${NOMBRE_ESTADO[body.estado]}` });
        lead.estado = body.estado;
        if (['respondio', 'reunion', 'ganado', 'no_contactar'].includes(body.estado) && lead.contactos && !lead.respondio) lead.respondio = ahora;
        if (['nuevo', 'contactado'].includes(body.estado)) delete lead.respondio;
        if (body.estado === 'nuevo' && lead.contactos) {
          // Volver a "Nuevo" anula los contactos: el próximo mensaje vuelve a ser el de primer contacto
          for (const h of lead.historial) if (h.tipo === 'contacto') { h.tipo = 'contacto_anulado'; h.accion += ' (anulado)'; }
          lead.contactos = 0;
          delete lead.ultimoContacto; delete lead.plantillaUsada; delete lead.primerContactoFecha;
        }
        if (body.estado === 'ganado') lead.ganado = ahora; else delete lead.ganado;
      }
      if (typeof body.notas === 'string') lead.notas = body.notas.slice(0, 5000);
      if (typeof body.visto === 'boolean') lead.visto = body.visto;
      if (body.registrarContacto) {
        const plantilla = typeof body.plantilla === 'string' ? body.plantilla.slice(0, 40) : '';
        lead.historial.push({ fecha: ahora, tipo: 'contacto', plantilla, accion: `Mensaje enviado (${body.registrarContacto})` });
        if (!lead.contactos) { lead.plantillaUsada = plantilla || 'manual'; lead.primerContactoFecha = ahora; }
        lead.ultimoContacto = ahora;
        lead.contactos = (lead.contactos || 0) + 1;
        lead.visto = true;
        if (['nuevo', 'contactado'].includes(lead.estado)) lead.estado = 'contactado';
      }
      if (body.deshacerContacto) {
        const idx = lead.historial.map((h) => h.tipo).lastIndexOf('contacto');
        if (idx >= 0) lead.historial.splice(idx, 1);
        lead.contactos = Math.max(0, (lead.contactos || 1) - 1);
        const prev = [...lead.historial].reverse().find((h) => h.tipo === 'contacto');
        lead.ultimoContacto = prev?.fecha || null;
        if (!lead.contactos) { delete lead.plantillaUsada; delete lead.primerContactoFecha; if (lead.estado === 'contactado') lead.estado = 'nuevo'; }
      }
      lead.actualizado = ahora;
      leadsStore.save();
      return enviar(res, 200, { lead, stats: estadisticas() });
    }
  }

  if ((mm = p.match(/^\/api\/leads\/([^/]+)\/analizar$/)) && m === 'POST') {
    const id = decodeURIComponent(mm[1]);
    if (!leadsStore.data.leads[id]) return enviar(res, 404, { error: 'Lead no encontrado' });
    const body = await leerCuerpo(req);
    leadsStore.data.leads[id].webCheck = { categoria: 'pendiente' };
    const lead = await colaWeb.push(() => analizarLead(id, { conPagespeed: !!body.pagespeed }));
    return enviar(res, 200, { lead });
  }

  if (p === '/api/leads-demo' && m === 'DELETE') {
    for (const [id, l] of Object.entries(leadsStore.data.leads)) if (l.demo) delete leadsStore.data.leads[id];
    leadsStore.save();
    return enviar(res, 200, { ok: true, stats: estadisticas() });
  }

  if (p === '/api/busquedas' && m === 'GET') return enviar(res, 200, { busquedas: searchesStore.data.busquedas });
  if (p === '/api/busquedas' && m === 'POST') {
    const b = await leerCuerpo(req);
    if (!b.rubro) return enviar(res, 400, { error: 'Falta el rubro' });
    searchesStore.data.busquedas.push({ id: `b${Date.now().toString(36)}`, rubro: String(b.rubro).trim(), comuna: String(b.comuna || '').trim(), max: Number(b.max) || cfg().maxResultados, auto: b.auto !== false, cadaHoras: Number(b.cadaHoras) || 24, ultimaEjecucion: null, creada: new Date().toISOString() });
    searchesStore.save();
    return enviar(res, 200, { busquedas: searchesStore.data.busquedas });
  }
  if ((mm = p.match(/^\/api\/busquedas\/([^/]+)(\/correr)?$/))) {
    const b = searchesStore.data.busquedas.find((x) => x.id === mm[1]);
    if (!b) return enviar(res, 404, { error: 'Búsqueda no encontrada' });
    if (mm[2] && m === 'POST') {
      try { const { analisis, ...r } = await correrGuardada(b, 'manual'); return enviar(res, 200, { resultado: r, busquedas: searchesStore.data.busquedas }); }
      catch (e) { return enviar(res, 400, { error: e.message }); }
    }
    if (m === 'DELETE') { searchesStore.data.busquedas = searchesStore.data.busquedas.filter((x) => x !== b); searchesStore.save(); return enviar(res, 200, { busquedas: searchesStore.data.busquedas }); }
    if (m === 'PATCH') {
      const body = await leerCuerpo(req);
      if (typeof body.auto === 'boolean') b.auto = body.auto;
      if (body.cadaHoras) b.cadaHoras = Math.max(1, Number(body.cadaHoras));
      if (body.max) b.max = Math.max(1, Math.min(60, Number(body.max)));
      searchesStore.save();
      return enviar(res, 200, { busquedas: searchesStore.data.busquedas });
    }
  }

  if (p === '/api/telegram/probar' && m === 'POST') {
    try { await enviarTelegram(cfg(), '✅ <b>ClientFind</b> conectado. Aquí te avisaré cuando aparezcan leads nuevos.'); return enviar(res, 200, { ok: true }); }
    catch (e) { return enviar(res, 400, { error: e.message }); }
  }

  if (p === '/api/photo' && m === 'GET') {
    const c = cfg();
    if (!c.googleApiKey) return enviar(res, 404, 'Sin API key');
    if ((statsStore.data.meses[mesLocal()]?.fotos || 0) >= (Number(c.limiteMensualFotos) || 0)) return enviar(res, 429, 'Límite mensual de fotos alcanzado');
    try {
      const r = await fetchPhoto(c.googleApiKey, url.searchParams.get('name') || '', Math.min(1600, Number(url.searchParams.get('w')) || 1200));
      contarUso('fotos');
      if (!r.ok) return enviar(res, r.status, 'No se pudo cargar la foto');
      const buf = Buffer.from(await r.arrayBuffer());
      return enviar(res, 200, buf, { 'Content-Type': r.headers.get('content-type') || 'image/jpeg', 'Cache-Control': 'private, max-age=3600' });
    } catch (e) { return enviar(res, 400, e.message); }
  }

  if (p === '/api/export.csv' && m === 'GET') {
    const leads = Object.values(leadsStore.data.leads).sort((a, b) => b.prioridad - a.prioridad);
    return enviar(res, 200, csv(leads), { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="leads-${hoyLocal()}.csv"` });
  }

  if ((mm = p.match(/^\/maqueta\/([^/]+)$/)) && m === 'GET') {
    const lead = leadsStore.data.leads[decodeURIComponent(mm[1])];
    if (!lead) return enviar(res, 404, 'Lead no encontrado');
    const descargar = url.searchParams.has('descargar');
    // La versión descargable no lleva fotos de Google (sus términos no permiten guardarlas)
    const c = cfg();
    const fotosUsadas = statsStore.data.meses[mesLocal()]?.fotos || 0;
    const quedanFotos = fotosUsadas + 4 <= (Number(c.limiteMensualFotos) || 0);
    const html = renderLanding(lead, c, { conFotos: !descargar && !lead.demo && quedanFotos });
    const headers = { 'Content-Type': 'text/html; charset=utf-8' };
    if (descargar) headers['Content-Disposition'] = `attachment; filename="maqueta-${slug(lead.nombre) || 'negocio'}.html"`;
    return enviar(res, 200, html, headers);
  }

  // --- Archivos estáticos ---
  if (m === 'GET') {
    const rel = p === '/' ? 'index.html' : p.slice(1);
    const file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC)) return enviar(res, 403, 'Prohibido');
    try {
      const data = await fs.promises.readFile(file);
      return enviar(res, 200, data, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    } catch { /* sigue */ }
  }
  return enviar(res, 404, { error: 'No encontrado' });
}

const esHttps = (req) => req.headers['x-forwarded-proto'] === 'https' || !!req.socket.encrypted;
const ipDe = (req) => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '?';
const PUBLICOS = new Set(['/login', '/login.html', '/styles.css', '/manifest.webmanifest', '/icono-192.png', '/icono-512.png', '/apple-touch-icon.png']);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function puerta(req, res) {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  if (!ONLINE) {
    // Modo local: solo peticiones del propio computador
    const host = (req.headers.host || '').split(':')[0];
    if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) return enviar(res, 403, 'Solo acceso local');
    return manejar(req, res);
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (esHttps(req)) res.setHeader('Strict-Transport-Security', 'max-age=15552000');

  // Bloquea peticiones que modifican datos si vienen desde otro sitio
  if (!['GET', 'HEAD'].includes(req.method)) {
    const origen = req.headers.origin;
    if (origen) {
      let hostOrigen = '';
      try { hostOrigen = new URL(origen).host; } catch {}
      if (hostOrigen !== req.headers.host) return enviar(res, 403, { error: 'Origen no permitido' });
    }
  }

  if (p === '/api/login' && req.method === 'POST') {
    const ip = ipDe(req);
    if (auth.bloqueado(ip)) return enviar(res, 429, { error: 'Demasiados intentos. Espera 15 minutos.' });
    const body = await leerCuerpo(req, 10e3).catch(() => ({}));
    if (!auth.claveCorrecta(body.password)) {
      auth.registrarFallo(ip);
      await esperar(700);
      return enviar(res, 401, { error: 'Contraseña incorrecta.' });
    }
    auth.registrarExito(ip);
    return enviar(res, 200, { ok: true }, { 'Set-Cookie': auth.cookieSesion(esHttps(req)) });
  }

  if (p === '/login') {
    if (auth.sesionValida(req)) { res.writeHead(302, { Location: '/' }); return res.end(); }
    req.url = '/login.html';
    return manejar(req, res);
  }
  if (PUBLICOS.has(p) || auth.sesionValida(req)) return manejar(req, res);

  if (p.startsWith('/api/')) return enviar(res, 401, { error: 'Tu sesión expiró. Vuelve a entrar.', login: true });
  res.writeHead(302, { Location: '/login' });
  return res.end();
}

const server = http.createServer((req, res) => {
  puerta(req, res).catch((e) => {
    console.error(e);
    if (!res.headersSent) enviar(res, 500, { error: e.message || 'Error interno' });
  });
});

server.listen(PORT, ONLINE ? '0.0.0.0' : '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  📡 ClientFind funcionando en ${ONLINE ? `el puerto ${PORT} (modo en línea, con contraseña)` : url}`);
  console.log(modoDemo() ? '  🧪 Modo DEMO (datos ficticios). Agrega tu API key para buscar de verdad.\n' : '  ✅ Conectado a Google Places.\n');
  if (ONLINE) return;
  console.log('  Deja esta ventana abierta mientras uses la app. Para cerrar: Ctrl + C\n');
  if (!ARGS.has('--no-abrir')) {
    const cmd = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
    try { spawn(cmd[0], cmd[1], { detached: true, stdio: 'ignore' }).on('error', () => {}).unref(); } catch {}
  }
});
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error(`\n  ⚠️  El puerto ${PORT} está ocupado. ¿Ya tienes la app abierta? Abre http://localhost:${PORT}\n`);
  else console.error(e);
  process.exit(1);
});

// Revisa búsquedas automáticas cada 15 minutos (y una vez al iniciar)
setTimeout(() => revisarProgramadas().catch(() => {}), 10_000);
setInterval(() => revisarProgramadas().catch(() => {}), 15 * 60_000);

for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { flushAll(); console.log('\n  👋 Datos guardados. ¡Hasta pronto!'); process.exit(0); });
process.on('exit', flushAll);
