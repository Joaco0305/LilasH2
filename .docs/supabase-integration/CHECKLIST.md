# Checklist de integración con Supabase

Actualización del 23 de noviembre: historial independiente implementado y probado. Ver [HISTORIAL.md](HISTORIAL.md). Las menciones siguientes al alcance sin historial describen la entrega anterior.

Estado: integración remota, esquema, CRUD, RLS y navegador verificados. Pendiente externo: publicar la versión actualizada en Netlify con sus variables públicas.

- [x] Revisar proyecto y validar PDF. Fuente autorizada: `.docs/ER-CRUD/Lilas_entidad_y_matriz_CRUD.pdf`, página 1; extracción y captura en FUENTE-MODELO.md. Original movido sin alterar.
- [x] Documentar modelo y correspondencia. ANALISIS.md: pedido, artículos, catálogo técnico, roles y reglas.
- [x] Crear e identificar proyecto remoto y enlazar CLI. Lilas `zasciyldjbqjlidznvsc`, organización `lfzcyjryjnaxdrlpshrn`, sa-east-1. CLI 2.122.0; project-ref local y migration list coinciden. No recrear.
- [x] Crear, aplicar y verificar migraciones y permisos. `db push --dry-run --linked`, `db push --linked --include-seed`, `migration list --linked`. Migración 20261116000100 aplicada y semilla explícita. Prueba con dos sesiones públicas verifica RLS y restricciones.
- [x] Configurar SDK y entorno. Cliente centralizado; `.env.local` solo URL/clave pública; archivos privados excluidos de Git. Auth anónimo habilitado con `config push`; única propiedad modificada.
- [x] Integrar y comprobar CRUD mediante API real. `node tests/supabase.mjs`: aprobado; datos ficticios, consulta posterior, cantidades, precios autoritativos, opciones, concurrencia, metadatos, borrado y cascada.
- [x] Verificar persistencia y funcionamiento desde interfaz. `tests/remote-ui.mjs`: recarga/nueva pestaña, guardar/editar/vaciar campos, cantidad, quitar, sesión separada, error de red y reintento aprobados. `tests/spa.mjs`: desarrollo y build local aprobados. `tests/confirmation.mjs`: 360/390/1440 px aprobados, capturas revisadas.
- [x] Documentar ejecución final y pendientes. README actualizado con variables, CLI, semilla explícita, pruebas y limpieza; ANALISIS.md distingue alcance y limitaciones.
- [x] Confirmar plan gratuito. GET de organización devuelve `plan: free`.
- [x] Verificar metadatos remotos. 4 tablas RLS activo; 3 funciones sin SECURITY DEFINER; 18 productos, 51 precios. Políticas públicas solo SELECT catálogo; pedidos/artículos por propietario.
- [x] Lint, ocho pruebas unitarias y compilación aprobados.
- [ ] Typecheck: no aplica; JavaScript/JSX sin script de tipos.
- [ ] Publicación Netlify: fuera de esta ejecución; configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en build y desplegar versión actualizada. No usar claves privadas.

## Matriz de comprobación

| Entidad/campo | Crear | Leer | Actualizar | Eliminar |
|---|---|---|---|---|
| Pedido | [x] RPC crea por propietario | [x] get_cart | [x] nombre/notas | [x] propietario y cascada por API |
| Artículos | [x] agregar y fusionar | [x] consulta con precio SQL | [x] cantidad; opciones mediante quitar/agregar | [x] quitar; no simular éxito con cero filas |
| Nombre/notas | [x] guardar ficticios | [x] consultar | [x] editar; límites 80/500 | [x] vaciar y guardar |
| Total | [ ] No aplica: calculado | [x] SQL y precio falso ignorado | [ ] No aplica: no editable | [ ] No aplica: no se almacena |
| Catálogo | [x] semilla de confianza | [x] lectura pública 18 productos | [ ] No solicitado: solo semilla/migración | [ ] No solicitado: sin interfaz administrativa |

## Seguridad y errores resueltos

- CLI inicialmente sin sesión; usuario completó login local.
- npm mostró la contraseña inicial generada al registrar un comando de creación. Se invalidó mediante la API oficial de cambio de contraseña. No se incorpora ese valor a código/documentación. Copia local actual cifrada con DPAPI y excluida de Git.
- ALTER ROLE desde API SQL fue rechazado por permisos; se usó el endpoint oficial de administración para rotar con éxito.
- Primera aplicación de patch local rechazó operaciones duplicadas sobre un archivo; se corrigió antes de continuar.
- Lint advirtió una actualización síncrona en efecto; se separó la carga asíncrona inicial. Lint posterior limpio.
- Autorización automática temporalmente no disponible por cuota; se reanudó tras instrucción del usuario y aprobación correcta.

## Siguiente acción

Para continuar con publicación, seguir README: configurar variables públicas de build y desplegar React. La integración local usa el remoto real. No recrear organización/proyecto. Para futuros cambios SQL, añadir una migración nueva; nunca editar una aplicada.

## Evidencia de ejecución

- `npx supabase migration list --linked --workdir ..`: versión local/remota 20261116000100.
- `node tests/supabase.mjs`: PASS CRUD real, restricciones, acceso cruzado, fusión atómica y cascada.
- `node tests/remote-ui.mjs`: PASS CRUD navegador, persistencia, sesión separada, fallo de conexión y recuperación.
- `node tests/spa.mjs`: PASS development, production-rules-local y 404 de assets/API.
- `node tests/confirmation.mjs`: PASS en 360, 390 y 1440 px; apertura WhatsApp interceptada sin envío.
- `npm run lint`, `npm test`, `npm run build`: aprobados. No warnings de lint tras corregir efecto inicial.
- Desarrollo activo durante comprobación: `http://127.0.0.1:5174/`; 5173 estaba ocupado por servidor anterior.
- Limpieza por UUID: nueve usuarios ficticios de API/UI eliminados con cascada; la repetición final de capturas creó tres adicionales, eliminados por el script de limpieza. Ningún usuario ajeno a las pruebas incluido.
- Capturas: [móvil](../evidencias/confirmacion-pedido-390.png), [escritorio](../evidencias/confirmacion-pedido-1440.png); [resultado SPA](../evidencias/spa-results.json).
