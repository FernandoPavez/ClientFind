# ClientFind: contexto para Claude Code

App de Fernando (KaiKira TI, landing pages para pymes en Santiago) para encontrar negocios sin página web en Google Maps y contactarlos por WhatsApp.

## Cómo está hecha
- Node.js 18+ sin dependencias (`http`, `fetch`, `fs`). Frontend en `public/` con HTML, CSS y JS vanilla.
- Datos en JSON dentro de `data/` (o en la ruta de `RADAR_DATA_DIR`): `leads.json`, `config.json`, `busquedas.json`, `uso.json` y `secreto.json`. Nunca se suben a git.
- `lib/places.js`: Google Places API (New), Text Search con field mask, SKU Enterprise.
- `lib/webcheck.js`: clasifica la web de cada negocio en sin_web, red_social, plataforma (AgendaPro, PedidosYa…), caida, mejorable, ok o no_verificable.
- `lib/scoring.js`: prioridad de 0 a 100 y la frase `{problema}` del mensaje.
- `lib/config.js`: configuración y plantillas por categoría. Cuando cambies una plantilla por defecto, agrega el texto anterior a `PLANTILLAS_ANTERIORES` para que se migre solo.
- `lib/preview.js`: maqueta de landing por rubro.
- `lib/auth.js`: login del modo en línea.
- `public/prioridad.js`: cálculo de prioridad, compartido entre servidor e interfaz.
- Diseño: "estilo libreta" de KaiKira TI, documentado en `DESIGN.md` y `PRODUCT.md`. Las fuentes van en `public/fonts`. En pantallas de 760 px o menos, la barra lateral pasa a ser la navegación inferior.

## Modos
- **Local:** `node server.js` (o `--demo`). Escucha solo en 127.0.0.1:3030.
- **En línea** (Hostinger, App web de Node.js): se activa con `CLIENTFIND_PASSWORD`. Usa `PORT` y `GOOGLE_API_KEY` por variables de entorno. Ver `docs/PUBLICAR-EN-HOSTINGER.md`.

## Decisiones que hay que respetar
- Los mensajes NO se envían solos: la app abre WhatsApp (`wa.me`) con el texto listo. El envío masivo automático lleva a bloqueos.
- Mensajes sin emojis y en tono natural. Siempre ofrecen dejar de escribir; "No contactar" se respeta.
- Tope mensual de 900 llamadas de búsqueda y 900 fotos, para quedarse en el tramo gratis de Google (1.000 al mes).
- Volver un lead a "Nuevo" anula sus contactos: el mensaje vuelve a ser el de primer contacto.
- La maqueta descargable no lleva fotos de Google, porque sus términos no permiten guardarlas.
- Al terminar un cambio de interfaz, revísalo también en ancho de celular (390 px) y respeta `DESIGN.md`.

## Ideas pendientes
- Publicar la maqueta con un link para mandarla por WhatsApp.
- Revisar la ficha de Google del negocio (pocas fotos, sin horario) como servicio extra.
- Propuesta en PDF con plan y precio.
- Resumen diario por Telegram con seguimientos pendientes.
