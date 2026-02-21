# Skill Index — NEXA

> Lista de todos los skills reutilizables del proyecto con su propósito, tipo y rol principal.

---

## Skills de implementación (MVP)

Skills procedurales que producen archivos y artefactos.

| # | Slug | Nombre | Rol principal | Prioridad |
|---|------|--------|---------------|-----------|
| S1 | `repo-bootstrap` | [Repo Bootstrap](./repo-bootstrap.md) | R1 Arquitectura | Alta |
| S2 | `pwa-setup` | [PWA Setup](./pwa-setup.md) | R1 Arquitectura | Alta |
| S3 | `env-validation` | [Env Validation](./env-validation.md) | R1 Arquitectura | Alta |
| S4 | `bungie-oauth` | [Bungie OAuth](./bungie-oauth.md) | R3 Backend | Alta |
| S5 | `bungie-client` | [Bungie Client](./bungie-client.md) | R3 Backend | Alta |
| S6 | `manifest-sync` | [Manifest Sync & Cache](./manifest-sync.md) | R4 Manifest | Alta |
| S7 | `inventory-read` | [Inventory Read Model](./inventory-read.md) | R5 Inventory | Alta |
| S8 | `item-actions` | [Item Actions](./item-actions.md) | R5 Inventory | Media |
| S9 | `build-optimization` | [Build Optimization Core](./build-optimization.md) | R6 Build Engine | Alta |
| S10 | `ai-connector` | [AI Local Connector](./ai-connector.md) | R7 AI Advisor | Media |
| S11 | `ui-design-system` | [UI Design System](./ui-design-system.md) | R8 Frontend | Alta |
| S12 | `e2e-smoke` | [E2E Smoke + Lighthouse](./e2e-smoke.md) | R9 Testing | Media |
| S13 | `security-audit` | [Security Audit](./security-audit.md) | R10 Seguridad | Media |
| S14 | `observability` | [Observability](./observability.md) | R11 Observabilidad | Baja |

---

## Skills de referencia

Skills de consulta que no producen archivos — sirven como documentación de referencia para implementadores.

| # | Slug | Nombre | Roles consumidores |
|---|------|--------|--------------------|
| R1 | `bungie-api` | [Bungie API Reference](./bungie-api.md) | R3, R4, R5 |
| R2 | `next-patterns` | [Next.js Patterns](./next-patterns.md) | R1, R3, R8 |
| R3 | `ollama-integration` | [Ollama Integration](./ollama-integration.md) | R7 |
| R4 | `prisma-database` | [Prisma Database](./prisma-database.md) | R1, R3, R5 |

> Las skills de referencia también existen como agent skills en `.agent/skills/*/SKILL.md`
> para uso directo por el agente de IDE. Los archivos en `docs/skills/` siguen el formato
> de plantilla estándar y complementan con información estructurada.

---

## Totales

| Tipo | Cantidad |
|------|----------|
| Implementación | 14 |
| Referencia | 4 |
| **Total** | **18** |

---

## Estructura de cada Skill

Cada skill sigue [`docs/skills/SKILL-TEMPLATE.md`](./SKILL-TEMPLATE.md) con las secciones:

1. **Slug** — identificador único
2. **Propósito** — qué hace y por qué
3. **Roles que la usan** — quién la ejecuta o consulta
4. **Inputs** — qué necesita antes de empezar
5. **Outputs** — qué produce al terminar
6. **Archivos tocados** — crea / modifica
7. **Procedimiento** — pasos concretos numerados
8. **Checks de validación** — comandos + checklist
9. **Fallback si falla** — tabla causa-solución
10. **Notas** — info adicional

## Convenciones

- Un skill es un **procedimiento repetible**, no un rol.
- Un rol puede ejecutar **múltiples skills** en orden.
- Un skill puede ser usado por **múltiples roles**.
- Los skills no tienen ownership de archivos — el ownership es del rol.
- Si un skill falla, el rol debe documentarlo en su handoff.
- Las skills de **referencia** no producen archivos — son documentación de consulta.
- Cada skill de referencia tiene una contraparte en `.agent/skills/` para el agente de IDE.

## Naming

- Archivos: `docs/skills/<slug>.md`
- Formato: todo lowercase, separado por guiones
- Sin duplicados: un slug = un archivo

## Mapa Rol → Skills

→ [`docs/skills/ROLE-SKILL-MAP.md`](./ROLE-SKILL-MAP.md)
