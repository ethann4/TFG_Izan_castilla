# CDP Customs

Proyecto final DAW para una web de personalizacion y venta de volantes de coche.

## Estado actual

- Frontend estatico sobre la plantilla Bootstrap original, ya adaptada a CDP Customs.
- Paginas principales en `public/`: inicio, catalogo, ficha de producto, configurador visual, contacto y base de admin.
- Catalogo con filtros por marca, modelo, material, color y precio mediante JavaScript.
- Configurador visual funcional con cambios de material, color, costuras, marcador, levas y extras.
- Estructura preparada para evolucionar a PHP/MySQL con CRUD de productos y pedidos personalizados.

## Paginas

- `public/index.html`: portada, navegacion, seccion de empresa, productos destacados y marcas.
- `public/Catalogo.html`: catalogo filtrable y preparado para catalogo dinamico.
- `public/producto.html`: ficha de producto reutilizable mediante parametros `?id=`.
- `public/Creacionvirtual.html`: base de configurador visual.
- `public/contacto.html`: formulario preparado para backend.
- `public/admin/index.html`: maqueta del futuro panel CRUD.

## Backend previsto

Tablas minimas recomendadas:

- `productos`: nombre, marca, modelo, material, color, precio, imagen, estado.
- `marcas_modelos`: marcas y modelos compatibles.
- `pedidos_personalizados`: datos del cliente, configuracion, presupuesto y estado.

Seguridad prevista:

- Validacion en cliente y servidor.
- Consultas preparadas con PDO.
- Hash de contrasenas con `password_hash`.
- Sesiones seguras para el panel admin.
- Control de permisos para operaciones CRUD.

## Entrega DAW

Pendiente para completar la rubrica al 100%:

- Implementar backend PHP/MySQL real.
- Crear CRUD completo con sesiones.
- Documentar instalacion, arquitectura, pruebas y manual de usuario.
- Subir a GitHub publico con README final y minimo 15 commits significativos.
