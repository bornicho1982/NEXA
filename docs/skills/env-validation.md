# Skill: Env Validation

## Slug

`env-validation`

## Propósito

Crear un módulo TypeScript que valide la presencia y tipado de todas las variables de entorno al arrancar, y documentar cada variable en `docs/env-config.md`.

## Roles que la usan

- R1 — Arquitectura y Configuración

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| `.env.example` con todas las variables | Config | Repo |
| Requisitos de cada módulo (qué variables necesita) | Documentación | Cada rol |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `src/lib/config/env.ts` — validador tipado | TS module | Backend, IA, Manifest |
| `docs/env-config.md` — documentación completa | Markdown | Todos los roles |

## Archivos tocados

### Crea

```
src/lib/config/env.ts
docs/env-config.md
```

### Modifica

```
.env.example              — verificar que todas las variables están listadas
```

## Procedimiento

1. Leer `.env.example` para obtener la lista de variables
2. Crear `src/lib/config/env.ts`:

   ```typescript
   function requireEnv(name: string): string {
     const value = process.env[name];
     if (!value) throw new Error(`Missing env var: ${name}`);
     return value;
   }

   export const env = {
     BUNGIE_API_KEY: requireEnv('BUNGIE_API_KEY'),
     BUNGIE_CLIENT_ID: requireEnv('BUNGIE_CLIENT_ID'),
     BUNGIE_CLIENT_SECRET: requireEnv('BUNGIE_CLIENT_SECRET'),
     BUNGIE_REDIRECT_URL: requireEnv('BUNGIE_REDIRECT_URL'),
     DATABASE_URL: requireEnv('DATABASE_URL'),
     SESSION_SECRET: requireEnv('SESSION_SECRET'),
     NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000',
     OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
     OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama3',
   } as const;
   ```

3. Crear `docs/env-config.md` con tabla:
   - Variable | Requerida | Público | Descripción | Ejemplo
4. Verificar que ninguna variable sensible usa `NEXT_PUBLIC_`
5. Verificar que `env.ts` se importa en los servicios que lo necesitan

## Checks de validación

```bash
npm run build                     # env.ts compila sin errores
# Probar con variable faltante:
# Quitar BUNGIE_API_KEY de .env.local → el server debe crashear con mensaje claro
```

- [ ] `src/lib/config/env.ts` exporta todas las variables tipadas
- [ ] Faltar una variable requerida lanza error descriptivo
- [ ] Variables opcionales tienen defaults razonables
- [ ] `docs/env-config.md` documenta todas las variables
- [ ] Ninguna variable sensible es `NEXT_PUBLIC_*`
- [ ] `npm run build` sin errores

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| Build falla por variable faltante | `.env.local` no tiene la variable | Copiar de `.env.example` y rellenar |
| Variable no necesaria marcada como requerida | Módulo no la usa aún | Moverla a opcional con default |
| Import circular | `env.ts` importa módulos que importan `env.ts` | Mantener `env.ts` sin dependencias internas |

## Notas

- `env.ts` debe ser un módulo sin dependencias (solo `process.env`).
- En producción, las variables se inyectan por el hosting (Vercel, Docker, etc.).
