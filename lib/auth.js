// Inicio de sesión para el modo en línea (cuando la app está publicada en internet).
// Una sola contraseña (variable de entorno CLIENTFIND_PASSWORD) y una cookie firmada que dura 30 días.
import crypto from 'node:crypto';

const DURACION_MS = 30 * 864e5;
const VENTANA_MS = 15 * 60e3;
const MAX_POR_IP = 8;
const MAX_GLOBAL = 40;

export function leerCookies(header = '') {
  const out = {};
  for (const parte of header.split(';')) {
    const i = parte.indexOf('=');
    if (i > 0) out[parte.slice(0, i).trim()] = decodeURIComponent(parte.slice(i + 1).trim());
  }
  return out;
}

export function crearAuth({ password, secreto }) {
  // Cambiar la contraseña invalida todas las sesiones abiertas
  const llave = crypto.createHash('sha256').update(`clientfind|${secreto}|${password}`).digest();
  const hashClave = crypto.createHash('sha256').update(password).digest();
  const firmar = (exp) => crypto.createHmac('sha256', llave).update(String(exp)).digest('base64url');

  const intentos = new Map(); // ip -> { n, desde }
  let global = { n: 0, desde: Date.now() };

  function limpiar(ip) {
    const ahora = Date.now();
    if (ahora - global.desde > VENTANA_MS) global = { n: 0, desde: ahora };
    const x = intentos.get(ip);
    if (x && ahora - x.desde > VENTANA_MS) intentos.delete(ip);
  }

  return {
    cookieSesion(segura) {
      const exp = Date.now() + DURACION_MS;
      return `cf_sesion=${exp}.${firmar(exp)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DURACION_MS / 1000}${segura ? '; Secure' : ''}`;
    },
    cookieCerrar(segura) {
      return `cf_sesion=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${segura ? '; Secure' : ''}`;
    },
    sesionValida(req) {
      const c = leerCookies(req.headers.cookie).cf_sesion;
      if (!c) return false;
      const [exp, firma] = c.split('.');
      if (!exp || !firma || !(Number(exp) > Date.now())) return false;
      const esperada = firmar(exp);
      return firma.length === esperada.length && crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada));
    },
    claveCorrecta(intento) {
      const h = crypto.createHash('sha256').update(String(intento ?? '')).digest();
      return crypto.timingSafeEqual(h, hashClave);
    },
    bloqueado(ip) {
      limpiar(ip);
      return global.n >= MAX_GLOBAL || (intentos.get(ip)?.n || 0) >= MAX_POR_IP;
    },
    registrarFallo(ip) {
      limpiar(ip);
      const x = intentos.get(ip) || { n: 0, desde: Date.now() };
      x.n++;
      intentos.set(ip, x);
      global.n++;
    },
    registrarExito(ip) {
      intentos.delete(ip);
    },
  };
}
