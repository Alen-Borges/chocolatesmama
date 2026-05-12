---
id: SPEC-001
status: APPROVED
feature: product-list
created: 2026-05-10
updated: 2026-05-10
author: spec-generator
version: "1.0"
related-specs:
  - product-form.spec.md
  - product-delete.spec.md
---

# Spec: Listado, Búsqueda y Cantidad de Registros de Productos Financieros

> **Estado:** `DRAFT` → aprobar con `status: APPROVED` antes de iniciar implementación.
> **Ciclo de vida:** DRAFT → APPROVED → IN_PROGRESS → IMPLEMENTED → DEPRECATED

---

## 1. REQUERIMIENTOS

### Descripción
Vista principal de la aplicación bancaria que muestra, filtra y pagina los productos financieros disponibles consumiendo la API local. Cubre las funcionalidades F1 (listado), F2 (búsqueda por texto) y F3 (selector de cantidad de registros). Es la pantalla de entrada de la aplicación  y punto de navegación hacia F4, F5 y F6.

### Requerimiento de Negocio
- **F1**: Visualizar los productos financieros cargados desde `GET /bp/products`. Maquetación según **Diseño D1**.
- **F2**: Buscar productos por texto libre sobre el listado ya cargado. Maquetación según **Diseño D1**.
- **F3**: Selector de cantidad de registros a mostrar (valores: 5, 10, 20) con contador de resultados actuales. Maquetación según **Diseño D1**.

### Historias de Usuario

#### HU-01: Visualizar listado de productos financieros

```
Como:        Usuario de la aplicación bancaria
Quiero:      Ver todos los productos financieros en una tabla
Para:        Conocer la oferta de productos del banco

Prioridad:   Alta
Estimación:  M
Dependencias: Ninguna
Feature:     F1
```

#### Criterios de Aceptación — HU-01

**Happy Path**
```gherkin
CRITERIO-1.1: Listado cargado exitosamente
  Dado que:  La API GET /bp/products responde con 200 y una lista de productos
  Cuando:    El usuario navega a la vista principal
  Entonces:  Se muestra una tabla con columnas: Logo, Nombre, Descripción,
             Fecha de Liberación, Fecha de Revisión y Acciones
  Y:         Cada fila muestra los datos correctos del producto
```

**Error Path**
```gherkin
CRITERIO-1.2: Error al cargar productos
  Dado que:  La API GET /bp/products no está disponible o responde con error
  Cuando:    El usuario navega a la vista principal
  Entonces:  Se muestra un mensaje de error visual descriptivo al usuario
  Y:         No se muestra la tabla con datos vacíos
```

**Edge Case**
```gherkin
CRITERIO-1.3: Lista vacía (sin productos)
  Dado que:  La API responde con una lista vacía []
  Cuando:    El usuario navega a la vista principal
  Entonces:  Se muestra un mensaje indicando que no hay productos disponibles
```

```gherkin
CRITERIO-1.4: Estado de carga (skeleton)
  Dado que:  La petición HTTP está en curso
  Cuando:    El usuario navega a la vista principal
  Entonces:  Se muestran placeholders de skeleton en lugar de la tabla
  Y:         El skeleton desaparece al recibir la respuesta
```

---

#### HU-02: Buscar productos financieros por texto

```
Como:        Usuario de la aplicación bancaria
Quiero:      Filtrar los productos mediante un campo de texto
Para:        Encontrar rápidamente el producto que me interesa

Prioridad:   Alta
Estimación:  S
Dependencias: HU-01
Feature:     F2
```

#### Criterios de Aceptación — HU-02

**Happy Path**
```gherkin
CRITERIO-2.1: Filtrado por coincidencia de texto
  Dado que:  Hay productos cargados en la tabla
  Cuando:    El usuario escribe un término en el campo de búsqueda
  Entonces:  La tabla muestra solo los productos cuyo nombre o descripción
             contengan el término buscado (case-insensitive)
  Y:         El contador de resultados se actualiza en tiempo real
```

**Edge Case**
```gherkin
CRITERIO-2.2: Búsqueda sin resultados
  Dado que:  Hay productos cargados en la tabla
  Cuando:    El usuario escribe un término que no coincide con ningún producto
  Entonces:  La tabla muestra cero filas
  Y:         El contador muestra 0 resultados
```

```gherkin
CRITERIO-2.3: Limpiar búsqueda
  Dado que:  El usuario ha aplicado un filtro de búsqueda
  Cuando:    El usuario borra el texto del campo de búsqueda
  Entonces:  La tabla vuelve a mostrar todos los productos
```

---

#### HU-03: Seleccionar cantidad de registros a mostrar

```
Como:        Usuario de la aplicación bancaria
Quiero:      Elegir cuántos productos ver en pantalla (5, 10 o 20)
Para:        Controlar la densidad de información visible

Prioridad:   Media
Estimación:  S
Dependencias: HU-01
Feature:     F3
```

#### Criterios de Aceptación — HU-03

**Happy Path**
```gherkin
CRITERIO-3.1: Cambio de cantidad de registros
  Dado que:  Hay productos cargados en la tabla
  Cuando:    El usuario selecciona una opción del selector (5, 10 o 20)
  Entonces:  La tabla muestra como máximo esa cantidad de productos
  Y:         El contador refleja la cantidad de productos visibles
             (ej: "5 resultados de 12")
```

**Edge Case**
```gherkin
CRITERIO-3.2: Menos productos que el límite seleccionado
  Dado que:  Hay 3 productos cargados y el usuario selecciona 10
  Cuando:    Se aplica el selector
  Entonces:  Se muestran los 3 productos disponibles
  Y:         El contador muestra el total real (ej: "3 resultados")
```

### Reglas de Negocio
1. El filtrado es **client-side** — sobre los datos ya cargados de la API, sin nuevas peticiones HTTP.
2. Los valores válidos para el selector de cantidad son únicamente: **5, 10, 20** (valor por defecto: 5).
3. El filtrado y el selector de cantidad actúan de forma **combinada** (primero filtrar, luego paginar).
4. El logo del producto se muestra como imagen `<img>` usando la URL del campo `logo`.

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
  date_release: string; // Fecha ISO (YYYY-MM-DD) — >= hoy
  date_revision: string; // Fecha ISO — exactamente 1 año después de date_release
}

export interface ProductApiResponse {
  data: Product[];
}
```

### API Endpoints a consumir

| Método | URL | Descripción | Response |
|--------|-----|-------------|----------|
| GET | `/bp/products` | Listar todos los productos | `{ data: Product[] }` |

### Diseño de Componentes Angular

#### Componentes
| Componente | Archivo | Descripción |
|------------|---------|-------------|
| `ProductListComponent` | `features/product-list/product-list.component.*` | Vista principal — tabla, búsqueda, paginación |
| `SkeletonLoaderComponent` | `shared/components/skeleton-loader/` | Placeholder de carga |

#### Página / Ruta
| Ruta | Componente | Observación |
|------|-----------|-------------|
| `/` o `/products` | `ProductListComponent` | Ruta raíz de la aplicación |

#### Pipes
| Pipe | Archivo | Descripción |
|------|---------|-------------|
| `SearchFilterPipe` | `shared/pipes/search-filter.pipe.ts` | Filtra `Product[]` por término de búsqueda case-insensitive sobre `name` y `description` |

#### Servicios
| Función | Servicio | Endpoint |
|---------|---------|----------|
| `getProducts(): Observable<ProductApiResponse>` | `ProductService` | GET `/bp/products` |

### Layout de la Vista (Diseño D1)

```
┌─────────────────────────────────────────────────────────────────┐
│  BANCO                               [Agregar]                  │
│  Listado de Productos Financieros                               │
├─────────────────────────────────────────────────────────────────┤
│  [Buscar...                    ]              [5 ▼] resultados  │
├──────┬──────────┬──────────────┬────────────┬───────────┬───────┤
│ Logo │  Nombre  │ Descripción  │F. Liberac. │F. Revisión│       │
├──────┼──────────┼──────────────┼────────────┼───────────┼───────┤
│ img  │  nombre  │    desc      │ 2025-01-01 │2026-01-01 │  ⋮   │
│ img  │  nombre  │    desc      │ 2025-06-01 │2026-06-01 │  ⋮   │
└──────┴──────────┴──────────────┴────────────┴───────────┴───────┘
  Mostrando X resultados
```

### Arquitectura y Dependencias
- **Módulos nuevos**: Declarar `ProductListComponent`, `SearchFilterPipe` en el módulo correspondiente o como standalone.
- **Servicios**: `ProductService` provisto en `root`.
- **Impacto en routing**: Ruta `/products` como ruta por defecto (`pathMatch: 'full'`).

### Notas de Implementación
> - El botón "Agregar" en la cabecera navega a `/products/add` (F4).
> - La columna de Acciones contiene un menú contextual tipo dropdown (icono `⋮`) — implementado en SPEC-002 (F5/F6).
> - Skeleton loader: mínimo 3-5 filas de placeholder con animación de shimmer.
> - Responsive: en mobile la tabla debe ser scrollable horizontalmente.

---

## 3. LISTA DE TAREAS

> Checklist accionable. Marcar cada ítem (`[x]`) al completarlo.

### Frontend — Implementación

#### Modelos
- [ ] Crear `Product` interface en `src/app/core/models/product.model.ts`
- [ ] Crear `ProductApiResponse` interface en el mismo archivo

#### Servicios
- [ ] Crear `ProductService` en `src/app/core/services/product.service.ts`
- [ ] Implementar método `getProducts(): Observable<ProductApiResponse>`
- [ ] Agregar `catchError` con manejo de error descriptivo
- [ ] Configurar `src/environments/environment.ts` con `{ apiUrl: 'http://localhost:3002' }`

#### Pipes
- [ ] Crear `SearchFilterPipe` en `src/app/shared/pipes/search-filter.pipe.ts`
- [ ] Filtrar sobre campos `name` y `description` (case-insensitive, trim)

#### Componentes Compartidos
- [ ] Crear `SkeletonLoaderComponent` en `src/app/shared/components/skeleton-loader/`
- [ ] Implementar animación shimmer en SCSS

#### Feature: Product List
- [ ] Crear `ProductListComponent` (template + SCSS)
- [ ] Cargar productos en `ngOnInit` con `ProductService.getProducts()`
- [ ] Mostrar skeleton durante la carga (`loading: boolean`)
- [ ] Mostrar mensaje de error si la petición falla
- [ ] Implementar campo de búsqueda que aplica `SearchFilterPipe`
- [ ] Implementar selector `<select>` con opciones 5, 10, 20
- [ ] Aplicar lógica de paginación: mostrar solo N registros del resultado filtrado
- [ ] Mostrar contador "X resultados" debajo de la tabla
- [ ] Botón "Agregar" en cabecera — navega a `/products/add`
- [ ] Columna "Acciones" con menú contextual (placeholder — implementado en SPEC-002)
- [ ] SCSS responsive sin frameworks

#### Routing
- [ ] Registrar ruta `/products` como raíz en `app-routing.module.ts`
- [ ] Redirect de `/` a `/products`

### Tests (Jest — Coverage ≥ 70%)

#### ProductService
- [ ] `getProducts — success (200)`: verifica `data` en respuesta
- [ ] `getProducts — network error`: verifica que el error se propaga

#### SearchFilterPipe
- [ ] `should return all products when search term is empty`
- [ ] `should filter products by name case-insensitively`
- [ ] `should filter products by description`
- [ ] `should return empty array when no products match`
- [ ] `should handle empty product list`

#### ProductListComponent
- [ ] `should create component`
- [ ] `should call getProducts on init`
- [ ] `should show skeleton while loading`
- [ ] `should display products in table after load`
- [ ] `should show error message on API failure`
- [ ] `should filter products when search term changes`
- [ ] `should limit products shown when page size changes`
- [ ] `should update counter when filter is applied`
- [ ] `should navigate to /products/add on Agregar click`

### QA
- [ ] Ejecutar `/gherkin-case-generator` → criterios CRITERIO-1.1 al 3.2
- [ ] Ejecutar `/risk-identifier` → riesgos de carga y filtrado
- [ ] Verificar cobertura ≥ 70%: `npx jest --coverage`
- [ ] Actualizar estado spec: `status: IMPLEMENTED`
