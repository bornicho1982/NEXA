# Role Index — NEXA

> Lista de todos los roles del proyecto con su propósito y orden de ejecución.

## Cadena de ejecución

```
Orquestador → Arquitectura → Producto → Backend → Manifest → Inventory → Build Engine → AI Advisor → Frontend → Testing → Seguridad → Observabilidad → ✅ Release
```

## Roles

| # | Slug | Nombre | Ubicación | Propósito |
|---|------|--------|-----------|-----------|
| 0 | `orchestrator` | Orquestador de Flujo | `.agent/rules/Orquestador de Flujo` | Coordina roles, valida DoD, gestiona handoffs |
| 1 | `architecture` | Arquitectura y Configuración | `.agent/rules/Arquitectura y Configuración del Proyecto` | Base técnica: Next.js, TS, PWA, Prisma, env |
| 2 | `product` | Producto y Specs Funcionales | `.agent/rules/Diseño Funcional y Requisitos` | Features, MVP, user flows, contratos API |
| 3 | `backend` | Backend y API | `.agent/rules/Backend y API` | Auth OAuth2, sesiones JWT, Bungie client |
| 4 | `manifest` | Manifest & Data Modeling | `.agent/rules/Manifest y Data Modeling` | Descarga, caché y tipos del Manifest D2 |
| 5 | `inventory` | Inventory & Loadouts | `.agent/rules/Inventory y Loadouts` | Servicios y endpoints de inventario y loadouts |
| 6 | `build-engine` | Build Engine (Determinista) | `.agent/rules/Build Engine` | Motor de optimización sin LLM, scoring, tests |
| 7 | `ai-advisor` | AI Advisor (LLM Local) | `.agent/rules/AI Advisor` | Intención NL, explicaciones, re-rank vía Ollama |
| 8 | `frontend` | Frontend y UI/UX | `.agent/rules/Frontend y UI-UX` | Páginas, componentes, design system |
| 9 | `testing` | Testing y QA | `.agent/rules/Testing y QA` | Tests, auditorías, bugs, señal de release |
| 10 | `security` | Seguridad y Compliance | `.agent/rules/Seguridad y Compliance` | Tokens, CORS, CSRF, headers, auditoría |
| 11 | `observability` | Observabilidad & Telemetría | `.agent/rules/Observabilidad y Telemetria` | Logging, métricas, trazas, middleware |

## Handoffs

Cada rol produce al terminar un handoff en:

```
docs/handoffs/<slug>_<yyyymmdd-hhmm>.md
```

## Plantilla para nuevos roles

→ [`docs/roles/ROLE-TEMPLATE.md`](./ROLE-TEMPLATE.md)

## Estado actual del proyecto

→ [`docs/project-state.json`](../project-state.json)
