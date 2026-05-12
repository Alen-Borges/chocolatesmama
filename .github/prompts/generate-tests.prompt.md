---
name: generate-tests
description: Genera pruebas unitarias Jest para Angular (servicios, componentes, pipes). Cobertura mínima 70%.
argument-hint: "<nombre-feature> [componente|servicio|pipe|todo (default)]"
agent: Test Engineer Frontend
tools:
  - edit/createFile
  - edit/editFiles
  - read/readFile
  - search/listDirectory
  - search
  - execute/runInTerminal
---

# Task: Generar Tests Jest para Angular

Genera la suite de pruebas unitarias para el feature implementado en Angular.

## Lineamientos
- **Framework**: Jest + `jest-preset-angular` + Angular `TestBed`.
- **Estilo**: AAA (Arrange / Act / Assert) con nombres descriptivos `should [acción] when [condición]`.
- **Aislamiento**: Mockear siempre `HttpClient` (usar `HttpClientTestingModule`), `Router`, y cualquier servicio externo.

**Feature**: ${input:featureName:nombre del feature en kebab-case}
**Scope**: ${input:scope:componente, servicio, pipe, o todo (default)}

## Pasos obligatorios:

1. **Lee la spec** en `.github/specs/${input:featureName:nombre-feature}.spec.md` — sección de validaciones y criterios de aceptación.
2. **Lee el código implementado** en `src/app/features/${input:featureName}/` y `src/app/core/services/`.
3. **Genera los tests** según el scope:

### Si scope es "servicio" o "todo":
```
src/app/core/services/product.service.spec.ts
```
- GET productos (200), error de red
- POST crear (200), error validación (400)  
- PUT actualizar (200), no encontrado (404)
- DELETE eliminar (200), no encontrado (404)
- GET verificación (true/false)

### Si scope es "componente" o "todo":
```
src/app/features/<feature>/<feature>.component.spec.ts
```
- Render inicial
- Interacciones (filtrar, paginar, abrir modal)
- Validaciones de formulario por campo
- Estados de error y carga

### Si scope es "pipe" o "todo":
```
src/app/shared/pipes/search-filter.pipe.spec.ts
```
- Filtrado exacto, case-insensitive, sin resultados

4. **Verifica** que los tests corren: `npx jest --coverage`
5. **Chequea** cobertura ≥ 70% en el reporte.

## Restricciones:
- Solo archivos `*.spec.ts`. No modificar el código fuente.
- `HttpClientTestingModule` siempre — no llamadas HTTP reales.
- Cada test con al menos un `expect()`.
- Limpiar mocks en `afterEach` donde aplique.
