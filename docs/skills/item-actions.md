# Skill: Item Actions

## Slug

`item-actions`

## Propósito

Implementar acciones mutativas sobre items del jugador: transferir entre personajes/vault, equipar items, y aplicar loadouts completos (batch transfer + equip).

## Roles que la usan

- R5 — Inventory & Loadouts

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| `bungieGet()` / `bungiePost()` autenticado | TS module | R3 Backend |
| `getSession()` | TS function | R3 Backend |
| `getInventory()` | TS function | Skill inventory-read |
| Loadout config (lista de items a equipar) | JSON | Frontend o DB |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `src/app/api/inventory/actions/route.ts` — POST actions | Route Handler | Frontend |
| `src/lib/inventory/actions.ts` — transfer/equip functions | TS module | API route |
| `src/app/api/loadouts/route.ts` — CRUD loadouts + apply | Route Handler | Frontend |
| `src/lib/loadouts/service.ts` — loadout CRUD | TS module | API route |

## Archivos tocados

### Crea

```
src/lib/inventory/actions.ts
src/app/api/inventory/actions/route.ts
src/lib/loadouts/service.ts
src/app/api/loadouts/route.ts
```

## Procedimiento

1. **Transfer item** — `POST /Platform/Destiny2/Actions/Items/TransferItem/`:

   ```typescript
   async function transferItem(
     itemId: string,
     itemHash: number,
     characterId: string,
     toVault: boolean,
     accessToken: string
   ): Promise<void>
   ```

   - Body: `{ itemReferenceHash, stackSize: 1, transferToVault, itemId, characterId, membershipType }`

2. **Equip item** — `POST /Platform/Destiny2/Actions/Items/EquipItem/`:

   ```typescript
   async function equipItem(
     itemId: string,
     characterId: string,
     accessToken: string
   ): Promise<void>
   ```

   - Body: `{ itemId, characterId, membershipType }`

3. **Apply loadout** (batch):

   ```typescript
   async function applyLoadout(loadout: LoadoutConfig, characterId: string, accessToken: string) {
     for (const item of loadout.items) {
       // 1. Si item está en vault → transferir al personaje
       // 2. Si item está en otro personaje → transferir a vault → transferir al personaje
       // 3. Equipar item
       // Delay 300ms entre cada operación (rate limit)
     }
   }
   ```

4. **Loadout CRUD** (`/api/loadouts`):
   - `GET` → listar loadouts del usuario (Prisma)
   - `POST` → crear loadout con nombre + items
   - `DELETE` → borrar loadout por ID
   - `POST /api/loadouts/apply` → aplicar loadout (batch transfer + equip)

5. **Rate limiting propio**:
   - Máximo 1 acción de transfer/equip por segundo
   - Queue las operaciones y ejecutar secuencialmente

## Checks de validación

```bash
npm run build
npm run dev
# Test transfer (requiere auth + item real):
curl -X POST -b cookies.txt -H 'Content-Type: application/json' \
  https://localhost:3000/api/inventory/actions \
  -d '{"action":"transfer","itemId":"...","characterId":"...","toVault":true}'
# Test loadout CRUD:
curl -b cookies.txt https://localhost:3000/api/loadouts
curl -X POST -b cookies.txt -H 'Content-Type: application/json' \
  https://localhost:3000/api/loadouts \
  -d '{"name":"PvP Build","classType":0,"items":[]}'
```

- [ ] Transfer to vault works
- [ ] Transfer from vault works
- [ ] Equip item works
- [ ] Loadout CRUD: create, read, delete
- [ ] Apply loadout transfers + equips in sequence
- [ ] Rate limit respected (≤1 action/sec)
- [ ] Error handling for: item not found, already equipped, inventory full
- [ ] 401 if no session
- [ ] `npm run build` passes

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| Transfer 400 error | Item ya en destino o no transferible | Check location antes de transferir |
| Equip 400 error | Item es exotic y ya hay exotic equipado | Desequipar exotic primero |
| Rate limit hit | Demasiadas operaciones seguidas | Aumentar delay a 500ms |
| Apply loadout parcial | Un item falla a mitad | Continuar con los demás, reportar errores |
| Inventory full | No hay espacio en personaje | Mover algo a vault primero |

## Notas

- Las operaciones de items son irreversibles — no hay "undo" en la API de Bungie.
- Apply loadout puede tardar 5-15 segundos dependiendo del número de items.
- Considerar WebSocket o polling para actualizar UI durante apply loadout.
