# Skill: Observability

## Slug

`observability`

## Propósito

Implementar logging estructurado (JSON), request ID tracing, timing de endpoints, y reportes de errores para los route handlers críticos.

## Roles que la usan

- R11 — Observabilidad & Telemetría

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| Route Handlers existentes | TS | R3-R7 |
| `.env.local` con `LOG_LEVEL` (opcional) | Env var | R1 Arquitectura |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `src/lib/logger.ts` — structured logger | TS module | Todos los servicios server |
| `src/lib/middleware/telemetry.ts` — timing + request-id middleware | TS module | Route Handlers |
| Logs JSON en stdout | JSON lines | Runtime |

## Archivos tocados

### Crea

```
src/lib/logger.ts
src/lib/middleware/telemetry.ts
```

### Modifica

```
src/app/api/*/route.ts              — wrap handlers con withTelemetry()
```

## Procedimiento

1. **Logger** (`src/lib/logger.ts`):

   ```typescript
   type LogLevel = 'debug' | 'info' | 'warn' | 'error';

   function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
     const entry = {
       timestamp: new Date().toISOString(),
       level,
       message,
       ...meta,
     };
     console.log(JSON.stringify(entry));
   }

   export const logger = {
     debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
     info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
     warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
     error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
   };
   ```

2. **Telemetry middleware** (`src/lib/middleware/telemetry.ts`):

   ```typescript
   import { logger } from '@/lib/logger';
   import { NextRequest, NextResponse } from 'next/server';
   import { randomUUID } from 'crypto';

   type RouteHandler = (req: NextRequest, ctx?: unknown) => Promise<NextResponse>;

   export function withTelemetry(name: string, handler: RouteHandler): RouteHandler {
     return async (req, ctx) => {
       const requestId = randomUUID();
       const start = performance.now();
       try {
         const res = await handler(req, ctx);
         const duration = Math.round(performance.now() - start);
         logger.info(`${name} completed`, {
           requestId, method: req.method, path: req.nextUrl.pathname,
           status: res.status, durationMs: duration,
         });
         res.headers.set('x-request-id', requestId);
         return res;
       } catch (error) {
         const duration = Math.round(performance.now() - start);
         logger.error(`${name} failed`, {
           requestId, method: req.method, path: req.nextUrl.pathname,
           durationMs: duration,
           error: error instanceof Error ? error.message : String(error),
         });
         throw error;
       }
     };
   }
   ```

3. **Wrap handlers** — ejemplo de uso:

   ```typescript
   // src/app/api/inventory/route.ts
   import { withTelemetry } from '@/lib/middleware/telemetry';

   export const GET = withTelemetry('GET /api/inventory', async (req) => {
     // ... handler logic
   });
   ```

4. **Aplicar** a los handlers más críticos:
   - `/api/auth/*` (login, callback, me, refresh, logout)
   - `/api/inventory` (GET, POST actions)
   - `/api/builds/optimize` (POST)
   - `/api/ai/chat` (POST)
   - `/api/manifest` (GET)

## Checks de validación

```bash
npm run build
npm run dev
# Hacer requests y verificar logs en la terminal del dev server:
curl -b cookies.txt https://localhost:3000/api/auth/me
# Esperado en terminal:
# {"timestamp":"...","level":"info","message":"GET /api/auth/me completed","requestId":"...","status":200,"durationMs":45}
```

- [ ] `logger` genera JSON válido en stdout
- [ ] Cada log tiene timestamp, level, message
- [ ] `withTelemetry()` añade requestId, duration, status
- [ ] x-request-id header presente en respuestas
- [ ] Errores se loguean como `error` con stack (truncado, sin PII)
- [ ] Logs NO contienen tokens, passwords, o PII
- [ ] `npm run build` sin errores

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| Performance overhead | Logger demasiado verbose | Usar LOG_LEVEL=info en producción |
| Import circular | telemetry importa algo que importa telemetry | Mantener logger sin deps internas |
| JSON parse error en logs | Campo meta no serializable | Stringify con safe fallback |
| requestId no se propaga | No se pasa entre servicios | Considerar async context (V2) |

## Notas

- En MVP, stdout JSON es suficiente. En V2, considerar Grafana/Loki o similar.
- No loguear body de requests/responses completos — solo metadata.
- `performance.now()` da timing en ms con precisión de sub-ms.
