import * as db from './db.js';

document.addEventListener('viewLoaded', (e) => {
    if (e.detail.view === 'produccion') {
        renderProduction();
    }
});

async function renderProduction() {
    const container = document.getElementById('production-list-container');
    container.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

    try {
        const items = await db.obtenerConsolidadoProduccion();

        if (items.length === 0) {
            container.innerHTML = `
                <div class="card empty-state-card" style="text-align: center; padding: 40px;">
                    <span style="font-size: 48px;">✨</span>
                    <h4 style="margin-top: 16px;">Todo al día</h4>
                    <p style="color: var(--text-muted);">No hay producción pendiente de fabricar.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="card production-card" onclick="openProductionDialog(${item.producto_id}, '${item.nombre}', ${item.deuda})">
                <div class="prod-header">
                    <span class="prod-name">${item.nombre}</span>
                    <span class="prod-stock-badge ${item.stock_actual > 0 ? 'has-stock' : ''}">Stock: ${item.stock_actual}</span>
                </div>
                <div class="prod-details">
                    <div class="debt-info ${item.deuda > 0 ? 'has-debt' : ''}">
                        <label>DEUDA PENDIENTE</label>
                        <span class="debt-value">${item.deuda}</span>
                    </div>
                    <div class="demand-info">
                        <label>DEMANDA TOTAL</label>
                        <span>${item.demanda_pendiente}</span>
                    </div>
                </div>
                
                ${item.deuda > 0 ? `
                    <div class="prod-alert">⚠️ Faltan ${item.deuda} para cubrir pedidos</div>
                ` : ''}
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="error">Error cargando producción.</div>';
    }
}

window.openProductionDialog = (id, nombre, faltante) => {
    const qty = prompt(`¿Cuántos unidades de [${nombre}] fabricaste? (Sugerido: ${faltante})`, faltante);
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
