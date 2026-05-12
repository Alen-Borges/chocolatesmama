# Banking API — Microservicios

Sistema bancario con dos microservicios para gestión de clientes, cuentas y movimientos.

---

## ¿Qué necesitás para correrlo?

- Docker instalado y corriendo
- Nada más.

---

## Cómo levantar el proyecto

```bash
git clone <URL_DEL_REPOSITORIO>
cd ejercicio-tecnico-backend-2
docker compose up --build
```

La primera vez tarda unos minutos. Cuando veas que ambos servicios arrancan sin errores, el sistema está listo.

---

## URLs disponibles

| Servicio | URL |
|---|---|
| API Clientes | http://localhost:8081 |
| API Cuentas y Movimientos | http://localhost:8082 |
| RabbitMQ (panel web) | http://localhost:15672 (usuario: `guest`, contraseña: `guest`) |

---

## Cómo probar los endpoints

Importá el archivo `Banking_API_Consolidada.postman_collection.json` en Postman.

Antes de correr los requests, creá un **entorno** en Postman con estas dos variables:

| Variable | Valor |
|---|---|
| `baseUrlClientes` | `http://localhost:8081` |
| `baseUrlCuentas` | `http://localhost:8082` |

La colección ya tiene todos los requests ordenados en un flujo lógico: primero creás clientes, luego cuentas, después movimientos, y por último consultás reportes.

---

## Endpoints disponibles

### Clientes — `http://localhost:8081`

```
GET    /clientes           → lista todos
GET    /clientes/{id}      → trae uno por ID
POST   /clientes           → crea uno
PUT    /clientes/{id}      → actualiza
DELETE /clientes/{id}      → elimina
```

**Crear cliente:**
```json
POST /clientes
{
  "nombre": "Jose Lema",
  "genero": "Masculino",
  "edad": 35,
  "identificacion": "1234567890",
  "direccion": "Otavalo sn y principal",
  "telefono": "098254785",
  "contrasena": "1234",
  "estado": true
}
```

---

### Cuentas — `http://localhost:8082`

```
GET    /cuentas            → lista todas
GET    /cuentas/{id}       → trae una por ID
POST   /cuentas            → crea una
PUT    /cuentas/{id}       → actualiza
DELETE /cuentas/{id}       → elimina
```

**Crear cuenta:**
```json
POST /cuentas
{
  "numeroCuenta": "478758",
  "tipoCuenta": "Ahorros",
  "saldoInicial": 2000,
  "estado": true,
  "clienteId": 1
}
```

---

### Movimientos — `http://localhost:8082`

```
GET    /movimientos        → lista todos
POST   /movimientos        → registra uno nuevo
```

**Registrar un retiro** (valor negativo):
```json
POST /movimientos
{
  "numeroCuenta": "478758",
  "valor": -575
}
```

**Registrar un depósito** (valor positivo):
```json
POST /movimientos
{
  "numeroCuenta": "478758",
  "valor": 600
}
```

Si no hay saldo suficiente para el retiro, el sistema responde:
```json
HTTP 400
{ "message": "Saldo no disponible" }
```

---

### Reportes — `http://localhost:8082`

```
GET /reportes?fecha=YYYY-MM-DD,YYYY-MM-DD&cliente={id}
```

**Ejemplo:**
```
GET /reportes?fecha=2024-01-01,2024-12-31&cliente=1
```

**Respuesta:**
```json
[
  {
    "fecha": "10/02/2024",
    "cliente": "Marianela Montalvo",
    "numeroCuenta": "225487",
    "tipo": "Corriente",
    "saldoInicial": 100,
    "estado": true,
    "movimiento": 600,
    "saldoDisponible": 700
  }
]
```

---

## Cómo bajar el proyecto

```bash
docker compose down
```

Para borrar también los datos de la base:
```bash
docker compose down -v
```
