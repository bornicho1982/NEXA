import { NextResponse, NextRequest } from "next/server";
import { chat, ChatMessage } from "@/lib/ai/client";
import { getManifestContext } from "@/lib/ai/rag";
import { getFullProfile } from "@/lib/inventory/service";
import { summarizeInventoryContext } from "@/lib/ai/context";
import { getErrorMessage } from "@/lib/utils";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1];
        let context = "";

        if (lastMessage.role === "user") {
            try {
                context = await getManifestContext(lastMessage.content);
            } catch (err) {
                console.warn("[AI] RAG context retrieval failed:", err);
            }
        }

        // Fetch User Inventory Context (Parallel with RAG for speed, though RAG depends on content)
        // Only fetch if authenticated (cookies checked by middleware, but service verifies token)
        let inventoryContext = "";
        try {
            // Check if user has session token to avoid 401 error logged
            const token = req.cookies.get("nexa-session")?.value;
            if (token) {
                const profile = await getFullProfile();
                inventoryContext = summarizeInventoryContext(profile.items);
            }
        } catch (err) {
            console.warn("[AI] Inventory context retrieval failed:", err);
        }

        const systemPrompt = `You are NEXA, an AI assistant for Destiny 2.
Your goal is to help players optimize builds and understand items.
Use the following context from the Manifest if relevant to the user query.
Use the User Inventory context to suggest items they actually own.
If the context doesn't match, answer based on your general knowledge.
Be concise.`;

        const fullMessages: ChatMessage[] = [
            { role: "system", content: systemPrompt },
        ];

        if (context) {
            fullMessages.push({ role: "system", content: `CONTEXTO DEL MANIFIESTO:\n${context}` });
        }

        if (inventoryContext) {
            fullMessages.push({ role: "system", content: inventoryContext });
        }

        // Add user conversation
        fullMessages.push(...messages);

        // Fetch from Ollama (Non-streaming for MVP simplicity)
        const content = await chat(fullMessages);

        return NextResponse.json({
            message: {
                role: "assistant",
                content
            }
        });

    } catch (e: unknown) {
        console.error("[AI Chat] Error:", e);
        return NextResponse.json({ error: getErrorMessage(e) }, { status: 500 });
    }
}
