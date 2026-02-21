---
name: next-patterns
description: Patrones y convenciones de Next.js 15+ App Router para el proyecto NEXA
---

# Skill: Next.js Patterns

## Descripción

Patrones y convenciones específicas de Next.js 15 (App Router) que se siguen en NEXA.

## Convenciones de archivos

| Archivo | Propósito |
|---------|-----------|
| `page.tsx` | Componente de página (ruta automática) |
| `layout.tsx` | Layout compartido entre páginas hijas |
| `route.ts` | Route Handler (API endpoint) |
| `loading.tsx` | UI de loading automática (Suspense) |
| `error.tsx` | Error boundary por segmento |
| `not-found.tsx` | Página 404 personalizada |

## Client vs Server Components

### Server Components (default)

```tsx
// No necesitan 'use client'
// Pueden hacer fetch directo, acceder a DB, leer env vars
export default function Page() {
  return <div>Server rendered</div>;
}
```

### Client Components

```tsx
'use client';
// Necesarios para: useState, useEffect, onClick, useRouter
// No pueden acceder directamente a DB ni env vars del server
```

## Route Handlers (API)

```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data: 'hello' });
}

export async function POST(req: Request) {
  const body = await req.json();
  // Validar inputs...
  return NextResponse.json({ success: true });
}
```

## Patrón de Auth Guard (Client)

```tsx
'use client';
export default function ProtectedPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;
  // ... render page
}
```

## Archivos relacionados

- `src/app/layout.tsx` → Root layout
- `src/components/layout/AppHeader.tsx` → Header compartido
- `src/components/layout/ErrorBoundary.tsx` → Error boundary global
- `src/contexts/AuthContext.tsx` → Auth provider

## Referencia

- [Next.js App Router Docs](https://nextjs.org/docs/app)
