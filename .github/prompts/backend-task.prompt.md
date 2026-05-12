---
name: backend-task
description: Implementa una funcionalidad en el backend FastAPI basada en una spec ASDD aprobada.
argument-hint: "<nombre-feature> (debe existir .github/specs/<nombre-feature>.spec.md)"
agent: Backend Developer
tools:
  - edit/createFile
  - edit/editFiles
  - read/readFile
  - search/listDirectory
  - search
  - execute/runInTerminal
---

Implementa el backend para el feature especificado, siguiendo la spec aprobada.
# Task: Implement Backend Feature (Java/Spring Boot 3)

Debes implementar la funcionalidad descrita en la spec técnica adjunta siguiendo estos lineamientos técnicos.

## Contexto de Implementación
- **Stack**: Java 21 + Spring Boot 3.x.
- **Base de Datos**: PostgreSQL (via JPA).
- **Wiring**: Constructor Injection (Inyección por constructor).

## Estructura de Salida Esperada
Debes generar los siguientes componentes en el orden indicado:

1. **Entities**: Clases Java con `@Entity`.
2. **DTOs/Records**: Java Records para la API.
3. **Repository**: Interfaz `JpaRepository`.
4. **Service**: Clase `@Service` con la lógica de negocio.
5. **Controller**: Clase `@RestController` con los endpoints.

## Plantilla de Código (Referencia)
```java
@Service
public class FeatureService {
    private final FeatureRepository repository;
    public FeatureService(FeatureRepository repository) {
        this.repository = repository;
    }
    // Business logic
}
```

## Reglas de Oro
- No retornar entidades — usar Records.
- Usar nombres de tablas en plural (`snake_case`).
- Manejo de excepciones global vía `@RestControllerAdvice`.
- Documentar con anotaciones de SpringDoc.

---
**Status**: Esperando implementación.
