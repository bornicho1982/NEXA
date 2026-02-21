---
name: ollama-integration
description: Skill para gestionar la integración con Ollama (LLM local) en NEXA
---

# Skill: Ollama Integration

## Descripción

Instrucciones para trabajar con Ollama como LLM local para el AI Advisor de NEXA.

## Requisitos previos

1. Instalar Ollama: <https://ollama.com/download>
2. Iniciar el servicio: `ollama serve`
3. Descargar un modelo: `ollama pull llama3`

## Variables de entorno

```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
```

## Endpoints de Ollama utilizados

### Health Check

```
GET http://localhost:11434/
→ 200 "Ollama is running"
```

### Listar modelos

```
GET http://localhost:11434/api/tags
→ { "models": [{ "name": "llama3", ... }] }
```

### Chat (streaming)

```
POST http://localhost:11434/api/chat
{
  "model": "llama3",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "stream": true
}
→ Stream de NDJSON: { "message": { "content": "..." }, "done": false }
```

## Patrón de streaming en NEXA

```typescript
// En el Route Handler (server)
const stream = new ReadableStream({
  async start(controller) {
    // Leer chunks de Ollama y reenviar al cliente
    controller.enqueue(new TextEncoder().encode(chunk));
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
  // Actualizar UI
}
```

## Archivos relacionados

- `src/lib/ai/client.ts` → Cliente HTTP
- `src/lib/ai/service.ts` → System prompt + lógica
- `src/app/api/ai/chat/route.ts` → Streaming endpoint
- `src/app/api/ai/status/route.ts` → Health check

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "Connection refused" | Ejecutar `ollama serve` |
| "Model not found" | Ejecutar `ollama pull llama3` |
| Respuestas lentas | Usar modelo más pequeño o GPU |
| Sin GPU | Ollama usa CPU automáticamente (más lento) |
