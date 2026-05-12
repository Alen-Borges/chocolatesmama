# Spec: Order Management (Pedidos)
**Status**: APPROVED

## Context
Registro de ventas a clientes. Un pedido puede tener múltiples productos o cajas, todos tratados como "ítems del pedido". Es crucial guardar un **snapshot** del precio al momento de la creación, para que los pedidos no se vean afectados por cambios futuros en el catálogo.

## Modelo de Datos (SQLite)
Tabla: `pedidos`
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `destinatario` (TEXT, NOT NULL)
- `telefono` (TEXT, NOT NULL)
- `direccion` (TEXT) - Obligatorio si con_envio es 1
- `fecha_entrega` (TEXT, YYYY-MM-DD)
- `con_envio` (INTEGER, 0 o 1)
- `notas` (TEXT)
- `estado` (TEXT, "pendiente" o "entregado")
- `created_at` (TEXT)

Tabla: `pedido_items`
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT)
- `pedido_id` (INTEGER, FK -> pedidos.id)
- `tipo_item` (TEXT, "producto" o "caja")
- `producto_id` (INTEGER, FK -> productos.id, nullable)
- `caja_id` (INTEGER, FK -> cajas.id, nullable)
- `cantidad` (INTEGER, NOT NULL)
- `precio_unitario` (REAL, NOT NULL) -> **SNAPSHOT**

## Acciones (JS)
**En `www/js/db.js`**:
- `obtenerPedidosPendientes()`: Filtra estado "pendiente" y ordena por `fecha_entrega` (ASC, más próximo primero).
- `obtenerHistorialPedidos()`: Filtra estado "entregado".
- `obtenerDetallePedido(id)`: Retorna pedido y JOIN con `pedido_items`, trayendo también el nombre del producto o caja (según corresponda).
- `crearPedido(pedidoDatos, itemsLista)`: Guarda cabecera e ítems capturando el precio actual como `precio_unitario`.
- `actualizarPedido(id, ...)`: Edita la info del pedido (solo si es "pendiente"). Un pedido entregado NO se puede editar.
- `eliminarPedido(id)`: Borra el pedido y sus ítems de `pedido_items`. Requiere confirmación de usuario.
- `marcarPedidoEntregado(id)`: Update estado a "entregado".

## UI/UX
- **Lista Pendientes**: Vista por defecto de la sección. Cards con Destinatario, Fecha entrega, Lista resumida de ítems/cantidades, precio total y badge si tiene envío.
- **Detalle Pedido**: Ver todos los datos. Si un ítem es caja, botón para ver su contenido interno opcionalmente.
- **Formulario de Pedido**: 
  - Datos de cliente y entrega. Casilla "Con envío" que habilita el campo Dirección y lo vuelve obligatorio (validación de formulario).
  - Selector unificado (Productos y Cajas) para armar ítems.
  - Calculador en tiempo real del precio total (sum(cantidad * precio_unitario)).

## Criterios de Aceptación
- **Scenario**: Snapshot del precio
  - **Given** que un "Bombón" cuesta $10 y creo un pedido de 5 bombones
  - **When** edito el precio del "Bombón" en el catálogo a $15
  - **Then** el pedido existente debe mostrar `precio_unitario` de $10 y total de $50.

- **Scenario**: Regla de Envío
  - **Given** que estoy registrando un pedido
  - **When** marco "con_envio" como verdadero y dejo la "dirección" vacía
  - **Then** el sistema arroja error de validación e impide guardar.

- **Scenario**: Inmutabilidad al Entregar
  - **Given** un pedido en historial con estado "entregado"
  - **When** intento editarlo
  - **Then** no debe permitirse (los campos o botones de edición no de estar disponibles/activos).
