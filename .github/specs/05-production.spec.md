# Spec: Production Module (Backlog & History)
**Status**: APPROVED

## Context
Módulo central para la gestión del trabajo. Muestra un consolidado acumulado de todos los productos *simples* pendientes de producir, calculados en tiempo real a partir de los pedidos en estado "pendiente" (incluyendo los que están dentro de cajas), y restando la producción ya registrada.

## Modelo de Datos (SQLite)
Tabla: `registros_produccion`
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `producto_id` (INTEGER, FK -> productos.id)
- `cantidad` (INTEGER, NOT NULL)
- `fecha` (TEXT, datetime)
- `notas` (TEXT)

> El faltante NO se persiste, siempre se calcula on the fly.

## Lógica de Cálculo (SQL en db.js)
El "Faltante a Producir" para un `producto_id` `X` se calcula así:

1.  **Suma Pedido Directo**: `SUM(cantidad)` de `pedido_items` donde `tipo_item` = 'producto', `producto_id` = `X` y el `estado` del pedido es 'pendiente'.
2.  **Suma Pedido Cajas**: `SUM(pedido_items.cantidad * caja_productos.cantidad)` donde el pedido es 'pendiente', `pedido_items.tipo_item` = 'caja', y dicha caja contiene al `producto_id` `X` en `caja_productos`.
3.  **Total Pedido**: `Suma Pedido Directo` + `Suma Pedido Cajas`.
4.  **Total Producido**: `SUM(cantidad)` de `registros_produccion` para el `producto_id` `X`.
5.  **Faltante**: `Total Pedido` - `Total Producido`.

*Nota:* Si un producto da Faltante <= 0, no se muestra en la lista.

## Acciones (JS)
**En `www/js/db.js`**:
- `obtenerFaltantesProduccion()`: Ejecuta la lógica compleja descrita arriba y retorna `[{ producto_id, nombre_producto, total_pedido, ya_producido, faltante_producir }]` filtrando `>= 1`.
- `insertarRegistroProduccion(producto_id, cantidad, notas)`: Guarda un registro en `registros_produccion`.

## UI/UX
- **Lista de Pendientes de Producción**: Tabla o lista mostrando Nombre del Producto, Total Pedido, Ya Producido, y Falta Producir.
- **Acción Rápida de Producción**: 
  - Al tocar un ítem en la lista, abre un modal: "¿Cuántos fabricaste?".
  - Input numérico. No puede ser mayor al número de "Falta producir".
  - Botón: Guardar. Al guardar, refresca la lista de faltantes de inmediato.

## Criterios de Aceptación
- **Scenario**: Desglose recursivo de cajas
  - **Given** que hay un Pedido "Pendiente" que contiene 2 "Cajas"
  - **And** esa Caja contiene 5 "Bombones"
  - **And** hay otro pedido "Pendiente" de 10 "Bombones" sueltos
  - **When** abro la sección Producción
  - **Then** el cálculo "Total Pedido" para "Bombón" debe ser 20 (2*5 + 10).

- **Scenario**: Límite de producción
  - **Given** que la sección indica que me faltan producir 50 trufas
  - **When** intento registrar que produje 60
  - **Then** el sistema muestra un error advirtiendo que no puedo superar el faltante actual.

- **Scenario**: Desaparición al completar
  - **Given** que faltan producir 10 figuras
  - **When** registro 10 unidades fabricadas
  - **Then** la orden se completa internamente y la figura ya NO figura en la vista de Producción.
