# Spec: Box Management (Cajas)
**Status**: APPROVED

## Context
Las cajas son productos compuestos que agrupan productos simples. Tienen su propio precio y funcionan como un ítem único en el catálogo de ventas, actuando exactamente igual que un producto a la hora de agregarse a un pedido.

## Modelo de Datos (SQLite)
Tabla: `cajas`
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `nombre` (TEXT, NOT NULL)
- `forma` (TEXT, NOT NULL)
- `empaque` (TEXT, NOT NULL)
- `precio_empaque` (REAL)
- `precio_total` (REAL, NOT NULL)
- `descripcion` (TEXT)

Tabla: `caja_productos` (N:M)
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `caja_id` (INTEGER, FK -> cajas.id)
- `producto_id` (INTEGER, FK -> productos.id)
- `cantidad` (INTEGER, NOT NULL)

## Acciones (JS)
**En `www/js/db.js`**:
- `obtenerCajas()`: Lista todas las cajas.
- `obtenerContenidoCaja(caja_id)`: Retorna lista de productos simples y sus cantidades para esa caja.
- `crearCaja(cajaDatos, productosLista)`: Inserta en `cajas` y sus relaciones en `caja_productos` dentro de una transacción o en cascada simulada si no hay transacciones explícitas.
- `actualizarCaja(id, cajaDatos, productosLista)`: Actualiza info de la caja, borra todos sus `caja_productos` y los inserta de nuevo con las nuevas cantidades.
- `eliminarCaja(id)`: Elimina la caja y sus contenidos (`caja_productos`), **solo** si `esCajaEliminable(id)` es true.
- `esCajaEliminable(id)`: Verifica si la caja NO está en pedidos pendientes (`pedido_items` con tipo_item = 'caja' de pedidos 'pendientes'). (Requisito 3.2).

## UI/UX
- **Lista de Cajas**: Sub-sección dentro de Productos.
- **Detalle**: Ver nombre, empaque, lista de productos con cantidades y precios para cálculo.
- **Editor de Caja**: 
  - Datos básicos de la caja (nombre, forma, empaque, etc).
  - Selector de productos simples con input numérico (min 1) de cantidad.
  - El usuario puede agregar múltiples productos distintos.

## Criterios de Aceptación
- **Scenario**: Armar una caja nueva
  - **Given** que tengo registrados los productos "Bombón" y "Trufa"
  - **When** creo una caja llamada "Combo Mixto"
  - **And** agrego 4 "Bombón" y 2 "Trufa"
  - **Then** la caja debe guardarse correctamente vinculando ambos productos en `caja_productos`.

- **Scenario**: Restricción de eliminación de Caja
  - **Given** una caja que está incluida en un pedido "pendiente"
  - **When** intento eliminar la caja
  - **Then** el sistema debe mostrar un error informando que no se puede eliminar.
