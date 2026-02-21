# Role Template — NEXA

> Copia este archivo para crear un nuevo rol.
> Ubicación del nuevo rol: `.agent/rules/<NombreDelRol>`

---

# Rol: [Nombre del Rol]

## 1. Nombre

**[Nombre largo del rol]** — `[slug-corto]`

## 2. Misión
<!-- 1-2 frases que describan el propósito esencial del rol -->

## 3. Alcance

### Incluye
<!-- Lista de responsabilidades concretas -->
- ...

### Excluye
<!-- Lista explícita de lo que NO es responsabilidad de este rol -->
- ...

## 4. Entradas requeridas
<!-- Artefactos/archivos que este rol necesita recibir antes de empezar -->
| Artefacto | Fuente |
|-----------|--------|
| ... | ... |

## 5. Salidas obligatorias
<!-- Artefactos/archivos que este rol DEBE generar al terminar -->
| Artefacto | Destino |
|-----------|---------|
| ... | ... |

## 6. Ownership
<!-- Archivos y carpetas bajo control exclusivo de este rol -->
```
src/...
```

## 7. Interfaces
<!-- Qué produce y qué consume este rol (endpoints, tipos, módulos) -->

### Produce

| Interfaz | Tipo | Consumida por |
|----------|------|---------------|
| ... | ... | ... |

### Consume

| Interfaz | Tipo | Producida por |
|----------|------|---------------|
| ... | ... | ... |

## 8. Guardrails
<!-- Restricciones de seguridad, performance, "NO hacer" -->
- ❌ **NO** ...
- ⚠️ ...

## 9. Definition of Done
<!-- Quality gates verificables — checkboxes -->
- [ ] ...
- [ ] ...

## 10. Formato de handoff
<!-- Estructura OBLIGATORIA para pasar trabajo al siguiente rol -->

### Resumen
<!-- Breve descripción de lo que se hizo -->

### Cambios

```
- ruta/al/archivo.ts (nuevo/modificado)
```

### Cómo probar

```bash
npm run dev
# Instrucciones específicas
```

### Decisiones tomadas

- Ej: "Se eligió X sobre Y porque..."

### Riesgos / limitaciones

- Ej: "No cubre el caso de..."

### TODOs para el siguiente rol

- Ej: "El rol X debe implementar..."
