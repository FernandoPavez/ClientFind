# Guía de instalación y uso — ClientFind

App para encontrar negocios en Google Maps que **necesitan una página web**, priorizarlos y contactarlos de forma ordenada.

## Qué hace

1. **Busca en Google Maps** por rubro y comuna, con la API oficial de Google Places. Trae hasta 60 resultados por comuna.
2. **Analiza la web de cada negocio** y lo clasifica:
   - 🟢 **Sin web**: no tiene sitio en su ficha de Google.
   - 🔵 **Solo redes**: su "sitio web" es Instagram, Facebook, WhatsApp, Linktree, etc.
   - 🟦 **Plataforma**: usa AgendaPro, Booksy, Fresha… para reservas, o PedidosYa, Rappi, Mercado Libre… para vender, sin web propia.
   - 🔴 **Web caída**: el dominio expiró, da error, está "en construcción", en venta o suspendido. También detecta las antiguas webs `business.site` de Google, que dejaron de existir en 2024.
   - 🟡 **Web mejorable**: sin https, no adaptada a celulares, lenta, desactualizada (© 2017), con dominio gratuito (wixsite, blogspot…), sin botón de WhatsApp. Opcionalmente mide la velocidad real con **Google PageSpeed**.
3. **Calcula una prioridad (0–100)** según la oportunidad, la cantidad de reseñas, el rating y si tiene celular para WhatsApp. Un negocio con 300 reseñas y sin web va primero.
4. **Arma el mensaje personalizado según su situación** (hay una plantilla para cada caso: sin web, solo redes, plataforma de reservas, plataforma de pedidos, web caída, web mejorable). Puedes escribir una **versión B** de cada plantilla para comparar cuál responde más ("Los encontré en Google Maps con 4,7⭐ y 230 reseñas y noté que su web no se ve bien en celulares…"). Con un clic se abre **WhatsApp** con el texto listo y el lead queda como contactado.
5. **Lleva tu seguimiento** con estados (Nuevo → Contactado → Respondió → Reunión → Cliente 🎉), notas e historial. Te avisa cuando toca hacer seguimiento y cuando llegas a tu **límite diario** de contactos.
6. **Genera una maqueta de landing** con los datos del negocio (nombre, rating, horarios, dirección, botón de WhatsApp y fotos de Google) para mostrarle "así podría verse tu web". También la puedes descargar como HTML.
7. **Búsquedas automáticas**: repite búsquedas cada X horas y te avisa por **Telegram** cuando aparecen leads nuevos con buena prioridad.
8. **📊 Resultados**: tasa de respuesta, reuniones y clientes por mensaje (A/B), rubro, comuna y situación web.
9. **Exporta a Excel** (CSV).

Todo corre en tu computador. Tus datos y tu API key no salen de él, salvo hacia Google y Telegram.

---

## 1. Instalación (una sola vez)

1. Instala **Node.js** versión LTS desde <https://nodejs.org>.
2. Descomprime la carpeta `ClientFind` donde quieras.
3. Abre la app:
   - **Windows**: doble clic en `iniciar-windows.bat`
   - **Mac / Linux**: doble clic en `iniciar-mac-linux.command`, o en una terminal: `node server.js`
4. Se abre el navegador en <http://localhost:3030>. **Deja abierta la ventana negra** mientras uses la app.

Sin API key, la app parte en **modo demo** con negocios ficticios para que la pruebes. Puedes borrarlos después en Configuración → "Borrar leads de demo".

## 2. Conseguir tu API key de Google (≈10 minutos)

1. Entra a <https://console.cloud.google.com> y crea un **proyecto nuevo** (ej: "ClientFind").
2. Activa la **facturación** (Billing). Google la exige aunque uses solo el tramo gratis. Pide una tarjeta.
3. Ve a **APIs y servicios → Biblioteca** y activa:
   - **Places API (New)**: obligatoria.
   - **PageSpeed Insights API**: opcional, para medir velocidad en celular.
4. Ve a **APIs y servicios → Credenciales → Crear credenciales → Clave de API**.
5. Haz clic en la clave → **Restricciones de API** → "Restringir clave" → marca solo *Places API (New)* y *PageSpeed Insights API*. **No** uses la restricción por "sitios web": esta app llama a Google desde tu computador, no desde una página.
6. Copia la clave (empieza con `AIza…`) y pégala en la app en **⚙️ Configuración**. Guarda.

### 💰 Costos y cómo protegerte

- Cada búsqueda trae hasta 20 negocios por llamada (40 = 2 llamadas, 60 = 3).
- La app pide teléfono y sitio web, así que Google lo cobra como **Text Search Enterprise**. A noviembre de 2026, ese SKU incluye **1.000 llamadas gratis al mes** (≈ 20.000 negocios) y luego cuesta **USD 35 por cada 1.000 llamadas**.
- Las **fotos** de la maqueta tienen su propio tramo gratis de 1.000 al mes. La maqueta usa hasta 4 fotos cada vez que la abres.
- **La app trae un tope mensual de 900 llamadas de búsqueda y 900 fotos** (Configuración → Google). Al llegar al tope deja de llamar a Google hasta el mes siguiente, así que con los valores por defecto te mantienes dentro del tramo gratis. Arriba ves cuántas llevas (ej: `☁️ Google: 12/900`).
- El tope cuenta solo lo que hace esta app. No uses la misma API key en otros proyectos.
- **Recomendado**: en Google Cloud ve a **Facturación → Presupuestos y alertas** y crea un presupuesto de USD 5 con alertas por correo. En **APIs y servicios → Places API (New) → Cuotas** puedes limitar las solicitudes diarias (ej: 100 al día) para que nunca se dispare.
- Los precios cambian. Revisa <https://developers.google.com/maps/billing-and-pricing/pricing>.

## 3. Telegram (opcional, para los avisos)

1. En Telegram, habla con **@BotFather** → `/newbot` → sigue los pasos y copia el **token**.
2. Escríbele cualquier mensaje a tu bot nuevo.
3. Abre en el navegador `https://api.telegram.org/bot<TU_TOKEN>/getUpdates` y copia el número que aparece en `"chat":{"id": 123456789`.
4. Pega ambos en Configuración y presiona "Enviar mensaje de prueba".

Los avisos llegan cuando una **búsqueda automática** encuentra leads nuevos sobre la prioridad mínima que definas.

## 4. Flujo de trabajo sugerido

1. **Buscar**: un rubro + 2 o 3 comunas (ej: "barberías" en "Maipú, Cerrillos").
2. En **Leads**, deja el filtro "Solo oportunidades" y ordena por prioridad.
3. Abre un lead, revisa su ficha de Maps y abre la **maqueta**. Si te gusta, saca una captura o descárgala.
4. Ajusta el mensaje si quieres y presiona **Abrir en WhatsApp**. Revisa y envía desde WhatsApp.
5. Cuando respondan, cambia el estado. Si piden no ser contactados, márcalo como **No contactar**.
6. Cada día revisa "⏳ Hacer seguimiento".

## 5. Uso responsable (importante)

- **Los mensajes no se envían solos, y es a propósito.** Enviar mensajes masivos automáticos por WhatsApp o Instagram va contra sus reglas y lleva a que **bloqueen tu número o cuenta**. La app prepara todo y tú solo presionas enviar.
- Mantén un **límite diario** razonable (20–30) y personaliza los mensajes.
- Siempre ofrece la opción de no recibir más mensajes (la plantilla ya lo incluye) y **respeta** a quien lo pida (estado "No contactar"). La Ley del Consumidor chilena exige dar esa opción en las comunicaciones promocionales y respetar la solicitud.
- La app usa solo datos públicos de negocios publicados en Google Maps.
- La **maqueta descargable no incluye fotos de Google**: sus términos no permiten guardarlas. Pídele fotos reales al cliente para el sitio final.
- La app **no revisa Instagram automáticamente**, porque eso va contra sus términos. Si el "sitio web" de un negocio es su Instagram, la app te da el link para que lo abras tú.

## 6. Preguntas frecuentes

**¿Dónde quedan mis datos?** En la carpeta `data/` (`leads.json`, `config.json`, etc.). Para respaldar, copia esa carpeta.

**"El puerto 3030 está ocupado"**: la app ya está abierta. Ve a <http://localhost:3030>. Para usar otro puerto: `PORT=4000 node server.js` (en Windows: `set PORT=4000 && node server.js`).

**Un lead aparece como "Revisar a mano"**: la web bloquea visitas automáticas (Cloudflare) o hubo un problema de conexión. Ábrela tú o usa "Volver a analizar".

**¿Funciona fuera de Chile?** Sí. Cambia "Código de país" (ej: `AR`, `MX`, `PE`) y la ciudad en Configuración. La detección de celulares para WhatsApp está afinada para Chile (+56 9).

**Modo demo forzado**: `node server.js --demo`.

## Subirla a GitHub

Sí se puede, y es buena idea como respaldo o portafolio:

- **Crea el repositorio como privado.** Tu forma de buscar clientes también es parte de tu negocio.
- La carpeta `data/` (con tu API key y tus leads) **no se sube**, porque está en `.gitignore`. Antes del primer commit, revisa que no aparezca en la lista de archivos.
- Lo más fácil es usar **GitHub Desktop**: *File → Add local repository* → elige la carpeta `ClientFind` → *Publish repository* con "Keep this code private" marcado.
- GitHub guarda el código, pero **no lo ejecuta**: la app sigue corriendo en tu computador con `iniciar-windows.bat`. GitHub Pages solo publica páginas estáticas y no puede correr este servidor. Si lo intentaras, además quedaría expuesta tu API key.

## Estructura

```
server.js          servidor local y API
lib/places.js      búsqueda en Google Places (New)
lib/webcheck.js    análisis de calidad de webs
lib/scoring.js     prioridad y frase del mensaje
lib/preview.js     generador de maquetas
lib/notify.js      avisos por Telegram
lib/demo.js        datos ficticios
public/            interfaz (HTML, CSS, JS)
data/              tus datos (se crea solo)
```

No requiere instalar paquetes (`npm install` no es necesario).
