# Skill: AI Local Connector

## Slug

`ai-connector`

## Propósito

Implementar el cliente para LLM local (Ollama) que interpreta intención del jugador en lenguaje natural, explica builds, y re-rankea resultados. Incluye fallback cuando no hay LLM disponible.

## Roles que la usan

- R7 — AI Advisor (LLM Local)

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| `OLLAMA_HOST` (default: `http://localhost:11434`) | Env var | R1 Arquitectura |
| `OLLAMA_MODEL` (default: `llama3`) | Env var | R1 Arquitectura |
| Build results del engine | `BuildResult[]` | R6 Build Engine |
| Inventario del jugador | `InventoryItem[]` | R5 Inventory |
| Mensaje del usuario en lenguaje natural | `string` | Frontend |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `src/lib/ai/client.ts` — Ollama HTTP client | TS module | AI service |
| `src/lib/ai/service.ts` — AI Advisor service (interpret, explain, rerank) | TS module | API route |
| `src/app/api/ai/chat/route.ts` — POST chat | Route Handler | Frontend |
| `src/app/api/ai/status/route.ts` — GET status | Route Handler | Frontend |

## Archivos tocados

### Crea

```
src/lib/ai/client.ts
src/lib/ai/service.ts
src/app/api/ai/chat/route.ts
src/app/api/ai/status/route.ts
```

## Procedimiento

1. **Ollama client** (`src/lib/ai/client.ts`):

   ```typescript
   async function ollamaChat(messages: Message[], options?: ChatOptions): Promise<string> {
     const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
       method: 'POST',
       body: JSON.stringify({
         model: OLLAMA_MODEL,
         messages,
         stream: false,
         options: { temperature: 0.3, num_predict: 500 }
       })
     });
     // Parse response → return content
   }

   async function isOllamaAvailable(): Promise<boolean> {
     // HEAD to OLLAMA_HOST → true if 200, false if timeout/error
   }
   ```

2. **AI Service** (`src/lib/ai/service.ts`) — 3 funciones principales:
   - `interpretIntent(userMessage)` → `{ action, params }` (ej: "optimize for PvP" → `{ action: "optimize", statTargets: { resilience: 10, recovery: 8 } }`)
   - `explainBuild(build)` → descripción en español de por qué ese build es bueno
   - `rerankBuilds(builds, userPreference)` → reordenar builds según preferencia NL

3. **System prompt** — incluir contexto de D2:

   ```
   Eres un experto en Destiny 2. El jugador te pide ayuda con builds de armadura.
   NUNCA calcules stats — usa los datos proporcionados.
   Responde en español, conciso, con terminología de D2.
   ```

4. **Fallback sin LLM**:

   ```typescript
   async function chatWithFallback(message: string, context: ChatContext): Promise<ChatResponse> {
     const available = await isOllamaAvailable();
     if (!available) {
       return {
         message: "AI no disponible. Usa el optimizador manual de builds.",
         source: 'fallback',
         suggestions: getStaticSuggestions(message)  // keyword matching básico
       };
     }
     // ... llamar a Ollama
   }
   ```

5. **Status endpoint** (`GET /api/ai/status`):
   - Check si Ollama está corriendo
   - Devolver `{ available: boolean, model: string, host: string }`

6. **Chat endpoint** (`POST /api/ai/chat`):
   - Body: `{ message: string, context?: { classType, currentBuild, inventory } }`
   - Response: `{ response: string, source: 'ollama' | 'fallback', suggestions?: string[] }`

## Checks de validación

```bash
npm run build

# Con Ollama corriendo:
curl https://localhost:3000/api/ai/status
# Esperado: { "available": true, "model": "llama3", "host": "http://localhost:11434" }

curl -X POST -b cookies.txt -H 'Content-Type: application/json' \
  https://localhost:3000/api/ai/chat \
  -d '{"message":"Quiero un build para PvP con mucha resiliencia"}'
# Esperado: response con sugerencias

# Sin Ollama:
# Parar Ollama → repetir chat → debe devolver fallback
```

- [ ] `isOllamaAvailable()` devuelve true cuando Ollama corre, false cuando no
- [ ] Chat funciona con Ollama disponible → respuesta coherente
- [ ] Chat funciona sin Ollama → fallback con mensaje informativo
- [ ] Status endpoint reporta estado real
- [ ] System prompt incluye contexto de D2
- [ ] AI NUNCA calcula stats (solo interpreta/explica)
- [ ] Timeout de 30s para respuestas de Ollama
- [ ] `npm run build` sin errores

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| Ollama no responde | No está instalado o no está corriendo | Devolver fallback con mensaje |
| Modelo no encontrado | `OLLAMA_MODEL` no descargado | API status debe indicar "model not found" |
| Timeout en respuesta | Modelo muy grande o hardware lento | Timeout 30s + fallback |
| Respuesta incoherente | Prompt insuficiente | Refinar system prompt con ejemplos |
| Error de parsing | Ollama API cambió | Check version en status endpoint |

## Notas

- Ollama debe estar instalado por separado (`ollama serve`).
- Modelo recomendado para MVP: `llama3` (8B) — balance entre calidad y velocidad.
- La AI nunca debe ser el único camino — siempre hay que poder usar la app sin ella.
- Temperature baja (0.3) para respuestas más deterministas y consistentes.
