# Skill: Bungie Client

## Slug

`bungie-client`

## Propósito

Implementar un cliente HTTP reutilizable para la API de Bungie con headers requeridos, manejo de errores estructurado, rate limiting (throttle), y reintentos con backoff exponencial.

## Roles que la usan

- R3 — Backend y API
- R4 — Manifest & Data Modeling
- R5 — Inventory & Loadouts

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| `BUNGIE_API_KEY` | Env var | R1 Arquitectura |
| Access token del usuario (para endpoints autenticados) | JWT session | Skill bungie-oauth |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `src/lib/bungie/client.ts` — HTTP client | TS module | Manifest, Inventory, Build Engine, AI |

## Archivos tocados

### Crea

```
src/lib/bungie/client.ts
```

## Procedimiento

1. Crear `src/lib/bungie/client.ts` con clase/funciones:

   ```typescript
   const BUNGIE_BASE = 'https://www.bungie.net';

   interface BungieResponse<T> {
     Response: T;
     ErrorCode: number;
     ErrorStatus: string;
     Message: string;
   }

   async function bungieGet<T>(path: string, accessToken?: string): Promise<T> {
     // 1. Headers: X-API-Key, Authorization (si token)
     // 2. Fetch con timeout de 15s
     // 3. Check throttle (x-throttle-seconds header)
     // 4. Check ErrorCode !== 1 → throw con mensaje
     // 5. Retry hasta 3 veces con backoff exponencial
     // 6. Devolver Response
   }
   ```

2. Headers obligatorios:
   - `X-API-Key: {BUNGIE_API_KEY}`
   - `Authorization: Bearer {accessToken}` (solo endpoints autenticados)
3. Rate limiting:
   - Leer header `x-throttle-seconds` de la respuesta
   - Si presente, esperar N segundos antes del siguiente request
4. Retry:
   - 3 intentos máximo
   - Backoff: 1s → 2s → 4s
   - Retry solo en 5xx y network errors, no en 4xx
5. Error handling:
   - `ErrorCode !== 1` → error de Bungie → log + throw
   - Network error → retry o throw descriptivo
   - 401 → token expirado → señalar para refresh

## Checks de validación

```bash
npm run build
npm run dev
# Llamar a un endpoint que use bungieGet:
curl -b cookies.txt https://localhost:3000/api/auth/me
# Debe devolver datos del usuario si autenticado
```

- [ ] `bungieGet()` añade X-API-Key a todas las requests
- [ ] Endpoints autenticados incluyen Authorization header
- [ ] Respeta `x-throttle-seconds` si Bungie lo devuelve
- [ ] Retry funciona en errores 5xx (verificar con logs)
- [ ] No hace retry en errores 4xx
- [ ] Timeout de 15s funciona
- [ ] `npm run build` sin errores

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| 401 en todas las requests | API key inválida | Verificar BUNGIE_API_KEY en .env.local |
| Throttle constante | Demasiadas requests | Implementar queue con delay |
| Timeout en manifest download | Archivo muy grande (>80MB) | Aumentar timeout para manifest a 60s |
| Network errors frecuentes | DNS o firewall | Verificar conectividad a bungie.net |

## Notas

- La API de Bungie tiene un rate limit informal de ~25 req/sec para la mayoría de endpoints.
- Endpoints como `TransferItem` y `EquipItem` tienen rate limits más estrictos (~1 req/sec).
- El client debe ser stateless — no cachear respuestas (eso es del Manifest skill).
