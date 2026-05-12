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
    const summaryContent = document.getElementById('summary-content');
    const totalBar = document.getElementById('detalle-total-bar');

    try {
        const data = await db.obtenerDetallePedido(id);
        
        // Cabecera del Cliente
        header.innerHTML = `
            <h3>${data.destinatario}</h3>
            <p><span>📞</span> ${data.telefono || 'Sin teléfono'}</p>
            <p><span>🚚</span> ${data.con_envio ? data.direccion : 'Retiro por local'}</p>
            <p><span>📅</span> Entrega: <strong>${data.fecha_entrega}</strong></p>
            
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <span class="order-status badge-${data.estado}" style="text-transform: uppercase; font-size: 10px; padding: 4px 10px;">${data.estado}</span>
                <span style="font-size: 11px; color: #999;">ID #${data.id}</span>
            </div>
        `;

        // Lista de Items
        let subtotal = 0;
        itemsList.innerHTML = data.items.map(item => {
            const rowTotal = item.cantidad * item.precio_unitario;
            subtotal += rowTotal;
            return `
                <div class="item-selected-row animate-in">
                    <div class="qty-bubble">${item.cantidad}</div>
                    <div class="item-info-col">
                        <h5>${item.nombre_item}</h5>
                        <span>${item.tipo_item === 'caja' ? '📦 Caja de chocolates' : '🍫 Chocolate simple'}</span>
                    </div>
                    <div class="item-total-col">$${rowTotal.toFixed(2)}</div>
                </div>
            `;
        }).join('');

        // Resumen y Total
        summaryContent.innerHTML = `
            <div class="summary-line">
                <span>Subtotal productos</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            ${data.con_envio ? `
                <div class="summary-line">
                    <span>Costo de envío</span>
                    <span>$${(data.costo_envio || 0).toFixed(2)}</span>
                </div>
            ` : ''}
        `;

        const totalFinal = subtotal + (data.costo_envio || 0);
        totalBar.innerHTML = `
            <span class="total-label">Importe Total</span>
            <span class="total-value">$${totalFinal.toFixed(2)}</span>
        `;

    } catch (err) {
        console.error(err);
        header.innerHTML = '<p class="error">Error al cargar el detalle del pedido.</p>';
    }
}
