# Conversión de Lilas a SPA con rutas

Fecha: 5 de octubre de 2026.

## Diagnóstico

`react-app` ya era una aplicación React renderizada en el cliente, con una sola página interactiva y navegación por anclas. Era una SPA de una vista, pero no tenía rutas de vistas, historial de navegación entre vistas, página para URLs desconocidas ni configuración de publicación que garantizara accesos directos. La raíz mantiene el sitio HTML anterior; no es la carpeta que debe publicarse ahora.

Se revisaron estructura, componentes, entrada `createRoot`, CSS, Vite, dependencias, scripts, persistencia y referencias del repositorio. No se encontraron archivos AGENTS.md aplicables, router previo, APIs, autenticación ni protecciones de acceso. React, React DOM, Vite y Oxlint siguen siendo las herramientas existentes. No se instalaron nuevas dependencias.

## Cambios

- History API con `pushState`, suscripción a `popstate`/`hashchange` y `useSyncExternalStore`. Solución pequeña para cuatro rutas, sin framework adicional.
- `/` conserva la portada completa. `/menu`, `/historia` y `/como-pedir` reutilizan los componentes existentes como vistas propias.
- `Link` intercepta únicamente clics normales en enlaces locales apropiados. Conserva enlaces externos, archivos, descargas, anclas y clics modificados. Cabecera y pie comparten navegación; WhatsApp conserva su enlace externo.
- Estado del carrito y campos del pedido fuera de las vistas, por lo que sobreviven a la navegación. Los diálogos se cierran al cambiar la ruta; los títulos, foco, desplazamiento y estado del enlace activo se actualizan.
- Vista 404 con enlaces de recuperación, mensaje inicial de carga y límite de errores de renderizado. Los datos siguen siendo locales; no se añadieron simulaciones de carga, APIs ni autenticación.
- Se conservaron validaciones, estados vacíos, opciones, precios, persistencia y mensaje WhatsApp. Los campos no hacen envío HTTP de formulario; Enter no recarga.
- Se retiró la referencia al menú que solo servía para navegar por desplazamiento. No se eliminaron recursos ni dependencias ajenos al cambio.

Archivos centrales: `src/App.jsx`, `src/routes.js`, `src/hooks/useRoute.js`, `src/components/Link.jsx`, `src/components/ErrorBoundary.jsx`, `src/views/PageContent.jsx`, `src/views/NotFound.jsx`, cabecera, portada, pie, CSS e index. Se añadieron `scripts/prepare-hosting.mjs`, pruebas de rutas y SPA, y `netlify.toml` en la raíz.

## Alojamiento

Netlify: base `react-app`, Node 24, comando `npm run build`, publicación `dist`. La compilación genera `_redirects` desde la misma lista de rutas que utiliza React y crea `404.html` a partir de la entrada compilada. Se reescriben solo las rutas conocidas a `index.html`; las rutas desconocidas usan el documento 404 con estado 404. Los archivos existentes se sirven normalmente y las solicitudes a assets/API inexistentes no se convierten en respuestas 200 del index. La vista 404 también funciona después de navegación del cliente.

Esta configuración está preparada para la raíz del dominio. Para otro servidor hay que configurar las mismas reescrituras y el documento de error, respetando los archivos y endpoints reales. No se aplicaron cambios remotos.

## Comprobaciones

- `npm run build`: correcto, 40 módulos; genera archivos de despliegue.
- `npm run lint`: correcto, sin avisos.
- `npm test`: siete tests aprobados (cinco del carrito/catálogo y dos de navegación).
- Typecheck: no existe; proyecto JavaScript/JSX.
- `tests/spa.mjs`: ejecutado con Playwright existente y Edge headless, en desarrollo y contra `dist` servido con las reglas generadas. Verifica que las navegaciones no piden nuevos documentos y que se conserva una marca en `window`; Atrás/Adelante; cuatro rutas directas y recargadas; consulta y barra final; ruta inexistente y recuperación; formulario con Enter; carrito y campos entre vistas; WhatsApp interceptado sin envío real; enlaces antiguos con anclas; navegación móvil. Sin errores de ejecución detectados.
- El servidor local de prueba respondió 404 para `/api/orders`, `/assets/missing.js` y `/images/missing.webp`, y 200 para una imagen existente. Esto valida los artefactos y la lógica local, no la infraestructura real de Netlify.
- `tests/browser.mjs`: regresión completa aprobada, incluidos los 18 productos, configuraciones, precios, almacenamiento, cantidades, diálogos y comparación con Legacy en 17 anchos. Se actualizaron sus expectativas de navegación a las nuevas rutas.
- Hashes SHA-256: original y `.docs/Legacy` permanecen intactos.

Evidencias: [SPA](evidencias/spa-results.json) y [regresión](evidencias/browser-results.json).

## Problemas y límites

Una primera invocación de npm se hizo desde la raíz, donde no existe package.json; se corrigió el directorio y los comandos finales pasan. El servidor anterior no estaba activo y se inició de nuevo en `http://127.0.0.1:5173`.

Se conservan las limitaciones anteriores: las fuentes Google Fonts pueden estar bloqueadas en este entorno y existe un desbordamiento heredado de un píxel en algunos anchos intermedios. No se modificó el diseño para corregir problemas ajenos al objetivo. Las comprobaciones de navegador se realizaron en Edge/Chromium, no en todos los navegadores. El límite de errores está implementado, pero no se inyectó un error de renderizado para probarlo.

Pendiente externo: publicar el commit que contiene `netlify.toml` y `react-app` en el repositorio conectado, o subir manualmente el contenido de `react-app/dist` con `_redirects` y `404.html`. Después verificar las URLs públicas. No se publicó ni se comprobó el sitio remoto en esta tarea.

## Ejecutar

Desde la carpeta Lilas:

```powershell
cd react-app
npm run dev
```

Para generar la carpeta publicable: `npm run build`. Instrucciones detalladas y ejecución de pruebas en `react-app/README.md`.
