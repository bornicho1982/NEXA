# Plantilla — Contrato API

> Copia este archivo para documentar un nuevo endpoint.
> Ubicación: `docs/api-contracts/<nombre-del-endpoint>.md`

## Endpoint

`POST /api/example`

## Descripción

Breve descripción de qué hace este endpoint.

## Autenticación

- ✅ Requiere sesión (cookie `session`)

## Request

### Headers

```
Content-Type: application/json
Cookie: session=<jwt>
```

### Body

| Campo | Tipo | Obligatorio | Descripción | Ejemplo |
|-------|------|-------------|-------------|---------|
| `fieldA` | string | Sí | Descripción del campo | `"valor"` |
| `fieldB` | number | No | Descripción del campo | `42` |
| `fieldC` | boolean | No | Default: `true` | `true` |

### Ejemplo

```json
{
  "fieldA": "valor",
  "fieldB": 42,
  "fieldC": true
}
```

## Response

### 200 — Éxito

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Siempre `true` |
| `data` | object | Datos de respuesta |

```json
{
  "success": true,
  "data": {}
}
```

### 400 — Parámetros inválidos

```json
{
  "error": "Missing required field: fieldA"
}
```

### 401 — No autenticado

```json
{
  "error": "Not authenticated"
}
```

### 500 — Error del servidor

```json
{
  "error": "Internal server error"
}
```

## Notas

- Rate limiting: X requests/segundo
- Dependencias: Bungie API, base de datos
