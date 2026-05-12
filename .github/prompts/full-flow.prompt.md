---
description: 'Orquesta el flujo completo ASDD adaptado para prueba técnica Angular: Spec → Frontend Developer → Tests (Jest) → QA. No hay backend propio — consume API en localhost:3002.'
agent: Orchestrator
---

Inicia el flujo completo ASDD para la prueba técnica Angular.

**Feature**: ${input:featureName:nombre del feature en kebab-case (ej: product-list, product-form)}
**Funcionalidades**: ${input:features:F1, F2, F3, F4, F5, F6 — separadas por coma según seniority}

**El @Orchestrator ejecuta automáticamente:**

1. **[FASE 1 — Secuencial]** `Spec Generator` → genera `.github/specs/${input:featureName}.spec.md`
   - Incluye criterios de aceptación Gherkin, modelo de datos Angular, diseño de componentes
2. **[FASE 2 — Secuencial]** al aprobar la spec:
   - `Frontend Developer` → implementa `src/app/` (Angular 14+, vanilla CSS/SCSS, ReactiveFormsModule)
3. **[FASE 3 — Secuencial]** al completar implementación:
   - `Test Engineer Frontend` → genera `src/app/**/*.spec.ts` (Jest, coverage ≥ 70%)
4. **[FASE 4]** `QA Agent` → Gherkin, estrategia de pruebas, riesgos
5. **[FASE 5 — Opcional]** `Documentation Agent` → si el usuario lo solicita

**Consideraciones especiales de esta prueba:**
- API ya provista en `http://localhost:3002` — NO implementar backend
- Sin frameworks CSS: vanilla CSS/SCSS únicamente
- Tests con Jest — cobertura mínima **70%** obligatoria
- Features según seniority: Junior (F1-F3), SemiSenior (F1-F4/F5), Senior (F1-F6)
