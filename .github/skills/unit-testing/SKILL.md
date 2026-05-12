---
name: unit-testing
description: Genera tests unitarios Jest para Angular (servicios, componentes, pipes). Lee la spec y el código implementado. Requiere spec APPROVED e implementación completa.
argument-hint: "<nombre-feature> [servicio|componente|pipe|todo]"
---

# Unit Testing (Angular + Jest)

## Definition of Done — verificar al completar

- [ ] Cobertura ≥ **70%** en statements, branches, functions, lines (quality gate bloqueante)
- [ ] Tests aislados — sin llamadas HTTP reales (`HttpClientTestingModule` siempre)
- [ ] Escenario feliz + errores de red + validaciones de entrada cubiertos
- [ ] Los cambios no rompen contratos existentes del módulo

## Prerequisito — Lee en paralelo

```
.github/specs/<feature>.spec.md        (criterios de aceptación, reglas de negocio)
src/app/core/services/                  (código de servicios implementado)
src/app/features/<feature>/             (código de componentes implementado)
src/app/shared/pipes/                   (pipes implementados)
jest.config.js                          (configuración de cobertura)
```

## Output por scope

### Servicios → `src/app/core/services/*.spec.ts`

| Test | Cubre |
|------|-------|
| `getProducts — success` | 200 + estructura de datos |
| `getProducts — error` | Error de red |
| `createProduct — success` | POST 200 |
| `createProduct — 400` | Error de validación |
| `updateProduct — success` | PUT 200 |
| `updateProduct — 404` | No encontrado |
| `deleteProduct — success` | DELETE 200 |
| `deleteProduct — 404` | No encontrado |
| `verifyId — true` | ID ya existe |
| `verifyId — false` | ID disponible |

### Componentes → `src/app/features/<feature>/*.spec.ts`

| Test | Cubre |
|------|-------|
| `should create` | Render sin errores |
| `should load products on init` | ngOnInit llama al servicio |
| `should filter products by search term` | F2 |
| `should change page size` | F3 |
| `should open delete modal` | F6 |
| `should navigate to edit` | F5 |
| `should show error message on API fail` | Error handling |
| `should show loading skeleton` | Loading state |

### Formulario → `src/app/features/product-form/*.spec.ts`

| Test | Cobre |
|------|-------|
| `id — required error` | Campo vacío |
| `id — minLength error` | < 3 chars |
| `id — maxLength error` | > 10 chars |
| `id — idExists async error` | ID ya existe en API |
| `name — required, min/max` | Validaciones |
| `description — required, min/max` | Validaciones |
| `logo — required` | Campo vacío |
| `date_release — past date error` | Fecha < hoy |
| `date_revision — not 1 year after` | Fecha inválida |
| `should reset form on Reiniciar` | F4 reset |
| `should emit on valid submit` | Submit exitoso |

### Pipes → `src/app/shared/pipes/*.spec.ts`

| Test | Cubre |
|------|-------|
| `should return all items for empty query` | Sin búsqueda |
| `should filter case-insensitively` | F2 |
| `should return empty array for no matches` | Sin resultados |
| `should handle null/empty list` | Edge case |

## Patrón de Test Estándar (Angular TestBed + Jest)

```typescript
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
    // ARRANGE
    const mockResponse = { data: [{ id: '1', name: 'Test' }] };
    // ACT
    service.getProducts().subscribe(res => {
      // ASSERT
      expect(res.data).toHaveLength(1);
    });
    httpMock.expectOne('http://localhost:3002/bp/products').flush(mockResponse);
  });
});
```

## Restricciones

- Solo `*.spec.ts`. No modificar código fuente.
- Nunca conectar a HTTP real — siempre `HttpClientTestingModule`.
- Cobertura mínima ≥ **70%** — verificar con `npx jest --coverage`.
- Verificar con: `npx jest --coverage --coverageReporters=text-summary`
