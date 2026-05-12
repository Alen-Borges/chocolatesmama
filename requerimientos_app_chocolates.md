# Requerimientos funcionales — App de chocolates
> Documento fuente de verdad para agentes de planificación y ejecución.  
> Stack: HTML + CSS + JS vanilla · Capacitor v6 · SQLite local · Android únicamente  
> Versión 3 — cajas como subtipo de producto, módulo de producción incorporado

---

## 1. Contexto general

Aplicación móvil Android de uso personal para una persona que produce chocolates artesanalmente. Permite registrar qué tipos de productos se fabrican (incluyendo cajas armadas), tomar pedidos de clientes, y llevar un control de cuánto hay que producir con la posibilidad de ir descontando lo que ya se fabricó.

Todo el almacenamiento es local en el dispositivo (SQLite). No requiere internet ni backend externo.

---

## 2. Estructura general de la app

Tres secciones accesibles desde una barra de navegación inferior:

| Sección | Propósito |
|---------|-----------|
| Productos | Catálogo de productos simples y cajas que se fabrican |
| Pedidos | Registro y seguimiento de pedidos de clientes |
| Producción | Consolidado de todo lo pendiente de fabricar |

---

## 3. Sección: Productos

Esta sección tiene dos subsecciones: **Productos simples** y **Cajas**.

### 3.1 Subsección: Productos simples

#### Qué es un producto simple
Un tipo de chocolate individual que se fabrica. Es el catálogo de referencia — no representa stock ni existencias. Ejemplo: "Bombón de dulce de leche", "Trufa de frambuesa".

#### Atributos

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| nombre | texto | sí | nombre descriptivo |
| tipo_chocolate | texto | sí | ej: blanco, negro, con leche, ruby |
| forma | texto | sí | ej: bombón, tableta, figura, trufa |
| relleno | texto | no | ej: dulce de leche, frambuesa, sin relleno |
| peso_g | número | no | peso en gramos |
| tamanio | texto | no | ej: chico, mediano, grande |
| precio | número | sí | precio unitario de venta |
| ingredientes | texto | no | lista libre de ingredientes |
| porcentaje_chocolate | número | no | % de cacao si aplica |
| extra | texto | no | observaciones o agregados especiales |

#### Funcionalidades
- Listar todos los productos simples
- Crear, editar y eliminar producto simple
- Eliminar solo permitido si el producto no está en pedidos pendientes ni en cajas activas
- Ver detalle completo

---

### 3.2 Subsección: Cajas

#### Qué es una caja
Una caja es un producto compuesto: agrupa uno o más productos simples en cantidades definidas, con su propio empaque, nombre y precio. **Una caja se comporta exactamente igual que un producto a la hora de agregarse a un pedido.** La diferencia es que internamente está compuesta por productos simples.

#### Atributos de la caja

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| nombre | texto | sí | ej: "Caja surtida navideña" |
| forma | texto | sí | ej: rectangular, circular, corazón |
| empaque | texto | sí | descripción del empaque |
| precio_empaque | número | no | costo del empaque como ítem separado |
| precio_total | número | sí | precio de venta de la caja completa |
| descripcion | texto | no | descripción libre |

#### Contenido de la caja

Cada caja tiene una lista de productos simples con su cantidad:

| Campo | Tipo | Notas |
|-------|------|-------|
| producto_id | referencia | producto simple existente en el catálogo |
| cantidad | número entero | unidades de ese producto dentro de la caja |

- Una caja puede contener múltiples productos distintos
- Un mismo producto simple puede estar en varias cajas
- Cantidad mínima por producto: 1

#### Funcionalidades
- Listar todas las cajas
- Crear caja: ingresar atributos + agregar productos simples con cantidad
- Editar caja existente (atributos y contenido)
- Eliminar caja (solo si no está en pedidos pendientes)
- Ver detalle: nombre, empaque, lista de productos con cantidades y precio desglosado

---

## 4. Sección: Pedidos

### 4.1 Qué es un pedido
Un encargo de un cliente. Puede contener productos simples, cajas, o ambos — todos tratados como ítems del pedido.

### 4.2 Atributos del pedido

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| destinatario | texto | sí | nombre completo |
| telefono | texto | sí | número de contacto |
| direccion | texto | condicional | obligatorio si tiene envío |
| fecha_entrega | fecha | sí | formato YYYY-MM-DD |
| con_envio | booleano | sí | si se envía o retira en persona |
| notas | texto | no | observaciones del pedido |
| estado | texto | sí | "pendiente" o "entregado" |

### 4.3 Ítems del pedido

Un ítem puede ser un producto simple o una caja:

| Campo | Tipo | Notas |
|-------|------|-------|
| tipo_item | texto | "producto" o "caja" |
| producto_id | referencia | si tipo_item = "producto" |
| caja_id | referencia | si tipo_item = "caja" |
| cantidad | número entero | unidades pedidas |
| precio_unitario | número | snapshot del precio al momento de crear el pedido |

> **Regla importante:** el precio_unitario es un snapshot. Cambios futuros en precios no afectan pedidos ya creados.

### 4.4 Vista de lista de pedidos

Muestra por defecto los pedidos con estado **"pendiente"**, ordenados por fecha de entrega (más próximo primero). Por cada pedido se ve:
- Nombre del destinatario
- Fecha de entrega
- Lista resumida de ítems y cantidades
- Precio total
- Indicador de envío

Opción para ver historial de pedidos entregados.

### 4.5 Detalle del pedido

- Todos los datos del destinatario
- Lista completa de ítems con nombre, cantidad, precio unitario y subtotal
- Si un ítem es una caja, mostrar opcionalmente su contenido interno
- Precio total final
- Botón para marcar como "entregado"

### 4.6 Precio total

Suma de (cantidad × precio_unitario) de todos los ítems. Se calcula en tiempo real mientras se arma el pedido.

### 4.7 Funcionalidades
- Ver lista de pedidos pendientes
- Ver historial de entregados
- Crear, editar y ver detalle de pedido
- Marcar pedido como entregado
- Eliminar pedido (con confirmación)
- Un pedido entregado no se puede editar

---

## 5. Sección: Producción

### 5.1 Propósito
Responde la pregunta: **¿cuánto tengo que fabricar?**

Muestra el consolidado acumulado de todos los productos pendientes de producir, calculado a partir de todos los pedidos con estado "pendiente". No es por período — es el total pendiente en cualquier momento.

> Cuando un pedido incluye una caja, los productos simples que componen esa caja se suman al pendiente de producción de forma individual. Ejemplo: si un pedido tiene 2 cajas que contienen 5 bombones cada una, se suman 10 bombones al pendiente de producción.

### 5.2 Vista principal

Lista de productos con faltante de producción:

| Columna | Descripción |
|---------|-------------|
| Nombre del producto | nombre del producto simple |
| Total pedido | total de ese producto en pedidos pendientes |
| Ya producido | suma de registros de producción ingresados |
| Falta producir | total pedido − ya producido |

Solo se muestran productos con "falta producir" > 0.

### 5.3 Registrar producción (descontar deuda)

El usuario indica cuántas unidades de un producto acaba de fabricar:

1. Toca un producto en la lista
2. Aparece un formulario: "¿Cuántos fabricaste?"
3. Ingresa el número (no puede superar el faltante actual)
4. El sistema guarda el registro y actualiza el faltante en pantalla

**Ejemplo:**
- Pendiente: 200 bombones
- Usuario registra: fabricó 100
- Nuevo faltante: 100 bombones

### 5.4 Historial de producción

Cada registro se guarda con:

| Campo | Tipo | Notas |
|-------|------|-------|
| producto_id | referencia | qué producto se fabricó |
| cantidad | número entero | unidades fabricadas |
| fecha | datetime | automática al guardar |
| notas | texto | opcional |

### 5.5 Reglas de negocio de producción

1. No se puede registrar más producción que el faltante actual
2. Cuando "falta producir" llega a 0, el producto desaparece de la lista
3. Agregar un nuevo pedido aumenta automáticamente el pendiente
4. Marcar un pedido como entregado recalcula el pendiente
5. El faltante nunca se guarda como valor fijo — siempre se calcula en tiempo real

### 5.6 Fórmula del faltante

```
total_pedido    = SUM de ese producto en pedidos pendientes
                  (incluyendo los que vienen dentro de cajas)
total_producido = SUM de registros_produccion de ese producto
falta_producir  = total_pedido − total_producido
```

---

## 6. Navegación

- SPA con un único `index.html`
- Barra de navegación inferior fija: Productos · Pedidos · Producción
- La sección Productos tiene navegación interna entre Productos simples y Cajas (tabs o submenú)
- Router JS en `router.js` maneja todas las vistas
- El botón atrás del celular debe funcionar (historial de navegación)

---

## 7. Reglas de negocio generales

1. No se puede eliminar un producto simple que esté en pedidos pendientes o en cajas activas
2. No se puede eliminar una caja que esté en pedidos pendientes
3. El precio de los ítems en un pedido es un snapshot — inmutable tras la creación
4. Si un pedido tiene envío, la dirección es obligatoria
5. El faltante de producción se calcula siempre en tiempo real desde la BD
6. Los productos dentro de una caja se cuentan individualmente en producción
7. Un pedido entregado no se puede editar

---

## 8. Esquema de base de datos

### productos
| campo | tipo | notas |
|-------|------|-------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| nombre | TEXT | NOT NULL |
| tipo_chocolate | TEXT | NOT NULL |
| forma | TEXT | NOT NULL |
| relleno | TEXT | nullable |
| peso_g | REAL | nullable |
| tamanio | TEXT | nullable |
| precio | REAL | NOT NULL |
| ingredientes | TEXT | nullable |
| porcentaje_chocolate | REAL | nullable |
| extra | TEXT | nullable |

### cajas
| campo | tipo | notas |
|-------|------|-------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| nombre | TEXT | NOT NULL |
| forma | TEXT | NOT NULL |
| empaque | TEXT | NOT NULL |
| precio_empaque | REAL | nullable |
| precio_total | REAL | NOT NULL |
| descripcion | TEXT | nullable |

### caja_productos
| campo | tipo | notas |
|-------|------|-------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| caja_id | INTEGER | FK → cajas.id |
| producto_id | INTEGER | FK → productos.id |
| cantidad | INTEGER | NOT NULL |

### pedidos
| campo | tipo | notas |
|-------|------|-------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| destinatario | TEXT | NOT NULL |
| telefono | TEXT | NOT NULL |
| direccion | TEXT | nullable |
| fecha_entrega | TEXT | YYYY-MM-DD |
| con_envio | INTEGER | 0 o 1 |
| notas | TEXT | nullable |
| estado | TEXT | "pendiente" o "entregado" |
| created_at | TEXT | datetime automática |

### pedido_items
| campo | tipo | notas |
|-------|------|-------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| pedido_id | INTEGER | FK → pedidos.id |
| tipo_item | TEXT | "producto" o "caja" |
| producto_id | INTEGER | FK → productos.id, nullable |
| caja_id | INTEGER | FK → cajas.id, nullable |
| cantidad | INTEGER | NOT NULL |
| precio_unitario | REAL | snapshot al momento del pedido |

### registros_produccion
| campo | tipo | notas |
|-------|------|-------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| producto_id | INTEGER | FK → productos.id |
| cantidad | INTEGER | NOT NULL |
| fecha | TEXT | datetime automática |
| notas | TEXT | nullable |

---

## 9. Restricciones técnicas

- Todo el código va en `www/` — sin frameworks JS
- Toda query SQL va en `db.js` como función nombrada — nunca SQL inline en otros archivos
- Sin llamadas HTTP externas
- Sin localStorage ni sessionStorage — usar exclusivamente SQLite vía @capacitor-community/sqlite
- El directorio `android/` es generado por Capacitor y no debe editarse manualmente
- El faltante de producción nunca se persiste — siempre se calcula con SELECT en tiempo real

