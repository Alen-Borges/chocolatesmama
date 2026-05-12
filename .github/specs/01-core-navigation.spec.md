# Spec: Core App Structure & Navigation
**Status**: APPROVED

## Context
La aplicación de chocolates es una herramienta móvil nativa (Capacitor) para uso administrativo offline. Requiere una estructura sólida de Single Page Application (SPA) para garantizar fluidez sin recargas de página.

## Requerimientos Funcionales
- Barra de navegación inferior con tres secciones principales: **Productos**, **Pedidos** y **Producción**.
- Estructura de layout centralizada en `index.html`.
- Sistema de ruteo basado en fragmentos HTML cargados dinámicamente.
- Persistencia de estado de navegación (activar icono correspondiente en la barra nav).
- La sección Productos debe tener subnavegación interna (tabs) para cambiar entre Productos simples y Cajas.

## Arquitectura (SPA)
- **Container**: `<main id="app-container">` en `index.html`.
- **Router Logic**: `www/js/router.js` interceptará cambios de vista y manejará el historial del navegador.
- **Views**: Archivos `.html` en `www/views/` (fragmentos sin `<body>`).
- **Controladores**: Un archivo `.js` en `www/js/` por cada módulo/pantalla.

## Modelo de Datos (Navegación)
No requiere persistencia en SQLite, pero se debe manejar el historial del navegador para que el botón "atrás" de Android funcione.

## Acciones (JS)
- `router.navigateTo(viewName)`: Carga el HTML vía `fetch` e inyecta en el container. Actualiza historial.
- `router.init()`: Escucha eventos de carga inicial, navegación y el evento `popstate` para manejar el botón Atrás.

## UI/UX (Layout Base)
- **Header**: Nombre de la sección actual.
- **Content Area**: Scrollable.
- **Bottom Nav**: 3 iconos con etiquetas (Fixed position).
  - Icono 1: Productos (Catálogo)
  - Icono 2: Pedidos (Lista)
  - Icono 3: Producción (Fábrica)

## Criterios de Aceptación
- **Scenario**: Navegar entre secciones
  - **Given** que estoy en la pantalla de "Productos"
  - **When** toco el icono de "Pedidos" en la barra inferior
  - **Then** el contenido central debe cambiar a la vista de pedidos sin recargar la página
  - **And** el icono de "Pedidos" debe resaltarse.

- **Scenario**: Botón atrás de Android
  - **Given** que navegué de "Productos" a "Pedidos"
  - **When** presiono el botón "atrás" del sistema (evento popstate)
  - **Then** la app debe volver a mostrar la sección de "Productos".

- **Scenario**: Subnavegación en Productos
  - **Given** que estoy en la sección de "Productos"
  - **When** veo el encabezado
  - **Then** debo ver Tabs o un Submenú para alternar entre "Productos Simples" y "Cajas".
