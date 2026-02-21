# Skill: Repo Bootstrap

## Slug

`repo-bootstrap`

## Propósito

Inicializar o verificar la base del repositorio: Next.js + TypeScript strict + ESLint + Prettier + scripts npm. Garantiza que cualquier rol posterior trabaje sobre una configuración sólida y validada.

## Roles que la usan

- R1 — Arquitectura y Configuración

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| Repositorio existente o vacío | Directorio | Sistema |
| Requisitos de TS/lint definidos | Documentación | Reglas del proyecto |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `tsconfig.json` configurado (strict, ES2022, aliases) | Config | Todos los roles |
| `eslint.config.mjs` con Prettier integration | Config | Todos los roles |
| `.prettierrc` con reglas de formato | Config | Todos los roles |
| `package.json` con scripts dev/build/lint/format | Config | Todos los roles |
| Dependencias instaladas | node_modules | Runtime |

## Archivos tocados

### Crea

```
.prettierrc
```

### Modifica

```
tsconfig.json             — target ES2022, strict true, allowJs false, paths
eslint.config.mjs         — añadir eslint-config-prettier
package.json              — añadir script "format", dependencias prettier
```

## Procedimiento

1. Verificar que `package.json` existe; si no, ejecutar `npx -y create-next-app@latest ./`
2. Verificar `tsconfig.json`:
   - `"strict": true`
   - `"target": "ES2022"`
   - `"allowJs": false`
   - `"paths": { "@/*": ["./src/*"] }`
3. Instalar Prettier si no está:

   ```bash
   npm install -D prettier eslint-config-prettier
   ```

4. Crear `.prettierrc`:

   ```json
   {
     "semi": true,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "all",
     "printWidth": 100
   }
   ```

5. Actualizar `eslint.config.mjs` para incluir prettier integration
6. Añadir script en `package.json`:

   ```json
   "format": "prettier --write ."
   ```

7. Ejecutar validación

## Checks de validación

```bash
npm run build              # Exit code 0, sin errores de tipo
npm run lint               # Exit code 0, 0 errores
npx prettier --check .     # Sin archivos sin formatear
```

- [ ] `npm run build` pasa limpio
- [ ] `npm run lint` pasa limpio
- [ ] `npx prettier --check .` sin archivos pendientes
- [ ] `tsconfig.json` tiene strict: true y target: ES2022
- [ ] `.prettierrc` existe con reglas definidas

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| `npm run build` falla tras cambiar tsconfig | Código usa features incompatibles con ES2022 | Revertir target a ES2017, documentar como riesgo |
| ESLint conflicta con Prettier | Config no incluye eslint-config-prettier último | Mover prettier al final del array extends |
| `allowJs: false` rompe archivos existentes | Hay archivos .js en src/ | Renombrar a .ts/.tsx o mantener allowJs: true documentado |

## Notas

- Este skill se ejecuta **una sola vez** al inicio del proyecto, salvo re-work.
- Si el repo ya existe y pasa los checks, marcar como completado sin cambios.
