---
applyTo: "src/app/**/*.{ts,html,scss,css}"
---

> **Scope**: Se aplica a proyectos Angular 14+. Sin frameworks de estilos externos (vanilla CSS/SCSS únicamente).

# Instrucciones para Archivos de Frontend (Angular 14+ / TypeScript)

## Convenciones Obligatorias

- **Componentes**: Componentes funcionales con `@Component`. Standalone components si el proyecto usa Angular 14+.
- **CSS/SCSS**: SIEMPRE vanilla CSS o SCSS con archivos independientes por componente. **NUNCA** usar Bootstrap, Tailwind, Angular Material ni estilos en línea para lógica compleja.
- **Nombres**: `kebab-case` para carpetas y archivos (`product-list/product-list.component.ts`), PascalCase para clases (`ProductListComponent`), camelCase para propiedades y métodos.
- **Reactive Forms**: Usar `ReactiveFormsModule` (`FormGroup` + `FormControl` + `Validators`) para todos los formularios con validaciones.
- **HttpClient**: Toda comunicación HTTP debe estar en servicios (`@Injectable`). Nunca llamar `HttpClient` directamente desde un componente.
- **Variables de entorno**: Usar `src/environments/environment.ts` para la URL base de la API.
- **Error handling**: Usar `catchError` con RxJS. Mostrar mensajes visuales al usuario — jamás silenciar errores.

## Estructura de Archivos

```
src/
  app/
    core/
      services/
        product.service.ts       ← Llamadas HTTP a la API de productos
      models/
        product.model.ts         ← Interface Product
    shared/
      components/                ← Componentes reutilizables (spinner, modal, etc.)
      pipes/
        search-filter.pipe.ts    ← Pipe de búsqueda
    features/
      product-list/
        product-list.component.ts
        product-list.component.html
        product-list.component.scss
      product-form/
        product-form.component.ts
        product-form.component.html
        product-form.component.scss
    app-routing.module.ts        ← Rutas de la aplicación
    app.module.ts                ← Módulo raíz (o app.component.ts si standalone)
  environments/
    environment.ts               ← { apiUrl: 'http://localhost:3002' }
```

## Llamadas a la API Backend

Usar siempre **HttpClient** dentro de servicios. El backend está en `http://localhost:3002`.

```typescript
// core/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = `${environment.apiUrl}/bp/products`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<{ data: Product[] }> {
    return this.http.get<{ data: Product[] }>(this.baseUrl);
  }
}
```

## Formularios Reactivos

```typescript
this.form = this.fb.group({
  id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
  name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
  // ...
});
```

## Rutas (Angular Router)

Las rutas se definen en `app-routing.module.ts`. F4, F5 usan rutas separadas (`/add`, `/edit/:id`).

## Nunca hacer

- Llamar a `HttpClient` directamente desde un componente.
- Usar frameworks CSS (Bootstrap, Material, Tailwind).
- Lógica de negocio/validación en los templates HTML — usar el componente o servicios.
- Mostrar datos sin manejar estados de carga (loading) y error.

---

> Para estándares de testing, ver `.github/instructions/tests.instructions.md`.
