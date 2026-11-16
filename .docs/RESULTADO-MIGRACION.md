# Resultado de la migración de Lilas

Fecha: 5 de octubre de 2026. Aplicación en `react-app/`, React + JavaScript/JSX + Vite, sin nuevas dependencias.

## Interfaz y funcionalidad

Se migró la página completa: cabecera y carrito sticky, portada, catálogo de seis categorías con 18 productos, búsqueda, personalización, carrito, instrucciones para pedir, historia familiar, misión, visión y pie. Se conservaron precios, textos, fotografías WebP, opciones, estructura visual y breakpoints.

La lógica de listeners/HTML generado se sustituyó por estado y eventos React. `useCart` concentra persistencia; las utilidades comparten identidad de combinación, validación, precio, total y mensaje. Se conserva `lilas-cart-v1` y su formato. Nombre/notas son opcionales y permanecen al reabrir el carrito. El enlace apunta a `59175918018` y exige confirmar el envío en WhatsApp.

## Componentes

La referencia no contenía implementaciones reutilizables. Se crearon sus 13 componentes: `SiteHeader`, `Hero`, `MenuCatalog`, `ProductCard`, `HowToOrder`, `OurStory`, `SiteFooter`, `Modal`, `ProductDialog`, `QuantityControl`, `CartDialog`, `CartItem` y `Toast`.

`Modal` y `QuantityControl` se comparten entre producto y carrito; `ProductCard` y `CartItem` se reutilizan en las listas. Se reutilizaron íntegramente el CSS y los 18 assets Legacy. Los únicos efectos imperativos de interfaz sincronizan el diálogo nativo, foco, scroll y desplazamiento a las anclas.

## Archivos principales

- `react-app/src/App.jsx`, `src/components/`, `src/hooks/useCart.js`.
- `react-app/src/data/menu.js`, `src/config.js`, `src/utils/cart.js`, `src/utils/format.js`.
- `react-app/src/index.css`, `index.html`, `public/images/`.
- `react-app/tests/cart.test.js`, `tests/browser.mjs`, `package.json` (script test) y `README.md`.
- Se retiró `src/App.css`, que solo correspondía a la demo Vite.

No se modificaron la página original ni `.docs/Legacy`. Se verificaron los 21 hashes de cada conjunto contra `preparacion.json`; los 18 WebP y el CSS de React son copias idénticas. No hay archivos TypeScript en `src`. No se modificaron dependencias ni el archivo de bloqueo.

## Validaciones ejecutadas

| Comprobación | Resultado |
|---|---|
| `npm run build` | Correcto; 34 módulos compilados |
| `npm run lint` | Correcto, sin avisos |
| `npm test` | 5 pruebas aprobadas con Node, sin dependencias adicionales |
| Typecheck | No existe ni corresponde a la configuración JavaScript actual |
| HTTP y render React en localhost:5173 | HTTP 200, interfaz e interacciones verificadas |
| Playwright con Edge headless instalado | 10 grupos funcionales aprobados; sin errores de ejecución ni recursos locales fallidos |
| Comparación responsive | Geometría de las secciones y ambos diálogos idéntica en 17 anchos |
| Capturas | 15 pares: página completa, producto y carrito a 360, 390, 768, 1024 y 1440 px |

Los cinco tests unitarios contrastan catálogo con Legacy; importes; combinaciones y límites; validación/almacenamiento; y mensaje WhatsApp comparado literalmente con la función original.

El navegador comprobó los 18 productos y todos sus tamaños/precios, imágenes, búsqueda sin acentos, cambios de categoría, estado vacío, extras, té frío/caliente y bobas incluidas, fusión y separación de líneas, cantidades, eliminar, persistencia, datos corruptos, almacenamiento bloqueado, límites 1–99, nombre/notas 80/500, mensaje y enlace alternativo, cierre de diálogos, teclado, foco, anclas, carrito sticky y aviso temporal. No se envió ningún mensaje al negocio.

Los anchos comparados fueron 359, 360, 361, 390, 519, 520, 521, 759, 760, 761, 768, 1024, 1099, 1100, 1101, 1440 y 1500 px. Se inspeccionaron visualmente capturas de escritorio y móvil. La comparación de píxeles con umbral 0,1 encontró cero píxeles diferentes en 13 pares; los dos diálogos de producto a 360/390 px difieren en 10 píxeles cada uno (menos de 0,0031% de la captura), sin diferencias de geometría. Todas las pruebas usan movimiento reducido.

Evidencias: [resultados del navegador](evidencias/browser-results.json), [comparación de píxeles](evidencias/pixel-comparison.json), [escritorio React](evidencias/react-1440.png), [móvil React](evidencias/react-390.png).

## Incidencias corregidas y límites conocidos

Durante la integración, la primera compilación falló porque una escritura apuntó a una ruta duplicada y App todavía importaba el CSS de la plantilla. Se corrigió la ruta y se sustituyó App; las compilaciones finales pasan. Se corrigieron dos avisos de lint relativos al año y a referencias de foco. El test de teclado se ajustó al comportamiento nativo de Edge: Tab puede pasar por los controles del navegador, sin enfocar contenido de fondo. No se sustituyó la semántica nativa del diálogo.

Google Fonts está bloqueado en este entorno (`ERR_NETWORK_ACCESS_DENIED`). Ambas versiones se compararon con las mismas fuentes alternativas del CSS. Se conservan las fuentes remotas y sus alternativas; no se certifica aquí su descarga en una red diferente.

El Legacy presenta 1 píxel de desbordamiento horizontal en los anchos comprobados entre 761 y 1100 px; React lo reproduce. Se conserva el CSS original para evitar un cambio visual fuera de la migración. El test tolera ese píxel y exige la misma medida en ambos proyectos. No se validó zoom de texto manual ni navegadores distintos de Edge/Chromium o dispositivos físicos.

No se identificaron diferencias funcionales en los flujos probados. El carrito sigue siendo local al navegador/origen, no una base de datos; al cambiar de Netlify a localhost no se comparte almacenamiento. Abrir WhatsApp no confirma ni envía automáticamente un pedido. No se publicaron cambios en Netlify o GitHub.

## Ejecución

Desde Lilas:

```powershell
cd react-app
npm run dev
```

Servidor verificado en http://localhost:5173. Para repetir tests de navegador con una instalación existente de Playwright, consultar `react-app/README.md`.
