import { env } from "@/lib/config/env";

export const OLLAMA_URL = env.OLLAMA_HOST;
export const OLLAMA_MODEL = env.OLLAMA_MODEL;

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

/**
 * Send a chat completion request to the local Ollama instance (Full Response).
 */
export async function chat(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages,
            stream: false,
        }),
    });

    if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || "";
}

/**
 * Send a chat completion request as a data stream.
 */
export async function streamChat(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages,
            stream: true,
        }),
    });

    if (!response.ok || !response.body) {
        throw new Error(`Ollama Stream error: ${response.statusText}`);
    }

    return response.body;
}

/**
 * Basic health check for the Ollama instance.
 */
export async function checkOllamaHealth(): Promise<{ online: boolean; model: string }> {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`);
        if (!response.ok) throw new Error("Offline");

        const data = await response.json();
        const models = data.models || [];
        const hasModel = models.some((m: { name: string }) => m.name.includes(OLLAMA_MODEL));

        return {
            online: true,
            model: hasModel ? OLLAMA_MODEL : "NOT_PULLED",
        };
    } catch {
        return { online: false, model: "OFFLINE" };
    }
}
