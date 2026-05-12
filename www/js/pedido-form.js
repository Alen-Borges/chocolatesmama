import * as db from './db.js';

let selectedItems = [];
let availableItems = [];

document.addEventListener('viewLoaded', (e) => {
    if (e.detail.view === 'nuevo-pedido') {
        initPedidoForm();
    }
});

async function initPedidoForm() {
    selectedItems = [];
    availableItems = [];
    renderSelectedItems();

    const envBtn = document.getElementById('ped-envio');
    const dirContainer = document.getElementById('dir-container');
    const btnAddItem = document.getElementById('btn-add-item');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnSave = document.getElementById('btn-save-pedido');
    const searchInput = document.getElementById('search-item');

    // UI Events
    envBtn.addEventListener('change', () => {
        dirContainer.classList.toggle('hidden-force', !envBtn.checked);
        renderSelectedItems(); // Re-calcular total con envío
    });

    const costSelect = document.getElementById('ped-costo-envio');
    costSelect.addEventListener('change', () => {
        renderSelectedItems(); // Re-calcular total al cambiar costo
    });

    btnAddItem.addEventListener('click', openItemModal);
    btnCloseModal.addEventListener('click', closeItemModal);
    btnSave.addEventListener('click', savePedido);
    
    searchInput.addEventListener('input', (e) => {
        renderModalList(e.target.value);
    });

    // Load Data
    try {
        const [products, boxes] = await Promise.all([db.obtenerProductos(), db.obtenerCajas()]);
        availableItems = [
            ...products.map(p => ({ ...p, type: 'producto', price: p.precio })),
            ...boxes.map(b => ({ ...b, type: 'caja', price: b.precio_total }))
        ];
    } catch (e) {
        console.error("Error loading items", e);
    }
}

function openItemModal() {
    document.getElementById('modal-item').classList.remove('hidden-force');
    renderModalList();
}

function closeItemModal() {
    document.getElementById('modal-item').classList.add('hidden-force');
}

function renderModalList(filter = '') {
    const list = document.getElementById('modal-list');
    const searchTerm = filter.toLowerCase();
    
    const filtered = availableItems.filter(item => 
        item.nombre.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
        list.innerHTML = `<p style="text-align:center; padding:20px; color:var(--text-muted);">
            No se encontraron resultados.<br>
            ${availableItems.length === 0 ? '<b>Crea productos o cajas primero.</b>' : ''}
        </p>`;
        return;
    }

    list.innerHTML = filtered.map((item) => {
        const idx = availableItems.indexOf(item);
        return `
            <div class="modal-item-row animate-in">
                <div class="item-main-info">
                    <strong>${item.nombre}</strong><br>
                    <small>$${item.price.toFixed(2)} - ${item.type === 'caja' ? '📦 Caja' : '🍫 Simple'}</small>
                </div>
                <div class="qty-actions">
                    <input type="number" id="modal-qty-${idx}" value="1" min="1" class="qty-field">
                    <button class="btn-add-mini" onclick="addItemFromModal(${idx})">Añadir</button>
                </div>
            </div>
        `;
    }).join('');
}

window.addItemFromModal = (idx) => {
    const qtyInput = document.getElementById(`modal-qty-${idx}`);
    const cantidad = parseInt(qtyInput.value) || 1;
    
    const baseItem = availableItems[idx];
    const existing = selectedItems.find(i => i.id === baseItem.id && i.type === baseItem.type);

    if (existing) {
        existing.cantidad += cantidad;
    } else {
        selectedItems.push({
            id: baseItem.id,
            nombre: baseItem.nombre,
            type: baseItem.type,
            precio_unitario: baseItem.price,
            cantidad: cantidad
        });
    }

    renderSelectedItems();
    closeItemModal();
};

function renderSelectedItems() {
    const list = document.getElementById('pedido-items-list');
    const totalEl = document.getElementById('ped-total');

    if (selectedItems.length === 0) {
        list.innerHTML = '<div class="empty-items-text">El pedido está vacío</div>';
        totalEl.innerText = '$ 0.00';
        return;
    }

    let total = 0;
    selectedItems.forEach(item => {
        total += (item.cantidad * item.precio_unitario);
    });

    const conEnvio = document.getElementById('ped-envio').checked;
    if (conEnvio) {
        total += parseFloat(document.getElementById('ped-costo-envio').value) || 0;
    }

    list.innerHTML = selectedItems.map((item, idx) => {
        const subtotal = item.cantidad * item.precio_unitario;
        return `
            <div class="item-selected-row">
                <span class="qty-badge">${item.cantidad}</span>
                <div class="item-name-col">
                    <h5>${item.nombre}</h5>
                    <span>${item.type === 'caja' ? 'Caja mixta' : 'Chocolate simple'}</span>
                </div>
                <div class="item-price-col">$${subtotal.toFixed(2)}</div>
                <button class="btn-remove" onclick="removeSelectedItem(${idx})">🗑️</button>
            </div>
        `;
    }).join('');

    totalEl.innerText = `$ ${total.toFixed(2)}`;
}

window.removeSelectedItem = (idx) => {
    selectedItems.splice(idx, 1);
    renderSelectedItems();
};

async function savePedido() {
    const data = {
        destinatario: document.getElementById('ped-destinatario').value,
        telefono: document.getElementById('ped-telefono').value,
        direccion: document.getElementById('ped-direccion').value,
        fecha_entrega: document.getElementById('ped-fecha').value,
        con_envio: document.getElementById('ped-envio').checked ? 1 : 0,
        costo_envio: document.getElementById('ped-envio').checked ? parseFloat(document.getElementById('ped-costo-envio').value) : 0,
        plataforma: document.getElementById('ped-plataforma').value,
        notas: '',
        estado: 'pendiente'
    };

    if (!data.destinatario || !data.fecha_entrega || selectedItems.length === 0) {
        alert("¡Faltan datos! Completa destinatario, fecha y agrega ítems.");
        return;
    }

    if (data.con_envio && !data.direccion) {
        alert("Si hay envío, la dirección es obligatoria.");
        return;
    }

    const items = selectedItems.map(i => ({
        tipo_item: i.type,
        producto_id: i.type === 'producto' ? i.id : null,
        caja_id: i.type === 'caja' ? i.id : null,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario
    }));

    try {
        await db.crearPedido(data, items);
        window.location.hash = 'pedidos';
    } catch (e) {
        alert("Error al guardar pedido: " + e.message);
    }
}
