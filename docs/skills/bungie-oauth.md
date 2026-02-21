# Skill: Bungie OAuth

## Slug

`bungie-oauth`

## Propósito

Implementar el flujo completo de autenticación OAuth2 con Bungie.net: login redirect, callback con exchange de code, sesión JWT en HttpOnly cookie, logout, y protección CSRF con state parameter.

## Roles que la usan

- R3 — Backend y API

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| `BUNGIE_CLIENT_ID`, `BUNGIE_CLIENT_SECRET`, `BUNGIE_REDIRECT_URL` | Env vars | R1 Arquitectura |
| `SESSION_SECRET` (min 32 chars) | Env var | R1 Arquitectura |
| Prisma schema con modelo User | Schema | R1 Arquitectura |
| Documentación OAuth de Bungie | API docs | bungie.net |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `src/app/api/auth/login/route.ts` | Route Handler | Frontend |
| `src/app/api/auth/callback/route.ts` | Route Handler | Bungie redirect |
| `src/app/api/auth/logout/route.ts` | Route Handler | Frontend |
| `src/app/api/auth/me/route.ts` | Route Handler | Frontend |
| `src/app/api/auth/refresh/route.ts` | Route Handler | Frontend |
| `src/lib/session.ts` — JWT session management | TS module | Todos los servicios |

## Archivos tocados

### Crea

```
src/app/api/auth/login/route.ts
src/app/api/auth/callback/route.ts
src/app/api/auth/logout/route.ts
src/app/api/auth/me/route.ts
src/app/api/auth/refresh/route.ts
src/lib/session.ts
```

## Procedimiento

1. **Login** (`GET /api/auth/login`):
   - Generar `state` aleatorio (CSRF protection)
   - Guardarlo en cookie temporal (`bungie_auth_state`, HttpOnly, 10min TTL)
   - Redirect a `https://www.bungie.net/en/OAuth/Authorize?client_id=...&response_type=code&state=...`

2. **Callback** (`GET /api/auth/callback`):
   - Verificar `state` param contra cookie `bungie_auth_state`
   - Exchange `code` → `access_token` + `refresh_token` via POST `/Platform/App/OAuth/Token/`
   - Fetch user profile: `GET /Platform/User/GetMembershipsForCurrentUser/`
   - Upsert User en DB (Prisma) con tokens cifrados
   - Crear JWT session → set HttpOnly cookie `nexa_session`
   - Redirect a `/dashboard`

3. **Me** (`GET /api/auth/me`):
   - Leer cookie `nexa_session` → verificar JWT
   - Buscar user en DB → devolver `{ user: { displayName, profilePicturePath, ... } }`
   - Si no hay session → 401

4. **Refresh** (`POST /api/auth/refresh`):
   - Verificar session JWT
   - Usar `refresh_token` de DB → POST `/Platform/App/OAuth/Token/` con `grant_type=refresh_token`
   - Actualizar tokens en DB
   - Devolver 200

5. **Logout** (`POST /api/auth/logout`):
   - Borrar cookie `nexa_session`
   - Devolver 200

6. **Session** (`src/lib/session.ts`):
   - `createSession(userId)` → JWT firmado con `jose`
   - `getSession(cookies)` → decodificar y validar JWT → devolver userId
   - Cookie config: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age=7d`

## Checks de validación

```bash
npm run build
npm run dev

# Test manual:
# 1. Abrir https://localhost:3000/api/auth/login → debe redirigir a Bungie
# 2. Autorizar en Bungie → debe volver a /dashboard
# 3. curl -b cookies.txt https://localhost:3000/api/auth/me → debe devolver user
# 4. curl -X POST -b cookies.txt https://localhost:3000/api/auth/logout → 200
# 5. curl -b cookies.txt https://localhost:3000/api/auth/me → 401
```

- [ ] Login redirect funciona con state CSRF
- [ ] Callback intercambia code por tokens y crea session
- [ ] /me devuelve user cuando hay session válida
- [ ] /me devuelve 401 cuando no hay session
- [ ] Logout borra la cookie y /me devuelve 401 después
- [ ] Refresh actualiza tokens en DB
- [ ] Tokens cifrados en DB (no plaintext)
- [ ] Cookie es HttpOnly + Secure + SameSite

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| Redirect a Bungie falla | CLIENT_ID incorrecto | Verificar en bungie.net/en/Application |
| Callback da error 400 | REDIRECT_URL no coincide con la registrada | Verificar que match exacto |
| State mismatch | Cookie expiró o browser bloqueó cookie | Aumentar TTL, verificar HTTPS |
| Token refresh falla | Token expirado (>90 días) | Forzar re-login |
| jose falla en edge runtime | Versión incompatible | Asegurar jose >= 5.x |

## Notas

- Bungie OAuth tokens expiran en 1 hora; refresh tokens en 90 días.
- `jose` se usa en vez de `jsonwebtoken` porque es compatible con Edge Runtime de Next.js.
- El state CSRF es crítico para prevenir ataques de redirección.
