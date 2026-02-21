---
description: Cómo crear un nuevo componente UI reutilizable en NEXA
---

# Nuevo Componente UI — Paso a paso

## 1. Decidir ubicación

```
src/components/
  ui/           → Componentes genéricos (Button, Modal, Input, Badge)
  layout/       → Componentes de layout (AppHeader, Sidebar, ErrorBoundary)
  inventory/    → Componentes específicos de inventario
  builds/       → Componentes específicos de builds
```

## 2. Crear el archivo

Crear `src/components/<categoria>/<NombreComponente>.tsx`

## 3. Plantilla base

```tsx
"use client";

interface MiComponenteProps {
    title: string;
    children?: React.ReactNode;
    variant?: "default" | "primary" | "danger";
    className?: string;
}

export function MiComponente({
    title,
    children,
    variant = "default",
    className = "",
}: MiComponenteProps) {
    const variants = {
        default: "glass border-white/5",
        primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
        danger: "bg-red-600/20 hover:bg-red-600/40 text-red-300",
    };

    return (
        <div className={`rounded-xl p-4 transition-all ${variants[variant]} ${className}`}>
            <h3 className="text-white font-medium text-sm">{title}</h3>
            {children && <div className="mt-2">{children}</div>}
        </div>
    );
}
```

## 4. Reglas de diseño

- Usar clases globales del design system (`glass`, `text-gradient`)
- Responsive por defecto (mobile-first)
- Aceptar `className` para extensibilidad
- Exportar como named export (no default)
- Props tipadas con interface

## 5. Verificar

// turbo

```bash
npm run build
```
