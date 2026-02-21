# Role → Skill Map — NEXA

> Mapea cada rol a los skills que ejecuta, en qué orden, y qué output/handoff produce.

---

## R0 — Orquestador

| Orden | Skill | Output esperado |
|-------|-------|----------------|
| — | (No ejecuta skills de implementación) | `docs/project-state.json`, Job Briefs, Handoffs |

> El Orquestador coordina — no ejecuta skills técnicos. Su "skill" es generar briefs y validar DoD.

---

## R1 — Arquitectura y Configuración

| Orden | Skill | Output esperado |
|-------|-------|----------------|
| 1 | [`repo-bootstrap`](./repo-bootstrap.md) | tsconfig, eslint, prettier, scripts npm |
| 2 | [`pwa-setup`](./pwa-setup.md) | manifest.json, iconos, SW, installability |
| 3 | [`env-validation`](./env-validation.md) | `src/lib/config/env.ts`, `docs/env-config.md` |

**Handoff**: `docs/handoffs/architecture_<yyyymmdd-hhmm>.md`
**Gate**: `npm run build` + `npm run lint` + Lighthouse PWA > 80

---

## R2 — Producto y Specs Funcionales

| Orden | Skill | Output esperado |
|-------|-------|----------------|
| — | (No tiene skills técnicos) | `docs/features.md`, `docs/user-flows/`, `docs/api-contracts/` |

> Producto define QUÉ construir. No ejecuta skills técnicos sino que genera documentación funcional.

---

## R3 — Backend y API

| Orden | Skill | Output esperado |
|-------|-------|----------------|
| 1 | [`bungie-oauth`](./bungie-oauth.md) | Auth flow completo: login, callback, session, logout, refresh |
| 2 | [`bungie-client`](./bungie-client.md) | `src/lib/bungie/client.ts` con retry, throttle, headers |

**Handoff**: `docs/handoffs/backend_<yyyymmdd-hhmm>.md`
**Gate**: Auth flow E2E manual + `npm run build`

---

## R4 — Manifest & Data Modeling

| Orden | Skill | Output esperado |
|-------|-------|----------------|
| 1 | [`manifest-sync`](./manifest-sync.md) | ManifestService, cache, resolver API, route handlers |

**Handoff**: `docs/handoffs/manifest_<yyyymmdd-hhmm>.md`
**Gate**: `/api/manifest` devuelve versión + `/api/manifest/definition?hash=X` resuelve items

---

## R5 — Inventory & Loadouts

| Orden | Skill | Output esperado |
|-------|-------|----------------|
| 1 | [`inventory-read`](./inventory-read.md) | `getInventory()`, DTO enriquecidos, `/api/inventory` |
| 2 | [`item-actions`](./item-actions.md) | Transfer, equip, loadout CRUD, `/api/loadouts` |

**Handoff**: `docs/handoffs/inventory_<yyyymmdd-hhmm>.md`
**Gate**: `/api/inventory` devuelve items con stats + `/api/loadouts` CRUD funcional

---

## R6 — Build Engine

| Orden | Skill | Output esperado |
|-------|-------|----------------|
| 1 | [`build-optimization`](./build-optimization.md) | Engine, scoring, `/api/builds/optimize`, unit tests |

**Handoff**: `docs/handoffs/build-engine_<yyyymmdd-hhmm>.md`
**Gate**: Post con stat targets devuelve builds válidos en < 5s (MVP) + tests pasan
> *Nota: Objetivo v1 es < 500ms*

---

## R7 — AI Advisor

| Orden | Skill | Output esperado |
|-------|-------|----------------|
| 1 | [`ai-connector`](./ai-connector.md) | Ollama client, AI service, chat + status endpoints |

**Handoff**: `docs/handoffs/ai-advisor_<yyyymmdd-hhmm>.md`
**Gate**: Chat funciona con Ollama + fallback funciona sin Ollama

---

## R8 — Frontend y UI/UX

| Orden | Skill | Output esperado |
|-------|-------|----------------|
| 1 | [`ui-design-system`](./ui-design-system.md) | Tokens CSS, componentes base, responsive, animaciones |

**Handoff**: `docs/handoffs/frontend_<yyyymmdd-hhmm>.md`
**Gate**: Todas las páginas renderizan + responsive en 3 breakpoints + `npm run build`

---

## R9 — Testing y QA

| Orden | Skill | Output esperado |
|-------|-------|----------------|
| 1 | [`e2e-smoke`](./e2e-smoke.md) | Playwright smoke tests + Lighthouse audit |

**Handoff**: `docs/handoffs/testing_<yyyymmdd-hhmm>.md`
**Gate**: Smoke tests pasan + Lighthouse PWA > 80 + señal de release emitida

---

## R10 — Seguridad y Compliance

| Orden | Skill | Output esperado |
|-------|-------|----------------|
| 1 | [`security-audit`](./security-audit.md) | Checklist, resultados, recomendaciones |

**Handoff**: `docs/handoffs/security_<yyyymmdd-hhmm>.md`
**Gate**: No hay secrets leaks + headers presentes + tokens cifrados

---

## R11 — Observabilidad & Telemetría

| Orden | Skill | Output esperado |
|-------|-------|----------------|
| 1 | [`observability`](./observability.md) | Logger JSON, middleware telemetry, handlers wrapped |

**Handoff**: `docs/handoffs/observability_<yyyymmdd-hhmm>.md`
**Gate**: Logs JSON en stdout + request-id en responses + timing en logs

---

## Skills de referencia (consulta)

Estas skills no producen archivos — son documentación que los roles consultan durante la implementación.

| Skill de referencia | Roles que la consultan | Complementa a |
|---------------------|------------------------|----------------|
| [`bungie-api`](./bungie-api.md) | R3 Backend, R4 Manifest, R5 Inventory | `bungie-oauth`, `bungie-client` |
| [`next-patterns`](./next-patterns.md) | R1 Arquitectura, R3 Backend, R8 Frontend | `repo-bootstrap`, `ui-design-system` |
| [`ollama-integration`](./ollama-integration.md) | R7 AI Advisor | `ai-connector` |
| [`prisma-database`](./prisma-database.md) | R1 Arquitectura, R3 Backend, R5 Inventory | `env-validation`, `bungie-oauth`, `item-actions` |

> Estas skills también existen como agent skills en `.agent/skills/*/SKILL.md`.
> Los archivos en `docs/skills/` siguen el formato de plantilla estándar.

---

## Resumen visual

```
R0  Orchestrator     →  (coordina)
R1  Architecture     →  repo-bootstrap → pwa-setup → env-validation
                         refs: next-patterns, prisma-database
R2  Product          →  (documentación funcional)
R3  Backend          →  bungie-oauth → bungie-client
                         refs: bungie-api, next-patterns, prisma-database
R4  Manifest         →  manifest-sync
                         refs: bungie-api
R5  Inventory        →  inventory-read → item-actions
                         refs: bungie-api, prisma-database
R6  Build Engine     →  build-optimization
R7  AI Advisor       →  ai-connector
                         refs: ollama-integration
R8  Frontend         →  ui-design-system
                         refs: next-patterns
R9  Testing          →  e2e-smoke
R10 Security         →  security-audit
R11 Observability    →  observability
```

## Dependencias entre Skills

```
repo-bootstrap ─┐
pwa-setup ───────┤
env-validation ──┘──► bungie-oauth ──► bungie-client ──┐
                                                        ├──► manifest-sync ──┐
                                                        │                     ├──► inventory-read ──► item-actions
                                                        │                     │
                                                        └─────────────────────┘──► build-optimization ──► ai-connector
                                                                                                          │
ui-design-system ──────────────────────────────────────────────────────────────►  (Frontend uses all APIs)
                                                                                          │
                                                                               e2e-smoke ◄┘
                                                                                   │
                                                                          security-audit
                                                                                   │
                                                                          observability

Reference skills (consulted, not executed):
  bungie-api ·············· R3, R4, R5
  next-patterns ··········· R1, R3, R8
  ollama-integration ······ R7
  prisma-database ········· R1, R3, R5
```
