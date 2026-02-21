# Features — NEXA Destiny 2 Companion

> Este documento lo mantiene el rol **Diseño Funcional y Requisitos (R2)**.

## MVP Implementation Status (R2 Verified)

### ✅ Completado / Base Existente

Features que tienen código base en `src/app` y `src/lib`:

| Feature | Prioridad | Estado | Notas |
|---------|-----------|--------|-------|
| **Auth Bungie OAuth2** | 🔴 Crítica | 🚧 Review | Login, callback existen. Falta validar refresh automatico. |
| **Manifest D2** | 🔴 Crítica | 🚧 Review | Descarga y caché. Falta validar performance. |
| **Inventario** | 🔴 Crítica | 🚧 Review | Lectura básica funcionando. |
| **Build Optimizer** | 🔴 Crítica | 🚧 Review | Algoritmo combinatorio implementado. |
| **PWA Setup** | 🟡 Alta | ✅ Done | Manifest y SW configurados (R1). |
| **AI Client** | 🟡 Alta | 🚧 Review | Cliente Ollama básico. |

### 📋 Pendiente para MVP (Roadmap Inmediato)

Features que faltan o requieren trabajo significativo para cerrar MVP:

| Feature | Prioridad | Asignado a | Descripción |
|---------|-----------|------------|-------------|
| **Token Auto-Refresh** | 🔴 Crítica | R3 Backend | Middleware para renovar token expirado sin logout. |
| **Error Handling Integrado** | 🔴 Crítica | R3 Backend | Páginas 404/500 amigables y Toasts de error. |
| **Mobile Responsive QA** | 🟡 Alta | R8 Frontend | Ajustar grid de inventario en móvil. |
| **Landing Page SEO** | 🟡 Alta | R8 Frontend | Meta tags y open graph. |
| **Testing Core** | 🟡 Alta | R9 Testing | Tests unitarios para Engine y Auth. |

### 🔮 Postergado a V1 (Post-MVP)

Features deseables pero fuera del scope actual:

| Feature | Descripción |
|---------|-------------|
| **Limpieza de bóveda** | Sugerencias de desmantelado inteligentes. |
| **Comparador de items** | Comparativa side-by-side de perks y stats. |
| **Historial de builds** | Guardar historial de optimizaciones previas. |
| **Notificaciones push** | Alertas de Xûr, reset semanal, vendors. |
| **Loadout Sharing** | Links compartibles de builds. |

## Definiciones de Prioridad

- **🔴 Crítica**: Bloquea el lanzamiento del MVP. Sin esto no sirve.
- **🟡 Alta**: Debe estar, pero con soluciones simples (workarounds) es aceptable.
- **🟢 Baja**: Improvement de calidad de vida.
