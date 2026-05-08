# Conexion con Supabase

Esta carpeta contiene los scripts para crear la base de datos del proyecto CDP Wheels en Supabase.

## 1. Crear proyecto

1. Entra en Supabase.
2. Crea un proyecto nuevo.
3. Espera a que termine la preparacion de la base de datos.

## 2. Crear tablas

En Supabase, abre `SQL Editor` y ejecuta los archivos en este orden:

1. `supabase_schema.sql`
2. `supabase_seed.sql`

El primer archivo crea las tablas y politicas de seguridad. El segundo mete productos de ejemplo.

## 3. Conectar la web

Abre:

`public/assets/js/supabase-config.js`

Pega:

- `Project URL`
- `anon public key`

Ejemplo:

```js
window.CDP_SUPABASE = {
  url: "https://tu-proyecto.supabase.co",
  anonKey: "tu-anon-public-key",
};
```

No pegues nunca la `service_role key` en el frontend.

## 4. Que partes usa Supabase

- `Catalogo.html`: carga productos desde la tabla `productos`.
- `producto.html`: carga la ficha del producto por `slug`.
- `contacto.html`: guarda solicitudes en la tabla `solicitudes`.

Si las claves estan vacias, la web sigue usando los datos locales para no romper el proyecto.
