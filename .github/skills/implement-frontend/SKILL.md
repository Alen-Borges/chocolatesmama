---
name: implement-frontend
description: Implementa un feature completo en Angular. Requiere spec con status APPROVED en .github/specs/.
argument-hint: "<nombre-feature>"
---

# Implement Frontend (Angular)

## Prerequisitos
1. Lee spec: `.github/specs/<feature>.spec.md` — secciones de requerimientos, diseño y lista de tareas
2. Lee stack: `.github/instructions/frontend.instructions.md`
3. Lee el contexto: `.github/copilot-instructions.md`

## Orden de implementación
```
models → services → pipes → components → routing
```

| Capa | Responsabilidad |
|------|-----------------|
| **Models** | Interface TypeScript (ej: `Product`) — sin lógica |
| **Services** | `HttpClient` + `catchError` — sin estado UI |
| **Pipes** | Transformaciones puras (filtros, formato) |
| **Components** | Template HTML + SCSS + lógica de componente |
| **Routing** | Registrar ruta en `app-routing.module.ts` |

## Patrones obligatorios

- **Estilos**: Vanilla CSS/SCSS por componente — **sin frameworks externos**
- **Formularios**: `ReactiveFormsModule` únicamente
- **API URL**: Siempre desde `src/environments/environment.ts`
- **Error handling**: `catchError` en el servicio, mensaje visual en el componente
- **Loading state**: Variable `loading: boolean` + skeleton screen mientras carga
- **Responsive**: Usar CSS Flexbox/Grid, sin breakpoints hardcodeados

## Validaciones de Formulario (F4 / F5)

```typescript
// Validator personalizado: fecha_revision = fecha_release + 1 año
export function reviseDateValidator(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent;
  if (!parent) return null;
  const release = new Date(parent.get('date_release')?.value);
  const revision = new Date(control.value);
  const expected = new Date(release);
  expected.setFullYear(expected.getFullYear() + 1);
  return revision.toISOString().slice(0, 10) === expected.toISOString().slice(0, 10) 
    ? null : { invalidReviseDate: true };
}

// AsyncValidator: verificar si el ID ya existe
export class IdNotExistsValidator {
  static createValidator(productService: ProductService): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return productService.verifyId(control.value).pipe(
        map(exists => exists ? { idExists: true } : null),
        catchError(() => of(null))
      );
    };
  }
}
```

## Estructura de Archivos esperada

```
src/app/
  core/
    models/product.model.ts
    services/product.service.ts
  shared/
    components/
      skeleton-loader/
      confirm-modal/
    pipes/search-filter.pipe.ts
  features/
    product-list/
      product-list.component.ts
      product-list.component.html
      product-list.component.scss
    product-form/
      product-form.component.ts
      product-form.component.html
      product-form.component.scss
  app-routing.module.ts
  environments/
    environment.ts     ← { apiUrl: 'http://localhost:3002' }
```

## Restricciones
- Solo `src/app/`. No tocar la API del backend.
- No generar tests (responsabilidad de `test-engineer-frontend`).
- No usar `any` en TypeScript — tipar siempre correctamente.
