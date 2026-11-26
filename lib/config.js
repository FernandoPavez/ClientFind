export const PLANTILLAS_DEFAULT = {
  sin_web: "Hola, ¿cómo están? Soy {mi_nombre}, de {mi_negocio}.\n\nVi {nombre} en Google Maps{reputacion} y me di cuenta de que no tienen página web. Me dedico a hacer páginas para negocios{en_comuna} y les armé una muestra de cómo podría verse la suya.\n\n¿Se la mando? Es sin compromiso. Si no les interesa, me avisan y no les escribo más.",

  red_social: "Hola, ¿cómo están? Soy {mi_nombre}, de {mi_negocio}.\n\nVi {nombre} en Google Maps{reputacion} y noté que el link de su página lleva a su {plataforma}. Una web propia les ayuda a aparecer cuando alguien busca en Google y deja todo a mano: servicios, horarios y cómo llegar.\n\nLes armé una muestra de cómo podría verse. ¿Se la mando? Si no les interesa, me avisan y no les escribo más.",

  reservas: "Hola, ¿cómo están? Soy {mi_nombre}, de {mi_negocio}.\n\nVi {nombre} en Google Maps{reputacion} y que toman horas por {plataforma}. Les quería ofrecer una página web propia, con su marca, fotos de sus trabajos y el botón para reservar en {plataforma}, para que los encuentren más fácil cuando alguien busca {rubro}{en_comuna}.\n\nLes armé una muestra. ¿Se la mando? Si no les interesa, me avisan y no les escribo más.",

  ventas: "Hola, ¿cómo están? Soy {mi_nombre}, de {mi_negocio}.\n\nVi {nombre} en Google Maps{reputacion} y que el link de su página lleva a {plataforma}. Con una web propia, sus clientes pueden ver lo que venden y pedirles directo por WhatsApp, sin pagar comisión por cada venta.\n\nLes armé una muestra de cómo podría verse. ¿Se la mando? Si no les interesa, me avisan y no les escribo más.",

  caida: "Hola, ¿cómo están? Soy {mi_nombre}, de {mi_negocio}.\n\nQuise entrar a la página de {nombre} desde Google Maps y vi que {problema}. Lo más probable es que a otros clientes les esté pasando lo mismo.\n\nHago páginas web para negocios{en_comuna} y les armé una muestra de cómo podría verse una nueva. ¿Se la mando? Si no les interesa, me avisan y no les escribo más.",

  mejorable: "Hola, ¿cómo están? Soy {mi_nombre}, de {mi_negocio}.\n\nRevisé la página de {nombre} y noté que {problema}. Eso hace que algunos clientes se vayan antes de escribirles.\n\nLes armé una muestra de cómo podría verse renovada. ¿Se la mando? Si no les interesa, me avisan y no les escribo más.",

  primerContacto: "Hola, ¿cómo están? Soy {mi_nombre}, de {mi_negocio}.\n\nVi {nombre} en Google Maps{reputacion} y noté que {problema}. Hago páginas web para negocios{en_comuna} y les armé una muestra de cómo podría verse la suya.\n\n¿Se la mando? Si no les interesa, me avisan y no les escribo más.",

  seguimiento: "Hola de nuevo, soy {mi_nombre}, de {mi_negocio}. Les escribí {cuando} por una página web para {nombre}. ¿Alcanzaron a verlo? Si quieren, les mando la muestra que les preparé.\n\nSi no les interesa, me avisan y no les escribo más.",

};

// Textos de versiones anteriores: si el usuario no los editó, se reemplazan por los nuevos al iniciar
export const PLANTILLAS_ANTERIORES = [
 "¡Hola de nuevo, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio}.\n\nLes escribí {cuando} por una página web para el negocio. ¿Alcanzaron a verlo? Tengo lista la muestra que les preparé, por si quieren echarle un vistazo.\n\nSi prefieren que no les escriba más, solo díganmelo 🙂",
 "¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋\n\nLos encontré en Google Maps{reputacion} y noté que no tienen página web. Hoy mucha gente busca en Google antes de elegir dónde ir, y una web propia les ayuda a aparecer y a que los contacten directo por WhatsApp.\n\nHago páginas web para negocios{en_comuna} y les preparé una muestra gratuita de cómo podría verse la suya. ¿Se la puedo enviar?\n\nSi no les interesa, me dicen y no les vuelvo a escribir 🙂",
 "¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋\n\nLos encontré en Google Maps{reputacion} y vi que el enlace de su web lleva a su {plataforma}. Las redes son buenísimas para el día a día, pero una página propia da más confianza a los clientes nuevos, aparece en Google y tiene todo (servicios, horarios, ubicación) en un solo lugar.\n\nLes preparé una muestra gratuita de cómo podría verse su web. ¿Se la puedo enviar?\n\nSi no les interesa, me dicen y no les vuelvo a escribir 🙂",
 "¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋\n\nLos encontré en Google Maps{reputacion} y vi que usan {plataforma} para las reservas, ¡excelente! Les quería proponer complementarlo con una web propia: con su marca, fotos de sus trabajos y el botón de reservar de {plataforma} integrado, para que aparezcan mejor cuando alguien busca {rubro}{en_comuna}.\n\nLes preparé una muestra gratuita de cómo podría verse. ¿Se la puedo enviar?\n\nSi no les interesa, me dicen y no les vuelvo a escribir 🙂",
 "¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋\n\nLos encontré en Google Maps{reputacion} y vi que el enlace de su web lleva a {plataforma}. Con una página propia, sus clientes pueden ver la carta o el catálogo y pedirles directo por WhatsApp, sin que pierdan una comisión en cada venta.\n\nLes preparé una muestra gratuita de cómo podría verse. ¿Se la puedo enviar?\n\nSi no les interesa, me dicen y no les vuelvo a escribir 🙂",
 "¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋\n\nLos encontré en Google Maps{reputacion} y quise entrar a su página, pero noté que {problema} 😕 Es probable que otros clientes también se estén encontrando con eso.\n\nHago páginas web para negocios{en_comuna} y les preparé una muestra de cómo podría verse una web nueva para ustedes, sin compromiso. ¿Se la puedo enviar?\n\nSi no les interesa, me dicen y no les vuelvo a escribir 🙂",
 "¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋\n\nLos encontré en Google Maps{reputacion} y revisé su página web: noté que {problema}. Son cosas que hacen que algunos clientes se vayan antes de contactarlos.\n\nLes preparé una muestra gratuita de cómo podría verse una versión renovada. ¿Se la puedo enviar?\n\nSi no les interesa, me dicen y no les vuelvo a escribir 🙂",
 "¡Hola, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio} 👋\n\nLos encontré en Google Maps{reputacion} y noté que {problema}.\n\nHago páginas web para negocios{en_comuna} y les preparé una muestra gratuita de cómo podría verse la suya. ¿Se la puedo enviar?\n\nSi no les interesa, me dicen y no les vuelvo a escribir 🙂",
 "¡Hola de nuevo, equipo de {nombre}! Soy {mi_nombre}, de {mi_negocio}.\n\nLes escribí hace unos días por una página web para el negocio. ¿Alcanzaron a verlo? Tengo lista la muestra que les preparé, por si quieren echarle un vistazo.\n\nSi prefieren que no les escriba más, solo díganmelo 🙂"
];

// Para compatibilidad con versiones anteriores
export const PLANTILLA_PRIMER_CONTACTO = PLANTILLAS_DEFAULT.primerContacto;
export const PLANTILLA_SEGUIMIENTO = PLANTILLAS_DEFAULT.seguimiento;

export const DEFAULT_CONFIG = {
  googleApiKey: '',
  demo: false,
  miNombre: 'Fernando',
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
