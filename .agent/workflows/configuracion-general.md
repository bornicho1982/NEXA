---
description: Reglas generales de configuración y desarrollo del proyecto NEXA
---

# Configuración General — NEXA

## Contexto del Proyecto

NEXA es una aplicación companion para Destiny 2 construida con Next.js 15, React 19, TypeScript y Tailwind CSS v4.

## Reglas de Desarrollo

### 1. Idioma

- Código fuente: **Inglés** (variables, funciones, comentarios de código)
- Documentación y comunicación: **Español**
- Nombres de archivos: **Inglés** (kebab-case para archivos, PascalCase para componentes)

### 2. Estructura de Archivos

```
src/
  app/          → rutas y páginas (App Router)
  components/   → componentes UI reutilizables
  lib/          → servicios y lógica de negocio
  types/        → definiciones TypeScript
  hooks/        → custom hooks
  contexts/     → React Context providers
```

### 3. Convenciones de Código

- TypeScript estricto — nunca usar `any`
- Componentes como funciones (`function`, no arrow functions para exports)
- Imports con aliases: `@/lib/*`, `@/components/*`, `@/hooks/*`
- API keys y secretos SOLO en el backend (nunca `NEXT_PUBLIC_*`)

### 4. Estilo Visual

- Tema oscuro inspirado en Destiny 2
- Glassmorphism para paneles
- Clases CSS globales: `glass`, `glass-strong`, `text-gradient`, `animate-page-enter`
- Colores principales: indigo (#6366f1), purple (#a855f7)

### 5. Git

- Nunca commitear `.env.local`, `data/`, `node_modules/`
- Mensajes de commit descriptivos en español

### 6. Calidad

- `npm run build` debe pasar sin errores antes de cualquier merge
- `npm run lint` sin warnings críticos
