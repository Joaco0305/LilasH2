# Lilas · Cafetería

SPA con React, JavaScript/JSX y Vite. Incluye catálogo de 18 productos, personalización de bebidas, carrito persistente en Supabase y preparación de pedidos por WhatsApp.

## Ejecutar

Requisitos: Node.js 24 y npm.

```sh
cd react-app
npm install
```

Copiar `react-app/.env.example` a `react-app/.env.local` y completar la URL y clave pública de Supabase. Los valores se configuran localmente; no usar claves privadas ni subir `.env.local` al repositorio.

```sh
npm run dev
```

Abrir la dirección indicada por Vite. Rutas: `/`, `/menu`, `/historia` y `/como-pedir`. El formulario del carrito guarda nombre/notas; WhatsApp requiere que el cliente confirme el envío del mensaje.

## Comprobar

```sh
npm run lint
npm test
npm run build
```

El proyecto usa Supabase Auth anónimo y políticas RLS para separar los carritos por visitante. Las cantidades y opciones se validan y los importes se calculan en el servidor. No hay administrador ni pagos.

Consulta [las instrucciones completas](react-app/README.md), [el análisis del modelo](.docs/supabase-integration/ANALISIS.md) y [el checklist de pruebas](.docs/supabase-integration/CHECKLIST.md). El esquema y las políticas están en `supabase/migrations/`.

## Publicación

`netlify.toml` configura base `react-app`, compilación `npm run build` y publicación `dist`. En Netlify deben configurarse `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` antes de compilar. Las rutas de la SPA se preparan durante el build.
