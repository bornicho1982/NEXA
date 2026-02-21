# Configuración de Variables de Entorno

Este documento detalla las variables de entorno necesarias para ejecutar NEXA.

## Backend (Server-side)

| Variable | Requerida | Privado | Descripción | Ejemplo |
|----------|-----------|---------|-------------|---------|
| `BUNGIE_API_KEY` | ✅ Sí | 🔒 Sí | API Key de Bungie.net Developers Portal | `abcdef123456...` |
| `BUNGIE_CLIENT_ID` | ✅ Sí | 🔒 Sí | ID de la aplicación OAuth | `12345` |
| `BUNGIE_CLIENT_SECRET` | ✅ Sí | 🔒 Sí | Secret de la aplicación OAuth | `secret_abc_123` |
| `BUNGIE_REDIRECT_URL` | ✅ Sí | 🔒 Sí | URL de callback OAuth registrada | `http://localhost:3000/api/auth/callback` |
| `DATABASE_URL` | ✅ Sí | 🔒 Sí | Connection string de la base de datos (Prisma) | `file:./dev.db` |
| `SESSION_SECRET` | ✅ Sí | 🔒 Sí | Clave para firmar cookies de sesión (JWT) | `long_random_string` |
| `OLLAMA_HOST` | ❌ No | 🔒 Sí | URL del servidor Ollama (default: localhost) | `http://localhost:11434` |
| `OLLAMA_MODEL` | ❌ No | 🔒 Sí | Modelo LLM a utilizar (default: llama3) | `llama3` |

## Frontend (Public / Shared)

| Variable | Requerida | Privado | Descripción | Ejemplo |
|----------|-----------|---------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | ✅ Sí | ❌ No | URL base de la aplicación (para links absolutos) | `http://localhost:3000` |

## Notas

- Las variables marcadas como **Privado** 🔒 NUNCA deben exponerse en el cliente (no usar `NEXT_PUBLIC_`).
- `.env.local` se ignora en git. Usar `.env.example` como plantilla.
