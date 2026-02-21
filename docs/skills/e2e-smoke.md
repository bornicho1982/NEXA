# Skill: E2E Smoke + Lighthouse

## Slug

`e2e-smoke`

## Propósito

Configurar Playwright para smoke tests básicos de los flujos principales (landing, login redirect, dashboard, inventory, builds), y ejecutar un audit de Lighthouse para verificar PWA, performance, y accesibilidad.

## Roles que la usan

- R9 — Testing y QA

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| App corriendo en `localhost:3000` | Dev server | R1 Arquitectura |
| Todas las páginas implementadas | Pages | R8 Frontend |
| Todos los endpoints funcionales | API | R3-R7 |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `playwright.config.ts` | Config | Repo |
| `e2e/smoke.spec.ts` — smoke tests | Test file | CI |
| `e2e/lighthouse.spec.ts` — Lighthouse audit | Test file | CI |
| Reporte HTML de Playwright | HTML | Dev review |

## Archivos tocados

### Crea

```
playwright.config.ts
e2e/smoke.spec.ts
e2e/lighthouse.spec.ts
```

## Procedimiento

1. **Instalar Playwright**:

   ```bash
   npm install -D @playwright/test
   npx playwright install chromium
   ```

2. **Config** (`playwright.config.ts`):

   ```typescript
   export default defineConfig({
     testDir: './e2e',
     use: {
       baseURL: 'https://localhost:3000',
       ignoreHTTPSErrors: true,
     },
     webServer: {
       command: 'npm run dev',
       port: 3000,
       reuseExistingServer: true,
     },
   });
   ```

3. **Smoke tests** (`e2e/smoke.spec.ts`):

   ```typescript
   test('landing page loads', ...);
   test('login redirects to Bungie', ...);
   test('dashboard shows when authenticated', ...);
   test('inventory page renders grid', ...);
   test('builds page shows optimizer', ...);
   test('advisor page shows chat', ...);
   ```

4. **Lighthouse audit** (`e2e/lighthouse.spec.ts`):
   - Install `lighthouse` y `@playwright-community/lighthouse`
   - Run audit en landing page
   - Assert: Performance > 70, PWA > 80, Accessibility > 80

5. **Scripts en package.json**:

   ```json
   "test:e2e": "playwright test",
   "test:lighthouse": "playwright test e2e/lighthouse.spec.ts"
   ```

## Checks de validación

```bash
npx playwright test                                   # Smoke tests
npx playwright test e2e/lighthouse.spec.ts            # Lighthouse
npx playwright show-report                             # Ver reporte HTML
```

- [ ] Smoke tests pasan (6 flujos básicos)
- [ ] Lighthouse PWA score > 80
- [ ] Lighthouse Performance > 70
- [ ] Lighthouse Accessibility > 80
- [ ] Reporte HTML se genera correctamente
- [ ] Tests pasan en CI (headless)

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| Playwright no carga HTTPS localhost | Certificado auto-firmado | `ignoreHTTPSErrors: true` en config |
| Login test falla | No hay credenciales de test | Mockear auth con cookie hardcoded para tests |
| Lighthouse bajo en Performance | Imágenes no optimizadas, JS grande | Optimizar en Frontend, usar `next/image` |
| Lighthouse bajo en PWA | Falta manifest o SW | Ejecutar skill pwa-setup |
| CI headless falla | Falta Chromium | `npx playwright install chromium` en CI |

## Notas

- Los smoke tests NO testean auth real — usan cookies mockeadas o rutas públicas.
- Lighthouse corre sobre la landing page (no autenticada) en MVP.
- E2E completos con auth real son V2 — requieren mock server de Bungie.
