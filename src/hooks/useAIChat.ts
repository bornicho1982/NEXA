"use client";

import { useState, useCallback } from "react";
import { ChatMessage } from "@/lib/ai/client";

export interface Message extends ChatMessage {
    id: string;
    timestamp: number;
}

export function useAIChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            // Prepare payload with history (excluding IDs/timestamps for API)
            const apiMessages = [...messages, userMessage].map(({ role, content }) => ({ role, content }));

            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: apiMessages })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to fetch response");
            }

            const data = await response.json();
            const aiMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.message.content,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (err: any) {
            console.error("Chat Error:", err);
            setError(err.message || "Something went wrong.");
            // Optional: Remove user message if failed? Or just show error.
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat
    };
}
