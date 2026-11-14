// Google Places API (New) — Text Search
// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search

const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';

// Los campos pedidos definen el SKU que cobra Google (sitio web y teléfono => "Text Search Enterprise").
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.shortFormattedAddress',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.rating',
  'places.userRatingCount',
  'places.primaryTypeDisplayName',
  'places.businessStatus',
  'places.photos',
  'places.regularOpeningHours',
  'places.location',
  'nextPageToken',
].join(',');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function explicarError(status, msg = '') {
  const m = msg.toLowerCase();
  if (m.includes('api key not valid') || m.includes('api_key_invalid'))
    return 'La API key de Google no es válida. Revísala en Configuración.';
  if (m.includes('has not been used') || m.includes('is disabled') || m.includes('service_disabled'))
    return 'La "Places API (New)" no está activada en tu proyecto de Google Cloud. Actívala y espera un par de minutos.';
  if (m.includes('billing'))
    return 'Tu proyecto de Google Cloud no tiene la facturación activada (Google la exige aunque uses el tramo gratis).';
  if (status === 429) return 'Google rechazó la búsqueda por exceso de solicitudes (cuota). Espera un rato o revisa tus cuotas.';
  if (m.includes('referer') || m.includes('not authorized'))
    return 'La API key tiene restricciones que bloquean esta app. En Google Cloud, restríngela por API (no por sitio web).';
  return `Error de Google (${status}): ${msg}`;
}

export async function textSearch({ apiKey, query, regionCode = 'CL', max = 40, onCall }) {
  const out = [];
  let pageToken;
  for (let page = 0; page < 3 && out.length < max; page++) {
    const body = { textQuery: query, languageCode: 'es', regionCode, pageSize: 20 };
    if (pageToken) body.pageToken = pageToken;
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify(body),
    });
    onCall?.('textSearch');
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(explicarError(res.status, json?.error?.message || res.statusText));
    out.push(...(json.places || []));
    pageToken = json.nextPageToken;
    if (!pageToken) break;
    await sleep(400);
  }
  return out.slice(0, max).map(normalizar);
}

export function digitos(intl) {
  return (intl || '').replace(/\D/g, '');
}

export function esMovil(d, regionCode = 'CL') {
  if (!d) return false;
  if (regionCode === 'CL') return /^569\d{8}$/.test(d);
  return d.length >= 10; // otros países: no sabemos, asumimos que puede ser WhatsApp
}

export function normalizar(p) {
  const wa = digitos(p.internationalPhoneNumber);
  return {
    id: p.id,
    nombre: p.displayName?.text || '(sin nombre)',
    rubroGoogle: p.primaryTypeDisplayName?.text || '',
    direccion: p.shortFormattedAddress || p.formattedAddress || '',
    direccionCompleta: p.formattedAddress || '',
    telefono: p.nationalPhoneNumber || '',
    telefonoIntl: p.internationalPhoneNumber || '',
    waNumber: wa,
    esMovil: esMovil(wa),
    web: p.websiteUri || '',
    mapsUrl: p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${p.id}`,
    rating: p.rating ?? null,
    resenas: p.userRatingCount ?? 0,
    estadoNegocio: p.businessStatus || 'OPERATIONAL',
    horario: p.regularOpeningHours?.weekdayDescriptions || [],
    fotos: (p.photos || []).slice(0, 6).map((f) => ({
      name: f.name,
      autores: (f.authorAttributions || []).map((a) => ({ nombre: a.displayName, uri: a.uri })),
    })),
    location: p.location || null,
  };
}

export const PHOTO_NAME_RE = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;

export async function fetchPhoto(apiKey, name, maxW = 1200) {
  if (!PHOTO_NAME_RE.test(name)) throw new Error('Nombre de foto inválido');
  const url = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxW}&key=${encodeURIComponent(apiKey)}`;
  return fetch(url, { redirect: 'follow' });
}
