---
applyTo: "www/js/db.js"
---

# Instrucciones para la Capa de Datos (SQLite + Capacitor)

## Regla de Oro
Toda interacción con la base de datos **DEBE** realizarse exclusivamente dentro de `www/js/db.js`.

## Estándares de Codificación
1. **Conexión**: Usar `@capacitor-community/sqlite`. Asegurar que la base de datos se llame `chocolates_db`.
2. **Promesas**: Todas las funciones de exportación deben ser `async`.
3. **Parametrización**: NUNCA concatenar strings para crear queries. Usar el sistema de parámetros del plugin para prevenir SQL Injection.
4. **Esquema Inicial**: Implementar un bloque de inicialización que cree las tablas si no existen.

## Ejemplo de Función CRUD

```javascript
// Correcto
export async function crearProducto(producto) {
    const sql = `INSERT INTO productos (nombre, precio, tipo_chocolate) VALUES (?, ?, ?)`;
    const params = [producto.nombre, producto.precio, producto.tipo];
    try {
        await db.execute(sql, params);
        return true;
    } catch (e) {
        console.error("Error al crear producto", e);
        throw e;
    }
}
```

## Manejo de Tipos
- **Precios**: Usar `REAL`.
- **Cantidades**: Usar `INTEGER`.
- **Booleano**: Usar `INTEGER` (0 = false, 1 = true).
- **Fechas**: Usar `TEXT` con formato `YYYY-MM-DD`.

## Tablas Requeridas
- `productos`: Catálogo individual.
- `cajas`: Conjuntos de productos.
- `caja_productos`: Relación N:M (caja_id, producto_id, cantidad).
- `pedidos`: Cabecera de venta.
- `pedido_items`: Detalle de venta (puede contener productos sueltos o cajas).

## Restricciones
- No usar `localStorage`.
- No usar librerias pesadas de ORM.
- Mantener el archivo `db.js` limpio y bien documentado.
