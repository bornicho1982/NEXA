# Skill Template — NEXA

> Copia este archivo para crear un nuevo skill.
> Ubicación: `docs/skills/<slug>.md`

---

# Skill: [Nombre del Skill]

## Slug

`skill-slug`

## Propósito

<!-- 1-2 frases: qué hace este skill y por qué existe -->

## Roles que la usan

<!-- Lista de roles que ejecutan este skill -->

- R? — Nombre del Rol

## Inputs

<!-- Qué necesita antes de empezar -->

| Input | Tipo | Fuente |
|-------|------|--------|
| ... | Archivo / Config / API | Rol o sistema |

## Outputs

<!-- Qué produce al terminar -->

| Output | Tipo | Destino |
|--------|------|---------|
| ... | Archivo / Config / Endpoint | Rol consumidor |

## Archivos tocados

### Crea

```
ruta/al/archivo.ts
```

### Modifica

```
ruta/al/archivo.ts
```

## Procedimiento

<!-- Pasos numerados, concretos, reproducibles -->

1. ...
2. ...
3. ...

## Checks de validación

<!-- Cómo saber que el skill se completó correctamente -->

```bash
# Comando 1
npm run build

# Comando 2
npm run lint
```

- [ ] Check 1
- [ ] Check 2

## Fallback si falla

<!-- Qué hacer si algo sale mal -->

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| ... | ... | ... |

## Notas

<!-- Información adicional, links, advertencias -->
