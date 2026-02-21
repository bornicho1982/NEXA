# Skill: Next.js Patterns

## Slug

`next-patterns`

## Propósito

Referencia de patrones y convenciones de Next.js 15+ (App Router) usados en NEXA: convenciones de archivos, client vs server components, route handlers, y auth guards.

## Roles que la usan

- R1 — Arquitectura
- R3 — Backend y API
- R8 — Frontend y UI/UX

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| [Next.js App Router Docs](https://nextjs.org/docs/app) | Documentación externa | nextjs.org |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| Referencia de patrones para implementadores | Documentación | Todos los roles |

## Archivos tocados

### Crea

```
(ninguno — este skill es referencia, no produce archivos)
```

### Modifica

```
(ninguno)
```

## Procedimiento

### 1. Convenciones de archivos App Router

| Archivo | Propósito |
|---------|-----------|
| `page.tsx` | Componente de página (ruta automática) |
| `layout.tsx` | Layout compartido entre páginas hijas |
| `route.ts` | Route Handler (API endpoint) |
| `loading.tsx` | UI de loading automática (Suspense) |
| `error.tsx` | Error boundary por segmento |
| `not-found.tsx` | Página 404 personalizada |

### 2. Server Components (default)

```tsx
// No necesitan 'use client'
// Pueden hacer fetch directo, acceder a DB, leer env vars
export default function Page() {
  return <div>Server rendered</div>;
}
```

- Default en App Router — todo componente es server a menos que diga `'use client'`
- Pueden usar `async/await` directamente
- Pueden importar módulos server-only (Prisma, env.ts, etc.)

### 3. Client Components

```tsx
'use client';
// Necesarios para: useState, useEffect, onClick, useRouter
// No pueden acceder directamente a DB ni env vars del server
```

- Deben declarar `'use client'` en la primera línea
- Necesarios para interactividad (hooks, event handlers)
- No pueden importar módulos server-only

### 4. Route Handlers (API)

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ data: 'hello' });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Validar inputs...
  return NextResponse.json({ success: true });
}
```

### 5. Patrón Auth Guard (Client)

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

### 6. Archivos clave del proyecto

| Archivo | Propósito |
|---------|-----------|
| `src/app/layout.tsx` | Root layout (font, providers, SW registration) |
| `src/components/layout/AppHeader.tsx` | Header compartido |
| `src/components/layout/ErrorBoundary.tsx` | Error boundary global |
| `src/contexts/AuthContext.tsx` | Auth provider (client) |

## Checks de validación

- [ ] Todos los componentes con hooks/events tienen `'use client'`
- [ ] Route handlers usan `NextRequest`/`NextResponse`
- [ ] No hay imports server-only en client components
- [ ] `npm run build` no da errores de "server/client mismatch"

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| "useState is not a function" | Falta `'use client'` | Añadir directiva al inicio del archivo |
| "Module not found: prisma" en client | Import server-only en client component | Mover lógica a server component o route handler |
| Route handler no responde | Archivo no se llama `route.ts` | Verificar naming convention |
| Hydration mismatch | Server y client renderizan diferente | Verificar uso de `useEffect` para lógica client-only |

## Notas

- Referencia agent original: `.agent/skills/next-patterns/SKILL.md`
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- Preferir server components siempre que sea posible (performance).
