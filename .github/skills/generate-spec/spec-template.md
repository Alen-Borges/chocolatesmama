---
id: SPEC-###
status: DRAFT
feature: nombre-del-feature
created: YYYY-MM-DD
updated: YYYY-MM-DD
author: spec-generator
version: "1.0"
related-specs: []
---

# Spec: [Nombre de la Funcionalidad]

> **Estado:** `DRAFT` → aprobar con `status: APPROVED` antes de iniciar implementación.
> **Ciclo de vida:** DRAFT → APPROVED → IN_PROGRESS → IMPLEMENTED → DEPRECATED

---

## 1. REQUERIMIENTOS

### Descripción
Resumen de la funcionalidad en 2-3 oraciones. Qué hace, para quién y qué problema resuelve.

### Requerimiento de Negocio
El requerimiento original de la prueba técnica. Referencia al feature ID (F1/F2/F3/F4/F5/F6) y al diseño visual correspondiente (D1/D2/D3/D4).

### Historias de Usuario

#### HU-01: [Título descriptivo corto]

```
Como:        Usuario que accede a la aplicación del banco
Quiero:      [acción o funcionalidad concreta]
Para:        [valor o beneficio esperado]

Prioridad:   Alta / Media / Baja
Estimación:  XS / S / M / L / XL
Dependencias: HU-X, HU-Y o Ninguna
Feature:     F1 / F2 / F3 / F4 / F5 / F6
```

#### Criterios de Aceptación — HU-01

**Happy Path**
```gherkin
CRITERIO-1.1: [nombre del escenario exitoso]
  Dado que:  [contexto inicial válido]
  Cuando:    [acción del usuario]
  Entonces:  [resultado esperado verificable en la UI]
```

**Error Path**
```gherkin
CRITERIO-1.2: [nombre del escenario de error]
  Dado que:  [contexto inicial]
  Cuando:    [acción inválida o datos incorrectos]
  Entonces:  [mensaje de error visual mostrado al usuario]
```

**Edge Case** *(si aplica)*
```gherkin
CRITERIO-1.3: [nombre del caso borde]
  Dado que:  [contexto de borde]
  Cuando:    [acción en el límite]
  Entonces:  [resultado esperado en el límite]
```

### Reglas de Negocio
1. Regla de validación (ej. "el ID es obligatorio, mínimo 3 y máximo 10 caracteres")
2. Regla de unicidad (ej. "el ID debe verificarse contra la API antes de guardar")
3. Regla de negocio de fecha (ej. "fecha_revision = fecha_release + exactamente 1 año")

---

## 2. DISEÑO

### Modelo de Datos

#### Interface TypeScript

```typescript
// src/app/core/models/product.model.ts
export interface Product {
  id: string;           // Identificador único — 3-10 chars
  name: string;         // Nombre — 5-100 chars
  description: string;  // Descripción — 10-200 chars
  logo: string;         // URL del logo
  date_release: string; // Fecha ISO — >= hoy
  date_revision: string; // Fecha ISO — exactamente 1 año después de date_release
}

export interface ProductApiResponse {
  data: Product[];
}
```

### API Endpoints a consumir

| Método | URL | Descripción | Response |
|--------|-----|-------------|----------|
| GET | `/bp/products` | Listar productos | `{ data: Product[] }` |
| POST | `/bp/products` | Crear producto | `{ message, data: Product }` |
| PUT | `/bp/products/:id` | Actualizar | `{ message, data: Product }` |
| DELETE | `/bp/products/:id` | Eliminar | `{ message }` |
| GET | `/bp/products/verification/:id` | Verificar ID | `true` o `false` |

### Diseño de Componentes Angular

#### Componentes nuevos
| Componente | Archivo | Inputs/Outputs | Descripción |
|------------|---------|----------------|-------------|
| `ProductListComponent` | `features/product-list/` | — | Página principal F1/F2/F3/F6 |
| `ProductFormComponent` | `features/product-form/` | `@Input() product?` | Formulario F4/F5 |
| `ConfirmModalComponent` | `shared/components/confirm-modal/` | `@Input() message`, `@Output() confirm`, `@Output() cancel` | Modal F6 |
| `SkeletonLoaderComponent` | `shared/components/skeleton-loader/` | `@Input() rows` | Skeleton D1 |

#### Páginas / Rutas
| Ruta | Componente | Feature |
|------|-----------|---------|
| `/products` | `ProductListComponent` | F1, F2, F3, F6 |
| `/products/add` | `ProductFormComponent` | F4 |
| `/products/edit/:id` | `ProductFormComponent` | F5 |

#### Pipes
| Pipe | Archivo | Uso |
|------|---------|-----|
| `SearchFilterPipe` | `shared/pipes/search-filter.pipe.ts` | Filtrar productos por texto (F2) |

#### Servicios
| Función | Servicio | Endpoint |
|---------|---------|----------|
| `getProducts()` | `ProductService` | GET `/bp/products` |
| `createProduct(data)` | `ProductService` | POST `/bp/products` |
| `updateProduct(id, data)` | `ProductService` | PUT `/bp/products/:id` |
| `deleteProduct(id)` | `ProductService` | DELETE `/bp/products/:id` |
| `verifyId(id)` | `ProductService` | GET `/bp/products/verification/:id` |

### Referencia de Diseño Visual
- **Lista** → Diseño D1 (tabla con columnas: Logo, Nombre, Descripción, Fecha Liberación, Fecha Revisión, Acciones)
- **Formulario agregar/editar** → Diseño D2
- **Menú contextual (dropdown)** → Diseño D3
- **Modal eliminar** → Diseño D4

### Notas de Implementación
> Observaciones técnicas: validators personalizados, comportamiento del skeleton, responsividad.

---

## 3. LISTA DE TAREAS

> Checklist accionable para todos los agentes. Marcar cada ítem (`[x]`) al completarlo.
> El Orchestrator monitorea este checklist para determinar el progreso.

### Frontend — Implementación

#### Modelos
- [ ] Crear interface `Product` y `ProductApiResponse` en `src/app/core/models/product.model.ts`

#### Servicios
- [ ] Implementar `ProductService` con todos los métodos HTTP
- [ ] Configurar `src/environments/environment.ts` con `apiUrl`

#### Pipes
- [ ] Implementar `SearchFilterPipe` (filtrado case-insensitive por nombre/descripción)

#### Componentes Compartidos
- [ ] Implementar `SkeletonLoaderComponent` — skeleton de tabla
- [ ] Implementar `ConfirmModalComponent` — modal de confirmación (F6)

#### Feature: Product List (F1, F2, F3)
- [ ] Implementar `ProductListComponent`
- [ ] HTML: tabla con columnas del diseño D1
- [ ] Input de búsqueda (F2)
- [ ] Select 5/10/20 registros + contador (F3)
- [ ] Skeleton mientras carga
- [ ] Mensaje de error si falla la API
- [ ] SCSS responsive sin frameworks

#### Feature: Product Form (F4, F5)
- [ ] Implementar `ProductFormComponent` con `ReactiveFormsModule`
- [ ] Todos los validators requeridos (F4)
- [ ] AsyncValidator para verificación de ID único
- [ ] Validator personalizado `date_revision = date_release + 1 año`
- [ ] Mostrar errores visuales por campo
- [ ] Botón Agregar / Reiniciar (F4)
- [ ] Campo ID deshabilitado en edición (F5)

#### Feature: Delete (F6)
- [ ] Dropdown contextual por fila (Editar / Eliminar)
- [ ] Integrar `ConfirmModalComponent` al hacer clic en Eliminar

#### Routing
- [ ] Registrar rutas `/products`, `/products/add`, `/products/edit/:id`

### Tests (Jest — Coverage ≥ 70%)

#### Servicio
- [ ] `getProducts` — success, error
- [ ] `createProduct` — success, 400
- [ ] `updateProduct` — success, 404
- [ ] `deleteProduct` — success, 404
- [ ] `verifyId` — true, false

#### ProductListComponent
- [ ] Render inicial
- [ ] Carga de productos
- [ ] Filtrado por búsqueda
- [ ] Cambio de cantidad de registros
- [ ] Apertura de modal

#### ProductFormComponent
- [ ] Validaciones por campo (id, name, description, logo, dates)
- [ ] AsyncValidator ID
- [ ] Validator de fechas
- [ ] Reset form
- [ ] Submit válido

#### SearchFilterPipe
- [ ] Filtrado, case-insensitive, vacío, sin resultados

### QA
- [ ] Ejecutar skill `/gherkin-case-generator` → flujos F1-F6
- [ ] Ejecutar skill `/risk-identifier` → riesgos
- [ ] Verificar cobertura ≥ 70%: `npx jest --coverage`
- [ ] Actualizar estado spec: `status: IMPLEMENTED`
