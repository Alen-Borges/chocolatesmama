---
name: frontend-task
description: Implementa una funcionalidad en el frontend Angular basada en una spec ASDD aprobada. Sin frameworks CSS.
argument-hint: "<nombre-feature> (debe existir .github/specs/<nombre-feature>.spec.md)"
agent: Frontend Developer
tools:
  - edit/createFile
  - edit/editFiles
  - read/readFile
  - search/listDirectory
  - search
  - execute/runInTerminal
---

Implementa el feature Angular especificado, siguiendo la spec aprobada y las reglas del proyecto.

**Feature**: ${input:featureName:nombre del feature en kebab-case}

## Pasos obligatorios:

1. **Lee la spec** en `.github/specs/${input:featureName:nombre-feature}.spec.md` — si no existe, detente e informa al usuario.
2. **Lee las instrucciones** en `.github/instructions/frontend.instructions.md`.
3. **Revisa el código existente** en `src/app/` para entender patrones actuales y evitar duplicados.
4. **Implementa en orden**:
   - `src/app/core/models/` — interface TypeScript del dominio (si aplica)
   - `src/app/core/services/` — servicio con `HttpClient` (si aplica)
   - `src/app/shared/pipes/` — pipe de filtrado (si aplica)
   - `src/app/features/<feature>/` — componente con template HTML y SCSS
5. **Registra la ruta** en `src/app/app-routing.module.ts`.
6. **Verifica** el build: `ng build --configuration=development`

## Restricciones:
- USAR vanilla CSS/SCSS exclusivamente — **sin Bootstrap, Tailwind ni Angular Material**.
- API URL siempre desde `src/environments/environment.ts`.
- Manejo de errores: `catchError` en el servicio + mensaje visual en el componente.
- Skeleton loading mientras cargan los datos.
- Formularios con `ReactiveFormsModule` — no Template-driven forms.
