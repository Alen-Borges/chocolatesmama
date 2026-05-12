# App de Chocolates — Capacitor & Vanilla JS

Aplicación móvil nativa para la gestión de productos, cajas y pedidos de chocolates.

## Stack Tecnológico

- **UI**: HTML5 + CSS3 + JavaScript vanilla (sin frameworks).
- **Core**: Capacitor v6.
- **Base de Datos**: SQLite nativo via `@capacitor-community/sqlite`.
- **Arquitectura**: Single Page Application (SPA).

---

## Estructura de Carpetas

```
proyecto/
├── www/                  ← Código fuente web
│   ├── index.html        ← Punto de entrada único
│   ├── css/              ← Estilos CSS3
│   ├── js/               ← Lógica JS modularized
│   │   ├── db.js         ← Queries SQLite (Aislado)
│   │   └── router.js     ← Navegación SPA
│   └── views/            ← Fragmentos HTML de las pantallas
├── android/              ← Proyecto nativo Android
├── package.json
└── capacitor.config.json
```

---

## Reglas del Proyecto

1. **Sin Frameworks**: No React, Vue, Angular ni Tailwind.
2. **Sin Backend**: Persistencia 100% offline via SQLite.
3. **SQLite Centralizado**: Toda query SQL debe estar en `www/js/db.js`.
4. **Offline first**: No se permiten llamadas HTTP externas.
5. **Vanilla JS**: Código limpio, JS moderno pero sin transpiladores ni TypeScript.

---

## Cómo Ejecutar

1. **Instalar dependencias**:
   ```bash
   npm install
   ```
2. **Sincronizar Capacitor**:
   ```bash
   npx cap sync
   ```
3. **Ejecutar en Android**:
   ```bash
   npx cap run android
   ```

---

## Flujo de Desarrollo (ASDD)

Este proyecto sigue el flujo de agentes **ASDD**:
1. **Spec Generator**: Define el feature en `.github/specs/`.
2. **Database Agent**: Implementa SQL en `db.js`.
3. **Frontend Developer**: Implementa UI y lógica en `www/`.
4. **QA Agent**: Valida el feature y la persistencia.

---
> Last update: 2026-05-11
