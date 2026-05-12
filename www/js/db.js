import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

let sqlite = null;
let db = null;
let isInitializing = false;
const DB_NAME = 'choco_db_v6'; // v6: Persistencia de nombres en historial

/**
 * Espera hasta que la base de datos esté lista.
 */
async function ensureDbReady() {
    if (db) return;
    let retries = 0;
    while (!db && retries < 10) {
        console.log("Esperando a que la DB esté lista... Intento " + retries);
        await new Promise(r => setTimeout(r, 500));
        retries++;
    }
    if (!db) throw new Error("La base de datos no se inicializó a tiempo.");
}

export async function initDB() {
    if (isInitializing) return;
    isInitializing = true;
    
    try {
        console.log("Iniciando DB " + DB_NAME);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!sqlite) {
            // Intentar detectar el plugin nativo de forma agresiva
            const nativePlugin = Capacitor.Plugins.CapacitorSQLite || CapacitorSQLite;
            if (!nativePlugin) throw new Error("No se encontró el plugin CapacitorSQLite.");
            sqlite = new SQLiteConnection(nativePlugin);
        }

        const isConn = (await sqlite.isConnection(DB_NAME)).result;
        if (isConn) {
            db = await sqlite.retrieveConnection(DB_NAME);
        } else {
            db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
        }

        await db.open();

        const schema = `
            CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                tipo_chocolate TEXT NOT NULL,
                forma TEXT NOT NULL,
                relleno TEXT,
                peso_g REAL,
                precio REAL NOT NULL,
                extra TEXT
            );
            CREATE TABLE IF NOT EXISTS cajas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                empaque TEXT NOT NULL,
                precio_total REAL NOT NULL,
                descripcion TEXT
            );
            CREATE TABLE IF NOT EXISTS caja_productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                caja_id INTEGER,
                producto_id INTEGER,
                cantidad INTEGER NOT NULL,
                FOREIGN KEY (caja_id) REFERENCES cajas(id) ON DELETE CASCADE,
                FOREIGN KEY (producto_id) REFERENCES productos(id)
            );
            CREATE TABLE IF NOT EXISTS pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                destinatario TEXT NOT NULL,
                telefono TEXT,
                direccion TEXT,
                fecha_entrega TEXT,
                con_envio INTEGER,
                costo_envio REAL DEFAULT 0,
                plataforma TEXT,
                notas TEXT,
                estado TEXT DEFAULT 'pendiente',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS pedido_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pedido_id INTEGER,
                tipo_item TEXT,
                producto_id INTEGER,
                caja_id INTEGER,
                nombre TEXT, -- Nombre estático para el historial
                cantidad INTEGER NOT NULL,
                precio_unitario REAL NOT NULL,
                FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL,
                FOREIGN KEY (caja_id) REFERENCES cajas(id) ON DELETE SET NULL
            );
            CREATE TABLE IF NOT EXISTS registros_produccion (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                producto_id INTEGER,
                cantidad INTEGER NOT NULL,
                fecha TEXT DEFAULT CURRENT_TIMESTAMP,
                notas TEXT,
                FOREIGN KEY (producto_id) REFERENCES productos(id)
            );
        `;

        await db.execute(schema);
        console.log("DB esquema ejecutado.");
        isInitializing = false;
    } catch (err) {
        isInitializing = false;
        console.error("Critical DB Init Error:", err);
        throw err;
    }
}

// --- FUNCIONES PROTEGIDAS ---

export async function obtenerProductos() {
    await ensureDbReady();
    const res = await db.query('SELECT * FROM productos ORDER BY nombre ASC');
    return res.values || [];
}

export async function crearProducto(p) {
    await ensureDbReady();
    const sql = `INSERT INTO productos (nombre, tipo_chocolate, forma, relleno, peso_g, precio, extra) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [p.nombre, p.tipo_chocolate, p.forma, p.relleno, p.peso_g || 0, p.precio || 0, p.extra];
    return await db.run(sql, params);
}

export async function actualizarProducto(id, p) {
    await ensureDbReady();
    const sql = `UPDATE productos SET nombre=?, tipo_chocolate=?, forma=?, relleno=?, peso_g=?, precio=?, extra=? WHERE id=?`;
    const params = [p.nombre, p.tipo_chocolate, p.forma, p.relleno, p.peso_g || 0, p.precio || 0, p.extra, id];
    return await db.run(sql, params);
}

async function obtenerStockDeProducto(productoId) {
    const res = await db.query('SELECT SUM(cantidad) as stock FROM registros_produccion WHERE producto_id = ?', [productoId]);
    return res.values[0].stock || 0;
}

export async function eliminarProducto(id) {
    await ensureDbReady();
    return await db.run('DELETE FROM productos WHERE id=?', [id]);
}

export async function esProductoEliminable(id) {
    await ensureDbReady();
    
    // 1. ¿Está en alguna caja? (Si está en una caja, no se puede borrar el producto base)
    const resBox = await db.query('SELECT COUNT(*) as count FROM caja_productos WHERE producto_id = ?', [id]);
    if (resBox.values[0].count > 0) return { ok: false, msg: "Este producto es parte de una o más Cajas existentes." };
    
    // 2. ¿Está en algún pedido pendiente?
    const resOrders = await db.query(`
        SELECT COUNT(*) as count 
        FROM pedido_items pi 
        JOIN pedidos p ON pi.pedido_id = p.id 
        WHERE pi.producto_id = ? AND p.estado = 'pendiente'`, [id]);
        
    if (resOrders.values[0].count > 0) return { ok: false, msg: "Este producto está en un pedido PENDIENTE actual." };
    
    return { ok: true };
}

export async function obtenerProductoPorId(id) {
    await ensureDbReady();
    const res = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
    return res.values[0] || null;
}

export async function obtenerCajas() {
    await ensureDbReady();
    const res = await db.query('SELECT * FROM cajas ORDER BY nombre ASC');
    return res.values || [];
}

export async function obtenerContenidoCaja(cajaId) {
    await ensureDbReady();
    const sql = `SELECT cp.cantidad, p.nombre, p.tipo_chocolate, p.id as producto_id FROM caja_productos cp JOIN productos p ON cp.producto_id = p.id WHERE cp.caja_id = ?`;
    const res = await db.query(sql, [cajaId]);
    return res.values || [];
}

export async function obtenerCajaPorId(id) {
    await ensureDbReady();
    const res = await db.query('SELECT * FROM cajas WHERE id = ?', [id]);
    return res.values[0] || null;
}

export async function esCajaEliminable(id) {
    await ensureDbReady();
    // ¿Está en algún pedido pendiente?
    const resOrders = await db.query(`
        SELECT COUNT(*) as count 
        FROM pedido_items pi 
        JOIN pedidos p ON pi.pedido_id = p.id 
        WHERE pi.caja_id = ? AND p.estado = 'pendiente'`, [id]);
        
    if (resOrders.values[0].count > 0) return { ok: false, msg: "Esta caja está en un pedido PENDIENTE actual." };
    
    return { ok: true };
}

export async function eliminarCaja(id) {
    await ensureDbReady();
    return await db.run('DELETE FROM cajas WHERE id = ?', [id]);
}

export async function crearCaja(caja, items) {
    await ensureDbReady();
    const res = await db.run(`INSERT INTO cajas (nombre, empaque, precio_total, descripcion) VALUES (?, ?, ?, ?)`, [caja.nombre, caja.empaque, caja.precio_total, caja.descripcion]);
    const newId = res.changes.lastId;
    for (const item of items) {
        await db.run('INSERT INTO caja_productos (caja_id, producto_id, cantidad) VALUES (?, ?, ?)', [newId, item.producto_id, item.cantidad]);
    }
    return newId;
}

export async function actualizarCaja(id, caja, items) {
    await ensureDbReady();
    // 1. Actualizar datos base
    await db.run(`UPDATE cajas SET nombre=?, empaque=?, precio_total=?, descripcion=? WHERE id=?`, [caja.nombre, caja.empaque, caja.precio_total, caja.descripcion, id]);
    
    // 2. Limpiar items antiguos
    await db.run('DELETE FROM caja_productos WHERE caja_id = ?', [id]);
    
    // 3. Insertar nuevos items
    for (const item of items) {
        await db.run('INSERT INTO caja_productos (caja_id, producto_id, cantidad) VALUES (?, ?, ?)', [id, item.producto_id, item.cantidad]);
    }
    return true;
}

export async function obtenerPedidosPendientes() {
    await ensureDbReady();
    const sql = `SELECT p.*, COALESCE((SELECT SUM(pi.cantidad * pi.precio_unitario) FROM pedido_items pi WHERE pi.pedido_id = p.id), 0) + p.costo_envio as total_acumulado FROM pedidos p WHERE p.estado = 'pendiente' ORDER BY p.fecha_entrega ASC`;
    const res = await db.query(sql);
    const pedidos = res.values || [];

    // Pre-cargar stocks para optimizar
    const resStock = await db.query('SELECT producto_id, SUM(cantidad) as total FROM registros_produccion GROUP BY producto_id');
    const stocks = {};
    (resStock.values || []).forEach(s => stocks[s.producto_id] = s.total || 0);

    // Verificar cada pedido
    for (const p of pedidos) {
        const detalle = await obtenerDetallePedido(p.id);
        const necesidades = {};
        for (const item of detalle.items) {
            if (item.tipo_item === 'producto') {
                necesidades[item.producto_id] = (necesidades[item.producto_id] || 0) + item.cantidad;
            } else if (item.tipo_item === 'caja') {
                const componentes = await obtenerContenidoCaja(item.caja_id);
                for (const comp of componentes) {
                    necesidades[comp.producto_id] = (necesidades[comp.producto_id] || 0) + (comp.cantidad * item.cantidad);
                }
            }
        }

        let listo = true;
        for (const pid in necesidades) {
            if ((stocks[pid] || 0) < necesidades[pid]) {
                listo = false;
                break;
            }
        }
        p.stock_listo = listo;
    }

    return pedidos;
}

export async function obtenerHistorialPedidos() {
    await ensureDbReady();
    const sql = `
        SELECT p.*, 
        COALESCE((SELECT SUM(pi.cantidad * pi.precio_unitario) FROM pedido_items pi WHERE pi.pedido_id = p.id), 0) + p.costo_envio as total_acumulado 
        FROM pedidos p 
        WHERE p.estado IN ('entregado', 'cancelado') 
        ORDER BY p.created_at DESC`;
    const res = await db.query(sql);
    return res.values || [];
}

export async function obtenerDetallePedido(id) {
    await ensureDbReady();
    const resP = await db.query("SELECT * FROM pedidos WHERE id = ?", [id]);
    const pedido = resP.values[0];
    // Usamos pi.nombre como fuente principal del nombre
    const resI = await db.query(`SELECT pi.*, pi.nombre as nombre_item FROM pedido_items pi WHERE pi.pedido_id = ?`, [id]);
    return { ...pedido, items: resI.values || [] };
}

export async function crearPedido(pedido, items) {
    await ensureDbReady();
    const sqlP = `INSERT INTO pedidos (destinatario, telefono, direccion, fecha_entrega, con_envio, costo_envio, plataforma, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const paramsP = [pedido.destinatario, pedido.telefono, pedido.direccion, pedido.fecha_entrega, pedido.con_envio, pedido.costo_envio, pedido.plataforma, pedido.notas];
    const res = await db.run(sqlP, paramsP);
    const newId = res.changes.lastId;
    
    for (const item of items) {
        // Obtener el nombre actual para guardarlo de forma estática
        let nombreEstatico = "Item eliminado";
        if (item.tipo_item === 'producto') {
            const p = await obtenerProductoPorId(item.producto_id);
            if (p) nombreEstatico = p.nombre;
        } else {
            const c = await obtenerCajaPorId(item.caja_id);
            if (c) nombreEstatico = c.nombre;
        }

        await db.run(`INSERT INTO pedido_items (pedido_id, tipo_item, producto_id, caja_id, nombre, cantidad, precio_unitario) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
            [newId, item.tipo_item, item.producto_id || null, item.caja_id || null, nombreEstatico, item.cantidad, item.precio_unitario]);
    }

    return newId;
}

export async function marcarComoEntregado(id) {
    const pedido = await obtenerDetallePedido(id);
    const errores = [];
    const stockNecesario = {};

    // 1. Mapear necesidades totales del pedido
    for (const item of pedido.items) {
        if (item.tipo_item === 'producto') {
            stockNecesario[item.producto_id] = (stockNecesario[item.producto_id] || 0) + item.cantidad;
        } else if (item.tipo_item === 'caja') {
            const componentes = await obtenerContenidoCaja(item.caja_id);
            for (const comp of componentes) {
                stockNecesario[comp.producto_id] = (stockNecesario[comp.producto_id] || 0) + (comp.cantidad * item.cantidad);
            }
        }
    }

    // 2. Validar contra stock real
    for (const prodId in stockNecesario) {
        const stock = await obtenerStockDeProducto(prodId);
        if (stock < stockNecesario[prodId]) {
            // Obtener nombre del producto para el error
            const p = await obtenerProductoPorId(prodId);
            errores.push(`[${p.nombre}]: Tienes ${stock} y necesitas ${stockNecesario[prodId]}`);
        }
    }

    if (errores.length > 0) {
        throw new Error("⚠️ STOCK INSUFICIENTE:\n" + errores.join('\n'));
    }

    // 3. Registrar salidas de stock
    for (const item of pedido.items) {
        if (item.tipo_item === 'producto') {
            await registrarProduccion(item.producto_id, -item.cantidad, `Entrega Pedido #${id}`);
        } else if (item.tipo_item === 'caja') {
            const componentes = await obtenerContenidoCaja(item.caja_id);
            for (const comp of componentes) {
                await registrarProduccion(comp.producto_id, -(comp.cantidad * item.cantidad), `Entrega Pedido #${id} (Caja)`);
            }
        }
    }

    // 4. Cambiar estado y limpiar historial
    await db.run("UPDATE pedidos SET estado = 'entregado' WHERE id = ?", [id]);

    // 4. Limpiar Historial (solo mantener los últimos 20 no-pendientes)
    await db.run(`
        DELETE FROM pedidos 
        WHERE estado IN ('entregado', 'cancelado') 
        AND id NOT IN (
            SELECT id FROM pedidos 
            WHERE estado IN ('entregado', 'cancelado') 
            ORDER BY created_at DESC 
            LIMIT 20
        )
    `);
    return true;
}

export async function cancelarPedido(id) {
    await ensureDbReady();
    await db.run("UPDATE pedidos SET estado = 'cancelado' WHERE id = ?", [id]);
    
    // Limpiar Historial
    await db.run(`
        DELETE FROM pedidos 
        WHERE estado IN ('entregado', 'cancelado') 
        AND id NOT IN (
            SELECT id FROM pedidos 
            WHERE estado IN ('entregado', 'cancelado') 
            ORDER BY created_at DESC 
            LIMIT 20
        )
    `);
    return true;
}

export async function obtenerConsolidadoProduccion() {
    await ensureDbReady();
    const sql = `
    SELECT 
        p.id as producto_id, 
        p.nombre,
        -- Stock Actual (Total producido - Total entregado)
        COALESCE((SELECT SUM(rp.cantidad) FROM registros_produccion rp WHERE rp.producto_id = p.id), 0) as stock_actual,
        -- Demanda Pendiente (Suma de lo necesario para los pedidos actuales)
        (
            COALESCE((SELECT SUM(pi.cantidad) FROM pedido_items pi JOIN pedidos ped ON pi.pedido_id = ped.id WHERE pi.tipo_item = 'producto' AND pi.producto_id = p.id AND ped.estado = 'pendiente'), 0)
            +
            COALESCE((SELECT SUM(pi.cantidad * cp.cantidad) FROM pedido_items pi JOIN pedidos ped ON pi.pedido_id = ped.id JOIN caja_productos cp ON pi.caja_id = cp.caja_id WHERE pi.tipo_item = 'caja' AND cp.producto_id = p.id AND ped.estado = 'pendiente'), 0)
        ) as demanda_pendiente
    FROM productos p`;
    
    const res = await db.query(sql);
    return (res.values || [])
        .map(v => ({
            ...v,
            deuda: Math.max(0, v.demanda_pendiente - v.stock_actual)
        }))
        .filter(v => v.stock_actual > 0 || v.demanda_pendiente > 0 || v.deuda > 0);
}

export async function registrarProduccion(productoId, cantidad, notas = '') {
    await ensureDbReady();
    return await db.run(`INSERT INTO registros_produccion (producto_id, cantidad, notas) VALUES (?, ?, ?)`, [productoId, cantidad, notas]);
}
