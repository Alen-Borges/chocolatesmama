---
applyTo: "src/app/**/*.spec.ts"
---

> **Scope**: Pruebas unitarias para Angular con Jest. Cobertura mínima obligatoria: **70%**.

# Instrucciones para Archivos de Pruebas (Angular + Jest)

## Principios

- **Independencia**: Cada test es 100% independiente — no compartir estado entre `it()`.
- **Aislamiento**: Mockear siempre dependencias externas (HttpClient, Router, servicios).
- **Cobertura**: Cubrir happy path, error path y edge cases. Cobertura ≥ **70%** (requisito de la prueba técnica).
- **Legibilidad**: Nombres descriptivos: `should [acción] when [condición]`.

## Setup Jest en Angular

Usar `jest-preset-angular` con `TestBed` de Angular.

```typescript
// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterFramework: ['<rootDir>/setup-jest.ts'],
  coverageThreshold: {
    global: { lines: 70, functions: 70, branches: 70, statements: 70 }
  }
};
```

## Estructura de Archivos de Test

```
src/app/
  core/services/
    product.service.spec.ts       ← Tests del servicio HTTP
  features/product-list/
    product-list.component.spec.ts ← Tests del componente lista
  features/product-form/
    product-form.component.spec.ts ← Tests del formulario (validaciones)
  shared/pipes/
    search-filter.pipe.spec.ts    ← Tests del pipe de búsqueda
```

## Tests de Servicios (HttpClient mock)

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should get products successfully', () => {
    // GIVEN
    const mockData = { data: [{ id: '1', name: 'Test', description: 'Desc', logo: 'logo.png', date_release: '2025-01-01', date_revision: '2026-01-01' }] };
    // WHEN
    service.getProducts().subscribe(res => {
      // THEN
      expect(res.data.length).toBe(1);
    });
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should handle HTTP error gracefully', () => {
    service.getProducts().subscribe({
      error: (err) => expect(err).toBeTruthy()
    });
    httpMock.expectOne('http://localhost:3002/bp/products').error(new ErrorEvent('Network error'));
  });
});
```

## Tests de Componentes (TestBed)

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../core/services/product.service';
import { of, throwError } from 'rxjs';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceMock: jest.Mocked<ProductService>;

  beforeEach(async () => {
    productServiceMock = {
      getProducts: jest.fn().mockReturnValue(of({ data: [] })),
      deleteProduct: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [ProductListComponent],
      providers: [{ provide: ProductService, useValue: productServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    expect(productServiceMock.getProducts).toHaveBeenCalled();
  });
});
```

## Tests de Formularios Reactivos (Validaciones)

```typescript
it('should mark id as invalid if less than 3 chars', () => {
  component.form.get('id')?.setValue('ab');
  expect(component.form.get('id')?.hasError('minlength')).toBeTruthy();
});

it('should mark date_revision as invalid if not exactly 1 year after date_release', () => {
  component.form.get('date_release')?.setValue('2025-01-01');
  component.form.get('date_revision')?.setValue('2025-06-01');
  expect(component.form.get('date_revision')?.errors).toBeTruthy();
});
```

## Tests de Pipes

```typescript
it('should filter products by name', () => {
  const pipe = new SearchFilterPipe();
  const products = [{ name: 'Visa' }, { name: 'MasterCard' }];
  expect(pipe.transform(products, 'visa')).toEqual([{ name: 'Visa' }]);
});
```

## Cobertura Mínima por Capa

| Capa | Escenarios obligatorios |
|------|------------------------|
| **Services** | GET lista, POST crear, PUT actualizar, DELETE, GET verificación, error HTTP |
| **Components** | Render inicial, filtrado, paginación, navegación, apertura de modal |
| **Form Component** | Validaciones por campo, envío válido, reset, error de ID existente |
| **Pipes** | Filtrado por nombre, búsqueda vacía, búsqueda sin resultados |

## Restricciones

- SÓLO en archivos `*.spec.ts` — nunca tocar el código fuente.
- Mockear SIEMPRE dependencias externas (HttpClient, Router).
- NO hacer llamadas HTTP reales en tests (usar `HttpClientTestingModule`).
- Cobertura mínima ≥ **70%** (bloqueante para entrega).

---

> Convención de nombres Jest: `describe('[Clase]')` + `it('should [acción] when [condición]')`.
