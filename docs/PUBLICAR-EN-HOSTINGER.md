# Usar ClientFind desde el celular (publicado en Hostinger)

ClientFind puede correr en tu plan de Hostinger como **App web de Node.js**. Así lo abres desde el celular o cualquier computador, protegido con contraseña, sin dejar tu PC encendido.

La app entra en **modo en línea** cuando existe la variable de entorno `CLIENTFIND_PASSWORD`. En ese modo:

- pide contraseña para todo, salvo la pantalla de inicio de sesión;
- la sesión dura 30 días en cada dispositivo;
- bloquea 15 minutos tras 8 intentos fallidos;
- rechaza peticiones que vengan de otros sitios web.

## 1. Respalda tus datos actuales

En tu computador, abre ClientFind → **⚙️ Configuración → Respaldo de tus datos → Descargar respaldo**. Guarda el archivo `clientfind-respaldo-AAAA-MM-DD.json`: después lo subes a la versión en línea.

## 2. Sube la versión nueva a GitHub

En la carpeta de ClientFind:

```bash
git add .
git status          # revisa que NO aparezca la carpeta data/
git commit -m "Modo en línea y versión para celular"
git push
```

La carpeta `data/` (tus leads y tu API key) está en `.gitignore` y no se sube.

## 3. Crea la app en Hostinger

1. hPanel → **Sitios web → Agregar sitio web → App web de Node.js**.
2. Elige **Importar desde GitHub** y selecciona el repositorio `ClientFind`. También puedes **subir el ZIP**.
3. Configuración de compilación:

   | Campo | Valor |
   | --- | --- |
   | Framework | Express / Otro |
   | Versión de Node | 20 o superior |
   | Comando de compilación | (vacío) |
   | Archivo de entrada | `server.js` |
   | Comando de inicio | `npm start` |

4. **Variables de entorno** (paso clave):

   | Variable | Valor |
   | --- | --- |
   | `CLIENTFIND_PASSWORD` | Una contraseña larga y única, de al menos 10 caracteres. No la uses en otro lado. |
   | `GOOGLE_API_KEY` | Tu API key de Google (la que empieza con `AIza…`). |

5. Elige un dominio. Un subdominio como `app.tudominio.cl` queda bien, separado de tu web de KaiKira TI.
6. **Desplegar.**

## 4. Entra y carga tus datos

1. Abre la dirección de la app. Te pedirá la contraseña.
2. Ve a **⚙️ Ajustes → Importar respaldo** y elige el archivo del paso 1.

## 5. Revisa que los datos no se borren (importante)

Hostinger mantiene la app corriendo, pero no está claro si los archivos que la app guarda se conservan al **redeployar** (por ejemplo, cuando subes una versión nueva). Pruébalo una vez:

1. Escribe una nota en cualquier lead.
2. En Hostinger: **Implementaciones → Configuración y redeploy → Guardar y redeployar**.
3. Vuelve a abrir la app. Si la nota sigue ahí, todo bien.

**Si se borró:** pregúntale al soporte de Hostinger por una carpeta de tu cuenta que **no se borre al redeployar**. Agrega la variable `RADAR_DATA_DIR` con esa ruta y redeploya. Mientras tanto, **descarga un respaldo antes de cada redeploy**.

## 6. Instálala en el celular como app

- **Android (Chrome):** abre la app → menú ⋮ → **Agregar a pantalla de inicio** (o **Instalar app**).
- **iPhone (Safari):** abre la app → botón Compartir → **Agregar a inicio**.

Queda con su propio ícono y se abre a pantalla completa, con la navegación abajo.

## Buenas prácticas

- **Usa una sola versión a la vez** (la en línea), para no tener leads distintos en el PC y en el celular. Si vuelves a usar la del PC, importa antes un respaldo.
- **La API key de Google** sigue restringida solo por API (Places API (New) y PageSpeed). No uses restricción por sitio web: las llamadas las hace el servidor.
- El **tope mensual de 900 llamadas** sigue funcionando igual en línea.
- Las **búsquedas automáticas** ahora corren aunque tu PC esté apagado.
- **Cambiar `CLIENTFIND_PASSWORD`** cierra la sesión en todos los dispositivos.
