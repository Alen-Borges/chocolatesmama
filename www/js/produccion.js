import * as db from './db.js';

let allProducts = [];

document.addEventListener('viewLoaded', (e) => {
    if (e.detail.view === 'produccion') {
        renderProduction();
        initProductionControls();
    }
});

async function initProductionControls() {
    const searchInput = document.getElementById('search-prod-input');
    const btnClose = document.getElementById('btn-close-modal');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderModalProdList(e.target.value);
        });
    }

    if (btnClose) {
        btnClose.onclick = () => document.getElementById('modal-search-prod').classList.add('hidden-force');
    }

    // Cargar todos los productos para el modal
    allProducts = await db.obtenerProductos();
}

async function renderProduction() {
    const container = document.getElementById('production-list-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

    try {
        const items = await db.obtenerConsolidadoProduccion();

        if (items.length === 0) {
            container.innerHTML = `
                <div class="card empty-state-card" style="text-align: center; padding: 40px; background: white; border-radius: 20px;">
                    <span style="font-size: 48px;">✨</span>
                    <h4 style="margin-top: 16px; color: var(--primary);">Todo al día</h4>
                    <p style="color: var(--text-muted); font-size: 14px;">No hay productos con stock o demanda operativa.</p>
                    <button class="btn btn-primary" onclick="openSearchModal()" style="margin-top: 20px; font-size: 14px;">Registrar Producción</button>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="card production-card animate-in" onclick="openProductionDialog(${item.producto_id}, '${item.nombre}', ${item.deuda})">
                <div class="prod-header">
                    <span class="prod-name" style="font-weight: 700; font-size: 17px; color: var(--primary);">${item.nombre}</span>
                    <span class="prod-stock-badge ${item.stock_actual > 0 ? 'has-stock' : ''}" style="background: ${item.stock_actual > 0 ? '#e8f5e9' : '#f5f5f5'}; color: ${item.stock_actual > 0 ? '#2e7d32' : '#999'}; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 700;">Stock: ${item.stock_actual}</span>
                </div>
                <div class="prod-details" style="display: flex; gap: 20px; margin-top: 15px; padding: 12px; background: #fafafa; border-radius: 12px;">
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 10px; font-weight: 800; color: #999; margin-bottom: 2px;">DEUDA</label>
                        <span style="font-size: 18px; font-weight: 800; color: ${item.deuda > 0 ? '#e53935' : '#2c1b18'};">${item.deuda}</span>
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-size: 10px; font-weight: 800; color: #999; margin-bottom: 2px;">DEMANDA</label>
                        <span style="font-size: 18px; font-weight: 800;">${item.demanda_pendiente}</span>
                    </div>
                </div>
                <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
                    <button class="btn btn-sm btn-outline" style="padding: 6px 14px; font-size: 12px; border-color: var(--primary); color: var(--primary);">+ Registrar</button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="error">Error cargando producción.</div>';
    }
}

window.openSearchModal = () => {
    document.getElementById('modal-search-prod').classList.remove('hidden-force');
    renderModalProdList();
};

function renderModalProdList(filter = '') {
    const list = document.getElementById('modal-prod-list');
    const term = filter.toLowerCase();
    
    const matched = allProducts.filter(p => p.nombre.toLowerCase().includes(term));
    
    if (matched.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">No se encontraron productos.</p>';
        return;
    }

    list.innerHTML = matched.map(p => `
        <button class="prod-search-item animate-in" onclick="quickRegister(${p.id}, '${p.nombre}')">
            <span>${p.nombre}</span>
            <span style="font-size: 12px; color: var(--secondary); font-weight: 700;">Seleccionar ➔</span>
        </button>
    `).join('');
}

window.quickRegister = (id, nombre) => {
    document.getElementById('modal-search-prod').classList.add('hidden-force');
    openProductionDialog(id, nombre, 0); // Abre el prompt de cantidad
};

window.openProductionDialog = (id, nombre, sugerencia) => {
    const val = sugerencia > 0 ? sugerencia : '';
    const qty = prompt(`¿Cuántos unidades de [${nombre}] fabricaste?`, val);
    if (qty) {
        const n = parseInt(qty);
        if (n > 0) {
            confirmarProduccion(id, n);
        }
    }
};

async function confirmarProduccion(id, cantidad) {
    try {
        await db.registrarProduccion(id, cantidad);
        renderProduction(); // Refresh
    } catch (e) {
        alert("Error al registrar producción: " + e.message);
    }
}
