# Documentación de Lilas

La migración a React fue autorizada e implementada el 5 de octubre de 2026. El resultado y las comprobaciones se encuentran en [RESULTADO-MIGRACION.md](RESULTADO-MIGRACION.md).

Las rutas del enunciado se interpretan desde la carpeta **Lilas**:

- `Legacy/`: referencia HTML, CSS, JS y 18 WebP, conservada intacta.
- `Liberia-de-Componentes/`: referencia propia creada a partir de Lilas, implementada en `../react-app/src/components/`. El docente no proporcionó una biblioteca externa. Se conserva la escritura del nombre indicada en el enunciado.
- `INVENTARIO-LEGACY.md`: inventario funcional de la fuente.
- `VALIDACION.md`: lista de comprobaciones y estado de verificación.
- `preparacion.json`: manifiesto histórico previo a la migración; sus hashes permiten verificar Legacy y los originales. Los hashes de la plantilla React describen la versión anterior, no la implementación migrada.
- `evidencias/`: capturas del original y React, y resultados del navegador.
- `../react-app/`: aplicación React/JSX/Vite funcional.

La página original de la raíz y `.docs/Legacy` permanecen intactas. Esta tarea no incluye publicación en GitHub o Netlify, base de datos ni administración.

Desde Lilas:

```powershell
cd react-app
npm run dev
```

Si una terminal antigua no reconoce npm, reabrirla para cargar el PATH actualizado. Alternativa puntual: `& "$env:LOCALAPPDATA\Programs\npm-tools\npm.cmd" run dev` desde `react-app`.

La etapa posterior de navegación SPA está documentada en [RESULTADO-SPA.md](RESULTADO-SPA.md): rutas propias, historial, 404 y configuración de alojamiento. Los informes de migración anteriores describen su estado histórico.
