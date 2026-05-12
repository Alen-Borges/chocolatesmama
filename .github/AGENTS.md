# AGENTS.md — Prueba Técnica Frontend (Angular)

This file defines general guidance for all AI agents working in this repository, following the **ASDD (Agent Spec Software Development)** workflow.

## Project Summary

- **Frontend**: Angular 14+ (standalone o módulos)
- **Lenguaje**: TypeScript 4.8+
- **Backend local**: Node.js API en `http://localhost:3002` (ya proporcionado)
- **Estilos**: Vanilla CSS / SCSS — **sin frameworks** (no Bootstrap, no Material, no Tailwind)
- **Testing**: Jest (preferido) con coverage ≥ 70%
- **Architecture**: Servicios → Componentes → Rutas (Angular Router)

## Seniority Target: Senior

Funcionalidades requeridas: **F1, F2, F3, F4, F5, F6** + rendimiento + Skeletons + Responsive.

## ASDD Workflow

**Every new feature must follow this pipeline:**

```
[FASE 1 — Secuencial]
spec-generator     → /generate-spec      → .github/specs/<feature>.spec.md

[FASE 2 — Solo Frontend]
frontend-developer → Angular components / services / pipes / routing

[FASE 3 — Tests]
test-engineer-frontend → src/app/**/*.spec.ts (Jest)

[FASE 4 — Secuencial]
qa-agent           → Gherkin, riesgos, validación visual
```

## API Backend (local — no modificar)

| Method | URL | Descripción |
|--------|-----|-------------|
| GET | `/bp/products` | Lista todos los productos |
| POST | `/bp/products` | Crea un producto |
| PUT | `/bp/products/:id` | Actualiza un producto |
| DELETE | `/bp/products/:id` | Elimina un producto |
| GET | `/bp/products/verification/:id` | Verifica si un id ya existe |

Base URL: `http://localhost:3002`

## Modelo Producto Financiero

```typescript
interface Product {
  id: string;          // 3-10 chars, único
  name: string;        // 5-100 chars
  description: string; // 10-200 chars
  logo: string;        // URL
  date_release: string; // ISO date — >= hoy
  date_revision: string; // exactamente 1 año después de date_release
}
```

## Critical Rules for All Agents

1. **No frameworks CSS** — vanilla CSS/SCSS únicamente.
2. **Pruebas con Jest** — cobertura mínima 70%.
3. **Manejo de errores** — mostrar mensajes visuales al usuario.
4. **No implementation without a spec.** — leer `.github/specs/` primero.
5. **Clean Code + SOLID** — separación de responsabilidades.
6. **Responsive design** — diseño adaptable a mobile/desktop.

---
> Last update: 2026-05-10 - Stack adaptado para Prueba Técnica Frontend Angular.
