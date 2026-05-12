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
            if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
            try {
                const check = await db.esProductoEliminable(editId);
                if (!check.ok) {
                    alert(check.msg);
                    return;
                }
                await db.eliminarProducto(editId);
                window.location.hash = 'productos';
            } catch (e) {
                alert("Error al eliminar: " + e.message);
            }
        });
    }
}
