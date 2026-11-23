# Lilas · React

SPA de la cafetería Lilas con React, JavaScript/JSX, Vite y CSS tradicional. Conserva el catálogo de 18 productos, personalización y pedido por WhatsApp. Supabase guarda el carrito y sus datos opcionales, valida las opciones y calcula los importes. No hay administrador, pagos ni pedidos comerciales confirmados.

## Ejecutar

Desde la carpeta Lilas:

```powershell
cd react-app
npm run dev
```

Si faltan dependencias en una copia nueva, ejecutar primero `npm install`. Copiar `.env.example` a `.env.local` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con la URL y clave **pública** del proyecto. Reiniciar Vite después de cambiar variables. Abrir la URL indicada por Vite (habitualmente http://localhost:5173). Sin configuración o conexión se muestra un error; no se simula un guardado local.

## Validar

```powershell
npm run build
npm run lint
npm test
```

Las pruebas unitarias usan el ejecutor incluido en Node. El proyecto es JavaScript y no tiene script de typecheck.

Las pruebas de navegador usan una instalación existente de Playwright y Chromium; no son dependencias nuevas del proyecto. Con Vite activo, indicar sus rutas locales:

```powershell
$env:PLAYWRIGHT_MODULE = 'RUTA_ABSOLUTA_A_PLAYWRIGHT'
$env:BROWSER_EXECUTABLE = 'RUTA_ABSOLUTA_A_CHROME_O_EDGE'
node tests/spa.mjs
node tests/confirmation.mjs
node tests/remote-ui.mjs
```

`APP_URL` permite probar otro puerto. Ejecutar primero `npm run build` para la prueba SPA. Las capturas y resultados se guardan en `.docs/evidencias`. Las pruebas interceptan WhatsApp: no envían mensajes. `node tests/supabase.mjs` prueba CRUD, validaciones y RLS con dos sesiones reales usando solo la clave pública. Estas pruebas requieren red y un proyecto de prueba configurado; crean usuarios anónimos ficticios y registran exclusivamente sus UUID en `supabase/.temp/test-users.txt`, excluido de Git. Para eliminarlos al terminar, desde `react-app`: `powershell -File scripts/cleanup-test-users.ps1` con CLI autenticada. Revisar siempre el proyecto vinculado.

`tests/browser.mjs` se conserva como referencia histórica de equivalencia con Legacy: asume persistencia local y operaciones síncronas, por lo que no se utiliza para certificar la integración remota. Los tests vigentes son los anteriores.

## Organización

- `src/App.jsx`: composición y coordinación de diálogos.
- `src/components/`: secciones, catálogo, diálogos y controles compartidos.
- `src/hooks/useCart.js`: estado y persistencia del carrito.
- `src/services/cart.js`: sesión anónima y operaciones remotas; errores seguros.
- `src/hooks/useCatalog.js`: consulta del catálogo y precios públicos.
- `src/lib/supabase.js`: cliente centralizado, sin claves privadas.
- `../supabase/migrations/`: esquema, restricciones, RLS y operaciones SQL atómicas.
- `src/hooks/useRoute.js`, `src/routes.js`, `src/components/Link.jsx`: navegación mediante History API, sin dependencias nuevas.
- `src/views/`: composición de vistas y página 404.
- `src/data/menu.js`: catálogo, categorías, tamaños y bobas.
- `src/config.js`: número de WhatsApp y clave de almacenamiento.
- `src/utils/`: importes, validación y texto del pedido.
- `src/index.css`: estilos originales más ajustes mínimos para las vistas y el estado de navegación activo.
- `public/images/`: los 18 WebP originales.

La sincronización de `dialog.showModal()`, foco y scroll utiliza refs/efectos; el contenido y los eventos se controlan con React. Supabase Auth crea una identidad anónima sin pantalla de registro. RLS limita cada carrito a su propietario. Artículos, nombre y notas sobreviven a recargas en el mismo navegador/origen. Borrar la sesión del navegador pierde acceso al carrito anterior; no hay recuperación entre dispositivos. Los antiguos datos de `lilas-cart-v1` se conservan sin modificarlos, pero no se importan automáticamente al carrito remoto: se vuelven a agregar desde el catálogo.

Nombre y notas se guardan al pulsar **Guardar datos del pedido** o **Enviar pedido por WhatsApp**. Para borrar esos campos, vaciarlos y guardar. Cantidades y artículos se guardan al modificarlos, esperando confirmación del servidor. Un error mantiene el último estado confirmado y ofrece actualizar; no muestra un éxito ficticio. El mensaje usa la respuesta SQL más reciente, no precios aportados por el cliente.

Abrir WhatsApp prepara el mensaje; el cliente debe confirmar su envío. Las fuentes remotas conservan las alternativas locales del CSS si no hay acceso a Google Fonts.

Consulta [el informe de migración](../.docs/RESULTADO-MIGRACION.md) y [la referencia de componentes](../.docs/Liberia-de-Componentes/README.md).

## SPA y rutas

La portada `/` conserva las secciones originales. La navegación principal abre vistas propias en `/menu`, `/historia` y `/como-pedir`, sin recargar el documento. Cabecera, pie y carrito son compartidos. Atrás/Adelante sincronizan la vista; los diálogos se cierran al cambiar de ruta. Los títulos y el enlace activo se actualizan. Se conservan los enlaces especiales, externos y las aperturas con teclas modificadoras.

Los estados vacíos del catálogo y carrito permanecen. Hay carga real, errores de conexión con reintento, vista 404 y límite de errores de renderizado. El formulario usa `preventDefault`: Enter guarda sin recargar. Los límites 80/500 caracteres se aplican en interfaz y SQL; cantidades 1–99, tamaños y opciones se validan en servidor. Imágenes, descripciones y categorías visuales se reutilizan localmente; precios y catálogo disponible se consultan en Supabase.

Para validar rutas, historial, persistencia entre vistas y el build con las reglas generadas de alojamiento:

```powershell
node tests/spa.mjs
```

Usa las mismas variables `PLAYWRIGHT_MODULE`, `BROWSER_EXECUTABLE` y `APP_URL` del test anterior. Este script sirve `dist` temporalmente y comprueba las reglas preparadas para Netlify; no valida un despliegue remoto.

## Despliegue en Netlify

El archivo `../netlify.toml` define base `react-app`, comando `npm run build`, publicación `dist` y Node 24. Al compilar se generan `dist/_redirects` y `dist/404.html` a partir de las rutas reales. Solo las rutas conocidas se reescriben a `index.html`; Netlify sirve la página 404 personalizada para direcciones desconocidas. Los archivos estáticos existentes mantienen prioridad. Auth y API se conectan directamente al dominio de Supabase.

En Netlify configurar **antes de compilar** `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los mismos valores públicos locales, y volver a desplegar. Nunca usar `service_role`, tokens de CLI o contraseña de base de datos como variables `VITE_*`. El sitio remoto de Netlify no se ha actualizado en esta tarea.

Referencias oficiales: [reescrituras y prioridad de archivos](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/), [páginas 404 y resolución de solicitudes](https://docs.netlify.com/resources/troubleshooting/request-chain/).

Para publicar por Git, subir el proyecto y `netlify.toml` al repositorio conectado y desplegar ese commit. Para publicación manual, ejecutar `npm run build` y subir **el contenido de `react-app/dist`**, incluidos `_redirects` y `404.html`; no subir la carpeta raíz con la versión HTML anterior. Esta tarea prepara los archivos, pero no publica ni modifica la configuración remota.

El despliegue preparado sirve la aplicación en la raíz del dominio. En otro proveedor hay que reproducir las reescrituras de rutas conocidas y servir `404.html` con estado 404 cuando no exista un archivo o endpoint real.

## Confirmación de pedidos

El carrito y WhatsApp muestran **Total estimado** y aclaran que el precio y la disponibilidad se confirman con la cafetería antes de aceptar el pedido. El negocio debe recalcular el importe con su catálogo oficial: el texto recibido puede modificarse. Procedimiento y prueba controlada en [Confirmación de pedidos](../.docs/CONFIRMACION-PEDIDOS.md).

## Supabase remoto

### Historial de solicitudes (23 de noviembre de 2026)

Al pulsar **Enviar pedido por WhatsApp**, se guarda una solicitud independiente con sus artículos y precios y se vacía el carrito para iniciar otro. El guardado es atómico; un reintento de la misma operación no duplica la solicitud. **Mis solicitudes anteriores**, dentro del carrito, permite consultar las últimas 50 de la sesión y volver a abrir el mensaje. El estado es **Preparada**: no acredita envío, aceptación ni pago.

Las tablas `orders` y `order_items` siguen siendo el carrito editable. Los registros permanentes de solicitudes se encuentran en `order_history` y `order_history_items`, protegidos por RLS y sin permisos de escritura directa para visitantes. No se recuperan pedidos borrados antes de este cambio.

Migración adicional: `20261123000100_order_history.sql`. Pruebas: `node tests/history.mjs` y `node tests/history-ui.mjs` (esta última usa las variables de Playwright ya documentadas). Detalles y límites en [HISTORIAL.md](../.docs/supabase-integration/HISTORIAL.md).

Proyecto existente: `zasciyldjbqjlidznvsc` (Lilas), región São Paulo, organización con plan `free` verificado. No volver a crear el proyecto. Desde `react-app`, después de `npx supabase login`:

```powershell
npx supabase link --project-ref zasciyldjbqjlidznvsc --workdir ..
npx supabase db push --dry-run --linked --workdir ..
npx supabase db push --linked --workdir ..
npx supabase migration list --linked --workdir ..
npx supabase config diff --project-ref zasciyldjbqjlidznvsc --workdir ..
npx supabase config push --project-ref zasciyldjbqjlidznvsc --workdir ..
```

La migración ya está aplicada. `config.toml` declara solo Auth anónimo, para no sobrescribir ajustes remotos ajenos. No hace falta Docker. La semilla idempotente contiene únicamente los 18 productos y 51 precios existentes, sin clientes ficticios; se cargó explícitamente con `db push --linked --include-seed --workdir ..`. Volver a cargarla restaura esos precios: no hacerlo si el negocio ya los modificó deliberadamente.

Modelo, permisos, pruebas, limitaciones y evidencia: [ANALISIS](../.docs/supabase-integration/ANALISIS.md) y [CHECKLIST](../.docs/supabase-integration/CHECKLIST.md). Auth anónimo mantiene el flujo sin registro; para una publicación abierta conviene evaluar CAPTCHA y limpieza programada de sesiones abandonadas. No se añadieron servicios de pago.
