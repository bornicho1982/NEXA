# Skill: UI Design System

## Slug

`ui-design-system`

## Propósito

Definir y construir el sistema de diseño visual: tokens CSS (colores, tipografía, espaciado, radios), componentes base reutilizables (Button, Card, Badge, StatBar, Modal), reglas de responsive, y animaciones micro.

## Roles que la usan

- R8 — Frontend y UI/UX

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| Branding NEXA (colores, tipografía Inter) | Decisión | R2 Producto |
| Skill file `.agent/skills/design-system/SKILL.md` | Referencia | Repo |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `src/app/globals.css` — tokens + utilidades CSS | CSS | Todas las páginas |
| `src/components/ui/Button.tsx` | React component | Todas las páginas |
| `src/components/ui/Card.tsx` | React component | Inventory, Builds, Dashboard |
| `src/components/ui/Badge.tsx` | React component | Items, Stats |
| `src/components/ui/StatBar.tsx` | React component | Builds, Inventory |
| `src/components/ui/Modal.tsx` | React component | Loadouts, Settings |
| `src/components/layout/AppHeader.tsx` | React component | Layout global |

## Archivos tocados

### Crea

```
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/Badge.tsx
src/components/ui/StatBar.tsx
src/components/ui/Modal.tsx
```

### Modifica

```
src/app/globals.css                    — tokens, utilidades, animaciones
src/components/layout/AppHeader.tsx    — estilizar con design system
```

## Procedimiento

1. **Tokens CSS** en `globals.css`:

   ```css
   :root {
     --color-bg-primary: #0a0e17;
     --color-bg-card: #111827;
     --color-accent: #6366f1;
     --color-accent-hover: #818cf8;
     --color-text-primary: #f1f5f9;
     --color-text-secondary: #94a3b8;
     --radius-sm: 6px;
     --radius-md: 12px;
     --radius-lg: 16px;
     --space-xs: 4px;
     --space-sm: 8px;
     --space-md: 16px;
     --space-lg: 24px;
   }
   ```

2. **Componentes base** — cada uno como client component con:
   - Props tipadas (TS interface)
   - Variantes (primary/secondary/ghost para Button; sm/md/lg sizes)
   - CSS modules o clases de `globals.css`
   - Hover/active animations

3. **Responsive rules**:
   - Mobile-first: base → `min-width: 640px` → `min-width: 1024px`
   - Grid: 1 col → 2 col → 3-4 col
   - Navigation: hamburger en mobile, sidebar en desktop

4. **Micro-animations**:

   ```css
   @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
   @keyframes shimmer { /* loading skeleton */ }
   ```

5. **Verificar** que todos los componentes se renderizan sin errores

## Checks de validación

```bash
npm run build
npm run dev
# Navegar a cada página y verificar visualmente
# Chrome DevTools → responsive mode: 375px, 768px, 1440px
```

- [ ] Tokens CSS definidos en `:root`
- [ ] Componentes base renderizan sin errores
- [ ] Responsive funciona en 3 breakpoints
- [ ] Hover/focus states visibles
- [ ] Animaciones suaves (no flashean)
- [ ] Fuente Inter cargando correctamente
- [ ] Dark theme consistente en toda la app
- [ ] `npm run build` sin errores

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| Fuente no carga | Import incorrecto | Verificar `next/font/google` setup en layout |
| Colores inconsistentes | Hardcoded en vez de tokens | Buscar/reemplazar por variables CSS |
| Layout roto en mobile | CSS no respeta breakpoints | Verificar media queries |
| Animaciones laggy | Animando propiedades costosas (width/height) | Usar solo transform/opacity |

## Notas

- Consultar `.agent/skills/design-system/SKILL.md` para la referencia completa de tokens.
- Glassmorphism: `background: rgba(17,24,39,0.8); backdrop-filter: blur(12px);`
- Preferir CSS variables sobre hardcoded values para tematización futura.
