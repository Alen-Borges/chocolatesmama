import * as db from './db.js';

let orderTab = 'pendientes';

document.addEventListener('viewLoaded', (e) => {
    if (e.detail.view === 'pedidos') {
        renderOrders();
    }
});

window.switchOrderTab = (tab) => {
    orderTab = tab;
    renderOrders();
};

window.marcarEntregadoUI = async (id) => {
    if (confirm("¿Marcar este pedido como ENTREGADO?")) {
        await db.marcarComoEntregado(id);
        renderOrders();
    }
};

window.cancelarPedidoUI = async (id) => {
    if (confirm("¿Estás seguro de CANCELAR este pedido?")) {
        await db.cancelarPedido(id);
        renderOrders();
    }
};

async function renderOrders() {
    const container = document.getElementById('orders-list-container');
    if (!container) return;

    // Actualizar tabs visualmente
    document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        const isPendientes = (idx === 0 && orderTab === 'pendientes');
        const isHistorial = (idx === 1 && orderTab === 'historial');
        btn.classList.toggle('active', isPendientes || isHistorial);
    });

    container.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

    try {
        let orders = [];
        if (orderTab === 'pendientes') {
            orders = await db.obtenerPedidosPendientes();
        } else {
            orders = await db.obtenerHistorialPedidos();
        }

        if (orders.length === 0) {
            container.innerHTML = `<div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-muted);">
                No hay pedidos ${orderTab}.
            </div>`;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="card order-card animate-in" onclick="verDetallePedido(${order.id})">
                <div class="order-header">
                    <div class="order-main-info">
                        <span class="destinatario">${order.destinatario}</span>
                        <span class="plataforma-tag">${order.plataforma ? 'via ' + order.plataforma : ''}</span>
                    </div>
                    <div class="order-amount-col">
                        <span class="price-total">$${(order.total_acumulado || 0).toFixed(2)}</span>
                        <span class="order-date">${order.fecha_entrega}</span>
                    </div>
                </div>
                <div class="order-footer">
                    <span class="order-status badge-${order.estado}">${order.estado}</span>
                    ${order.con_envio ? `<span class="shipping-tag">🚚 $${order.costo_envio}</span>` : ''}
                </div>
                
                ${order.estado === 'pendiente' ? `
                    <div class="order-actions-row" onclick="event.stopPropagation()">
                        <button class="btn btn-sm btn-success" onclick="marcarEntregadoUI(${order.id})">Entregado</button>
                        <button class="btn btn-sm btn-danger" onclick="cancelarPedidoUI(${order.id})">Cancelar</button>
                    </div>
                ` : ''}
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="error">Error cargando pedidos.</div>';
    }
}

window.verDetallePedido = (id) => {
    window.location.hash = `pedido-detalle?id=${id}`;
};
