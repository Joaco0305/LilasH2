# Análisis de modelo e integración

## Fuente y alcance

Fuente autorizada: `.docs/ER-CRUD/Lilas_entidad_y_matriz_CRUD.pdf`, página 1. Texto y captura en [FUENTE-MODELO.md](FUENTE-MODELO.md). `Foro3.pdf` es una evidencia de seguridad y no define el modelo; se conserva intacto.

La entidad es **Pedido en preparación**, con artículos, nombre, notas y total calculado. El PDF es un modelo lógico, no un esquema SQL. Las siguientes son decisiones técnicas para materializarlo, no nuevas funciones comerciales: un carrito por visitante, artículos normalizados y catálogo de precios en servidor. No se añade administrador, cobro ni historial de pedidos confirmados.

## Entidades y campos PostgreSQL

Todos los campos son NOT NULL salvo indicación. Claves técnicas y propietario son necesarios para persistencia y RLS; no estaban definidos como campos de negocio en el PDF.

| Tabla | Campo / tipo | Claves, valores y restricciones |
|---|---|---|
| products | id text, name text, category text, can_boba boolean | PK id; catálogo existente de Lilas; solo lectura para clientes |
| product_prices | product_id text, size text, price numeric(10,2) | PK (product_id,size), FK products; precio > 0; tamaño P/M/G/EG/U |
| orders | id uuid, owner_id uuid | PK id, default gen_random_uuid(); FK auth.users, default auth.uid(); UNIQUE owner_id |
| orders | name text, notes text | default ''; máximo 80/500 caracteres; vacío significa eliminar dato opcional |
| orders | created_at timestamptz | default now(); dato técnico de creación |
| order_items | id uuid, order_id uuid | PK id, default gen_random_uuid(); FK orders ON DELETE CASCADE |
| order_items | product_id text, size text | FK compuesta product_prices; reemplaza id del producto y size del PDF |
| order_items | quantity integer | 1..99, sin valores fraccionarios |
| order_items | extra, included, temperature, base: text | default ''; validación según producto y sabores permitidos; base siempre vacía para catálogo actual |
| order_items | created_at timestamptz | default now(); orden de presentación |
| Consulta de carrito | unitPrice, subtotal y total numeric | Calculados en SQL con precios del servidor y extra de Bs 5; no editables por el visitante |

Relaciones: auth.users 1:0..1 orders; orders 1:0..N order_items; products 1:N product_prices; product_prices 1:N order_items. Borrar un usuario elimina su carrito y artículos en cascada. No se ofrece borrar usuarios desde la interfaz. Borrar catálogo con artículos referenciados queda restringido. Índices de PK, UNIQUE owner_id, FK order_id e identidad de combinación. UNIQUE sobre order_id + producto + tamaño + opciones impide duplicados.

## Correspondencia CRUD y verificación

| PDF p. 1 | Operación | Flujo / archivo | Prueba prevista |
|---|---|---|---|
| items / producto y opciones | C | ProductDialog → useCart → servicio remoto; RPC suma combinación atómicamente | Agregar, consultar y recargar |
| items | R | Abrir app/carrito; consulta autenticada | Misma sesión recupera datos; otra no los ve |
| quantity | U | Controles + / - → actualización por ID real | Volver a consultar; 100, 0 inválido directo, fracción rechazados |
| producto/opciones | U | Quitar y agregar otra combinación, como indica el PDF | Confirmar que nueva combinación sustituye la deseada |
| items | D | Quitar o disminuir de 1 a 0 | DELETE con fila devuelta; lectura confirma ausencia |
| name / notes | C/R/U/D | Campos con guardado remoto explícito; vaciar y guardar borra el contenido | Guardar, recargar, editar, vaciar, volver a consultar |
| total | R / recálculo automático | SQL deriva importes, servicio los muestra y construye mensaje | Intento de precio impuesto no altera cálculo |

El PDF decía que nombre/notas eran volátiles. La solicitud actual exige persistencia remota de los flujos: se guardarán explícitamente en el carrito remoto y se recuperarán después de recargar. Se informa al usuario en el formulario. No se guarda una nota antes de pulsar guardar o preparar WhatsApp.

## Identidad y permisos

El visitante tendrá sesión anónima de Supabase Auth, sin correo, contraseña ni registro manual. Esto permite distinguir propietarios con auth.uid(); una clave pública por sí sola no identifica al dueño. Un usuario anónimo de Auth usa el rol authenticated, no el rol Postgres anon. Limpiar el almacenamiento de la sesión pierde acceso al carrito anterior; no se promete recuperación entre dispositivos.

- Catálogo: lectura pública; escritura solo por migraciones de confianza.
- orders: C/R/U/D solo si owner_id = auth.uid(). UPDATE no permite reasignar propiedad.
- order_items: C/R/U/D solo si su order_id pertenece al usuario actual, con USING y WITH CHECK.
- RPC: SECURITY INVOKER, ejecutables solo por authenticated; sin bypass de RLS. La suma concurrente es atómica y respeta máximo 99.
- Funciones de validación: validan opciones y cantidades del lado servidor. Los importes enviados por el cliente no son aceptados como precio autoritativo.

Se mantienen el aviso de total estimado y la confirmación comercial por WhatsApp: el texto del mensaje sigue siendo editable fuera de la aplicación.

## Remoto y decisiones de operación

Se comprobó login. La cuenta devolvió cero organizaciones y cero proyectos. Se creó organización Lilas `lfzcyjryjnaxdrlpshrn` y proyecto Lilas `zasciyldjbqjlidznvsc`, región `sa-east-1`, sin opciones de cómputo pagado. La CLI confirmó ACTIVE_HEALTHY. No ejecutar otra creación al retomar.

CLI 2.122.0; utilizar `npx supabase` desde react-app y `--workdir ..` para configuración/migraciones de raíz. No Docker. `.env.supabase-password.dpapi` es local, cifrado y excluido de Git. No publicar su contenido ni claves privadas.

Verificado el 16 de noviembre de 2026: proyecto vinculado, migración `20261116000100` aplicada, 18 productos y 51 precios; cuatro tablas con RLS activo y tres funciones SECURITY INVOKER. `config push` habilitó únicamente `auth.enable_anonymous_sign_ins`. API de organización confirmó `plan: free`. No se contrataron servicios ni se duplicaron recursos.

## Implementación y resultados

- `src/services/cart.js`: sesión anónima deduplicada, consultas y mutaciones RPC; errores sin detalles SQL ni credenciales.
- `src/hooks/useCart.js`: estado remoto confirmado, carga, error y reintento; bloqueo durante operaciones. `change_cart` devuelve la instantánea calculada dentro de la misma transacción; una actualización/borrado sin fila falla explícitamente.
- `src/hooks/useCatalog.js`: lectura pública de catálogo y precios; conserva assets y descripciones locales. Productos nuevos requieren sus metadatos visuales locales; no hay alta administrativa en el alcance del PDF.
- `CartDialog`: guardado de nombre/notas con formulario sin recarga; vaciar y guardar elimina contenido. WhatsApp se prepara solo después de guardar y obtener importes remotos. La ventana se abre desde el clic; si se bloquea, aparece enlace alternativo.
- El precio mostrado por tarjetas procede de Supabase. El precio del mensaje procede de la respuesta SQL del guardado, aunque cambie el catálogo durante la visita.
- El nombre de producto y las descripciones visuales se mantienen en el catálogo local de referencia para el mensaje; los cambios administrativos al catálogo deben sincronizar sus metadatos de interfaz. No se ofrece edición de catálogo desde el cliente.

Pruebas ejecutadas: ocho unitarias aprobadas; lint limpio y build correcto; `tests/supabase.mjs` con dos usuarios anónimos reales, CRUD completo del modelo, restricciones, importes falsos, acceso cruzado denegado, combinación concurrente y límite 99. `tests/remote-ui.mjs` validó guardar/editar/borrar, persistencia tras recarga y nueva pestaña, visitante separado, error de transporte sin falso éxito y reintento. `tests/spa.mjs` aprobó desarrollo y build servido con reglas Netlify locales, rutas directas, historial, 404 y recursos. `tests/confirmation.mjs`: 360, 390 y 1440 px. Capturas móvil/escritorio inspeccionadas visualmente. No se enviaron mensajes reales.

## Diferencias y límites explícitos

- Los carritos antiguos de localStorage no se borran ni importan automáticamente: el usuario debe volver a agregar esos artículos. La persistencia remota comienza con su sesión Supabase.
- Nombre/notas ahora son persistentes tras guardar, a diferencia del Legacy; no se recopilan correos ni contraseñas.
- Eliminar todos los artículos deja un pedido vacío; el DELETE de pedido completo también está protegido y probado en API, pero no requiere botón separado según el flujo del PDF.
- No se añadió historial de compras confirmadas, administración ni pago. El carrito remoto no acredita recepción o aceptación por la cafetería.
- La protección RLS no reemplaza medidas antiabuso de Auth anónimo. Para publicación abierta evaluar CAPTCHA y limpieza de usuarios abandonados; no se activaron servicios de pago.
- No se actualizó Netlify. Configurar las dos variables públicas durante su build y desplegar el commit actualizado. La sesión de localhost es distinta de la de Netlify.
- No existe typecheck (proyecto JavaScript). `tests/browser.mjs` documenta la comparación Legacy anterior y asume carrito local; no se presenta como prueba vigente de Supabase.

La contraseña inicial apareció en una salida de npm al crear el remoto. Se invalidó y rotó por el endpoint oficial de administración; el reemplazo no se imprime ni se versiona. Datos ficticios de pruebas eliminados por UUID registrado, sin borrar registros ajenos.

Referencias: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Auth anónimo](https://supabase.com/docs/guides/auth/auth-anonymous), [CLI](https://supabase.com/docs/reference/cli/introduction).
