# Skill: Security Audit

## Slug

`security-audit`

## Propósito

Verificar que la app no filtra secretos, configura CORS/CSRF correctamente, usa headers de seguridad, no loguea datos sensibles, y cumple con las prácticas mínimas de seguridad para una app que maneja tokens OAuth.

## Roles que la usan

- R10 — Seguridad, Privacidad y Compliance

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| Código fuente completo | Repo | Todos los roles |
| Endpoints funcionales | API | R3-R7 |
| `.env.example` y `.env.local` | Config | R1 Arquitectura |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `docs/security-checklist.md` — checklist de auditoría | Markdown | Orquestador, todos |
| `docs/security-audit-results.md` — resultados | Markdown | Orquestador |
| Recomendaciones de fix (si hay issues) | Markdown | Rol afectado |

## Archivos tocados

### Crea

```
docs/security-checklist.md
docs/security-audit-results.md
```

### Modifica

```
(ninguno directamente — este skill audita, no corrige)
```

## Procedimiento

1. **Secrets leak scan**:

   ```bash
   # Buscar API keys hardcoded
   grep -r "BUNGIE_API_KEY\|CLIENT_SECRET\|SESSION_SECRET" --include="*.ts" --include="*.tsx" src/
   # Buscar NEXT_PUBLIC_ con variables sensibles
   grep -r "NEXT_PUBLIC_.*KEY\|NEXT_PUBLIC_.*SECRET" --include="*.ts" --include="*.tsx" src/
   # Buscar tokens en console.log
   grep -r "console.log.*token\|console.log.*key\|console.log.*secret" -i src/
   ```

2. **Headers de seguridad** — verificar en respuestas:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY` o `SAMEORIGIN`
   - `Strict-Transport-Security: max-age=31536000`
   - `Content-Security-Policy` (al menos básica)

3. **CORS**:
   - Verificar que no hay `Access-Control-Allow-Origin: *` en producción
   - Solo orígenes whitelisted

4. **CSRF**:
   - Verificar que auth login usa state parameter
   - Verificar que cookies usan `SameSite=Lax` o `Strict`
   - Verificar que POST endpoints verifican origin

5. **Tokens**:
   - Verificar que tokens de Bungie están cifrados en DB (no plaintext)
   - Verificar que session cookie es HttpOnly + Secure
   - Verificar que access_token no aparece en respuestas JSON de /api
   - Verificar que token refresh maneja expiración correctamente

6. **Logging**:
   - Verificar que logs no contienen tokens, passwords, o PII
   - Verificar que error responses no exponen stack traces en producción

7. **Generar checklist** con estado de cada punto

## Checks de validación

```bash
# Automated scans:
grep -r "BUNGIE_API_KEY\|CLIENT_SECRET" --include="*.ts" src/
# Esperado: solo en env.ts o config, nunca hardcoded

# Manual checks:
curl -I https://localhost:3000
# Verificar headers de seguridad
```

- [ ] No hay API keys hardcoded en código
- [ ] No hay NEXT_PUBLIC_ con variables sensibles
- [ ] No hay tokens en console.log
- [ ] Headers de seguridad presentes
- [ ] CORS no es `*` en producción
- [ ] Auth state CSRF implementado
- [ ] Cookies HttpOnly + Secure + SameSite
- [ ] Tokens cifrados en DB
- [ ] Error responses no exponen internals
- [ ] Logs no contienen PII ni tokens

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| Secret encontrado en código | Hardcoded durante desarrollo | Reportar al rol → mover a env var |
| CORS abierto | Config de desarrollo dejada | Restringir en next.config.ts |
| Token en console.log | Debug dejado en código | Reportar al rol → eliminar log |
| Cookie no HttpOnly | Bug en session.ts | Reportar a Backend |

## Notas

- Este skill es de **auditoría**, no de corrección. Los fixes los hace el rol dueño.
- Ejecutar al final del ciclo (después de Testing, antes de release).
- En MVP, CSP puede ser básica; en V2 se endurece.
