const CIERRE = `Si no les interesa, me dicen y no les vuelvo a escribir 🙂`;

export const PLANTILLAS_DEFAULT = {
  sin_web: `¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋

Los encontré en Google Maps{reputacion} y noté que no tienen página web. Hoy mucha gente busca en Google antes de elegir dónde ir, y una web propia les ayuda a aparecer y a que los contacten directo por WhatsApp.

Hago páginas web para negocios{en_comuna} y les preparé una muestra gratuita de cómo podría verse la suya. ¿Se la puedo enviar?

${CIERRE}`,

  red_social: `¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋

Los encontré en Google Maps{reputacion} y vi que el enlace de su web lleva a su {plataforma}. Las redes son buenísimas para el día a día, pero una página propia da más confianza a los clientes nuevos, aparece en Google y tiene todo (servicios, horarios, ubicación) en un solo lugar.

Les preparé una muestra gratuita de cómo podría verse su web. ¿Se la puedo enviar?

${CIERRE}`,

  reservas: `¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋

Los encontré en Google Maps{reputacion} y vi que usan {plataforma} para las reservas, ¡excelente! Les quería proponer complementarlo con una web propia: con su marca, fotos de sus trabajos y el botón de reservar de {plataforma} integrado, para que aparezcan mejor cuando alguien busca {rubro}{en_comuna}.

Les preparé una muestra gratuita de cómo podría verse. ¿Se la puedo enviar?

${CIERRE}`,

  ventas: `¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋

Los encontré en Google Maps{reputacion} y vi que el enlace de su web lleva a {plataforma}. Con una página propia, sus clientes pueden ver la carta o el catálogo y pedirles directo por WhatsApp, sin que pierdan una comisión en cada venta.

Les preparé una muestra gratuita de cómo podría verse. ¿Se la puedo enviar?

${CIERRE}`,

  caida: `¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋

Los encontré en Google Maps{reputacion} y quise entrar a su página, pero noté que {problema} 😕 Es probable que otros clientes también se estén encontrando con eso.

Hago páginas web para negocios{en_comuna} y les preparé una muestra de cómo podría verse una web nueva para ustedes, sin compromiso. ¿Se la puedo enviar?

${CIERRE}`,

  mejorable: `¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋

Los encontré en Google Maps{reputacion} y revisé su página web: noté que {problema}. Son cosas que hacen que algunos clientes se vayan antes de contactarlos.

Les preparé una muestra gratuita de cómo podría verse una versión renovada. ¿Se la puedo enviar?

${CIERRE}`,

  primerContacto: `¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋

Los encontré en Google Maps{reputacion} y noté que {problema}.

Hago páginas web para negocios{en_comuna} y les preparé una muestra gratuita de cómo podría verse la suya. ¿Se la puedo enviar?

${CIERRE}`,

  seguimiento: `¡Hola de nuevo, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio}.

Les escribí {cuando} por una página web para el negocio. ¿Alcanzaron a verlo? Tengo lista la muestra que les preparé, por si quieren echarle un vistazo.

Si prefieren que no les escriba más, solo díganmelo 🙂`,
};

// Para compatibilidad con versiones anteriores
export const PLANTILLA_PRIMER_CONTACTO = PLANTILLAS_DEFAULT.primerContacto;
export const PLANTILLA_SEGUIMIENTO = PLANTILLAS_DEFAULT.seguimiento;

export const DEFAULT_CONFIG = {
  googleApiKey: '',
  demo: false,
  miNombre: 'Catalina',
  miNegocio: 'KaiKira TI',
  miInstagram: 'kaikira_ti',
  miWhatsapp: '',
  regionCode: 'CL',
  ciudadPorDefecto: 'Región Metropolitana, Chile',
  maxResultados: 40,
  limiteMensualBusquedas: 900,
  limiteMensualFotos: 900,
  limiteDiario: 25,
  diasSeguimiento: 3,
  pagespeedAuto: false,
  telegramToken: '',
  telegramChatId: '',
  prioridadMinimaAviso: 50,
  plantillas: { ...PLANTILLAS_DEFAULT },
};

export function mergeConfig(stored) {
  return {
    ...DEFAULT_CONFIG,
    ...stored,
    plantillas: { ...DEFAULT_CONFIG.plantillas, ...(stored?.plantillas || {}) },
  };
}

export function mask(secret) {
  if (!secret) return '';
  return `••••••${String(secret).slice(-4)}`;
}
