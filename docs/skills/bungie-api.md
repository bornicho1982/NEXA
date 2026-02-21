# Skill: Bungie API Reference

## Slug

`bungie-api`

## Propósito

Referencia centralizada de la API de Bungie.net: endpoints principales, headers requeridos, rate limiting, y patrones de respuesta. Complementa las skills `bungie-oauth` y `bungie-client` con información de referencia para implementadores.

## Roles que la usan

- R3 — Backend y API
- R4 — Manifest & Data Modeling
- R5 — Inventory & Loadouts

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| [Bungie API Docs](https://bungie-net.github.io/multi/index.html) | Documentación externa | bungie.net |
| [API Explorer](https://data.destinysets.com/) | Herramienta externa | destinysets.com |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| Referencia de endpoints para implementadores | Documentación | R3, R4, R5 roles |

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

### 1. Endpoints de autenticación (OAuth2)

| Operación | Método | Endpoint |
|-----------|--------|----------|
| Authorize | `GET` | `https://www.bungie.net/en/oauth/authorize?client_id={CLIENT_ID}&response_type=code` |
| Token | `POST` | `https://www.bungie.net/platform/app/oauth/token/` |
| Refresh | `POST` | Mismo endpoint con `grant_type=refresh_token` |

### 2. Endpoints de Manifest

| Operación | Método | Endpoint |
|-----------|--------|----------|
| Get Manifest | `GET` | `/Platform/Destiny2/Manifest/` |
| Get Definition | `GET` | `/Platform/Destiny2/Manifest/{entityType}/{hashIdentifier}/` |

### 3. Endpoints de perfil e inventario

| Operación | Método | Endpoint |
|-----------|--------|----------|
| Profile | `GET` | `/Platform/Destiny2/{membershipType}/Profile/{destinyMembershipId}/?components=100,102,200,201,205,300,304,305` |
| Transfer Item | `POST` | `/Platform/Destiny2/Actions/Items/TransferItem/` |
| Equip Item | `POST` | `/Platform/Destiny2/Actions/Items/EquipItem/` |
| Memberships | `GET` | `/Platform/User/GetMembershipsForCurrentUser/` |

### 4. Headers requeridos

```http
X-API-Key: {BUNGIE_API_KEY}
Authorization: Bearer {access_token}
```

- `X-API-Key` es requerido en **todas** las requests
- `Authorization` solo en endpoints autenticados (profile, transfer, equip)

### 5. Rate limiting

- Respetar header `x-throttle-seconds` en las respuestas
- Máximo ~25 requests/segundo por API key (informal)
- Transfer/Equip: máximo ~1 req/sec (más estricto)
- Implementar retry con backoff exponencial

### 6. Formato de respuesta estándar

```typescript
interface BungieResponse<T> {
  Response: T;
  ErrorCode: number;      // 1 = Success
  ThrottleSeconds: number;
  ErrorStatus: string;
  Message: string;
  MessageData: Record<string, string>;
}
```

- `ErrorCode === 1` → éxito
- `ErrorCode !== 1` → error de Bungie (no HTTP error)
- `ThrottleSeconds > 0` → esperar antes del siguiente request

## Checks de validación

- [ ] Todos los endpoints listados son accesibles con API key válida
- [ ] Headers correctos producen respuestas con `ErrorCode: 1`
- [ ] Rate limiting está implementado en `src/lib/bungie/client.ts`

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| 401 Unauthorized | API key inválida o expirada | Verificar en bungie.net/en/Application |
| 403 Forbidden | App no tiene permisos necesarios | Revisar scopes en bungie.net/en/Application |
| 503 Service Unavailable | Mantenimiento de Bungie | Esperar, mostrar mensaje al usuario |
| Rate limit hit | Demasiadas requests | Respetar `x-throttle-seconds`, implementar queue |

## Notas

- Referencia agent original: `.agent/skills/bungie-api/SKILL.md`
- Skills de implementación: [`bungie-oauth.md`](./bungie-oauth.md), [`bungie-client.md`](./bungie-client.md)
- [Documentación oficial](https://bungie-net.github.io/multi/index.html)
- [API Explorer](https://data.destinysets.com/)
