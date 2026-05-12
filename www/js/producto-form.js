import * as db from './db.js';

document.addEventListener('viewLoaded', (e) => {
    if (e.detail.view === 'nuevo-producto') {
        initProductForm();
    }
});

function initProductForm() {
    const btn = document.getElementById('btn-save-product');
    btn.addEventListener('click', async () => {
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
            await db.crearProducto(product);
            window.location.hash = 'productos';
        } catch (e) {
            alert("Error al guardar: " + e.message);
        }
    });
}
