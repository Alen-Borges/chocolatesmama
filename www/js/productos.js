import * as db from './db.js';

let currentTab = 'simples';

document.addEventListener('viewLoaded', (e) => {
    if (e.detail.view === 'productos') {
        renderProducts();
    }
});

window.switchProductTab = (tab) => {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', (idx === 0 && tab === 'simples') || (idx === 1 && tab === 'cajas'));
    });
    renderProducts();
};

async function renderProducts() {
    const container = document.getElementById('products-list-container');
    if (!container) return;
    container.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

    try {
        let items = [];
        if (currentTab === 'simples') {
            items = await db.obtenerProductos();
        } else {
            items = await db.obtenerCajas();
        }

        if (items.length === 0) {
            container.innerHTML = `<div class="empty-state">No hay ${currentTab} registrados.</div>`;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="card product-card animate-in" onclick="editItem('${currentTab}', ${item.id})">
                <div class="product-info">
                    <div class="prod-main">
                        <span class="prod-title">${item.nombre}</span>
                        <span class="prod-price">$${(item.precio || item.precio_total).toFixed(2)}</span>
                    </div>
                    <p class="prod-sub">${item.tipo_chocolate || item.empaque || 'Descripción: ' + (item.descripcion || 'Sin descripción')}</p>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="error">Error al cargar datos.</div>`;
    }
}

window.editItem = (tipo, id) => {
    // CORRECCIÓN: Los nombres de las rutas deben coincidir con router.js
    if (tipo === 'simples') {
        window.location.hash = `nuevo-producto?id=${id}`;
    } else {
        window.location.hash = `nueva-caja?id=${id}`;
    }
};
