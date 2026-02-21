# Skill: Ollama Integration

## Slug

`ollama-integration`

## Propósito

Referencia de la integración con Ollama (LLM local): requisitos, endpoints de la API de Ollama, patrón de streaming, y troubleshooting. Complementa la skill `ai-connector` con información de referencia sobre Ollama.

## Roles que la usan

- R7 — AI Advisor (LLM Local)

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| Ollama instalado en el sistema | Software | [ollama.com/download](https://ollama.com/download) |
| `OLLAMA_HOST`, `OLLAMA_MODEL` | Env vars | R1 Arquitectura |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| Referencia de API Ollama para implementadores | Documentación | R7 AI Advisor |

## Archivos tocados

### Crea

```
(ninguno — este skill es referencia, no produce archivos)
```

### Modifica

```
(ninguno)
```

## Procedimiento

### 1. Requisitos previos

```bash
# 1. Instalar Ollama
# Descargar desde https://ollama.com/download

# 2. Iniciar el servicio
ollama serve

# 3. Descargar un modelo
ollama pull llama3
```

### 2. Variables de entorno

```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
```

### 3. Endpoints de Ollama

#### Health Check

```http
GET http://localhost:11434/
→ 200 "Ollama is running"
```

#### Listar modelos

```http
GET http://localhost:11434/api/tags
→ { "models": [{ "name": "llama3", ... }] }
```

#### Chat (non-streaming)

```http
POST http://localhost:11434/api/chat
{
  "model": "llama3",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "stream": false
}
→ { "message": { "role": "assistant", "content": "..." }, "done": true }
```

#### Chat (streaming)

```http
POST http://localhost:11434/api/chat
{
  "model": "llama3",
  "messages": [...],
  "stream": true
}
→ Stream de NDJSON: { "message": { "content": "..." }, "done": false }
```

### 4. Patrón de streaming en NEXA

```typescript
// En el Route Handler (server)
const stream = new ReadableStream({
  async start(controller) {
    const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      body: JSON.stringify({ model, messages, stream: true }),
    });
    const reader = res.body!.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      controller.enqueue(value);
    }
    controller.close();
  }
});
return new Response(stream, { headers: { 'Content-Type': 'text/plain' } });

// En el cliente
const reader = res.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value, { stream: true });
  // Actualizar UI con el chunk
}
```

### 5. Archivos relacionados en NEXA

| Archivo | Propósito |
|---------|-----------|
| `src/lib/ai/client.ts` | Cliente HTTP a Ollama |
| `src/lib/ai/service.ts` | System prompt + lógica de negocio |
| `src/app/api/ai/chat/route.ts` | Streaming endpoint |
| `src/app/api/ai/status/route.ts` | Health check |

## Checks de validación

- [ ] `ollama serve` está corriendo
- [ ] `curl http://localhost:11434/` devuelve "Ollama is running"
- [ ] `curl http://localhost:11434/api/tags` lista el modelo configurado
- [ ] El chat endpoint de NEXA responde con texto coherente

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| "Connection refused" | Ollama no está corriendo | Ejecutar `ollama serve` |
| "Model not found" | Modelo no descargado | Ejecutar `ollama pull llama3` |
| Respuestas lentas (>30s) | Sin GPU, modelo grande | Usar modelo más pequeño (`llama3:8b`) |
| Sin GPU | N/A | Ollama usa CPU automáticamente (más lento) |
| Puerto en uso | Otro proceso usa 11434 | `OLLAMA_HOST` con otro puerto |

## Notas

- Referencia agent original: `.agent/skills/ollama-integration/SKILL.md`
- Skill de implementación: [`ai-connector.md`](./ai-connector.md)
- Ollama corre como proceso local — no necesita internet para inferencia.
- Modelo recomendado para MVP: `llama3` (8B) — balance entre calidad y velocidad.
