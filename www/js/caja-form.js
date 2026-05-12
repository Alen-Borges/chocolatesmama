import * as db from './db.js';

let editId = null;

document.addEventListener('viewLoaded', (e) => {
    if (e.detail.view === 'nueva-caja') {
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        editId = params.get('id');
        initBoxForm();
    }
});

async function initBoxForm() {
    const listContainer = document.getElementById('box-items-selector');
    const btnSave = document.getElementById('btn-save-box');
    const btnDelete = document.getElementById('btn-delete-item');
    const dangerZone = document.getElementById('danger-zone');
    const title = document.querySelector('.view-title') || { innerText: '' };

    try {
        const products = await db.obtenerProductos();
        if (products.length === 0) {
            listContainer.innerHTML = '<p class="error">Primero debes crear productos simples.</p>';
            return;
        }

        let boxData = null;
        let boxContent = [];
        if (editId) {
            title.innerText = 'Editar Caja';
            btnSave.innerText = 'Actualizar Caja';
            dangerZone.style.display = 'block';

            boxData = await db.obtenerCajaPorId(editId);
            boxContent = await db.obtenerContenidoCaja(editId);
            
            if (boxData) {
                document.getElementById('c-nombre').value = boxData.nombre;
                document.getElementById('c-empaque').value = boxData.empaque;
                document.getElementById('c-precio-total').value = boxData.precio_total;
            }
        }

        listContainer.innerHTML = products.map(p => {
            const existing = boxContent.find(i => i.producto_id === p.id);
            return `
                <div class="selector-item">
                    <label>${p.nombre} (${p.tipo_chocolate})</label>
                    <input type="number" class="qty-input product-qty" data-id="${p.id}" value="${existing ? existing.cantidad : 0}" min="0">
                </div>
            `;
        }).join('');

        btnSave.addEventListener('click', async () => {
            const caja = {
                nombre: document.getElementById('c-nombre').value,
                empaque: document.getElementById('c-empaque').value,
                precio_total: parseFloat(document.getElementById('c-precio-total').value) || 0,
                descripcion: ''
            };

            const items = [];
            document.querySelectorAll('.product-qty').forEach(input => {
                const qty = parseInt(input.value);
                if (qty > 0) {
                    items.push({ producto_id: parseInt(input.dataset.id), cantidad: qty });
                }
            });

            if (!caja.nombre || caja.precio_total <= 0 || items.length === 0) {
                alert("Completa el nombre, precio y añade al menos un chocolate.");
                return;
            }

            try {
                if (editId) {
                    await db.actualizarCaja(editId, caja, items);
                } else {
                    await db.crearCaja(caja, items);
                }
                window.location.hash = 'productos';
            } catch (err) {
                alert("Error al guardar caja: " + err.message);
            }
        });

        if (btnDelete) {
            btnDelete.addEventListener('click', async () => {
                if (!confirm("¿Seguro que quieres eliminar esta caja?")) return;
                try {
                    const check = await db.esCajaEliminable(editId);
                    if (!check.ok) {
                        alert(check.msg);
                        return;
                    }
                    await db.eliminarCaja(editId);
                    window.location.hash = 'productos';
                } catch (e) {
                    alert("Error al eliminar: " + e.message);
                }
            });
        }

    } catch (err) {
        console.error(err);
        listContainer.innerHTML = '<p class="error">Error cargando productos.</p>';
    }
}
