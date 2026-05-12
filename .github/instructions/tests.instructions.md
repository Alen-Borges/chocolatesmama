---
applyTo: "test/**/*.js"
---

# Instrucciones para Pruebas y Validación (Vanilla JS)

Como este es un proyecto móvil nativo con Capacitor y Vanilla JS, el enfoque de pruebas se divide en:

## 1. Validación de Lógica (Unit Testing)
- **Aislamiento**: Probar funciones puras en archivos JS independientes.
- **Herramientas**: Se puede usar Jest o simplemente scripts de validación que se ejecutan con `node`.
- **Enfoque**: Validar la lógica de negocio (ej: cálculo de precios de cajas, validación de fechas de entrega).

## 2. Validación de Persistencia (SQLite)
- **db.js Audit**: El QA Agent debe verificar que las queries en `db.js` manejen correctamente:
  - Sentencias SQL parametrizadas (Evitar SQL Injection).
  - Apertura y cierre de conexión.
  - Manejo de excepciones en los `execute`.
- **Manual Data Verification**: Usar `npx cap run android` y verificar que los datos persistan tras reiniciar la aplicación.

## 3. Validación de UI (Integration)
- **SPA Flow**: Verificar que el `router.js` cargue correctamente todas las vistas de `www/views/`.
- **Responsive**: Validar que los elementos no se desborden en pantallas de 360px a 720px de ancho.
- **Micro-interacciones**: Asegurar que los botones tengan feedback visual y los formularios validen en tiempo real.

## Criterios de Aceptación (Ejemplo Gherkin)

```gherkin
Feature: Gestión de Productos
  As an administrator
  I want to add new chocolates to the database
  So that they can be used in boxes and orders

  Scenario: Create a valid product
    Given I am on the "Nuevo Producto" view
    When I fill the name with "Bombón Suizo"
    And I set the price to 5.50
    And I click "Guardar"
    Then I should see the product in the product list
    And the data should be saved in the SQLite database
```

## Checklist de Calidad
- [ ] ¿Hay SQL en archivos que no sean `db.js`? (Debe ser NO).
- [ ] ¿Se usa `localStorage`? (Debe ser NO).
- [ ] ¿El diseño es responsive para Android móvil?
- [ ] ¿Las funciones siguen camelCase?
- [ ] ¿Los errores se muestran al usuario?
