# Copilot Instructions — Prueba Técnica Frontend Angular

## ASDD Workflow (Agent Spec Software Development)

Este repositorio sigue el flujo **ASDD** adaptado para una aplicación **Angular** de productos financieros (prueba técnica).

```
[Orchestrator] → [Spec Generator] → [Frontend Developer] → [Test Engineer Frontend] → [QA]
```

### Fases del flujo ASDD
1. **Spec**: El agente `spec-generator` genera la spec en `.github/specs/<feature>.spec.md`.
2. **Implementación**: `frontend-developer` implementa en Angular (sin backend propio — consume API local en puerto 3002).
3. **Tests**: `test-engineer-frontend` genera pruebas con Jest ≥ 70% coverage.
4. **QA**: `qa-agent` genera estrategia, Gherkin y valida los casos de uso.

### Skills disponibles (slash commands):
- `/asdd-orchestrate` — orquesta el flujo completo ASDD
- `/generate-spec` — genera spec técnica en `.github/specs/`
- `/implement-frontend` — implementa feature completo en Angular
- `/unit-testing` — genera suite de tests con Jest

---

## Mapa de Archivos e Instrucciones

| Scope | Instrucción | Se aplica a |
|---|---|---|
| **Frontend** | `.github/instructions/frontend.instructions.md` | `src/app/**/*.{ts,html,scss}` |
| **Tests** | `.github/instructions/tests.instructions.md` | `src/app/**/*.spec.ts` |

---

## Funcionalidades del Proyecto

| ID | Nombre | Seniority |
|----|--------|-----------|
| F1 | Listado de productos financieros | Junior+ |
| F2 | Búsqueda de productos | Junior+ |
| F3 | Cantidad de registros (5/10/20) | Junior+ |
| F4 | Agregar producto (formulario validado) | SemiSenior+ |
| F5 | Editar producto (menú contextual) | SemiSenior+ |
| F6 | Eliminar producto (modal confirmación) | Senior |

---

## Reglas de Oro

> Principio rector: clean code, SOLID, y UX cuidada sin frameworks de estilos.

1. **Angular 14+**: Usar componentes standalone si aplica, `HttpClient`, `ReactiveFormsModule`.
2. **Sin frameworks CSS**: Vanilla CSS/SCSS exclusivamente. No Bootstrap, Tailwind, Material.
3. **No implementation without a spec**: Consultar `.github/specs/` antes de codificar.
4. **Clean Code + SOLID**: Responsabilidad única por componente/servicio.
5. **Error handling**: Mostrar errores visuales al usuario — nunca silenciar errores.

---

## Diccionario de Dominio (Angular Context)

| Término | Definición | Contexto Técnico |
|---------|-----------|------------------|
| **Component** | Unidad de UI con template y lógica | Clase con `@Component` |
| **Service** | Lógica de negocio y llamadas HTTP | Clase con `@Injectable` |
| **Pipe** | Transformación de datos en template | Clase con `@Pipe` |
| **Guard** | Protección de rutas | Implementa `CanActivate` |
| **Reactive Form** | Formulario controlado por código | `FormGroup` + `FormControl` |
| **HttpClient** | Cliente HTTP de Angular | `HttpClientModule` |
| **Router** | Navegación entre vistas | `RouterModule` |
| **Product** | Producto financiero del banco | Interface con id, name, description, logo, dates |

---

## API Backend (provista — solo lectura/escritura, no modificar)

Base URL: `http://localhost:3002`

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/bp/products` | GET | Listar productos |
| `/bp/products` | POST | Crear producto |
| `/bp/products/:id` | PUT | Actualizar producto |
| `/bp/products/:id` | DELETE | Eliminar producto |
| `/bp/products/verification/:id` | GET | Verificar si ID existe |
