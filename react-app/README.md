# Lilas · React

Migración de la cafetería Lilas a React con JavaScript/JSX, Vite y CSS tradicional. Conserva el catálogo de 18 productos, personalización, carrito local y pedido por WhatsApp. No hay backend ni administrador.

## Ejecutar

Desde la carpeta Lilas:

```powershell
cd react-app
npm run dev
```

Si faltan dependencias en una copia nueva, ejecutar primero `npm install`. Abrir la URL indicada por Vite (habitualmente http://localhost:5173).

## Validar

```powershell
npm run build
npm run lint
npm test
```

Las pruebas unitarias usan el ejecutor incluido en Node. El proyecto es JavaScript y no tiene script de typecheck.

`tests/browser.mjs` comprueba interacciones y compara geometría/capturas contra `../.docs/Legacy`. Usa una instalación existente de Playwright y un navegador Chromium; no son nuevas dependencias del proyecto. Con Vite activo, indicar sus rutas locales:

```powershell
$env:PLAYWRIGHT_MODULE = 'RUTA_ABSOLUTA_A_PLAYWRIGHT'
$env:BROWSER_EXECUTABLE = 'RUTA_ABSOLUTA_A_CHROME_O_EDGE'
node tests/browser.mjs
```

Opcionalmente, `APP_URL` permite probar otro puerto o una vista previa de producción. Las capturas y el resultado se guardan en `.docs/evidencias`. Las pruebas interceptan la apertura de WhatsApp: no envían mensajes.

## Organización

- `src/App.jsx`: composición y coordinación de diálogos.
- `src/components/`: secciones, catálogo, diálogos y controles compartidos.
- `src/hooks/useCart.js`: estado y persistencia del carrito.
- `src/hooks/useRoute.js`, `src/routes.js`, `src/components/Link.jsx`: navegación mediante History API, sin dependencias nuevas.
- `src/views/`: composición de vistas y página 404.
- `src/data/menu.js`: catálogo, categorías, tamaños y bobas.
- `src/config.js`: número de WhatsApp y clave de almacenamiento.
- `src/utils/`: importes, validación y texto del pedido.
- `src/index.css`: estilos originales más ajustes mínimos para las vistas y el estado de navegación activo.
- `public/images/`: los 18 WebP originales.

La sincronización de `dialog.showModal()`, foco y scroll utiliza refs/efectos; el contenido y los eventos se controlan con React. El carrito conserva la estructura Legacy en `lilas-cart-v1`. El almacenamiento pertenece al origen del navegador: los pedidos de Netlify no se trasladan automáticamente a localhost. Nombre y notas permanecen durante la sesión, pero no se guardan al recargar, igual que en Legacy.

Abrir WhatsApp prepara el mensaje; el cliente debe confirmar su envío. Las fuentes remotas conservan las alternativas locales del CSS si no hay acceso a Google Fonts.

Consulta [el informe de migración](../.docs/RESULTADO-MIGRACION.md) y [la referencia de componentes](../.docs/Liberia-de-Componentes/README.md).

## SPA y rutas

La portada `/` conserva las secciones originales. La navegación principal abre vistas propias en `/menu`, `/historia` y `/como-pedir`, sin recargar el documento. Cabecera, pie y carrito son compartidos. Atrás/Adelante sincronizan la vista; los diálogos se cierran al cambiar de ruta. Los títulos y el enlace activo se actualizan. Se conservan los enlaces especiales, externos y las aperturas con teclas modificadoras.

Los estados vacíos del catálogo y carrito permanecen. Hay un mensaje de carga inicial, una vista 404 y un límite de errores de renderizado con opción de recargar. No se simulan APIs ni tiempos de carga: el catálogo sigue siendo local. Los campos del pedido no pertenecen a un formulario que envíe HTTP; Enter no recarga la página y se mantienen límites de longitud y envío explícito a WhatsApp.

Para validar rutas, historial, persistencia entre vistas y el build con las reglas generadas de alojamiento:

```powershell
node tests/spa.mjs
```

Usa las mismas variables `PLAYWRIGHT_MODULE`, `BROWSER_EXECUTABLE` y `APP_URL` del test anterior. Este script sirve `dist` temporalmente y comprueba las reglas preparadas para Netlify; no valida un despliegue remoto.

## Despliegue en Netlify

El archivo `../netlify.toml` define base `react-app`, comando `npm run build`, publicación `dist` y Node 24. Al compilar se generan `dist/_redirects` y `dist/404.html` a partir de las rutas reales. Solo las rutas conocidas se reescriben a `index.html`; Netlify sirve la página 404 personalizada para direcciones desconocidas. Los archivos estáticos existentes mantienen prioridad y no se aplica un fallback global que devuelva HTTP 200 a solicitudes de API o assets inexistentes. No hay APIs ni autenticación en este proyecto.

Referencias oficiales: [reescrituras y prioridad de archivos](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/), [páginas 404 y resolución de solicitudes](https://docs.netlify.com/resources/troubleshooting/request-chain/).

Para publicar por Git, subir el proyecto y `netlify.toml` al repositorio conectado y desplegar ese commit. Para publicación manual, ejecutar `npm run build` y subir **el contenido de `react-app/dist`**, incluidos `_redirects` y `404.html`; no subir la carpeta raíz con la versión HTML anterior. Esta tarea prepara los archivos, pero no publica ni modifica la configuración remota.

El despliegue preparado sirve la aplicación en la raíz del dominio. En otro proveedor hay que reproducir las reescrituras de rutas conocidas y servir `404.html` con estado 404 cuando no exista un archivo o endpoint real.
