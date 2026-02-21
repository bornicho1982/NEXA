# Handoff Template

> Cada rol DEBE generar este documento al terminar su trabajo.
> Ruta: `docs/handoffs/<slug>_<yyyymmdd-hhmm>.md`

---

## Encabezado

| Campo | Valor |
|-------|-------|
| **Rol** | `R?` — Nombre del Rol |
| **Slug** | `<slug>` |
| **Fase** | MVP / v1 / v2 |
| **Fecha** | yyyy-mm-dd hh:mm |
| **Duración** | Tiempo aproximado de ejecución |

---

## 1. Resumen

<!-- 3-5 frases describiendo qué se hizo. Ser concreto, no genérico. -->

---

## 2. Cambios

<!-- Lista COMPLETA de archivos creados o modificados -->

### Archivos nuevos

```
- ruta/al/archivo.ts         — Descripción breve
- ruta/al/otro-archivo.ts    — Descripción breve
```

### Archivos modificados

```
- ruta/al/archivo.ts         — Qué se cambió
```

### Archivos eliminados

```
- (ninguno)
```

---

## 3. Cómo probar

<!-- Comandos y pasos exactos para verificar que todo funciona -->

### Verificación automática

```bash
npm run build          # Debe compilar sin errores
npm run lint           # 0 errores
npm test               # Tests pasan (si aplica)
```

### Verificación manual

```bash
npm run dev
# Paso 1: ...
# Paso 2: ...
# Resultado esperado: ...
```

---

## 4. Decisiones tomadas

<!-- Justificación de elecciones técnicas. Formato: decisión + razón -->

| Decisión | Razón |
|----------|-------|
| Se eligió X sobre Y | Porque Z |
| ... | ... |

---

## 5. Riesgos / limitaciones

<!-- Qué no se cubrió, qué puede fallar, qué queda pendiente -->

| Riesgo / Limitación | Severidad | Mitigación |
|---------------------|-----------|------------|
| ... | Alta/Media/Baja | ... |

---

## 6. TODOs para el siguiente rol

<!-- Tareas concretas que el próximo rol debe hacer, basadas en este trabajo -->

| TODO | Rol destino | Prioridad |
|------|-------------|-----------|
| ... | R? — Nombre | Alta/Media/Baja |
| ... | R? — Nombre | Alta/Media/Baja |

---

## DoD Checklist (auto-evaluación)

<!-- Copiar los checkboxes del DoD del archivo de rol y marcar los completados -->

- [x] ...
- [x] ...
- [ ] ... (pendiente — justificar por qué)
