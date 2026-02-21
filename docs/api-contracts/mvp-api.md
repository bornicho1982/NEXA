# API Contracts (MVP)

Documentación de los contratos de API internos para NEXA.

Base URL: `/api`

## 1. Auth

### `GET /auth/login`

Inicia el flujo OAuth2 redirigiendo a Bungie.net.

- **Query**: None
- **Response**: 302 Redirect

### `GET /auth/callback`

Intercambia `code` por tokens y crea sesión.

- **Query**: `code` (string), `state` (string)
- **Response**: 302 Redirect `/dashboard` (set-cookie `session`)

### `GET /auth/me`

Obtiene perfil del usuario actual.

- **Headers**: Session Cookie
- **Response 200**:

  ```json
  {
    "membershipId": "12345",
    "displayName": "Guardian#1234",
    "avatarPath": "/img/...",
    "bungieGlobalDisplayName": "Guardian"
  }
  ```

## 2. Manifest

### `GET /manifest`

Obtiene versionado del manifest local.

- **Response 200**:

  ```json
  {
    "version": "123456...",
    "lastUpdated": "2026-02-16T12:00:00Z"
  }
  ```

## 3. Inventory & Loadouts

### `GET /inventory`

Obtiene items y personajes del usuario.

- **Response 200**:

  ```json
  {
    "characters": [ { "id": "2305...", "classType": 0, "emblem": "..." } ],
    "items": [
      {
        "itemHash": 12345,
        "instanceId": "691...",
        "name": "Ace of Spades",
        "icon": "/common/destiny2_content/icons/...",
        "type": "Weapon",
        "power": 1810,
        "stats": { "Impact": 80, "Range": 75 ... }
      }
    ],
    "currencies": { "Glimmer": 250000, "Shards": 1000 }
  }
  ```

### `GET /loadouts`

Lista loadouts guardados en DB local (NEXA database).

- **Response 200**: `[ { "id": 1, "name": "PvP Void", "items": [...] } ]`

### `POST /loadouts`

Crea un nuevo loadout.

- **Body**: `{ "name": "Raid Solar", "items": ["id1", "id2"...] }`
- **Response 201**: `{ "id": 2, ... }`

## 4. Build Engine

### `POST /builds/optimize`

Motor de combinatoria para stats.

- **Body**:

  ```json
  {
    "classType": 0, // Titan
    "statPriorities": { "Resilience": 100, "Recovery": 80 },
    "exoticHash": 123456, // Opcional (fuerza exótico)
    "modCost" : 5 // Opcional (reserva energía)
  }
  ```

- **Response 200**:

  ```json
  {
    "builds": [
      {
        "stats": { "Mob": 20, "Res": 100, "Rec": 80... },
        "tier": 32,
        "items": ["id_helmet", "id_arms"...],
        "modsNeeded": ["mod_resilience_major"...]
      }
    ]
  }
  ```

## 5. AI Advisor

### `POST /ai/chat`

Conversación con contexto de inventario.

- **Body**: `{ "message": "Best void weapons?" }`
- **Response 200 (Stream)**: Texto incremental.
- **Response 200 (JSON)**: `{ "response": "Based on your vault..." }` (si no stream)

### `GET /ai/status`

Verifica estado de Ollama local.

- **Response 200**: `{ "status": "ok", "model": "llama3" }`
- **Response 503**: `{ "status": "error", "message": "Ollama not reachable" }`
