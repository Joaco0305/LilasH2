# Inventario del Legacy de Lilas

Fuente de verdad: los archivos en `Legacy/`. Este documento describe su código; no constituye una nueva prueba visual ni una certificación de equivalencia con React.

## Página y secciones

Una página, sin rutas adicionales: aviso superior, cabecera y navegación por anclas, presentación, franja decorativa, catálogo, banner de bobas, instrucciones para pedir, historia de Claudia/Romanet/Carlos, misión, visión y pie de página. Anclas: `#menu`, `#historia`, `#como-pedir` y `#` para inicio. La cabecera permanece visible con `position: sticky`.

Hay dos diálogos nativos: configuración de producto y carrito lateral. También hay un aviso temporal accesible (`role="status"`), estados vacíos, un enlace alternativo de WhatsApp y un mensaje `noscript`. No hay panel de administración.

## Catálogo y recursos

- 18 productos: tres por categoría. Categorías: Frozzis, Calientitas, Con bobas, Tés & cafés fríos, Repostería y Otros.
- Categoría inicial: `frozen`. La búsqueda filtra solo la categoría seleccionada; compara nombre, grupo y descripción ignorando mayúsculas y acentos. El texto de búsqueda se mantiene al cambiar de categoría.
- Cada tarjeta muestra fotografía, grupo, nombre, descripción, precio mínimo y acción «Elegir». Mostrar «DESDE» cuando existen varios tamaños.
- Conservar los identificadores no consecutivos del catálogo (`p1`, `p2`, `p3`, `p16`, etc.), porque se usan para recuperar el carrito.
- Precios en bolivianos con dos decimales. La lista completa y autoritativa de precios está en `Legacy/script.js`; no transcribirla manualmente en varios lugares.
- 18 imágenes locales `.webp`. La portada reutiliza `images/ice-latte.webp`. Fotos ilustrativas, iconos SVG inline y marca tipográfica; no hay fotografías personales de los fundadores.
- Fuentes de Google Fonts: DM Sans y Playfair Display. Tienen fallback Arial y Georgia. Las fuentes requieren conexión, mientras que los WebP son locales.

## Configuración del producto

- Estado inicial: primer tamaño disponible, una unidad, sin extra de bobas.
- Tamaños: P, M, G, EG según el producto; U para unidad. No mostrar tamaños sin precio.
- Cantidad de 1 a 99. Deshabilitar el decremento en 1 y el incremento en 99 en el diálogo de producto.
- Extra de bobas: Bs 5.00 por bebida, con Tapioca, Frutilla, Maracuyá, Cherry, Manzana o Mora; también se puede elegir «Sin extra».
- En los tés de perlas, las bobas incluidas no cuestan adicional y comienzan en Tapioca; la temperatura comienza en Frío y puede cambiarse a Caliente. Se puede añadir además una porción extra de bobas.
- Repostería y Otros no permiten extras de bobas.
- El código conserva soporte para smoothies con leche/agua, pero el menú actual no tiene smoothies. No reintroducirlos durante la migración. Conservar el campo `base` en las combinaciones almacenadas para compatibilidad.
- Agregar cierra el diálogo y muestra el aviso durante tres segundos. Si la suma de una combinación idéntica supera 99, avisar y no agregar.

## Carrito, formulario y persistencia

- Dos líneas se consideran iguales si coinciden `id`, `size`, `extra`, `included`, `base` y `temperature`. Sumar cantidades únicamente para esa combinación.
- Mostrar nombre, tamaño, opciones, cantidades y subtotales. Permitir aumentar, disminuir y quitar. Disminuir una línea de una unidad la elimina.
- Total: suma de `(precio del tamaño + extra de bobas) × cantidad`. El indicador de la cabecera suma unidades, no líneas distintas.
- Carrito vacío: mensaje y botón para volver al menú; ocultar formulario y deshabilitar envío.
- Nombre opcional, máximo 80 caracteres. Notas opcionales, máximo 500. Quitar espacios exteriores al construir el mensaje. No exigir teléfono, dirección o nombre si antes eran opcionales.
- Clave de localStorage: `lilas-cart-v1`. Validar estructura, producto, tamaño, cantidad entera y opciones permitidas al recuperar datos; filtrar entradas inválidas y cargar como máximo 100 líneas. Un JSON corrupto se trata como carrito vacío.
- Si el almacenamiento falla, el carrito sigue funcionando en memoria. El Legacy guarda solo el carrito; nombre y notas no se persisten.
- Al cambiar el pedido, nombre o notas, ocultar la confirmación anterior y el enlace alternativo para no mostrar un mensaje obsoleto. Reabrir el carrito también reinicia esos avisos.
- El almacenamiento depende del origen del navegador: abrir la copia como archivo y abrir React en localhost no garantiza compartir el mismo carrito. Probar compatibilidad con datos de prueba en el origen de React.

## WhatsApp

Destino: `59175918018`. Construir un enlace `https://wa.me/…?text=…` con `encodeURIComponent`. El mensaje contiene nombre si existe, todos los productos, tamaños, opciones, cantidades, precios unitarios, subtotales, total y notas, más la consulta de entrega/recojo. El total no incluye envío.

Abrir una pestaña con `noopener,noreferrer` en respuesta al clic. Mantener enlace alternativo y aviso de que falta confirmar el envío en WhatsApp. Abrir WhatsApp no demuestra que se envió un mensaje ni que se confirmó una compra. No vaciar automáticamente el carrito, registrar ventas ni enviar mensajes durante las pruebas.

## Diálogos y accesibilidad

Mantener `showModal()`/`close()` mediante una referencia React cuando se implementen. Preservar Escape, botón de cierre, clic fuera del rectángulo, foco contenido en el diálogo y devolución de foco. Bloquear scroll del cuerpo mientras exista un diálogo abierto. Los efectos deben limpiar listeners/clases al desmontar y tolerar StrictMode.

Mantener etiquetas, `aria-pressed` en categorías/tamaños, nombres accesibles de acciones, actualizaciones de estado y foco visible. Conservar navegación con teclado y comportamiento tras quitar una línea del carrito. Evitar HTML insertado manualmente para datos del usuario.

## Responsive y estilos

Leer todo `Legacy/styles.css` **en orden**: hay reglas posteriores que sustituyen declaraciones iniciales.

| Regla | Comportamiento destacado |
|---|---|
| Base desktop | Presentación en dos columnas, productos en tres columnas, carrito lateral de hasta 465 px. |
| `min-width: 1500px` | Ajustes de márgenes y altura de la fotografía de portada. |
| `max-width: 1100px` | Menores márgenes, barra del menú apilada, cambios en historia y espaciados. |
| `max-width: 760px` | Productos en dos columnas, categorías desplazables horizontalmente, historia en una columna y navegación en segunda fila de la cabecera. |
| `max-width: 520px` | Portada en una columna, tarjetas compactas, pasos apilados y carrito de ancho completo. |
| `max-width: 360px` | Ajustes de separación y tipografía de la navegación. |
| Movimiento reducido | Desactivar transiciones/animaciones y desplazamiento suave según preferencia. |

La regla final `.product-visual { height: auto; aspect-ratio: 3 / 2 }` prevalece sobre alturas anteriores. Fotografías del menú y del detalle usan `object-fit: contain`. La cabecera móvil vuelve a mostrar la navegación mediante las reglas finales, aunque antes exista `display: none`. Respetar los offsets de anclas: 130 px y 150 px en móvil.
