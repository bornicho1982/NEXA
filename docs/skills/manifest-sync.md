# Skill: Manifest Sync & Cache

## Slug

`manifest-sync`

## Propósito

Descargar el Manifest de Destiny 2, versionarlo, cachearlo en disco/SQLite, y exponer un resolver tipado para transformar hashes opacos en definiciones legibles con tipos TypeScript.

## Roles que la usan

- R4 — Manifest & Data Modeling

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| `bungieGet()` — HTTP client | TS module | R3 Backend (skill bungie-client) |
| `BUNGIE_API_KEY` | Env var | R1 Arquitectura |
| Manifest endpoint: `GET /Platform/Destiny2/Manifest/` | REST | bungie.net |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `src/lib/manifest/service.ts` — ManifestService | TS module | Inventory, Build Engine, AI, Frontend |
| `src/app/api/manifest/route.ts` — GET manifest info | Route Handler | Frontend |
| `src/app/api/manifest/definition/route.ts` — GET definition by hash | Route Handler | Frontend |
| Manifest cacheado en `.manifest-cache/` o SQLite | Archivos/DB | Local runtime |
| Tipos TS: `DestinyInventoryItemDefinition`, etc. | TS types | Build Engine, AI |

## Archivos tocados

### Crea

```
src/lib/manifest/service.ts
src/lib/manifest/types.ts             (tipos de definiciones)
src/app/api/manifest/route.ts
src/app/api/manifest/definition/route.ts
.manifest-cache/                       (directorio de cache)
```

## Procedimiento

1. **Check versión** → `GET /Platform/Destiny2/Manifest/` → obtener `jsonWorldContentPaths.en`
2. **Comparar versión** con la cacheada (guardar version hash en `.manifest-cache/version.json`)
3. **Si es nueva versión**:
   - Descargar JSON world content (~80MB) con timeout extendido (60s)
   - Parsear y extraer tablas necesarias:
     - `DestinyInventoryItemDefinition` (items)
     - `DestinyStatDefinition` (stats)
     - `DestinySocketCategoryDefinition` (sockets)
     - `DestinyPlugSetDefinition` (perks)
     - `DestinyClassDefinition` (clases)
     - `DestinyDamageTypeDefinition` (damage types)
   - Guardar en archivos JSON separados o SQLite
   - Actualizar `version.json`
4. **Resolver API** — `getDefinition(table, hash)`:

   ```typescript
   function getDefinition<T>(table: string, hash: number): T | undefined {
     // Buscar en cache → devolver tipado
   }
   ```

5. **Route Handlers**:
   - `GET /api/manifest` → devolver versión actual y estado del cache
   - `GET /api/manifest/definition?type=InventoryItem&hash=123` → devolver definición

## Checks de validación

```bash
npm run build
npm run dev
# Test de descarga:
curl https://localhost:3000/api/manifest
# Esperado: { "version": "...", "cached": true/false, "tables": [...] }
# Test de resolver:
curl "https://localhost:3000/api/manifest/definition?type=DestinyInventoryItemDefinition&hash=2272470786"
# Esperado: { "displayProperties": { "name": "Sunshot", ... } }
```

- [ ] Manifest se descarga y cachea correctamente
- [ ] La versión se compara antes de re-descargar
- [ ] `getDefinition()` resuelve hashes a definiciones tipadas
- [ ] `/api/manifest` devuelve info del cache
- [ ] `/api/manifest/definition` resuelve hashes
- [ ] Tablas clave extraídas: Items, Stats, Classes, DamageTypes
- [ ] `npm run build` sin errores

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| Descarga timeout | Manifest muy grande (~80MB) | Aumentar timeout a 120s, retry 2 veces |
| JSON parse falla | Descarga corrupta | Borrar cache, re-descargar |
| Hash no encontrado | Manifest desactualizado | Forzar re-sync |
| Disco lleno | Cache acumulado | Limpiar versiones viejas, mantener solo la última |
| Tipos incorrectos | Bungie cambió el schema | Actualizar types.ts con nuevos campos |

## Notas

- El Manifest se actualiza con cada patch de Destiny 2 (~semanal/mensual).
- No descargar el manifest en cada request — verificar versión y usar cache.
- El manifest JSON completo pesa ~80-100MB; solo cachear las tablas necesarias.
