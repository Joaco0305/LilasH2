# Confirmación de precios de los pedidos

## Ajuste aplicado

El carrito y el mensaje de WhatsApp muestran **Total estimado** y el aviso:

> El precio y la disponibilidad se confirman con la cafetería antes de aceptar el pedido.

Al abrir WhatsApp, el estado indica que la solicitud está lista para enviar y que debe esperarse la confirmación de la cafetería. El aviso está asociado al botón mediante `aria-describedby`. Se mantienen productos, tamaños, opciones, cantidades, precios unitarios y subtotales para facilitar la revisión.

El texto común se define en `react-app/src/config.js`. El envío actual se realiza por WhatsApp; no se añadió una aceptación automática ni se modificó la preparación existente de Supabase.

## Procedimiento del negocio

1. Tratar el mensaje recibido como una solicitud, no como un precio confirmado ni un pago.
2. Consultar el catálogo oficial del negocio, independiente del texto recibido. Verificar cada producto, tamaño, extra y cantidad, y comprobar disponibilidad.
3. Recalcular los subtotales y el total. Determinar por separado cualquier costo de envío.
4. Si existe una diferencia, comunicar el detalle y el importe correcto al cliente antes de aceptar el pedido. No utilizar el total recibido como fuente de verdad.
5. Confirmar el pedido únicamente después de esta revisión y de acordar las condiciones con el cliente.

## Verificación reproducible

- Preparar dos Frozzis de mora G con extra de bobas: precio unitario Bs 20.00, total estimado Bs 40.00.
- Comprobar que el aviso aparezca en el carrito y en el mensaje generado.
- En una prueba controlada, alterar el total del mensaje a Bs 1.00 y entregarlo a un receptor de pruebas. No contactar clientes ni realizar cobros.
- El receptor debe recalcular Bs 40.00 con el catálogo oficial, detectar la discrepancia y no aceptar Bs 1.00.

Las pruebas automatizadas comprueban el cálculo, el texto generado y el aviso en la interfaz. También comprueban que campos de precio o total añadidos a localStorage no sustituyan los importes del catálogo. La revisión humana de un mensaje modificado debe comprobarse por separado; no se presenta como una prueba automatizada ni como ya realizada.

## Límite de la mitigación

El aviso no impide editar un mensaje de WhatsApp ni manipular JavaScript en el navegador. La comprobación independiente del negocio es el control actual. Si se incorpora confirmación automática o cobro, el backend deberá validar productos, opciones y cantidades y calcular los importes con un catálogo confiable antes de aceptar una operación. La validación del cliente no sustituye esa protección.

El PDF de análisis previo describe la propuesta original; este documento registra el ajuste aplicado al proyecto.

## Comprobaciones realizadas el 16 de noviembre de 2026

- Compilación y lint correctos; ocho tests unitarios aprobados.
- `tests/spa.mjs`: pasó en desarrollo y contra el build servido localmente, incluyendo aviso, mensaje estimado, enlace alternativo, rutas e historial. La apertura de WhatsApp se interceptó; no se enviaron mensajes.
- `tests/confirmation.mjs`: comprobó el pedido de Bs 40.00 y la visibilidad del aviso y botón a 360, 390 y 1440 px. Capturas en `.docs/evidencias/confirmacion-pedido-*.png`.
- La prueba manual de recepción de un mensaje modificado por parte del negocio sigue pendiente; no se sustituyó por una simulación de aceptación.

Para repetir las pruebas de navegador, usar las variables `PLAYWRIGHT_MODULE`, `BROWSER_EXECUTABLE` y `APP_URL` descritas en el README y ejecutar `node tests/spa.mjs` y `node tests/confirmation.mjs` desde `react-app`, con el servidor de desarrollo activo.
