# Plantilla — Flujo de usuario

> Copia este archivo para documentar un nuevo flujo.
> Ubicación: `docs/user-flows/<nombre-del-flujo>.md`

## Nombre del flujo
<!-- Ej: Crear build con IA -->

## Actor
<!-- Ej: Jugador autenticado de Destiny 2 -->

## Precondiciones
<!-- Qué debe haber pasado antes -->
- [ ] Usuario ha iniciado sesión con Bungie
- [ ] Tiene al menos un personaje con armadura

## Flujo principal (happy path)

```mermaid
graph TD
    A[Dashboard] --> B[Navegar a Build Lab]
    B --> C[Seleccionar clase]
    C --> D[Configurar stat targets]
    D --> E[Click "Optimizar"]
    E --> F{Resultados?}
    F -->|Sí| G[Ver builds recomendados]
    F -->|No| H[Ajustar targets]
    G --> I[Expandir build para ver piezas]
```

## Pasos detallados

1. **Navegar** — El usuario va a `/builds` desde el dashboard
2. **Seleccionar clase** — Elige Titan/Hunter/Warlock
3. **Configurar stats** — Ajusta sliders de stats objetivo (0-100)
4. **Optimizar** — Click en "Find Optimal Builds"
5. **Revisar** — Ve los resultados ordenados por score
6. **Detallar** — Expande un build para ver las piezas de armadura

## Flujos alternativos

### Sin armadura suficiente

- Si el jugador tiene < 5 piezas de armadura, mostrar mensaje informativo

### Ollama offline (si usa AI)

- Mostrar warning pero permitir optimización manual

## Pantallas involucradas

- `/dashboard` — Punto de entrada
- `/builds` — Pantalla principal del flujo

## API endpoints usados

- `POST /api/builds/optimize` — Ejecutar optimización

## Criterios de aceptación

- [ ] El usuario puede seleccionar clase y stats
- [ ] Los resultados se muestran en < 5 segundos
- [ ] Cada build muestra el total de tiers y stats individuales
- [ ] Se puede expandir un build para ver las piezas
