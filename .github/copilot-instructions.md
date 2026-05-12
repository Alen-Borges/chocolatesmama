# Copilot Instructions — App de Chocolates (Vanilla JS)

## ASDD Workflow (Agent Spec Software Development)

Este repositorio sigue el flujo **ASDD** adaptado para una aplicación móvil nativa con **Capacitor** y **Vanilla JS**.

```
[Orchestrator] → [Spec Generator] → [Database Agent] → [Frontend Developer] → [QA]
```

### Fases del flujo ASDD
1. **Spec**: El agente `spec-generator` genera la spec en `.github/specs/<feature>.spec.md`.
2. **DB**: El agente `database-agent` implementa las queries SQL y migraciones en `www/js/db.js`.
3. **Frontend**: El agente `frontend-developer` implementa la vista (HTML), lógica (JS) y estilos (CSS) en `www/`.
4. **Validación**: Sincronización con Capacitor `npx cap sync`.

---

## Estructura de Carpetas

- `www/`: Código fuente de la app.
- `www/index.html`: Punto de entrada único (SPA).
- `www/views/`: Fragmentos HTML de las vistas.
- `www/js/db.js`: **Único** lugar para queries SQL.
- `www/js/router.js`: Manejo de navegación entre vistas.
- `android/`: Proyecto nativo (NO TOCAR MANUALMENTE).

---

## Skills disponibles (slash commands):
- `/asdd-orchestrate` — Orquesta el flujo completo ASDD.
- `/generate-spec` — Genera spec técnica en `.github/specs/`.
- `/db-query` — Implementa o modifica queries en `www/js/db.js`.
- `/implement-view` — Implementa una vista HTML5/JS/CSS.
- `/cap-sync` — Ejecuta `npx cap sync`.

---

## Reglas de Oro

1. **JS Vanilla Puro**: Sin frameworks, sin compiladores, sin TypeScript.
2. **Base de Datos SQLite**: Uso exclusivo de `@capacitor-community/sqlite`. Prohibido `localStorage`.
3. **Aislamiento SQL**: Toda query SQL debe estar en `db.js`.
4. **Navegación SPA**: La navegación se hace mediante `fetch()` de archivos en `www/views/` e inserción en el DOM.
5. **Capacitor v6**: Seguir convenciones de Capacitor para plugins nativos.
6. **Mobile First**: Diseño optimizado para Android.

---

## Diccionario de Dominio

| Término | Definición | Contexto Técnico |
|---------|-----------|------------------|
| **Vista** | Fragmento de HTML en `www/views/` | Cargado vía `fetch` |
| **Módulo JS** | Lógica de una pantalla en `www/js/` | Archivo JS dedicado |
| **db.js** | Capa de persistencia SQLite | Queries SQL centralizadas |
| **Router** | Lógica de cambio de pantalla | Manipulación de `location.hash` o similar |
| **Sync** | Sincronización Capacitor | `npx cap sync` |
| **Capacitor SQLite** | Plugin de BD nativa | `@capacitor-community/sqlite` |

---

## Esquema SQLite (Resumen)

- `productos`: chocolate, tipo, forma, peso, precio.
- `cajas`: nombre, forma, empaque, precio.
- `pedidos`: destinatario, fecha, total, con_envio.
- `pedido_items`: relación pedido -> (producto o caja).

---
> Last update: 2026-05-11 - Adaptado para App de Chocolates.
