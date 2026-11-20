---
name: ClientFind
description: Buscador y mini CRM de clientes de KaiKira TI, dibujado como la libreta del almacén.
colors:
  morado: "#6430FA"
  morado-osc: "#4A1FD1"
  cian: "#02C5EF"
  tinta: "#1A1833"
  tinta-2: "#55526E"
  papel: "#FBFAFF"
  lila: "#EFEBFF"
  linea: "#E2DDF5"
  ficha: "#FFFFFF"
  borde-campo: "#CFC8EA"
  lila-riel: "#E4DCFF"
  verde: "#15803D"
  rojo: "#C2261C"
  ambar: "#A15C00"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  number:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "\"tnum\""
  title:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title-sm:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.2
  body-strong:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.5
  caption:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  mark: "2px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  pill: "999px"
spacing:
  celda: "24px"
  renglon: "72px"
  foco: "144px"
  xs: "6px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  margen: "96px"
components:
  button:
    backgroundColor: "{colors.ficha}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "9px 15px"
  button-hover:
    backgroundColor: "{colors.lila}"
  button-primary:
    backgroundColor: "{colors.morado}"
    textColor: "{colors.ficha}"
    rounded: "{rounded.md}"
    padding: "9px 15px"
  button-primary-hover:
    backgroundColor: "{colors.morado-osc}"
  button-whatsapp:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.ficha}"
    rounded: "{rounded.md}"
    padding: "9px 15px"
  button-whatsapp-outline:
    backgroundColor: "{colors.ficha}"
    textColor: "{colors.verde}"
    rounded: "{rounded.md}"
    padding: "9px 15px"
  button-small:
    rounded: "{rounded.sm}"
    padding: "6px 11px"
  input:
    backgroundColor: "{colors.ficha}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  lead-row:
    textColor: "{colors.tinta}"
    height: "{spacing.renglon}"
    padding: "0 8px"
  lead-focus:
    backgroundColor: "{colors.ficha}"
    height: "{spacing.foco}"
    padding: "0 24px"
  rail:
    backgroundColor: "{colors.morado}"
    textColor: "{colors.lila-riel}"
    width: "224px"
  rail-item-active:
    backgroundColor: "{colors.morado-osc}"
    textColor: "{colors.ficha}"
    rounded: "9px"
    padding: "10px 12px"
  panel:
    backgroundColor: "{colors.ficha}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: ClientFind

## Overview

**Creative North Star: "La libreta del almacén"**

Cada negocio es una cuenta abierta en el cuaderno de fiado: se anota, se le hace seguimiento a tiempo y se tacha cuando se cierra. La pantalla de trabajo es una hoja cuadriculada lila con un margen cian, escrita en tinta oscura y morado KaiKira, junto a un riel morado sólido que lleva el logo KK, la navegación y los conteos. La hoja no es decoración: su cuadrícula de 24px es la grilla real de la lista, y cada renglón cae exactamente sobre sus líneas.

La densidad es la de una herramienta de uso diario: renglones de una línea por dato, cifras tabulares, nada que compita con la pregunta "¿a quién le escribo ahora?". La jerarquía la dan el número de prioridad en Outfit a escala de display, la cuenta enmarcada que toca abrir primero y los palotes del día. Los estados se escriben como marcas de libreta (palito, círculo, punto, raya, tachado), no como pastillas de color.

Rechaza el CRM SaaS genérico de tarjetas blancas, pastillas pastel y fondo gris.

**Key Characteristics:**
- Hoja cuadriculada de 24px (`linea` sobre `papel`) que es la grilla de la lista; margen cian de 2px.
- Riel morado sólido a la izquierda; en celular pasa a barra inferior.
- Prioridad en números Outfit grandes y tabulares, coloreados por banda.
- Renglones de 72px (3 celdas); la cuenta en foco mide 144px (6 celdas) y lleva marco morado.
- El límite diario se dibuja en palotes de cinco, tachados al completar el grupo.
- Estados como marcas tipográficas, nunca como pastillas pastel.

## Colors

La paleta es la identidad de KaiKira TI aplicada a papel y tinta: un morado dominante, un cian que solo marca y neutros con tinte violeta.

### Primary
- **Morado KaiKira** (`morado`): el riel completo, el subrayado de la etapa activa, el marco de la cuenta en foco, los números de prioridad alta, los palotes hechos y el botón primario.
- **Morado Tinta Profunda** (`morado-osc`): hover del primario, ítem activo del riel, enlaces, "Escríbele primero." y la marca de Contactado.

### Secondary
- **Cian Margen** (`cian`): la línea de margen de la hoja y del detalle, el punto de "nuevo" junto al nombre y la marca de Solo redes / Plataforma. Nunca rellena superficies ni texto.

### Neutral
- **Tinta Noche** (`tinta`): texto principal, borde de los botones neutros y la línea gruesa (2px) bajo las etapas.
- **Tinta Gastada** (`tinta-2`): texto secundario, direcciones, prioridad baja, renglones en espera, Cerrado.
- **Papel Lila** (`papel`): fondo de la hoja y de la lista.
- **Lila Claro** (`lila`): hover de botones, selección de texto, anillo de foco de campos, `code` y fondos de barra.
- **Línea de Cuadrícula** (`linea`): las líneas de la hoja, los separadores entre renglones y los bordes de fichas.
- **Ficha Blanca** (`ficha`): la cuenta en foco, los botones, los campos y las fichas de las otras secciones.
- **Borde de Campo** (`borde-campo`): contorno de inputs y selects en reposo.
- **Lila de Riel** (`lila-riel`): texto en reposo sobre el riel morado.

### Estados
- **Verde Respondió** (`verde`): WhatsApp y la marca de respuesta positiva.
- **Rojo Caída** (`rojo`): web caída, límite diario lleno, palotes extra y acciones de peligro.
- **Ámbar Seguimiento** (`ambar`): la etapa "Toca seguimiento", su marca y Web mejorable.

Los tres colores de estado cumplen 4.5:1 sobre `papel`.

### Named Rules
**La Regla del Cian que Marca.** El cian dibuja el margen y puntos de 8 a 9px. Nunca es fondo, texto ni relleno de botón.

**La Regla del Verde Único.** El verde lleno se reserva para la acción de WhatsApp de la cuenta en foco y para los botones de WhatsApp fuera de la lista. En los renglones comunes, WhatsApp va con contorno verde sobre blanco.

## Typography

**Display Font:** Outfit (con system-ui, sans-serif), autoalojada, pesos 500 a 800.
**Body Font:** Instrument Sans (con system-ui, sans-serif), autoalojada, pesos 400 a 700.

**Character:** Outfit pone los números y los títulos con voz de rótulo, geométrica y apretada; Instrument Sans lleva el trabajo de lectura con calma neutra. Toda cifra usa `tabular-nums`.

### Hierarchy
- **Display** (800, 64px, 1, -0.04em): el número de prioridad de la cuenta en foco. 56px bajo 1180px, 40px en celular.
- **Headline** (700, 34px, 1.2, -0.02em): el título de etapa en la cabecera de la hoja. 26px en celular; 26px también en el título del detalle.
- **Number** (700, 30px, 1, -0.03em): la prioridad de cada renglón. 24px en celular.
- **Title** (700, 25px, 1.15): el nombre del negocio en la cuenta en foco. 20px en celular. Encabezados de sección del detalle y de fichas en 17 a 20px.
- **Body-strong** (600, 16px): el nombre del negocio en un renglón.
- **Body** (400, 15px, 1.5): texto base, campos y riel.
- **Label** (600, 13px): situación web, estado, botones (14px) y etiquetas de formulario (13.5px).
- **Caption** (400, 12.5px): direcciones, detalles, conteos del riel.

### Named Rules
**La Regla del Número que Manda.** La prioridad es el elemento más grande del renglón y su color dice la banda: morado alta (≥75), tinta media (50 a 74), tinta gastada baja (<50, peso 600).

**La Regla del Renglón de Una Línea.** Cada dato ocupa una línea y lo largo se corta con "…"; el texto completo vive en el detalle y en el `title`. Solo el nombre de la cuenta en foco puede bajar a 2 líneas (3 en celular).

## Layout

**La hoja.** El cuerpo es una grilla de dos columnas: riel morado de 224px y la hoja (`max-width` 1320px). La hoja lleva la cuadrícula de 24px pintada con dos gradientes lineales y un margen cian de 2px a 71px del borde; el contenido empieza a 96px (padding `0 40px 80px 96px`). La lista repite su propia cuadrícula alineada a su borde para que cada separador caiga sobre una línea.

**La cabecera.** Mínimo 96px: título de etapa a la izquierda, texto del día y palotes a la derecha. Debajo, las etapas como pestañas subrayadas sobre una línea de tinta de 2px (alto mínimo 48px, separación 28px), luego los filtros y el resumen de la lista (32px).

**El renglón.** 72px de alto (3 celdas), seis columnas: prioridad 72px, nombre y dirección (2.2fr), nota 112px, situación web (2fr), estado 150px, acciones 168px; separación horizontal 16px.

**Responsive.**
- **≤1180px:** el renglón pasa a 3 columnas (64px, contenido, acciones) y 96px de alto; la nota se oculta, la situación web baja bajo el nombre y el estado bajo las acciones. La cuenta en foco mide 168px.
- **≤980px:** se oculta el estado del renglón; las grillas de resultados pasan a una columna.
- **≤760px:** el riel se vuelve barra superior compacta y la navegación una barra inferior fija de 5 botones (alto 60px, con `safe-area-inset-bottom`). La hoja usa padding `0 16px 24px 36px` y el margen cian queda a 22px. Los renglones crecen en alto (44px de número + contenido, acciones en su propia fila con mínimo 44px de toque). Los filtros extra se pliegan tras un botón. Los campos suben a 16px para evitar el zoom de iOS.

### Named Rules
**La Regla de las Celdas.** Toda altura de la lista es múltiplo de 24px: renglón 72px, foco 144px, separación bajo el foco 24px.

## Elevation & Depth

La hoja es plana. La profundidad viene del contraste entre papel cuadriculado y ficha blanca, y de bordes de 1.5 a 2px. Hay tres sombras, todas suaves y de un solo uso.

### Shadow Vocabulary
- **Levante del foco** (`box-shadow: 0 14px 30px -22px rgba(74,31,209,.55)`): solo bajo la cuenta en foco, teñida de morado.
- **Borde del detalle** (`box-shadow: -24px 0 50px -24px rgba(26,24,51,.45)`): el panel de detalle sobre la hoja, con velo `rgba(26,24,51,.4)`.
- **Aviso flotante** (`box-shadow: 0 12px 30px -12px rgba(26,24,51,.6)`): los toasts de tinta.

### Named Rules
**La Regla de la Hoja Plana.** Nada sobre la lista flota salvo la cuenta en foco. Los renglones nunca llevan sombra ni fondo propio en reposo; el hover solo aclara el papel (`rgba(255,255,255,.75)`).

## Shapes

Renglones a escuadra: la lista y la cuenta en foco no tienen radio, porque son líneas y un recuadro de libreta. Los controles tienen esquinas suaves (botones 10px, botón chico 8px, ítems del riel 9px), las fichas de otras secciones 12px, y los contadores son pastillas sólidas (999px). Las marcas de estado y los palotes usan 2px de radio. El detalle tiene un borde izquierdo morado de 4px como lomo.

## Components

### Buttons
Contorno de tinta, firmes y pequeños.
- **Shape:** esquinas suaves (10px); chico 8px.
- **Default:** blanco, texto y borde de tinta de 1.5px, 600 14px, padding 9px 15px; hover con fondo lila.
- **Primario:** morado lleno con texto blanco; hover morado oscuro.
- **WhatsApp:** verde lleno con texto blanco en la cuenta en foco (15px, padding 11px 18px); en renglones comunes contorno verde sobre blanco, hover `#EEF8F1`.
- **Peligro:** texto y borde rojos.
- **Foco:** anillo de 2.5px morado con 2px de separación; sobre el riel el anillo es blanco.
- **Deshabilitado:** opacidad .55 y cursor de espera.

### Inputs / Fields
- **Style:** blanco, borde `borde-campo` de 1.5px, radio 10px, padding 10px 12px; placeholder `#6E6A86`.
- **Focus:** borde morado más anillo lila de 3px.
- **Estado en el renglón:** el select se escribe sin caja (borde y fondo transparentes) hasta el hover o foco.

### Navigation
- **Riel:** fondo morado, logo KK sobre un recuadro blanco de 10px de radio, nombre en Outfit 21px, conteos de cuota en 12.5px `lila-riel` con la cifra en blanco.
- **Ítems:** iconos SVG de trazo 2px a 18px, texto 500 15px `lila-riel`; hover blanco sobre `rgba(255,255,255,.08)`; activo blanco 600 sobre morado oscuro, con conteo en pastilla blanca.
- **Celular:** barra inferior de 5 columnas, icono sobre etiqueta corta de 11.5px, conteo como insignia.

### Etapas
Pestañas de texto 600 15px en tinta gastada con el número en Outfit 700; la activa pasa a tinta con subrayado morado de 3px montado sobre la línea de tinta. "Toca seguimiento" va en ámbar con su número en pastilla ámbar sólida.

### Lead Row (renglón)
Prioridad, nombre (con punto cian si es nuevo), dirección en caption, nota con estrella SVG, situación web, estado y acciones. Separador inferior de 1px `linea`. El nombre es un botón: hover subraya en morado con 4px de separación.
- **En espera:** nombre y prioridad bajan a tinta gastada (prioridad alta a `#8F78E6`).
- **Cerrado:** nombre tachado con raya de 2px en tinta gastada.

### Lead Focus (la cuenta que toca primero)
La primera cuenta por contactar, solo con la lista en su orden natural. Ficha blanca de 144px con borde morado de 2px, sin radio, desbordando 8px a cada lado, 24px de separación debajo. Tres partes: número display de 64px, nombre en Outfit 25px con el porqué ("**Escríbele primero.**" en morado oscuro y las razones en tinta 14px) y la acción de WhatsApp llena con el estado debajo.

### Marcas de estado
- **Situación web:** círculo de 9px antes del texto 600 13px. Sin web: morado lleno. Solo redes: cian lleno. Plataforma: anillo cian. Web caída: rojo lleno con texto rojo. Mejorable: ámbar lleno. Web OK: texto gastado. Revisar a mano: anillo punteado. Pendiente: pulsa a .5 de opacidad cada 1.2s.
- **Contacto:** Contactado, palito morado de 3x13px; Seguimiento, anillo ámbar de 10px; Respondió, círculo verde de 10px; Cerrado, raya de 12x2px gastada.

### Palotes del día (firma)
El límite diario en grupos de cinco trazos de 3x28px (radio 2px, separación 4px; grupos a 14px). Pendientes en `rgba(85,82,110,.32)`, hechos en morado; un grupo completo se tacha con un trazo morado de 3px girado -22°. Los envíos sobre el límite se dibujan en rojo y el texto del día pasa a rojo. Lleva `role="img"` con la cuenta en palabras. En celular los trazos miden 22px.

### Drawer (detalle)
La página de esa cuenta en la libreta: panel fijo a la derecha de hasta 600px, misma cuadrícula y margen cian a 35px, lomo morado de 4px, padding `26px 28px 60px 56px`. Entra deslizando 28px en .2s con `cubic-bezier(.2,.8,.2,1)`. Secciones separadas por línea de 1px, títulos Outfit 17px, botón cerrar circular de 36px fijo arriba. La página detrás queda inerte.

### Panel (otras secciones)
Ficha blanca con borde `linea` de 1.5px y radio 12px, padding 24px (18px en celular), para formularios, configuración, resultados y búsquedas automáticas. Los KPI usan la cifra en Outfit 800 32px morado.

### Motion
Transiciones breves y funcionales: fondo del renglón .12s, detalle y toasts .2s. Con `prefers-reduced-motion: reduce` se quitan el pulso, la entrada del detalle, la subida del toast y la transición del renglón; los cambios de estado siguen visibles.

## Do's and Don'ts

### Do:
- **Do** alinear toda altura de la lista a la celda de 24px (renglón 72px, foco 144px).
- **Do** escribir los estados como marcas de libreta (palito, círculo, anillo, raya, tachado) seguidas de texto 600.
- **Do** dar a la prioridad el mayor tamaño del renglón, en Outfit tabular, coloreada por banda.
- **Do** reservar el marco morado y la sombra teñida para una sola cuenta en foco.
- **Do** usar el cian solo para el margen y los puntos de marca.
- **Do** mostrar el límite diario en palotes de cinco con su texto "Hoy · N de 25".
- **Do** usar iconos SVG de trazo inline (`currentColor`, trazo 2px).
- **Do** quitar animaciones y desplazamientos con movimiento reducido.

### Don't:
- **Don't** usar pastillas pastel para estados ni situación web; las pastillas sólidas quedan solo para contadores.
- **Don't** poner tarjetas redondeadas flotantes en la lista; los renglones son líneas a escuadra.
- **Don't** usar fondo gris ni quitar la cuadrícula de la hoja de trabajo.
- **Don't** rellenar botones de renglón con verde; el verde lleno es de la cuenta en foco.
- **Don't** usar colores fuera de la paleta KaiKira para nuevas superficies.
- **Don't** usar emoji como iconos ni rótulos.
