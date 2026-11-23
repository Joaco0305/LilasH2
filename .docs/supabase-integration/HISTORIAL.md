# Historial de solicitudes

Cambio aplicado el 23 de noviembre de 2026. Antes, `orders` y `order_items` solo representaban un carrito mutable. Quitar artículos eliminaba sus filas, y abrir WhatsApp no conservaba una solicitud independiente.

## Modelo y flujo

- `orders` / `order_items`: conservan el carrito editable existente; no se borraron carritos durante la migración.
- `order_history`: una fila por solicitud preparada, propietario, identificador, fecha, nombre, notas, estado `prepared` y total calculado.
- `order_history_items`: copia de producto, nombre, tamaño, opciones, cantidad y precio unitario de ese momento. No depende de relaciones al catálogo que puedan eliminar las líneas históricas.
- `prepare_order`: guarda el historial y sus artículos y vacía el carrito en una sola transacción. Si algo falla, todo se revierte. Un UUID por intento evita duplicados al reintentar una respuesta perdida; llamadas simultáneas con la misma clave devuelven la misma solicitud.
- El cliente conserva solo el identificador de reintento en almacenamiento local. Al actualizar el carrito comprueba si la solicitud pendiente ya existe para recuperar la operación.
- El botón de WhatsApp espera el guardado remoto y usa la copia histórica. El visitante puede empezar otro pedido inmediatamente. El historial permite abrir otra vez el mensaje sin crear otra solicitud.

## Permisos

RLS limita la lectura del historial a su propietario. `anon` no tiene acceso. `authenticated` solo tiene SELECT, no INSERT/UPDATE/DELETE sobre las dos tablas nuevas. La única entrada de escritura del cliente es `prepare_order`, SECURITY DEFINER con search_path vacío, identidad obtenida de `auth.uid()` y precios del servidor. No recibe propietario ni importes del cliente. Esta excepción es necesaria para insertar registros inmutables sin conceder escritura directa a los visitantes.

La eliminación administrativa de una cuenta Auth elimina sus registros en cascada, igual que el modelo previo; no hay botón de eliminar cuenta ni historial en la aplicación. La limpieza automática de usuarios anónimos en producción debe considerar esta retención.

## Interfaz

“Mis solicitudes anteriores” está dentro del carrito. Muestra las últimas 50 de la sesión actual, con fecha, estado, importe y detalles desplegables. No hay administrador ni historial compartido entre dispositivos. Si se pierde la sesión anónima, esos registros permanecen en la base pero el visitante ya no tiene acceso a ellos.

`prepared` significa **solicitud preparada**, no enviada, pagada ni aceptada. Abrir WhatsApp no permite comprobar si el usuario envió el mensaje. No se reconstruyeron compras antiguas ni se convirtieron carritos existentes en compras ficticias.

## Validación

- `tests/history.mjs`: dos solicitudes distintas, carrito vacío tras preparación, historial conservado tras editar/eliminar el siguiente carrito, dos preparaciones concurrentes con la misma clave sin duplicado, reintento después de borrar el carrito, carrito vacío rechazado, lectura cruzada denegada, escritura directa denegada y acceso anon rechazado. Usa clave pública y dos usuarios ficticios.
- `tests/history-ui.mjs`: dos solicitudes desde el navegador, recarga, detalles, enlace WhatsApp histórico y diseño móvil sin errores de runtime.
- Pruebas previas de formulario, confirmación y SPA adaptadas al nuevo vaciado del carrito tras preparar la solicitud.
- Nueva migración: `20261123000100_order_history.sql`; no se modificó la migración anterior.

Los escenarios anteriores se ejecutan contra Supabase real. La apertura de WhatsApp se intercepta para no enviar mensajes. Los usuarios ficticios se registran para su limpieza, incluyendo sus solicitudes históricas.

Resultado de esta ejecución: lint y build aprobados; 8 unitarias aprobadas; history, history-ui, remote-ui, confirmation (360/390/1440) y SPA (desarrollo/build) aprobados. Se eliminaron los 10 usuarios ficticios creados por estas pruebas y sus registros asociados. Captura revisada: [historial móvil](../evidencias/historial-390.png). La aplicación previa de Netlify seguirá sin crear historial hasta desplegar el código actualizado.
