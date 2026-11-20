# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Fernando, fundador de KaiKira TI, que vende páginas web y landing pages a pymes de Santiago. Usa ClientFind a diario en el computador para decidir a qué negocios escribir, enviarles un primer mensaje por WhatsApp, hacer seguimiento y registrar cómo avanza cada conversación.

Segunda audiencia: quienes ven ClientFind como muestra de su trabajo (repositorio en GitHub, entrevistas, clientes potenciales). No la usan; la evalúan.

## Product Purpose

Encontrar negocios en Google Maps que necesitan una web (sin web, solo redes sociales, plataforma de reservas o pedidos, web caída o mejorable), priorizarlos según qué tan buena oportunidad comercial son y contactarlos de forma ordenada y responsable. El éxito es conseguir reuniones y clientes sin escribir dos veces en frío al mismo negocio ni arriesgar el bloqueo del número de WhatsApp.

## Positioning

Une en una sola herramienta local el diagnóstico real de la web de cada negocio (HTTP, HTML, PageSpeed), un puntaje de prioridad explicable, mensajes personalizados según la situación de cada negocio y una maqueta de landing generada con sus propios datos. El argumento de venta sale del diagnóstico, no de un mensaje genérico.

## Operating Context

- App local (Node, sin dependencias) que se abre en el navegador del computador en `localhost`; solo acepta peticiones del propio equipo.
- Los datos viven en archivos JSON en `data/` (leads, configuración, uso). La copia en uso está en `D:\Negocio_KaiKira\ClientFind`.
- El contacto sale por WhatsApp (wa.me) o copiando el mensaje; los fijos se llaman o se escriben por Instagram.
- Rutina: elegir los mejores pendientes, escribir hasta el límite diario (25), hacer seguimiento a los 3 días, marcar respuestas, reuniones y clientes.
- Búsquedas automáticas opcionales con aviso por Telegram.

## Capabilities and Constraints

- Búsqueda con Google Places API (New), con tope mensual para no salir del tramo gratuito (900 de 1.000 llamadas).
- Clasificación web: Sin web, Solo redes, Plataforma, Web caída, Web mejorable, Web OK, Revisar a mano.
- Prioridad 0–100 calculada en `public/prioridad.js` (situación web, reseñas, nota, WhatsApp); bandas alta ≥75, media 50–74, baja <50.
- Mini CRM: Nuevo → Contactado → Respondió → Reunión / propuesta → Cliente, más Perdido y No contactar. Etapas de trabajo en la lista: Por contactar, Toca seguimiento, En curso, Cerrados.
- Plantillas de mensaje con versión A/B y variables (`{nombre}`, `{problema}`, `{cuando}`, …).
- Generador de maquetas de landing por negocio.
- Interfaz en español de Chile.

## Brand Commitments

- ClientFind es una herramienta de **KaiKira TI** y debe sentirse parte de su identidad.
- Logo KK de KaiKira TI (K morada y K cian), en `kaikira-web.zip` → `img/logo-kk.png`.
- Identidad del sitio de KaiKira TI: morado `#6430FA` (oscuro `#4A1FD1`), cian `#02C5EF`, tinta `#1A1833`, papel `#FBFAFF`, lila `#EFEBFF`; títulos en Outfit y texto en Instrument Sans.
- Voz: cercana, directa, de tú, en español chileno; los mensajes a negocios son respetuosos y ofrecen dejar de escribir.

## Evidence on Hand

- Capturas en modo demo en `docs/img/` (con negocios ficticios).
- Datos reales de leads solo en la copia local; nunca se muestran nombres reales en material público.
- No hay testimonios ni métricas publicadas de resultados; no inventarlas.

## Product Principles

1. La lista responde primero "¿a quién le escribo ahora?"; todo lo demás es secundario.
2. Contacto responsable: nunca facilitar un segundo mensaje en frío ni pasar el límite diario sin avisar.
3. Cada número se puede explicar (prioridad, conteos, resultados).
4. Los datos reales del usuario no se tocan sin pedirlo.
5. Funciona sola y en local: sin dependencias ni servicios extra más allá de Google.

## Accessibility & Inclusion

Se usa con mouse y teclado en el computador; debe poder recorrerse entera con teclado, cumplir contraste AA y respetar la preferencia de movimiento reducido.
