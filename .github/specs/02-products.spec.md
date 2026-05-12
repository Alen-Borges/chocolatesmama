# Spec: Product Management (Simple Products)
**Status**: APPROVED

## Context
Gestión del catálogo de productos base (chocolates individuales). Estos son los ladrillos fundamentales para las cajas y pedidos.

## Modelo de Datos (SQLite)
Tabla: `productos`
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `nombre` (TEXT, NOT NULL)
- `tipo_chocolate` (TEXT, NOT NULL)
- `forma` (TEXT, NOT NULL)
- `relleno` (TEXT)
- `peso_g` (REAL)
- `tamanio` (TEXT)
- `precio` (REAL, NOT NULL)
- `ingredientes` (TEXT)
- `porcentaje_chocolate` (REAL)
- `extra` (TEXT)

## Acciones (JS)
**En `www/js/db.js`**:
- `obtenerProductos()`: Retorna todos los productos simples.
- `obtenerProductoPorId(id)`: Retorna un producto específico.
- `crearProducto(datos)`: Inserta un nuevo producto.
- `actualizarProducto(id, datos)`: Modifica un producto existente.
- `eliminarProducto(id)`: Elimina un producto.
- `esProductoEliminable(id)`: Verifica si el producto no está asociado a `caja_productos` ni a `pedido_items` (con tipo_item = 'producto' en pedidos 'pendientes'). ¡Cuidado! Un pedido entregado NO debe bloquear la eliminación (los históricos quedan, pero el JOIN es con pedidos pendientes). Requisito 3.1: "Eliminar solo permitido si el producto no está en pedidos pendientes ni en cajas activas".

## UI/UX
- **Lista**: Mostrar productos. Clic para ver detalle.
- **Detalle**: Ver todos los atributos, editar o eliminar.
- **Búsqueda**: Filtro rápido en la lista.
- **Formulario**: Modal o vista dedicada para creación/edición con validaciones correspondientes para campos requeridos.

## Criterios de Aceptación
- **Scenario**: Crear producto válido
  - **Given** que estoy en el formulario de "Nuevo Producto"
  - **When** ingreso nombre, tipo_chocolate, forma y precio
  - **And** hago clic en "Guardar"
  - **Then** el producto se inserta en la base de datos SQLite
  - **And** vuelvo a la lista de productos donde aparece el nuevo chocolate.

- **Scenario**: Restricción de eliminación (en cajas)
  - **Given** un producto que ya forma parte de una "Caja"
  - **When** intento eliminar el producto
  - **Then** la acción es rechazada y se muestra un error visual.

- **Scenario**: Restricción de eliminación (en pedidos pendientes)
  - **Given** un producto que está incluido individualmente en un pedido "pendiente"
  - **When** intento eliminar el producto
  - **Then** la acción es rechazada y se muestra un error visual.
