const container = document.getElementById('app-container');
const pageTitle = document.getElementById('page-title');

const routes = {
    'productos': { title: 'Productos', view: 'productos.html' },
    'pedidos': { title: 'Pedidos', view: 'pedidos.html' },
    'produccion': { title: 'Producción', view: 'produccion.html' },
    'nuevo-producto': { title: 'Nuevo Chocolate', view: 'producto-form.html' },
    'nuevo-pedido': { title: 'Nuevo Pedido', view: 'pedido-form.html' },
    'nueva-caja': { title: 'Nueva Caja', view: 'caja-form.html' },
    'pedido-detalle': { title: 'Detalle de Pedido', view: 'pedido-detalle.html' }
};

export async function handleNavigation() {
    let hash = window.location.hash.substring(1) || 'productos';
    
    // Parse params if any (e.g. #pedido-detalle?id=1)
    let params = {};
    if (hash.includes('?')) {
        const parts = hash.split('?');
        hash = parts[0];
        const urlParams = new URLSearchParams(parts[1]);
        params = Object.fromEntries(urlParams.entries());
    }

    const route = routes[hash] || routes['productos'];

    // Update Title
    pageTitle.innerText = route.title;

    // Update Nav Active State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${hash}`);
    if (activeNav) activeNav.classList.add('active');

    // Fetch and Inject View
    try {
        console.log(`Navigating to: views/${route.view}`);
        const response = await fetch(`views/${route.view}`);
        if (!response.ok) throw new Error(`View not found: views/${route.view}`);
        const html = await response.text();
        container.innerHTML = `<div class="animate-in">${html}</div>`;

        // Load View Logic
        loadModule(hash, params);
    } catch (err) {
        console.error('Navigation Error:', err);
        container.innerHTML = `<div class="error" style="padding: 20px; color: red;">Error cargando vista: ${err.message}</div>`;
    }
}

async function loadModule(hash, params) {
    // Dynamically import logical modules if needed, or trigger events
    // For simplicity in vanilla, we can use custom events
    const event = new CustomEvent('viewLoaded', { detail: { view: hash, params } });
    document.dispatchEvent(event);
}
