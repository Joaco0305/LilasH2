# Verificación de la migración

**Estado: verificación ejecutada el 5 de octubre de 2026.** Consultar [resultados, evidencias y límites](RESULTADO-MIGRACION.md). Las excepciones se indican debajo; no se certifica zoom manual ni fuentes remotas bloqueadas.

## Entorno y límites

- [x] Abrir Legacy y React por separado; comparar con el mismo viewport, zoom y fuentes cargadas.
- [x] Confirmar que la copia Legacy no cambió respecto a `preparacion.json`.
- [x] Conservar JavaScript/JSX y dependencias justificadas; no añadir TypeScript, router, administrador, pagos o backend.
- [x] Ejecutar `npm run build` y `npm run lint` desde `react-app`.
- [x] Revisar scripts: ejecutar tests y typecheck si existen en ese momento. Se añadieron cinco tests nativos; no existe typecheck.
- [x] Revisar consola, errores de ejecución, recursos faltantes y respuesta HTTP del servidor.

## Catálogo y navegación

- [x] Ver 18 productos, tres por categoría, con los precios exactos del Legacy.
- [x] Iniciar en Frozzis; cambiar las seis categorías y verificar `aria-pressed`.
- [x] Buscar dentro de la categoría activa sin distinguir mayúsculas ni acentos; mantener el texto al cambiar de categoría.
- [x] Mostrar el estado sin resultados; recuperarse al borrar la búsqueda.
- [x] Probar anclas de menú, historia, cómo pedir e inicio con cabecera sticky y títulos visibles.
- [x] Conservar historia, misión, visión, textos y WhatsApp `59175918018`.

## Producto y carrito

- [x] Seleccionar tamaños existentes, cantidad de 1 a 99 y sus límites.
- [x] Probar cada sabor de extra; aplicar Bs 5.00 por bebida, no por línea.
- [x] Té de perlas: bobas incluidas sin recargo, temperatura Frío/Caliente y extra independiente.
- [x] Repostería/Otros: tamaño unidad y ausencia de selector de bobas.
- [x] Dos Frozzis de mora G (Bs 15.00), con extra de bobas: total Bs 40.00.
- [x] Agregar un queque de chocolate (Bs 8.00) al caso anterior: total Bs 48.00 y contador de 3 unidades.
- [x] Agregar idéntica combinación: sumar en una línea. Otro tamaño/sabor/temperatura: otra línea.
- [x] Evitar sumar más de 99 unidades por combinación y mostrar aviso.
- [x] Aumentar/disminuir/quitar; restar desde una unidad elimina la línea.
- [x] Carrito vacío: botón al menú, formulario oculto y envío deshabilitado.
- [x] Nombre/notas opcionales, límites 80/500; conservarlos al cerrar/reabrir durante la sesión.
- [x] Recuperar carrito tras recargar. JSON corrupto, productos inexistentes y opciones inválidas no rompen la página.
- [x] Si localStorage no está disponible, seguir usando el carrito en memoria.

## WhatsApp y accesibilidad

- [x] Inspeccionar el enlace generado con un pedido de prueba, sin enviar un mensaje al negocio.
- [x] Verificar destino, caracteres acentuados, saltos de línea, cantidades, opciones, subtotales, total y notas.
- [x] Mostrar aviso y enlace alternativo; ocultarlos cuando cambian pedido/nombre/notas. No vaciar carrito al abrir WhatsApp.
- [x] Ambos diálogos: cerrar por botón, Escape y clic exterior; clic interior no cierra.
- [x] Navegación con teclado, foco visible, foco contenido en el diálogo, devolución de foco y bloqueo/restauración del scroll.
- [x] Aviso accesible, nombres de botones y estados seleccionados/deshabilitados correctos.
- [x] No duplicar listeners, temporizadores o efectos bajo StrictMode.

## Comparación visual

- [x] Capturas equivalentes a 360, 390, 768, 1024 y 1440 px de ancho; portada, catálogo, historia y ambos diálogos.
- [x] Revisar ambos lados de los breakpoints 360, 520, 760 y 1100 px; comprobar también 1500 px.
- [x] Conservar tipografía, colores, márgenes, orden de secciones, 3/2 columnas de tarjetas, menú desplazable y cabecera móvil.
- [x] Verificar imágenes WebP completas en tarjetas y detalle; portada reutilizada correctamente.
- [x] Carrito lateral en escritorio y de ancho completo en móvil. Se conserva un desbordamiento de 1 píxel ya presente en Legacy entre los anchos probados de 761–1100 px.
- [x] Respetar preferencia de movimiento reducido (comparaciones ejecutadas con esa preferencia).
- [ ] Zoom de texto manual: no verificado.

## Entrega

Registrar pantallas/secciones migradas, componentes creados/reutilizados, archivos modificados, funciones trasladadas, comandos y pruebas ejecutadas, diferencias conocidas y pendientes. La restricción localStorage por origen y la necesidad de confirmar el envío en WhatsApp deben explicarse correctamente.
