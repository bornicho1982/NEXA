---
description: Cómo añadir una nueva página o feature completa a NEXA
---

# Nueva Feature — Paso a paso

## 1. Crear la página

```bash
# Crear el directorio de la ruta
mkdir src/app/<nombre-feature>
```

## 2. Crear el archivo de página

Crear `src/app/<nombre-feature>/page.tsx`:

```tsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

export default function NuevaFeaturePage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) router.push("/");
    }, [user, authLoading, router]);

    if (authLoading || !user) return null;

    return (
        <div className="min-h-screen bg-[#050810] animate-page-enter">
            <AppHeader title="Mi Feature" />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Contenido aquí */}
            </main>
        </div>
    );
}
```

## 3. Crear API Route (si necesita backend)

Crear `src/app/api/<nombre-feature>/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    // Lógica...
    return NextResponse.json({ data: {} });
}
```

## 4. Crear servicio (si tiene lógica de negocio)

Crear `src/lib/<nombre-feature>/service.ts`

## 5. Añadir navegación en Dashboard

Editar `src/app/dashboard/page.tsx` → array `NAV_ITEMS`:

```typescript
{ title: "Mi Feature", description: "...", icon: "🆕", href: "/mi-feature" },
```

## 6. Verificar

// turbo

```bash
npm run build
```
