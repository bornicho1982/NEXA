# Skill: Inventory Read Model

## Slug

`inventory-read`

## Propósito

Obtener el inventario del jugador vía `GetProfile`, transformar los datos crudos de Bungie en DTOs enriquecidos con nombres, iconos y stats resueltos del Manifest, organizados por bucket (armas, armadura, etc.) para consumo de UI y Build Engine.

## Roles que la usan

- R5 — Inventory & Loadouts

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| `bungieGet()` — HTTP client autenticado | TS module | R3 Backend |
| `getSession()` — tokens del usuario | TS function | R3 Backend |
| `getDefinition()` — resolver de hashes | TS function | R4 Manifest |
| User profile (membershipId, membershipType) | DB | R3 Backend |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `src/lib/inventory/service.ts` — `getInventory()` | TS function | API route, Build Engine |
| `src/app/api/inventory/route.ts` — GET inventory | Route Handler | Frontend |
| Tipos: `InventoryItem`, `ArmorItem`, `WeaponItem`, `BucketGroup` | TS types | Build Engine, AI, Frontend |

## Archivos tocados

### Crea

```
src/lib/inventory/service.ts
src/app/api/inventory/route.ts
src/types/inventory.ts          (si se centralizan tipos)
```

## Procedimiento

1. **Fetch profile** vía Bungie API:

   ```
   GET /Platform/Destiny2/{membershipType}/Profile/{membershipId}/
     ?components=100,102,200,201,205,300,304,305
   ```

   - 100: Profile
   - 102: ProfileInventories
   - 200: Characters
   - 201: CharacterInventories
   - 205: CharacterEquipment
   - 300: ItemInstances
   - 304: ItemStats
   - 305: ItemSockets
2. **Mapear items** — por cada item en el inventario:
   - Resolver `itemHash` → `DestinyInventoryItemDefinition` (nombre, icono, tipo)
   - Enriquecer con instance data (power level, stats, masterwork)
   - Clasificar por bucket (helmet, gauntlets, chest, legs, class item, weapons)
3. **Construir DTO** — `InventoryItem`:

   ```typescript
   interface InventoryItem {
     itemInstanceId: string;
     itemHash: number;
     name: string;
     icon: string;
     tierType: number;     // Legendary, Exotic, etc.
     classType: number;    // Titan, Hunter, Warlock
     bucketHash: number;
     powerLevel: number;
     stats: Record<string, number>;  // mobility, resilience, etc.
     isEquipped: boolean;
     characterId?: string;
   }
   ```

4. **Agrupar por bucket** para UI:

   ```typescript
   interface BucketGroup {
     bucketHash: number;
     bucketName: string;
     items: InventoryItem[];
   }
   ```

5. **Route Handler** `GET /api/inventory`:
   - Verificar session → obtener tokens
   - Llamar `getInventory(membershipType, membershipId, accessToken)`
   - Devolver `{ characters, items, buckets }`

## Checks de validación

```bash
npm run build
npm run dev
# Test (requiere auth):
curl -b cookies.txt https://localhost:3000/api/inventory
# Esperado: JSON con characters, items array no vacío, stats resueltos
```

- [ ] `/api/inventory` devuelve items con `name`, `icon`, `stats` resueltos
- [ ] Items agrupados por bucket correctamente
- [ ] Stats de armadura incluyen mobility, resilience, recovery, discipline, intellect, strength
- [ ] Items equipados tienen `isEquipped: true`
- [ ] Inventario vacío devuelve array vacío (no error)
- [ ] 401 si no hay session
- [ ] `npm run build` sin errores

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| Profile devuelve empty | Componentes incorrectos | Verificar component numbers |
| Items sin nombre | Manifest no cacheado | Ejecutar manifest-sync primero |
| Stats vacíos | No se pidió componente 304 | Añadir ItemStats al request |
| 401 de Bungie | Token expirado | Llamar refresh, reintentar |
| Mucho payload (~1MB) | Inventario completo es grande | Paginar o filtrar por tipo |

## Notas

- El inventario de D2 tiene 3 vaults + 3 personajes × ~10 slots = ~200-500 items.
- Los stats vienen como statHash → valor numérico; necesitan resolverse vía Manifest.
- Power level viene del componente `ItemInstances` (campo `primaryStat`).
