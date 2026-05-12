---
id: SPEC-003
status: APPROVED
feature: product-delete
created: 2026-05-10
updated: 2026-05-10
author: spec-generator
version: "1.0"
related-specs:
  - product-list.spec.md
  - product-form.spec.md
---

# Spec: Eliminación de Producto Financiero con Modal de Confirmación

> **Estado:** `DRAFT` → aprobar con `status: APPROVED` antes de iniciar implementación.
> **Ciclo de vida:** DRAFT → APPROVED → IN_PROGRESS → IMPLEMENTED → DEPRECATED

---

## 1. REQUERIMIENTOS

### Descripción
Funcionalidad de eliminación de un producto financiero accesible desde el menú contextual (dropdown) en la vista de listado. Al seleccionar "Eliminar", se muestra un modal de confirmación con los botones "Cancelar" y "Eliminar". La eliminación efectiva ocurre solo al confirmar; cancelar cierra el modal sin cambios en los datos.

### Requerimiento de Negocio
- **F6**: Implementar la opción "Eliminar" en el menú contextual de cada producto. Mostrar modal de confirmación antes de ejecutar la eliminación. Maquetación del menú en **Diseño D3** y del modal en **Diseño D4**.

### Historias de Usuario

#### HU-06: Eliminar un producto financiero

```
Como:        Usuario de la aplicación bancaria
Quiero:      Eliminar un producto del catálogo mediante confirmación modal
Para:        Mantener actualizado el listado de productos ofertados

Prioridad:   Alta
Estimación:  S
Dependencias: HU-01 (SPEC-001), Menú contextual de SPEC-002
Feature:     F6
```

#### Criterios de Aceptación — HU-06

**Happy Path**
```gherkin
CRITERIO-6.1: Apertura del modal de confirmación
  Dado que:  El usuario está en la vista de listado de productos
  Cuando:    El usuario abre el menú contextual (⋮) de un producto y hace clic en "Eliminar"
  Entonces:  Se muestra el modal de confirmación con el nombre del producto
  Y:         El modal contiene los botones "Cancelar" y "Eliminar"
  Y:         El fondo queda bloqueado (overlay)
```

```gherkin
CRITERIO-6.2: Confirmación de eliminación
  Dado que:  El modal de eliminación está abierto para el producto X
  Cuando:    El usuario hace clic en el botón "Eliminar" del modal
  Entonces:  Se realiza DELETE /bp/products/:id con el ID del producto X
  Y:         El modal se cierra
  Y:         El producto X desaparece del listado
  Y:         Se muestra un mensaje de éxito
```

**Error Path**
```gherkin
CRITERIO-6.3: Error de la API al eliminar
  Dado que:  El modal de eliminación está abierto
  Cuando:    El usuario confirma y DELETE /bp/products/:id responde con error (404 u otro)
  Entonces:  Se muestra un mensaje de error descriptivo al usuario
  Y:         El modal se cierra
  Y:         El producto permanece en el listado (no se elimina localmente)
```

**Edge Case**
```gherkin
CRITERIO-6.4: Cancelar la eliminación
  Dado que:  El modal de eliminación está abierto
  Cuando:    El usuario hace clic en "Cancelar"
  Entonces:  El modal se cierra sin realizar ninguna petición HTTP
  Y:         El producto permanece en el listado sin cambios
```

```gherkin
CRITERIO-6.5: Cerrar modal con overlay o tecla Escape
  Dado que:  El modal de eliminación está abierto
  Cuando:    El usuario hace clic en el overlay o presiona la tecla Escape
  Entonces:  El modal se cierra (equivalente a Cancelar)
```

### Reglas de Negocio
1. La eliminación es **permanente** — no hay soft delete en el frontend.
2. El modal debe mostrar el **nombre del producto** a eliminar para identificación clara.
3. La lista debe actualizarse inmediatamente tras una eliminación exitosa (sin recargar toda la página).
4. Si la API responde 404, el producto **no** debe eliminarse del estado local.

---

## 2. DISEÑO

### Modelo de Datos

No requiere modelos nuevos. Usa `Product` de `product.model.ts` (SPEC-001).

### API Endpoints a consumir

| Método | URL | Descripción | Response |
|--------|-----|-------------|----------|
| DELETE | `/bp/products/:id` | Eliminar producto por ID | `{ message: string }` (200) / `{ name, message }` (404) |

### Diseño de Componentes Angular

#### Componentes
| Componente | Archivo | Descripción |
|------------|---------|-------------|
| `ConfirmModalComponent` | `shared/components/confirm-modal/confirm-modal.component.*` | Modal genérico de confirmación reutilizable |

#### Integración en ProductListComponent
El `ConfirmModalComponent` se integra dentro de `ProductListComponent`:
- `selectedProduct: Product | null` — producto a eliminar (trigger para mostrar modal)
- Método `onDeleteConfirmed(product)` → llama `ProductService.deleteProduct(product.id)`
- Método `onDeleteCancelled()` → limpia `selectedProduct`

#### Servicios (agregar a ProductService)
| Función | Endpoint |
|---------|----------|
| `deleteProduct(id: string): Observable<{message: string}>` | DELETE `/bp/products/:id` |

### Layout del Modal (Diseño D4)

```
┌────────────────────────────────────────────────────┐
│                                                    │
│   ¿Estás seguro de eliminar el producto            │
│   "[Nombre del Producto]"?                         │
│                                                    │
│   Esta acción no se puede deshacer.                │
│                                                    │
│                  [Cancelar]  [Eliminar]            │
│                                                    │
└────────────────────────────────────────────────────┘
  (overlay semitransparente detrás del modal)
```

### Interface del Componente Modal

```typescript
// confirm-modal.component.ts
@Component({
  selector: 'app-confirm-modal',
  template: '...'
})
export class ConfirmModalComponent {
  @Input() productName: string = '';
  @Input() isVisible: boolean = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
```

### Notas de Implementación
> - El modal se muestra/oculta mediante `[isVisible]="!!selectedProduct"`.
> - Al confirmar: `deleteProduct(selectedProduct.id)` → en éxito, filtrar el producto del array local (`products = products.filter(p => p.id !== id)`).
> - Al fallar: mostrar error global, restablecer `selectedProduct = null`.
> - El overlay bloquea el scroll de la página mientras el modal está abierto (`overflow: hidden` en `body`).
> - Animación de entrada/salida del modal con CSS transitions.
> - Manejar la tecla `Escape` con `@HostListener('document:keydown.escape')`.

---

## 3. LISTA DE TAREAS

### Frontend — Implementación

#### Servicios (agregar a ProductService)
- [ ] Implementar `deleteProduct(id: string): Observable<{message: string}>`
- [ ] Agregar `catchError` con manejo de error

#### Componentes Compartidos
- [ ] Crear `ConfirmModalComponent` en `src/app/shared/components/confirm-modal/`
- [ ] Template HTML: mensaje con nombre del producto + botones "Cancelar" y "Eliminar"
- [ ] Inputs: `productName: string`, `isVisible: boolean`
- [ ] Outputs: `confirmed: EventEmitter<void>`, `cancelled: EventEmitter<void>`
- [ ] SCSS: overlay + modal centrado + animación de entrada
- [ ] Manejar cierre con tecla Escape (`@HostListener`)
- [ ] Bloquear scroll del body cuando está abierto

#### Integración en ProductListComponent
- [ ] Agregar opción "Eliminar" al menú contextual (dropdown) de cada fila
- [ ] Gestionar estado `selectedProduct: Product | null`
- [ ] Al click en "Eliminar" del dropdown → asignar `selectedProduct = product`
- [ ] Integrar `<app-confirm-modal>` en la template de `ProductListComponent`
- [ ] Método `onDeleteConfirmed()` → llamar `deleteProduct`, actualizar lista local, mostrar mensaje de éxito
- [ ] Método `onDeleteCancelled()` → `selectedProduct = null`
- [ ] Mostrar error si la API falla

### Tests (Jest — Coverage ≥ 70%)

#### ProductService (método nuevo)
- [ ] `deleteProduct — success (200)`: verifica DELETE con id correcto
- [ ] `deleteProduct — not found (404)`: verifica propagación del error

#### ConfirmModalComponent
- [ ] `should not render when isVisible is false`
- [ ] `should render product name when isVisible is true`
- [ ] `should emit confirmed when Eliminar button clicked`
- [ ] `should emit cancelled when Cancelar button clicked`
- [ ] `should emit cancelled on Escape key press`

#### ProductListComponent (integración con delete)
- [ ] `should set selectedProduct when Eliminar is clicked in dropdown`
- [ ] `should call deleteProduct and remove from list on confirm`
- [ ] `should show success message after deletion`
- [ ] `should show error message if deleteProduct fails`
- [ ] `should set selectedProduct to null on cancel`
- [ ] `should not call deleteProduct on cancel`

### QA
- [ ] Ejecutar `/gherkin-case-generator` → criterios CRITERIO-6.1 al 6.5
- [ ] Ejecutar `/risk-identifier` → riesgos de eliminación accidental
- [ ] Verificar cobertura ≥ 70%: `npx jest --coverage`
- [ ] Actualizar estado spec: `status: IMPLEMENTED`
