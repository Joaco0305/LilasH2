# Supabase · Lilas

La integración remota está implementada y verificada. Este archivo sustituye las notas iniciales de preparación que indicaban que faltaba iniciar sesión.

- Proyecto: Lilas (`zasciyldjbqjlidznvsc`), región `sa-east-1`, plan gratuito verificado.
- CLI local en `react-app`; usar `npx supabase` y `--workdir ..` para trabajar con la configuración de raíz.
- Migración aplicada: `20261116000100_cart.sql`; catálogo inicial cargado explícitamente.
- Auth anónimo y RLS activos. Cada visitante accede solo a su carrito.
- No hace falta Docker para esta integración remota.

Consulta [README de la aplicación](react-app/README.md) para instalación, variables públicas, migraciones, semillas, pruebas y despliegue. [ANALISIS](.docs/supabase-integration/ANALISIS.md) y [CHECKLIST](.docs/supabase-integration/CHECKLIST.md) registran el modelo, las verificaciones y los límites.

No recrear el proyecto al retomar. No subir archivos `.env`, tokens de CLI, contraseñas ni claves privadas al repositorio.
