---
id: SPEC-002
status: APPROVED
feature: product-form
created: 2026-05-10
updated: 2026-05-10
author: spec-generator
version: "1.0"
related-specs:
  - product-list.spec.md
  - product-delete.spec.md
---

# Spec: Formulario de Agregar y Editar Producto Financiero

> **Estado:** `DRAFT` → aprobar con `status: APPROVED` antes de iniciar implementación.
> **Ciclo de vida:** DRAFT → APPROVED → IN_PROGRESS → IMPLEMENTED → DEPRECATED

---

## 1. REQUERIMIENTOS

### Descripción
Formulario Angular reactivo para crear (F4) y editar (F5) productos financieros. Accesible desde la vista de listado mediante el botón "Agregar" o el menú contextual (dropdown) por producto. Incluye validaciones estrictas por campo — con feedback visual inmediato — y un validador asíncrono para verificar unicidad del ID contra la API.

### Requerimiento de Negocio
- **F4**: Formulario de registro de producto con botones "Agregar" y "Reiniciar". Validaciones por campo. Maquetación según **Diseño D2**. Botón "Agregar" en listado según **Diseño D3**.
- **F5**: Formulario de edición con los mismos campos/validaciones que F4, pero con el campo `id` deshabilitado. Accesible desde el **menú contextual (dropdown)** por fila en el listado. Maquetación según **Diseño D2** y **Diseño D3**.

### Historias de Usuario

#### HU-04: Agregar un nuevo producto financiero

```
Como:        Usuario de la aplicación bancaria
Quiero:      Registrar un nuevo producto financiero mediante un formulario
Para:        Ampliar el catálogo de productos ofertados por el banco

Prioridad:   Alta
Estimación:  L
Dependencias: HU-01 (SPEC-001)
Feature:     F4
```

#### Criterios de Aceptación — HU-04

**Happy Path**
```gherkin
CRITERIO-4.1: Creación exitosa de producto
  Dado que:  El usuario está en el formulario de agregar producto
  Y:         Todos los campos son válidos y el ID no existe en la API
  Cuando:    El usuario hace clic en "Agregar"
  Entonces:  Se realiza POST /bp/products con los datos del formulario
  Y:         Se muestra un mensaje de éxito
  Y:         Se navega de vuelta al listado de productos
```

**Error Path**
```gherkin
CRITERIO-4.2: Formulario con campos inválidos
  Dado que:  El usuario está en el formulario de agregar producto
  Cuando:    El usuario hace clic en "Agregar" con campos inválidos o vacíos
  Entonces:  NO se realiza la petición HTTP
  Y:         Se resalta visualmente cada campo inválido con su mensaje de error
  Y:         El formulario permanece visible para corrección
```

```gherkin
CRITERIO-4.3: ID ya existe en el sistema
  Dado que:  El usuario ingresa un ID en el formulario
  Y:         La API GET /bp/products/verification/:id retorna true
  Cuando:    El campo ID pierde el foco (blur) o al hacer submit
  Entonces:  Se muestra el error visual "ID ya registrado" en el campo id
  Y:         El botón "Agregar" no envía el formulario
```

```gherkin
CRITERIO-4.4: Error de la API al crear
  Dado que:  El formulario es válido
  Cuando:    POST /bp/products responde con error (400 u otro)
  Entonces:  Se muestra un mensaje de error descriptivo al usuario
  Y:         El formulario no se limpia
```

**Edge Case**
```gherkin
CRITERIO-4.5: Reiniciar el formulario
  Dado que:  El usuario ha completado uno o más campos del formulario
  Cuando:    El usuario hace clic en "Reiniciar"
  Entonces:  Todos los campos vuelven a su estado inicial (vacíos / sin error)
  Y:         El estado de validación se limpia
```

---

#### HU-05: Editar un producto financiero existente

```
Como:        Usuario de la aplicación bancaria
Quiero:      Modificar los datos de un producto existente desde el menú contextual
Para:        Mantener actualizada la información de los productos del banco

Prioridad:   Alta
Estimación:  M
Dependencias: HU-04, HU-01
Feature:     F5
```

#### Criterios de Aceptación — HU-05

**Happy Path**
```gherkin
CRITERIO-5.1: Navegación al formulario de edición
  Dado que:  El usuario está en el listado de productos
  Cuando:    El usuario abre el menú contextual (⋮) de un producto y hace clic en "Editar"
  Entonces:  Se navega a /products/edit/:id
  Y:         El formulario se precarga con los datos actuales del producto
  Y:         El campo "id" está deshabilitado (no editable)
```

```gherkin
CRITERIO-5.2: Actualización exitosa
  Dado que:  El usuario está en el formulario de edición con datos válidos
  Cuando:    El usuario hace clic en "Editar" (botón de submit en modo edición)
  Entonces:  Se realiza PUT /bp/products/:id con los campos modificados
  Y:         Se muestra un mensaje de éxito
  Y:         Se navega de vuelta al listado
```

**Error Path**
```gherkin
CRITERIO-5.3: Campos inválidos en edición
  Dado que:  El usuario está en el formulario de edición
  Cuando:    El usuario borra un campo requerido y hace clic en "Editar"
  Entonces:  Se muestra el error visual por campo inválido
  Y:         NO se realiza la petición PUT
```

```gherkin
CRITERIO-5.4: Producto no encontrado al actualizar
  Dado que:  El formulario de edición es válido
  Cuando:    PUT /bp/products/:id responde con 404
  Entonces:  Se muestra un mensaje de error descriptivo al usuario
```

### Reglas de Negocio

| Campo | Validación |
|-------|-----------|
| `id` | Requerido · mínimo 3 caracteres · máximo 10 · verificar unicidad async (solo en F4; deshabilitado en F5) |
| `name` | Requerido · mínimo 5 caracteres · máximo 100 |
| `description` | Requerido · mínimo 10 caracteres · máximo 200 |
| `logo` | Requerido (URL; no se valida formato de URL, solo que no esté vacío) |
| `date_release` | Requerido · fecha >= fecha de hoy (en zona local) |
| `date_revision` | Requerido · debe ser **exactamente 1 año** después de `date_release` (auto-calculado o validado) |

> **Regla de fecha_revision**: Al cambiar `date_release`, el campo `date_revision` debe calcularse automáticamente (date_release + 1 año) y mostrar ese valor. La validación debe confirmar que `date_revision === date_release + 1 año`.

---

## 2. DISEÑO

### Modelo de Datos

```typescript
// src/app/core/models/product.model.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string; // YYYY-MM-DD
  date_revision: string; // YYYY-MM-DD
}

export interface CreateProductRequest {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}
```

### API Endpoints a consumir

| Método | URL | Descripción | Request Body | Response |
|--------|-----|-------------|-------------|----------|
| POST | `/bp/products` | Crear producto | `CreateProductRequest` | `{ message, data: Product }` |
| PUT | `/bp/products/:id` | Actualizar producto | `UpdateProductRequest` | `{ message, data: Product }` |
| GET | `/bp/products/verification/:id` | Verificar ID | — | `true` / `false` |

### Diseño de Componentes Angular

#### Componentes
| Componente | Archivo | Modo | Entradas/Salidas |
|------------|---------|------|-----------------|
| `ProductFormComponent` | `features/product-form/product-form.component.*` | Crear (F4) y Editar (F5) | Detecta modo por ruta (`/add` vs `/edit/:id`) |

#### Páginas / Rutas
| Ruta | Componente | Modo |
|------|-----------|------|
| `/products/add` | `ProductFormComponent` | Crear (F4) |
| `/products/edit/:id` | `ProductFormComponent` | Editar (F5) |

#### Servicios adicionales en ProductService
| Función | Endpoint |
|---------|----------|
| `createProduct(data: CreateProductRequest): Observable<{message, data}>` | POST `/bp/products` |
| `updateProduct(id: string, data: UpdateProductRequest): Observable<{message, data}>` | PUT `/bp/products/:id` |
| `verifyId(id: string): Observable<boolean>` | GET `/bp/products/verification/:id` |

### Validators Personalizados

```typescript
// src/app/core/validators/product-date.validator.ts

/** Validador sincrónico: date_revision debe ser exactamente 1 año después de date_release */
export function reviseDateValidator(dateReleaseControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) return null;
    const releaseValue = parent.get(dateReleaseControlName)?.value;
    if (!releaseValue || !control.value) return null;
    const release = new Date(releaseValue);
    const revision = new Date(control.value);
    const expected = new Date(releaseValue);
    expected.setFullYear(expected.getFullYear() + 1);
    const isValid =
      revision.getFullYear() === expected.getFullYear() &&
      revision.getMonth() === expected.getMonth() &&
      revision.getDate() === expected.getDate();
    return isValid ? null : { invalidReviseDate: true };
  };
}

/** Validador sincrónico: date_release debe ser >= hoy */
export function minTodayValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(control.value + 'T00:00:00');
    return date >= today ? null : { pastDate: true };
  };
}

// src/app/core/validators/id-exists.validator.ts

/** Validador asíncrono: verifica si el ID ya existe en la API */
export class IdExistsValidator {
  static createValidator(productService: ProductService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length < 3) return of(null);
      return productService.verifyId(control.value).pipe(
        debounceTime(300),
        map(exists => (exists ? { idExists: true } : null)),
        catchError(() => of(null))
      );
    };
  }
}
```

### Layout del Formulario (Diseño D2)

```
┌─────────────────────────────────────────────────────────────────┐
│  BANCO                                                          │
│  Formulario de Registro / Edición                               │
├────────────────────────────┬────────────────────────────────────┤
│  ID:  [_______________]    │  Nombre: [_________________________]│
│  ⚠ Error mensaje          │  ⚠ Error mensaje                   │
├────────────────────────────┴────────────────────────────────────┤
│  Descripción: [______________________________________________]   │
│  ⚠ Error mensaje                                               │
├──────────────────────────────────────────────────────────────────┤
│  Logo (URL): [________________________________________________]  │
│  ⚠ Error mensaje                                               │
├────────────────────────────┬────────────────────────────────────┤
│  F. Liberación: [________] │  F. Revisión: [________________]   │
│  ⚠ Error mensaje          │  ⚠ Error mensaje                   │
├────────────────────────────┴────────────────────────────────────┤
│                              [Reiniciar]  [Agregar / Editar]    │
└─────────────────────────────────────────────────────────────────┘
```

### Menú Contextual por Fila (Diseño D3)

```
┌──────────────────────────────────────────────┐
│ Logo │ Nombre │ Desc │ F.Lib │ F.Rev │ ⋮     │
│                                        ┌────┐ │
│                                        │Edit│ │
│                                        │────│ │
│                                        │Del │ │
│                                        └────┘ │
└──────────────────────────────────────────────┘
```

El menú contextual (dropdown) está en la columna Acciones de `ProductListComponent`. Al hacer clic en "Editar" navega a `/products/edit/:id`.

### Notas de Implementación
> - El componente `ProductFormComponent` detecta el modo (crear vs editar) via `ActivatedRoute.snapshot.params['id']`.
> - En modo editar: cargar el producto desde el store/listado o desde la API; deshabilitar campo `id`.
> - Al cambiar `date_release`, recalcular automáticamente `date_revision` mediante `valueChanges` subscription.
> - Los mensajes de error de campo deben aparecer solo si el campo ha sido tocado (`touched`) o si se intentó hacer submit.
> - El botón "Reiniciar" llama a `form.reset()` y re-establece el estado de validación.

---

## 3. LISTA DE TAREAS

### Frontend — Implementación

#### Modelos (si no existen de SPEC-001)
- [ ] Agregar `CreateProductRequest` y `UpdateProductRequest` a `product.model.ts`

#### Servicios (agregar a ProductService)
- [ ] Implementar `createProduct(data): Observable<...>`
- [ ] Implementar `updateProduct(id, data): Observable<...>`
- [ ] Implementar `verifyId(id): Observable<boolean>`

#### Validators
- [ ] Crear `minTodayValidator()` en `src/app/core/validators/product-date.validator.ts`
- [ ] Crear `reviseDateValidator()` en el mismo archivo
- [ ] Crear `IdExistsValidator.createValidator()` en `src/app/core/validators/id-exists.validator.ts`

#### Feature: Product Form
- [ ] Crear `ProductFormComponent` (template + SCSS)
- [ ] Construir `FormGroup` con todos los `FormControl` y validators
- [ ] Aplicar `IdExistsValidator` como `asyncValidators` al campo `id`
- [ ] Suscribir a `date_release.valueChanges` → auto-calcular `date_revision`
- [ ] Mostrar mensajes de error por campo (solo si `touched` o submit intentado)
- [ ] Implementar botón "Reiniciar" → `form.reset()` + limpiar estado
- [ ] Detectar modo (crear/editar) via `ActivatedRoute`
- [ ] En modo editar: deshabilitar campo `id`, precargar datos del producto
- [ ] Implementar botón submit: llama `createProduct` o `updateProduct` según modo
- [ ] Navegar a `/products` tras éxito
- [ ] Mostrar error si la API falla

#### Feature: Menú Contextual (dropdown) en ProductListComponent
- [ ] Agregar columna "Acciones" con ícono `⋮` a la tabla
- [ ] Implementar dropdown con opciones "Editar" y "Eliminar" por fila
- [ ] Click en "Editar" → navegar a `/products/edit/:id`
- [ ] Click en "Eliminar" → emitir evento (manejado en SPEC-003)
- [ ] Cerrar dropdown al hacer clic fuera (directiva o event listener)
- [ ] SCSS del dropdown y animación de apertura

#### Routing
- [ ] Registrar `/products/add` → `ProductFormComponent`
- [ ] Registrar `/products/edit/:id` → `ProductFormComponent`

### Tests (Jest — Coverage ≥ 70%)

#### ProductService (métodos nuevos)
- [ ] `createProduct — success (200)`: verifica body y respuesta
- [ ] `createProduct — error (400)`: verifica propagación del error
- [ ] `updateProduct — success (200)`: verifica PUT con id en URL
- [ ] `updateProduct — not found (404)`: verifica propagación del error
- [ ] `verifyId — returns true`: ID existe
- [ ] `verifyId — returns false`: ID disponible

#### Validators
- [ ] `minTodayValidator — valid when date is today`
- [ ] `minTodayValidator — invalid when date is yesterday`
- [ ] `reviseDateValidator — valid when exactly 1 year after`
- [ ] `reviseDateValidator — invalid when same day`
- [ ] `reviseDateValidator — invalid when 1 year + 1 day`

#### ProductFormComponent
- [ ] `should create in add mode when no route param`
- [ ] `should create in edit mode when id param exists`
- [ ] `id field — required error`
- [ ] `id field — minLength (< 3 chars)`
- [ ] `id field — maxLength (> 10 chars)`
- [ ] `id field — async idExists error`
- [ ] `id field — disabled in edit mode`
- [ ] `name field — required, minLength, maxLength`
- [ ] `description field — required, minLength, maxLength`
- [ ] `logo field — required`
- [ ] `date_release — pastDate error`
- [ ] `date_revision — invalidReviseDate error`
- [ ] `should auto-calculate date_revision when date_release changes`
- [ ] `should call createProduct on valid submit in add mode`
- [ ] `should call updateProduct on valid submit in edit mode`
- [ ] `should reset form on Reiniciar click`
- [ ] `should show error message on API failure`
- [ ] `should navigate to /products on success`

### QA
- [ ] Ejecutar `/gherkin-case-generator` → criterios CRITERIO-4.1 al 5.4
- [ ] Ejecutar `/risk-identifier` → riesgos de validación y async validators
- [ ] Verificar cobertura ≥ 70%: `npx jest --coverage`
- [ ] Actualizar estado spec: `status: IMPLEMENTED`
