import 'jeep-sqlite';
import { initDB } from './db.js';
import { handleNavigation } from './router.js';

// Import modules to register listeners
import './productos.js';
import './producto-form.js';
import './produccion.js';
import './pedidos.js';
import './caja-form.js';
import './pedido-form.js';
import './pedido-detalle.js'; // Added missing pedios module

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded. Starting App...');
    
    // Initialize DB first
    try {
        await initDB();
        console.log('Database Ready.');
        
        // After DB is ready, handle initial navigation
        await handleNavigation();
    } catch (e) {
        console.error('CRITICAL: Failed to initialize App:', e);
        document.getElementById('app-container').innerHTML = `
            <div style="padding: 24px; color: red;">
                <h3>Error de Sistema</h3>
                <p>${e.message}</p>
                <button onclick="location.reload()">Reintentar</button>
            </div>
        `;
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleNavigation);
});
