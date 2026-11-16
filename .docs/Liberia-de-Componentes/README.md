# Referencia propia de componentes para Lilas

**Procedencia:** propuesta preparada para este proyecto a partir del Legacy. El docente no proporcionó una librería ni componentes para reutilizar. **Estado:** implementada en `react-app/src/components/` el 5 de octubre de 2026. Los 13 componentes de la tabla siguen esta referencia. Consulta [el resultado de la migración](../RESULTADO-MIGRACION.md).

## Convenciones

- React con componentes funcionales en archivos `.jsx`; utilidades y datos en `.js`. JavaScript, sin TypeScript.
- Nombres de componentes y archivos en PascalCase; hooks con prefijo `use`; funciones/props en camelCase.
- Usar las convenciones de `react-app` y su Oxlint existente. No añadir ESLint, bibliotecas de UI, router o gestión global de estado sin necesidad demostrada.
- Una sola página y anclas nativas. Estado local y props son suficientes; no crear contexto global de forma preventiva.
- Reutilizar clases y tokens del Legacy. CSS tradicional, sin introducir Tailwind, CSS-in-JS ni una nueva librería visual.
- Reutilizar controles HTML nativos: botones, input de búsqueda, select, textarea, enlaces y dialog. No crear un componente genérico para cada etiqueta HTML.
- Renderizado declarativo y claves estables. No copiar `innerHTML`, `querySelector` o los listeners de inicialización del Legacy a React.
- Excepción justificada: `useRef` y un efecto para los métodos nativos del diálogo, foco y bloqueo de scroll. No controlar el contenido del diálogo imperativamente.
- Contenido estático y bloques pequeños relacionados permanecen juntos; extraer solo unidades que tienen una responsabilidad o reutilización claras.

## Catálogo propuesto y correspondencia

Las props de esta tabla son los contratos orientativos originales; los contratos definitivos están en los archivos JSX. Los callbacks se reciben como props; ningún componente visual debe escribir por su cuenta en localStorage ni reconstruir reglas de precios.

| Componente previsto | Referencia Legacy | Responsabilidad / contrato |
|---|---|---|
| `SiteHeader` | `.announcement`, `.header`, `#open-cart` | Aviso, marca, anclas y acceso sticky al carrito. Props: `cartCount`, `onOpenCart`. |
| `Hero` | `.hero`, `.flavor-strip` | Portada y franja decorativa, mismos textos y fotografía. |
| `MenuCatalog` | `#menu`, `#categories`, `#search`, `.boba-banner` | Categoría, búsqueda, conteo, resultado vacío y banner. Props: `products`, `categories`, `onSelectProduct`; filtros en estado local. |
| `ProductCard` | `.product-card` | Producto y precio mínimo. Props: `product`, `onSelect`. Reutilizado para los 18 productos. |
| `HowToOrder` | `#como-pedir` | Los tres pasos, sin lógica de negocio. |
| `OurStory` | `#historia` | Historia, misión y visión; mantenerlos en un bloque coherente. |
| `SiteFooter` | `footer` | Marca, enlace WhatsApp, año actual y aviso de imágenes. Recibir o importar el número de configuración común. |
| `Modal` | Los dos `dialog` | Base accesible compartida. Props: `isOpen`, `onClose`, `labelledBy`, `className`, `children`. Foco, Escape, clic exterior y bloqueo de scroll. Conservar las diferencias visuales del carrito y del producto mediante sus clases. |
| `ProductDialog` | `#product-dialog` | Configuración temporal de tamaño, opciones y cantidad; cálculo previo y agregar. Props: `product`, `isOpen`, `onClose`, `onAdd`. Reiniciar selección al abrir otro producto. |
| `QuantityControl` | `.quantity` | Botones y cantidad accesibles. Props: `value`, `min`, `max`, `onChange`, `label`. En producto, mínimo 1; en carrito, permitir solicitar 0 al padre para eliminar. |
| `CartDialog` | `#cart-dialog` | Listado, total, estado vacío, formulario opcional y apertura de WhatsApp. Props: `isOpen`, `items`, `onClose`, `onChangeQuantity`, `onRemove`, `onBrowseMenu`. Mantener nombre/notas al cerrar y reabrir durante la sesión. |
| `CartItem` | `.cart-item` | Detalle, subtotal, cantidad y quitar. Props: `item`, `product`, `onChangeQuantity`, `onRemove`. |
| `Toast` | `#toast` | Aviso accesible durante tres segundos. Props: `message`, `onDismiss`; limpiar el temporizador del efecto. |

`Modal` y `QuantityControl` se reutilizan en ambos diálogos. `ProductCard` y `CartItem` se reutilizan en sus listas. No crear implementaciones alternativas de estos mismos controles.

## Estado y responsabilidades previstos

`App` compone la página y coordina el producto seleccionado, el diálogo activo y el aviso. Un hook `useCart`, si simplifica el código, concentra carga validada, agregar, cambiar cantidades, eliminar y persistir el carrito. Los importes y conteos se derivan de los datos, no se guardan como estados paralelos.

Ubicaciones implementadas:

```text
react-app/src/
├── App.jsx
├── components/       componentes de la tabla
├── hooks/useCart.js  estado y persistencia, si aporta claridad
├── data/menu.js      catálogo, categorías, tamaños y bobas
├── config.js         número de WhatsApp y clave de almacenamiento
└── utils/            cálculos puros, validación y mensaje de WhatsApp
```

Evitar dividir cada función en un archivo independiente; bastan módulos pequeños por responsabilidad. Una única función de precio debe utilizarse en detalle, carrito y mensaje. Una única definición de la identidad de la combinación evita duplicaciones incorrectas. Mantener la forma de los datos del carrito Legacy y sus IDs.

Los WebP podrán copiarse a `react-app/public/images/`, manteniendo nombres. Usar rutas compatibles con la base de Vite (`import.meta.env.BASE_URL`) si se sirve desde un subdirectorio. No importar archivos de `.docs/Legacy` en la aplicación final ni cargar su `script.js` como parche.

## Tokens visuales existentes

| Token | Valor |
|---|---|
| `--cream` | `#fbf8f2` |
| `--paper` | `#fffdfa` |
| `--plum` | `#70435f` |
| `--deep` | `#432d3b` |
| `--lilac` | `#e9ddea` |
| `--muted` | `#746973` |
| `--line` | `#e8e0e3` |
| `--green` | `#285d46` |
| `--serif` | `'Playfair Display', Georgia, serif` |
| `--sans` | `'DM Sans', Arial, sans-serif` |

Preservar medidas, radios, sombras, clases, breakpoints y orden efectivo de las reglas de `Legacy/styles.css`. Sustituir los estilos del starter que centran o decoran la demo de Vite; no dejarlos competir con Lilas. No rediseñar el sitio al componentizarlo.

## Criterio de implementación

Cada componente implementado deberá reproducir sus estados reales (seleccionado, vacío, deshabilitado, abierto/cerrado y foco, según corresponda) y verificarse con [la lista de validación](../VALIDACION.md). Esta referencia no certifica que esos componentes ya existan ni que sus pruebas hayan pasado.
