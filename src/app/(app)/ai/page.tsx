"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { Button, Input } from "@/components/ui/components";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

const SUGGESTED_QUERIES = [
    "Analyze my current loadout",
    "Suggest a Solar Warlock build",
    "What's the meta for distinct raids?",
    "How do I improve my resilience?",
];

export default function AIPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "0",
            role: "assistant",
            content: `Greetings, Guardian ${user?.displayName || ""}. I am NEXA, your tactical advisor. How can I assist with your build optimization today?`
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || loading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            // Context from previous messages (last 5)
            const apiMessages = messages.slice(-5).concat(userMsg).map(m => ({ role: m.role, content: m.content }));

            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: apiMessages })
            });

            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();
            const aiContent = data.message?.content || "I'm having trouble connecting to the network. Please try again.";

            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: aiContent }]);

        } catch {
            showToast("Connection severed. Retrying uplink...", "error");
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "I cannot establish a connection to the tactical network right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in max-w-5xl mx-auto w-full">
            {/* Header */}
            <header className="flex items-center justify-between py-4 px-6 border-b border-border-subtle bg-bg-secondary/50 backdrop-blur-md rounded-t-xl mx-4 mt-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gold-primary/10 rounded-lg text-gold-primary">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-text-primary">NEXA Advisor</h1>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-status-success shadow-[0_0_4px_theme(colors.status.success)]"></span>
                            <span className="text-xs text-text-secondary">System Online</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-bg-primary/50 relative overflow-hidden mx-4 mb-4 rounded-b-xl border border-t-0 border-border-subtle">
                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
                >
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn(
                            "flex gap-4 max-w-3xl",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}>
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                                msg.role === "assistant"
                                    ? "bg-bg-tertiary border-border-medium text-gold-primary"
                                    : "bg-bg-tertiary border-border-medium text-text-secondary"
                            )}>
                                {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                            </div>

                            <div className={cn(
                                "flex flex-col gap-1 min-w-[100px]",
                                msg.role === "user" ? "items-end" : "items-start"
                            )}>
                                <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider mb-1 px-1">
                                    {msg.role === "assistant" ? "NEXA" : "You"}
                                </span>
                                <div className={cn(
                                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                    msg.role === "user"
                                        ? "bg-gold-primary text-bg-primary font-medium rounded-tr-sm"
                                        : "bg-bg-secondary border border-border-subtle text-text-primary rounded-tl-sm"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-4 max-w-3xl mr-auto animate-pulse">
                            <div className="h-8 w-8 rounded-full bg-bg-tertiary border border-border-medium text-gold-primary flex items-center justify-center shrink-0">
                                <Bot size={16} />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider px-1">NEXA</span>
                                <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle rounded-tl-sm w-64">
                                    <div className="h-2 w-16 bg-text-tertiary/20 rounded-full mb-2 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="h-2 w-12 bg-text-tertiary/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-bg-secondary border-t border-border-subtle relative z-20">
                    {/* Suggestions */}
                    {messages.length < 3 && !loading && (
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none justify-center">
                            {SUGGESTED_QUERIES.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => handleSend(q)}
                                    className="px-3 py-1.5 rounded-full bg-bg-tertiary border border-border-medium text-xs text-text-secondary hover:text-gold-primary hover:border-gold-primary/30 transition-colors whitespace-nowrap"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-3 max-w-4xl mx-auto"
                    >
                        <div className="flex-1 relative">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about loadouts, builds, or item stats..."
                                className="h-12 bg-bg-primary border-border-medium focus:border-gold-primary/50 focus:ring-1 focus:ring-gold-primary/50 pl-4 rounded-xl shadow-inner"
                                autoFocus
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="h-12 w-12 rounded-xl p-0 bg-gold-primary text-bg-primary hover:bg-gold-primary/90 shadow-lg shadow-gold-primary/20"
                        >
                            <Send size={20} />
                        </Button>
                    </form>

                    <div className="text-center mt-3">
                        <p className="text-[10px] text-text-tertiary flex items-center justify-center gap-1.5">
                            <Sparkles size={10} className="text-gold-primary" />
                            AI responses may vary. Always verify in game.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
