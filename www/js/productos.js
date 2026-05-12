import * as db from './db.js';

let currentTab = 'simples';

document.addEventListener('viewLoaded', (e) => {
    if (e.detail.view === 'productos') {
        renderProducts();
    }
});

window.switchProductTab = (tab) => {
    currentTab = tab;
    // Update UI tabs
    document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', (idx === 0 && tab === 'simples') || (idx === 1 && tab === 'cajas'));
    });
    renderProducts();
};

async function renderProducts() {
    const container = document.getElementById('products-list-container');
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
            <div class="card product-card">
                <div class="product-info">
                    <h3>${item.nombre}</h3>
                    <p class="type">${item.tipo_chocolate || item.empaque || ''}</p>
                    <p class="price">$${item.precio || item.precio_total}</p>
                </div>
                <div class="actions">
                    <button class="btn-icon" onclick="editItem('${currentTab}', ${item.id})">✏️</button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        container.innerHTML = `<div class="error">Error al cargar datos.</div>`;
    }
}
