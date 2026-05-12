import * as db from './db.js';

let editId = null;

document.addEventListener('viewLoaded', async (e) => {
    if (e.detail.view === 'nuevo-producto') {
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        editId = params.get('id');
        initProductForm();
    }
});

async function initProductForm() {
    const btnSave = document.getElementById('btn-save-product');
    const btnDelete = document.getElementById('btn-delete-item');
    const dangerZone = document.getElementById('danger-zone');
    const title = document.querySelector('.view-title') || { innerText: '' };

    if (editId) {
        title.innerText = 'Editar Producto';
        btnSave.innerText = 'Actualizar Producto';
        dangerZone.style.display = 'block';

        const p = await db.obtenerProductoPorId(editId);
        if (p) {
            document.getElementById('p-nombre').value = p.nombre;
            document.getElementById('p-tipo').value = p.tipo_chocolate;
            document.getElementById('p-forma').value = p.forma;
            document.getElementById('p-relleno').value = p.relleno;
            document.getElementById('p-precio').value = p.precio;
            document.getElementById('p-peso').value = p.peso_g;
            document.getElementById('p-extra').value = p.extra || '';
        }
    }

    btnSave.addEventListener('click', async () => {
        const product = {
            nombre: document.getElementById('p-nombre').value,
            tipo_chocolate: document.getElementById('p-tipo').value,
            forma: document.getElementById('p-forma').value,
            relleno: document.getElementById('p-relleno').value,
            precio: parseFloat(document.getElementById('p-precio').value),
            peso_g: parseFloat(document.getElementById('p-peso').value) || 0,
            extra: document.getElementById('p-extra').value
        };

        if (!product.nombre || isNaN(product.precio)) {
            alert("Por favor completa los campos obligatorios.");
            return;
        }

        try {
            if (editId) {
                await db.actualizarProducto(editId, product);
            } else {
                await db.crearProducto(product);
            }
            window.location.hash = 'productos';
        } catch (e) {
            alert("Error al guardar: " + e.message);
        }
    });

    if (btnDelete) {
        btnDelete.addEventListener('click', async () => {
            try {
                // 1. Validar si es eliminable (si no está en cajas o pedidos pendientes)
                const check = await db.esProductoEliminable(editId);
                if (!check.ok) {
                    alert(check.msg);
                    return;
                }

                // 2. Verificar Stock para advertencia
                const stock = await db.obtenerStockDeProducto(editId);
                
                if (stock > 0) {
                    const confirm1 = confirm(`⚠️ ADVERTENCIA: Este producto tiene ${stock} unidades en stock.\n\nSi lo eliminas, se perderá todo el historial de producción y existencias.\n\n¿Estás SEGURO de querer eliminarlo?`);
                    if (!confirm1) return;

                    const confirm2 = confirm("⚠️ ÚLTIMA CONFIRMACIÓN:\n¿Realmente deseas borrar este producto y TODO su stock del sistema? Esta acción no se puede deshacer.");
                    if (!confirm2) return;
                } else {
                    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
                }

                await db.eliminarProducto(editId);
                window.location.hash = 'productos';
            } catch (e) {
                alert("Error al eliminar: " + e.message);
            }
        });
    }
}
