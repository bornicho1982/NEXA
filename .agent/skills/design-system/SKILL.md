---
name: design-system
description: Sistema de diseño NEXA — tokens, componentes, animaciones y clases CSS globales
---

# Skill: NEXA Design System

## Descripción

Guía completa del sistema de diseño de NEXA. Define colores, tipografía, componentes, animaciones y clases CSS globales.

## Paleta de colores

### Backgrounds

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-primary` | `#050810` | Fondo de página |
| `--bg-card` | `rgba(255,255,255,0.03)` | Fondo de tarjetas (`glass`) |
| `--bg-card-strong` | `rgba(255,255,255,0.06)` | Fondo de headers (`glass-strong`) |

### Accent

| Token | Valor | Uso |
|-------|-------|-----|
| Indigo | `#6366f1` / `#818cf8` | Botones primarios, links |
| Purple | `#a855f7` | Gradientes, decoración |
| Green | `#22c55e` | Éxito, equip |
| Red | `#ef4444` | Error, delete |
| Yellow | `#eab308` | Warnings, power level |

## Clases CSS globales

| Clase | Efecto |
|-------|--------|
| `glass` | Fondo blur + borde semi-transparente |
| `glass-strong` | Versión más opaca para headers |
| `text-gradient` | Gradiente indigo → purple en texto |
| `animate-page-enter` | Fade + slide-up al entrar a la página |
| `animate-fade-in-up` | Animación staggerable de entrada |
| `shimmer` | Efecto de loading skeleton |
| `card-hover-glow` | Glow de indigo al hacer hover |
| `focus-ring` | Indicador de focus accesible |

## Componentes compartidos

### AppHeader

```tsx
import { AppHeader } from '@/components/layout/AppHeader';

// Básico
<AppHeader title="Inventory" />

// Con acciones
<AppHeader title="Loadouts" actions={
  <button>+ New</button>
} />
```

### ErrorBoundary

Envuelve toda la app en `layout.tsx`. Catch automático de errores de render.

## Tipografía

- Font: `Inter` (Google Fonts)
- Headings: `font-bold` o `font-black`
- Body: `text-sm` (14px)
- Captions: `text-xs` (12px)

## Responsive breakpoints

| Breakpoint | Px | Uso |
|------------|------|-----|
| Default | 0-639 | Mobile |
| `sm:` | 640+ | Tablet |
| `lg:` | 1024+ | Desktop |
| `xl:` | 1280+ | Wide desktop |

## Archivos

- `src/app/globals.css` → Tokens y utilidades
- `src/components/layout/AppHeader.tsx` → Header
- `src/components/layout/ErrorBoundary.tsx` → Error catcher
