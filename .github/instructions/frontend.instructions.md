---
applyTo: "www/**/*.{html,js,css}"
---

> **Scope**: Se aplica a proyectos Vanilla JS + Capacitor. Sin frameworks (no React, no Angular, no Vue).

# Instrucciones para Archivos de Frontend (Vanilla JS)

## Convenciones Obligatorias

- **Navegación SPA**: La aplicación es una Single Page Application. El punto de entrada es `index.html`. Las vistas se cargan dinámicamente desde `www/views/` usando `fetch()` e inyectándolas en un contenedor principal.
- **JS Vanilla**: Escribir JavaScript puro (ES6+). Evitar librerías externas a menos que sean plugins de Capacitor oficiales.
- **CSS3 Vanilla**: Usar CSS nativo. Se permite (y recomienda) el uso de variables CSS (`--primary-color`), Flexbox y Grid. **PROHIBIDO** usar Tailwind, Bootstrap o Material.
- **Nombres**: 
  - Archivos: `snake_case` (ej: `ver_producto.js`).
  - Funciones: `camelCase` (ej: `obtenerProductos`).
- **Aislamiento de Datos**: **NUNCA** escribir queries SQL en archivos de vista o controladores JS. Usar siempre las funciones exportadas de `www/js/db.js`.
- **Manejo de Errores**: Siempre envolver operaciones asíncronas en `try/catch` y mostrar feedback visual al usuario (modales, toasts o mensajes en el DOM).

## Estructura de Archivos (www/)

```
www/
  index.html            ← Layout base (header, footer, main-container)
  css/
    main.css            ← Estilos globales, variables y utilitarios
  js/
    router.js           ← Lógica de navegación (fetch + innerHTML)
    db.js               ← Único lugar para queries SQLite (Capacitor)
    app.js              ← Inicialización de la app y Capacitor
    productos.js        ← Controlador para la vista de productos
    pedidos.js          ← Controlador para la vista de pedidos
  views/
    productos.html      ← Fragmento HTML (sin head ni body)
    pedidos.html        ← Fragmento HTML (sin head ni body)
```

## Ejemplo de Navegación

```javascript
// router.js
export async function cargarVista(vista) {
    try {
        const response = await fetch(`./views/${vista}.html`);
        const html = await response.text();
        document.getElementById('content').innerHTML = html;
        // Reinicializar lógica específica de la vista
    } catch (error) {
        console.error("Error cargando vista:", error);
    }
}
```

## Ejemplo de Acceso a Datos

```javascript
// productos.js
import { obtenerProductos } from './db.js';

async function init() {
    const lista = await obtenerProductos();
    renderizarLista(lista);
}
```

## Nunca hacer

- Usar `localStorage` o `sessionStorage` (Usar SQLite).
- Escribir `SELECT * FROM ...` fuera de `db.js`.
- Usar frameworks CSS.
- Crear múltiples archivos HTML con estructura completa (usar el patrón SPA).
- Olvidar sincronizar con Capacitor: `npx cap sync`.
