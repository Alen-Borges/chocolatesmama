# AGENTS.md — App de Chocolates (Capacitor + Vanilla JS)

This file defines general guidance for all AI agents working in this repository, following the **ASDD (Agent Spec Software Development)** workflow adapted for a mobile-first vanilla application.

## Project Summary

- **Target**: Android (Capacitor v6)
- **UI**: HTML5 + CSS3 + JavaScript Vanilla (Pure JS, no frameworks like React/Angular/Vue).
- **Database**: SQLite via `@capacitor-community/sqlite` (Native storage).
- **Navigation**: SPA architecture. One `index.html`, views loaded from `www/views/` via `fetch()` and injected into `innerHTML`.
- **Logic**: Vanilla JS, one file per module/screen in `www/js/`.
- **Database Logic**: **CRITICAL** - All SQL queries MUST live in `www/js/db.js`. Nowhere else.
- **Tools**: Node.js + npm + Android SDK (via Android Studio).

## Seniority Target: Senior

Focused on performance, native-like feel, robust offline storage (SQLite), and clean vanilla JS architecture.

## ASDD Workflow

**Every new feature must follow this pipeline:**

```
[FASE 1 — Spec]
spec-generator     → Generar spec técnica en .github/specs/<feature>.spec.md

[FASE 2 — Base de Datos]
database-agent     → Definir/Actualizar esquema y queries en www/js/db.js

[FASE 3 — Frontend]
frontend-developer → Implementar HTML views, logic en js/ y estilos en css/

[FASE 4 — Sincronización]
orchestrator       → Ejecutar "npx cap sync" y "npx cap run android" para validar

[FASE 5 — QA & Tests]
qa-agent           → Validar flujos de usuario, persistencia SQLite y UI responsive.
```

## Database Schema (Source of Truth)

Refer to the main SQLite schema defined in the project documentation for table details:
- `productos`: chocolate metadata and pricing.
- `cajas`: boxes metadata.
- `caja_productos`: N:M relation between boxes and chocolates.
- `pedidos`: order metadata (destinatario, entrega, envio).
- `pedido_items`: items in an order (products or boxes).

## Critical Rules for All Agents

1. **Vanilla Only**: No Angular, No React, No Vue, No TypeScript. Pure JS/HTML/CSS.
2. **Offline Only (SQLite)**: No localStorage, No sessionStorage, No Backend API.
3. **DB Isolation**: SQL queries ONLY in `db.js`.
4. **Capacitor Commands**:
   - Sync: `npx cap sync`
   - Run: `npx cap run android`
5. **No implementation without a spec**: Read `.github/specs/` first.
6. **Mobile First**: Design for Android interface.

---
> Last update: 2026-05-11 - Stack adaptado para App de Chocolates.
