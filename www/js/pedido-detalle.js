import * as db from './db.js';

document.addEventListener('viewLoaded', (e) => {
    if (e.detail.view === 'pedido-detalle') {
        const id = e.detail.params.id;
        if (id) renderDetallePedido(id);
    }
});

async function renderDetallePedido(id) {
    const header = document.getElementById('detalle-header');
    const itemsList = document.getElementById('detalle-items-list');
    const totalCard = document.getElementById('detalle-total-card');

    try {
        const data = await db.obtenerDetallePedido(id);
        
        // Header
        header.innerHTML = `
            <h3>${data.destinatario}</h3>
            <p>📱 ${data.telefono || 'Sin teléfono'}</p>
            <p>📅 Entrega: ${data.fecha_entrega}</p>
            ${data.plataforma ? `<p>🌐 Plataforma: ${data.plataforma}</p>` : ''}
            ${data.con_envio ? `<p>🏠 Envío a: ${data.direccion}</p>` : ''}
            
            <div class="detail-info-row">
                <div class="info-item">
                    <label>ESTADO</label>
                    <span class="order-status badge-${data.estado}">${data.estado}</span>
                </div>
                <div class="info-item" style="text-align: right;">
                    <label>CREADO EL</label>
                    <span>${new Date(data.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `;

        // Items
        let subtotalItems = 0;
        itemsList.innerHTML = data.items.map(item => {
            const rowTotal = item.cantidad * item.precio_unitario;
            subtotalItems += rowTotal;
            return `
                <div class="item-selected-row">
                    <span class="qty-badge">${item.cantidad}</span>
                    <div class="item-name-col">
                        <h5>${item.nombre_item}</h5>
                        <span>${item.tipo_item === 'caja' ? '📦 Caja' : '🍫 Simple'}</span>
                    </div>
                    <div class="item-price-col">$${rowTotal.toFixed(2)}</div>
                </div>
            `;
        }).join('');

        // Total
        const totalFinal = subtotalItems + (data.costo_envio || 0);
        totalCard.innerHTML = `
            <div>
                <div style="font-size: 11px; opacity: 0.8;">ITEMS: $${subtotalItems.toFixed(2)}</div>
                ${data.con_envio ? `<div style="font-size: 11px; opacity: 0.8;">ENVÍO: $${data.costo_envio.toFixed(2)}</div>` : ''}
                <div style="font-size: 18px;">TOTAL</div>
            </div>
            <div style="font-size: 24px;">$${totalFinal.toFixed(2)}</div>
        `;

    } catch (err) {
        console.error(err);
        header.innerHTML = '<p class="error">Error al cargar detalle.</p>';
    }
}
