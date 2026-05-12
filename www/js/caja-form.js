import * as db from './db.js';

document.addEventListener('viewLoaded', (e) => {
    if (e.detail.view === 'nueva-caja') {
        initBoxForm();
    }
});

async function initBoxForm() {
    const listContainer = document.getElementById('box-items-selector');
    const btnSave = document.getElementById('btn-save-box');

    try {
        const products = await db.obtenerProductos();
        if (products.length === 0) {
            listContainer.innerHTML = '<p class="error">Primero debes crear productos simples.</p>';
            return;
        }

        listContainer.innerHTML = products.map(p => `
            <div class="selector-item">
                <label>${p.nombre} (${p.tipo_chocolate})</label>
                <input type="number" class="qty-input product-qty" data-id="${p.id}" value="0" min="0">
            </div>
        `).join('');

        btnSave.addEventListener('click', async () => {
            const caja = {
                nombre: document.getElementById('c-nombre').value,
                empaque: document.getElementById('c-empaque').value,
                precio_empaque: parseFloat(document.getElementById('c-precio-empaque').value) || 0,
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
                await db.crearCaja(caja, items);
                window.location.hash = 'productos';
            } catch (err) {
                alert("Error al guardar caja: " + err.message);
            }
        });

    } catch (err) {
        listContainer.innerHTML = '<p class="error">Error cargando productos.</p>';
    }
}
