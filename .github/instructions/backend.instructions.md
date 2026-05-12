---
applyTo: "backend/**/*.java"
---

> **Scope**: Se aplica a proyectos con capa backend en Java. Seguir estrictamente las convenciones de Spring Boot 3.x y Java 21.

# Instrucciones para Archivos de Backend (Java 21 / Spring Boot 3)

## Arquitectura en Capas (Spring Standard)

Siempre sigue la arquitectura de capas y el flujo de datos:

```
Controller → Service → Repository → Entity (JPA/PostgreSQL)
```

- **`controller/`**: Solo exposición de endpoints REST, validación de DTOs (`@Valid`) y delegación al Service.
- **`service/`**: Lógica de negocio pura. Orquestación de repositorios. Marcado con `@Service`.
- **`repository/`**: Interfaces que extienden `JpaRepository` para acceso a PostgreSQL. Marcado con `@Repository`.
- **`model/entity/`**: Entidades JPA con anotaciones `@Entity`, `@Table`, `@Id`, etc.
- **`model/dto/`**: Data Transfer Objects para entrada/salida de API. Usar **Java Records** para DTOs inmutables.

## Inyección de Dependencias (Constructor Injection)

SIEMPRE usar inyección por constructor. NUNCA usar `@Autowired` sobre campos.

```java
// ✅ Correcto — Inyección por constructor
@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

## Convenciones de Código y Framework

- **Java 21**: Usar `var` para variables locales cuando el tipo sea obvio. Usar Records para DTOs.
- **Spring Boot 3.x**: Usar anotaciones modernas (`@RestController`, `@GetMapping`, etc.).
- **Naming**: `PascalCase` para clases e interfaces, `camelCase` para métodos y variables.
- **DB**: Los repositorios acceden a **PostgreSQL**. Usar nombres de tablas en plural y snake_case (`@Table(name = "users")`).
- **API Docs**: Usar anotaciones de **SpringDoc OpenAPI** (`@Tag`, `@Operation`) en los controladores.
- **Lombok**: Usar `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor` y `@Builder` para reducir boilerplate en Entidades y Clientes.

## Manejo de Excepciones

- Usar `@RestControllerAdvice` para capturar excepciones de forma global.
- No retornar `null`. Lanzar excepciones personalizadas de negocio.

## Nunca hacer

- Lógica de persistencia o negocio en el Controller.
- Uso de `@Autowired` en campos (field injection).
- Retornar Entidades directamente a la API (siempre usar DTOs/Records).
- Operaciones bloqueantes pesadas sin considerar Virtual Threads (Java 21).

---

> Para estándares de código limpio, SOLID y seguridad (Spring Security), ver `.github/docs/lineamientos/dev-guidelines.md`.
