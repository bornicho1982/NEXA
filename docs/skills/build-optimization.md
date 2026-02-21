# Skill: Build Optimization Core

## Slug

`build-optimization`

## Propósito

Motor determinista de optimización de armor builds: dada una clase, stat targets y el inventario del jugador, encontrar las N mejores combinaciones de 5 piezas de armadura que maximicen las stats deseadas respetando las restricciones (tiers, exóticos, mods).

## Roles que la usan

- R6 — Build Engine (Determinista)

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| Inventario de armadura del jugador | `ArmorItem[]` | R5 Inventory (skill inventory-read) |
| Stat targets (min tiers deseados) | `StatTargets` | Frontend / AI Advisor |
| Clase del personaje (Titan/Hunter/Warlock) | `ClassType` | Frontend |
| Exotic constraint (si el usuario quiere un exótico específico) | `ExoticConstraint?` | Frontend |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `src/lib/builds/engine.ts` — build optimizer core | TS module | API route, AI Advisor |
| `src/lib/builds/types.ts` — tipos de builds | TS types | AI, Frontend |
| `src/app/api/builds/optimize/route.ts` — POST optimize | Route Handler | Frontend |
| `__tests__/lib/builds/engine.test.ts` — tests unitarios | Test file | Testing |

## Archivos tocados

### Crea

```
src/lib/builds/engine.ts
src/lib/builds/types.ts
src/lib/builds/scoring.ts
src/app/api/builds/optimize/route.ts
__tests__/lib/builds/engine.test.ts
```

## Procedimiento

1. **Tipos base**:

   ```typescript
   interface StatTargets {
     mobility?: number;    // 0-10 (tiers)
     resilience?: number;
     recovery?: number;
     discipline?: number;
     intellect?: number;
     strength?: number;
   }

   interface BuildResult {
     items: ArmorItem[];     // 5 piezas: helmet, gauntlets, chest, legs, classItem
     totalStats: Record<string, number>;
     tiers: Record<string, number>;
     score: number;
     wastedStats: number;
   }
   ```

2. **Preprocessing** — filtrar y agrupar:
   - Solo armadura legendary + exotic de la clase correcta
   - Agrupar por bucket (helmet, gauntlets, chest, legs, classItem)
   - Si exotic constraint → forzar esa pieza y marcar su slot como locked

3. **Combinatorial search** — branch-and-bound:

   ```
   Para cada helmet:
     Para cada gauntlets:
       Para cada chest:
         Para cada legs:
           Para cada classItem:
             calcular totalStats = sum(stats de 5 piezas)
             calcular tiers = floor(stat / 10)
             si meets targets → calcular score → push a resultados
   ```

   - **Poda**: si después de 2 piezas ya es imposible alcanzar targets → skip
   - **Max 1 exotic** por build (regla de D2)

4. **Scoring** — para rankear resultados:

   ```typescript
   function scoreBuild(build: BuildResult, targets: StatTargets): number {
     // Puntos por cada tier alcanzado
     // Penalización por stat wasted (stats > tier*10)
     // Bonus por alcanzar todos los targets
   }
   ```

5. **Route Handler** `POST /api/builds/optimize`:

   ```
   Body: { classType, statTargets, exoticHash?, maxResults: 20 }
   Response: { builds: BuildResult[], timing: { ms: number } }
   ```

6. **Performance target**: < 500ms para inventarios típicos (~50-100 piezas por bucket)

## Checks de validación

```bash
npm run build
npx jest __tests__/lib/builds/engine.test.ts    # o vitest

# Test manual:
curl -X POST -b cookies.txt -H 'Content-Type: application/json' \
  https://localhost:3000/api/builds/optimize \
  -d '{"classType":0,"statTargets":{"resilience":10,"recovery":8}}'
```

- [ ] Engine produces valid builds (5 pieces, max 1 exotic)
- [ ] All builds meet stat targets (if possible)
- [ ] Results sorted by score (descending)
- [ ] Performance < 500ms for typical inventory
- [ ] Edge cases: empty inventory → empty results, impossible targets → empty results
- [ ] Unit tests cover: basic optimization, exotic constraint, edge cases
- [ ] `npm run build` passes
- [ ] No LLM dependency — pure deterministic

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| Timeout (>5s) | Inventario muy grande sin poda | Mejorar pruning, limitar por tier |
| No results | Targets imposibles con el inventario | Devolver "closest" builds con nota |
| Wrong stats | Mods/masterwork no contados | Añadir mod stats al cálculo |
| Exotic rule violated | Logic error | Añadir assertion + test |

## Notas

- Max stats posibles sin mods: ~34 por pieza × 5 = ~170 total.
- Cada stat tier = 10 puntos; stats por encima de tier×10 son "wasted".
- El engine NO considera mods (V2) — en MVP las stats son solo base + masterwork.
- Class items tienen stats 0 en D2 — incluirlos para completitud pero no afectan stats.
