# Job Brief Template

> El **Orchestrator** genera este documento para cada rol antes de activarlo.
> Ruta: `docs/briefs/<slug>_<yyyymmdd-hhmm>.md`

---

## Encabezado

| Campo | Valor |
|-------|-------|
| **Rol destino** | `R?` — Nombre del Rol |
| **Fase** | MVP / v1 / v2 |
| **Fecha** | yyyy-mm-dd |
| **Generado por** | Orchestrator |
| **Handoff previo** | `docs/handoffs/<slug-anterior>_<yyyymmdd-hhmm>.md` |

---

## 1. Contexto actual

<!-- Resumen de dónde está el proyecto: qué roles ya completaron, qué está listo -->

**Roles completados:**

- R1 Arquitectura ✅ — Proyecto arrancando, TS/ESLint/PWA configurados
- R2 Producto ✅ — Features y contratos API definidos
- ...

**Estado del proyecto:**

```json
{
  "current_phase": "MVP",
  "active_role": "R?-NombreRol",
  "completed_roles": ["R1-Architecture", "R2-Product"],
  "pending_roles": ["R?-NombreRol", ...]
}
```

---

## 2. Objetivo del rol

<!-- 2-3 frases que describan qué se espera que este rol logre en esta iteración -->

---

## 3. Skills a ejecutar

<!-- Skills del ROLE-SKILL-MAP.md, en orden de ejecución -->

| Orden | Skill | Referencia | Output esperado |
|-------|-------|------------|-----------------|
| 1 | `skill-slug` | [`docs/skills/skill-slug.md`](../skills/skill-slug.md) | Descripción del output |
| 2 | `skill-slug-2` | [`docs/skills/skill-slug-2.md`](../skills/skill-slug-2.md) | Descripción del output |

**Para cada skill, seguir el procedimiento documentado en su archivo.**

---

## 4. Tareas concretas

<!-- Checklist priorizado. Incluye tareas de las skills + tareas adicionales -->

### De skills

- [ ] **Skill `skill-slug`**: Tarea 1
- [ ] **Skill `skill-slug`**: Tarea 2
- [ ] **Skill `skill-slug-2`**: Tarea 3

### Adicionales (no cubiertas por skills)

- [ ] Tarea extra 1
- [ ] Tarea extra 2

---

## 5. Archivos a tocar

<!-- Lista de archivos que este rol DEBE crear o modificar -->

```
src/...  (nuevo)
src/...  (modificar)
```

**NO tocar** (ownership de otros roles):

```
src/...  (ownership de R?)
```

---

## 6. Interfaces / contratos a respetar

<!-- Endpoints, tipos TS, o formatos JSON que este rol debe producir o consumir -->

### Debe producir

| Interfaz | Tipo | Spec de referencia |
|----------|------|------------------|
| ... | ... | `docs/api-contracts/...` |

### Debe consumir

| Interfaz | Tipo | Producida por |
|----------|------|---------------|
| ... | ... | R? |

---

## 7. Cómo validar

### Quality Gate del rol

<!-- Checks específicos de este rol desde docs/workflows/main.md -->

```bash
# Comando 1
...

# Comando 2
...
```

### Checks de skills

<!-- Copiar los checks de validación de cada skill ejecutada -->

**Skill `skill-slug`:**

- [ ] Check 1
- [ ] Check 2

**Skill `skill-slug-2`:**

- [ ] Check 1
- [ ] Check 2

### Verificación manual

- [ ] ...
- [ ] ...

---

## 8. Artefactos esperados

<!-- Outputs combinados de todas las skills + handoff del rol -->

| Artefacto | Fuente (Skill) | Ruta |
|-----------|---------------|------|
| ... | `skill-slug` | `src/...` |
| ... | `skill-slug-2` | `src/...` |
| Handoff | Rol | `docs/handoffs/<slug>_<yyyymmdd-hhmm>.md` |

---

## 9. Definition of Done (copiar del archivo de rol)

<!-- Copiar checkboxes del DoD del archivo `.agent/rules/<Rol>` -->

- [ ] ...
- [ ] ...

### Handoff

Al terminar, generar handoff en `docs/handoffs/<slug>_<yyyymmdd-hhmm>.md`
siguiendo la plantilla de [`docs/workflows/handoff-template.md`](./handoff-template.md).
