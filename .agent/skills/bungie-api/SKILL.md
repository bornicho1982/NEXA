---
name: bungie-api
description: Skill para interactuar con la API de Bungie.net (OAuth2, Manifest, Inventory)
---

# Skill: Bungie API

## Descripción

Este skill contiene las instrucciones y referencias necesarias para trabajar con la API de Bungie.net en el contexto de NEXA.

## Endpoints principales

### Autenticación (OAuth2)

- **Authorize**: `https://www.bungie.net/en/oauth/authorize?client_id={CLIENT_ID}&response_type=code`
- **Token**: `POST https://www.bungie.net/platform/app/oauth/token/`
- **Refresh**: Mismo endpoint con `grant_type=refresh_token`

### Manifest

- **Get Manifest**: `GET /Platform/Destiny2/Manifest/`
- **Get Definition**: `GET /Platform/Destiny2/Manifest/{entityType}/{hashIdentifier}/`

### Perfil e Inventario

- **Profile**: `GET /Platform/Destiny2/{membershipType}/Profile/{destinyMembershipId}/?components=100,200,201,205,102`
- **Transfer Item**: `POST /Platform/Destiny2/Actions/Items/TransferItem/`
- **Equip Item**: `POST /Platform/Destiny2/Actions/Items/EquipItem/`

## Headers requeridos

```
X-API-Key: {BUNGIE_API_KEY}
Authorization: Bearer {access_token}
```

## Archivos relacionados en NEXA

- `src/lib/bungie/client.ts` → Cliente HTTP
- `src/lib/session.ts` → Gestión de tokens
- `src/app/api/auth/` → Flujo OAuth2

## Rate Limiting

- Respetar `x-throttle-seconds` en las respuestas
- Máximo ~25 requests/segundo por API key
- Implementar retry con backoff exponencial

## Referencia

- [Bungie API Docs](https://bungie-net.github.io/multi/index.html)
- [API Explorer](https://data.destinysets.com/)
