# Workflow Maestro — Ejecución Multi-Rol

> Este documento define el orden oficial de ejecución, las condiciones de paso
> entre roles, las skills asociadas, y las convenciones de handoff del proyecto NEXA.

---

## 1. Orden de ejecución (MVP)

```
R0  Orchestrator (coordina todo)
 │
 ├─▶ R1  Arquitectura / Tooling
 │    ├── Skills: repo-bootstrap → pwa-setup → env-validation
 │    └─▶ Gate: build + lint + Lighthouse PWA > 80 ✅
 │
 ├─▶ R2  Producto / Specs Funcionales
 │    ├── Skills: (documentación, sin skills técnicos)
 │    └─▶ Gate: features.md + user-flows + api-contracts ✅
 │
 ├─▶ R3  Backend / API (Auth, Bungie Client)
 │    ├── Skills: bungie-oauth → bungie-client
 │    └─▶ Gate: auth flow E2E manual + build ✅
 │
 ├─▶ R4  Manifest & Data Modeling
 │    ├── Skills: manifest-sync
 │    └─▶ Gate: /api/manifest + /api/manifest/definition?hash=X ✅
 │
 ├─▶ R5  Inventory & Loadouts Domain
 │    ├── Skills: inventory-read → item-actions
 │    └─▶ Gate: /api/inventory con stats + /api/loadouts CRUD ✅
 │
 ├─▶ R6  Build Engine (Determinista)
 │    ├── Skills: build-optimization
 │    └─▶ Gate: POST optimize < 5s (MVP) + unit tests pass ✅
 │         (Nota: Objetivo v1 < 500ms)
 │
 ├─▶ R7  AI Advisor (LLM Local)
 │    ├── Skills: ai-connector
 │    └─▶ Gate: chat con Ollama + fallback sin Ollama ✅
 │
 ├─▶ R8  Frontend / UI
 │    ├── Skills: ui-design-system
 │    └─▶ Gate: páginas renderizan + responsive 3 breakpoints ✅
 │
 ├─▶ R9  Testing / QA
 │    ├── Skills: e2e-smoke
 │    └─▶ Gate: smoke tests + Lighthouse PWA > 80 + señal release ✅
 │
 ├─▶ R10 Seguridad & Compliance
 │    ├── Skills: security-audit
 │    └─▶ Gate: no secrets leak + headers + tokens cifrados ✅
 │
 └─▶ R11 Observabilidad & Telemetría
      ├── Skills: observability
      └─▶ Gate: logs JSON + request-id + timing ✅
           │
           ▼
      ✅ RELEASE  o  🔄 RE-WORK (volver al rol afectado)
```

### Tabla de referencia rápida

| Orden | Slug | Rol | Skills | Quality Gate |
|-------|------|-----|--------|--------------|
| R0 | `orchestrator` | Orquestador | — | Briefs + DoD validation |
| R1 | `architecture` | Arquitectura | `repo-bootstrap` → `pwa-setup` → `env-validation` | `build` + `lint` + Lighthouse PWA > 80 |
| R2 | `product` | Producto | — (documentación) | `features.md` + flows + contracts |
| R3 | `backend` | Backend | `bungie-oauth` → `bungie-client` | Auth flow E2E + `build` |
| R4 | `manifest` | Manifest | `manifest-sync` | `/api/manifest` + definition resolver |
| R5 | `inventory` | Inventory | `inventory-read` → `item-actions` | `/api/inventory` + `/api/loadouts` CRUD |
| R6 | `build-engine` | Build Engine | `build-optimization` | POST optimize < 5s (MVP) / < 500ms (v1) + tests |
| R7 | `ai-advisor` | AI Advisor | `ai-connector` | Chat + fallback |
| R8 | `frontend` | Frontend | `ui-design-system` | Pages render + responsive |
| R9 | `testing` | Testing | `e2e-smoke` | Smoke pass + Lighthouse + release signal |
| R10 | `security` | Seguridad | `security-audit` | No leaks + headers + encrypted tokens |
| R11 | `observability` | Observabilidad | `observability` | JSON logs + request-id + timing |

### Referencia de skills

→ [`docs/skills/SKILL-INDEX.md`](../skills/SKILL-INDEX.md)
→ [`docs/skills/ROLE-SKILL-MAP.md`](../skills/ROLE-SKILL-MAP.md)

---

## 2. Condiciones de paso (Gate Rules)

### Regla general

> **No se puede activar el rol Rn+1 sin que el rol Rn haya completado
> TODOS los ítems de su Definition of Done Y el Quality Gate del rol.**

### Quality Gate por rol

Cada rol tiene un **Quality Gate** específico (columna en la tabla anterior). El gate se compone de:

1. **Checks automáticos** — comandos que deben pasar con exit code 0
2. **Checks funcionales** — endpoints/páginas que deben funcionar
3. **DoD del rol** — checkboxes del archivo `.agent/rules/<Rol>`

### Protocolo paso a paso

1. **Rol Rn termina** su trabajo ejecutando todas sus skills en orden.
2. **Rol Rn completa** los checks de validación de cada skill ejecutada.
3. **Rol Rn genera** su handoff en `docs/handoffs/<slug>_<yyyymmdd-hhmm>.md`.
4. **Orchestrator lee** el handoff y revisa:
   a. DoD del rol Rn (archivo en `.agent/rules/`)
   b. Quality Gate del rol (checks automáticos + funcionales)
   c. Outputs de cada skill (tabla en la skill)
5. **Orchestrator valida**:
   - Si **gate pasado ✅**: marcar Rn como `completed` en `project-state.json`, avanzar.
   - Si **gate fallido ❌**: devolver a Rn con lista de pendientes (re-work).
6. **Orchestrator genera** un Job Brief para Rn+1 usando:
   - El handoff de Rn (resumen + cambios + TODOs).
   - El archivo de rol de Rn+1 (entradas, ownership, DoD).
   - Las skills del Rn+1 (de `ROLE-SKILL-MAP.md`).
   - Plantilla: [`docs/workflows/job-brief-template.md`](./job-brief-template.md).
7. **Rn+1 comienza** su trabajo con el Job Brief como instrucciones.

### Excepciones

| Situación | Acción |
|-----------|--------|
| Testing reporta bug crítico | Orchestrator redirige al rol afectado con descripción |
| Seguridad encuentra hallazgo crítico | Bloquea release, crea Job Brief para el rol afectado |
| Re-work en un rol intermedio | Solo se re-ejecuta ese rol + los dependientes downstream |
| Roles independientes | R6/R7 pueden ejecutarse en paralelo si R3+R4+R5 están done |

---

## 3. Convenciones de handoff

### Ruta

```
docs/handoffs/<slug>_<yyyymmdd-hhmm>.md
```

**Ejemplos:**

```
docs/handoffs/architecture_20260216-0800.md
docs/handoffs/backend_20260216-1430.md
docs/handoffs/testing_20260217-0900.md
```

### Formato obligatorio

Cada handoff DEBE seguir la plantilla de [`docs/workflows/handoff-template.md`](./handoff-template.md) con estas 6 secciones:

1. **Resumen** — Qué se hizo (3-5 frases).
2. **Cambios** — Lista de archivos creados/modificados.
3. **Cómo probar** — Comandos y rutas para verificar.
4. **Decisiones tomadas** — Justificación de elecciones técnicas.
5. **Riesgos / limitaciones** — Qué no se cubrió o puede fallar.
6. **TODOs para el siguiente rol** — Tareas concretas a pasar.

### Naming

| Componente | Formato | Ejemplo |
|------------|---------|---------|
| Slug | Slug del rol (de ROLE-INDEX) | `backend` |
| Fecha | `yyyymmdd` | `20260216` |
| Hora | `hhmm` (24h, zona local) | `0800` |
| Extensión | `.md` | |
| Completo | `<slug>_<yyyymmdd-hhmm>.md` | `backend_20260216-0800.md` |

---

## 4. Flujo del Orchestrator

### Al inicio de cada iteración

```
1. Leer `docs/project-state.json`
2. Identificar `active_role` y `pending_roles`
3. Si hay un handoff pendiente del rol anterior:
   a. Leer el handoff
   b. Validar DoD del rol contra su archivo en `.agent/rules/`
   c. Validar Quality Gate (checks automáticos + funcionales)
   d. Si DoD + Gate cumplidos → mover a `completed_roles`
   e. Si DoD o Gate no cumplidos → crear Job Brief de re-work
4. Generar Job Brief para el siguiente rol pendiente
   a. Incluir skills a ejecutar (de ROLE-SKILL-MAP.md)
   b. Incluir artefactos esperados (de cada skill)
   c. Incluir Quality Gate del rol
5. Actualizar `project-state.json`:
   - `active_role` = siguiente rol
   - `next_actions` = tareas del Job Brief
   - `last_updated` = timestamp actual
6. Entregar Job Brief al rol
```

### Al finalizar todos los roles

```
1. Verificar que todos los roles están en `completed_roles`
2. Verificar que Testing dio señal ✅
3. Verificar que Seguridad no tiene hallazgos críticos abiertos
4. Si todo OK → marcar `active_role: "RELEASE"`
5. Si no → identificar rol afectado y crear Job Brief de re-work
```

---

## 5. Archivos relacionados

| Archivo | Propósito |
|---------|-----------|
| [`docs/project-state.json`](../project-state.json) | Estado actual del proyecto |
| [`docs/workflows/job-brief-template.md`](./job-brief-template.md) | Plantilla de Job Brief para roles |
| [`docs/workflows/handoff-template.md`](./handoff-template.md) | Plantilla de handoff estándar |
| [`docs/roles/ROLE-INDEX.md`](../roles/ROLE-INDEX.md) | Índice de roles |
| [`docs/roles/ROLE-TEMPLATE.md`](../roles/ROLE-TEMPLATE.md) | Plantilla para crear nuevos roles |
| [`docs/skills/SKILL-INDEX.md`](../skills/SKILL-INDEX.md) | Índice de skills reutilizables |
| [`docs/skills/ROLE-SKILL-MAP.md`](../skills/ROLE-SKILL-MAP.md) | Mapa rol → skills → gates |
| `docs/handoffs/` | Directorio de handoffs generados |
| `docs/briefs/` | Directorio de job briefs generados |
