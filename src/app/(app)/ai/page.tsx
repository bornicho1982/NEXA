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
            {/* Header — WowDash Card Header */}
            <header className="flex items-center justify-between py-4 px-6 border-b border-border-subtle bg-bg-secondary rounded-t-2xl mx-4 mt-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-wd-lilac/8 via-wd-primary-600/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-wd-lilac/20 flex items-center justify-center text-wd-lilac shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-text-primary">NEXA Advisor</h1>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-wd-success shadow-[0_0_6px_var(--color-wd-success)] animate-pulse"></span>
                            <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-bold">System Online • AI Powered</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-bg-primary/50 relative overflow-hidden mx-4 mb-4 rounded-b-2xl border border-t-0 border-border-subtle">
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
                                "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                msg.role === "assistant"
                                    ? "bg-wd-lilac/15 border border-wd-lilac/20 text-wd-lilac"
                                    : "bg-wd-primary-600/15 border border-wd-primary-600/20 text-wd-primary-400"
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
                                        ? "bg-wd-primary-600 text-white font-medium rounded-tr-sm"
                                        : "bg-bg-secondary border border-border-subtle text-text-primary rounded-tl-sm"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-4 max-w-3xl mr-auto wd-slide-up">
                            <div className="h-9 w-9 rounded-xl bg-wd-lilac/15 border border-wd-lilac/20 text-wd-lilac flex items-center justify-center shrink-0">
                                <Bot size={16} />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider px-1">NEXA</span>
                                <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle rounded-tl-sm w-72">
                                    <div className="h-2 w-40 wd-shimmer rounded-full mb-2.5" />
                                    <div className="h-2 w-28 wd-shimmer rounded-full mb-2.5" />
                                    <div className="h-2 w-20 wd-shimmer rounded-full" />
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
                                    className="px-3 py-1.5 rounded-full bg-bg-tertiary border border-border-medium text-xs text-text-secondary hover:text-wd-primary-400 hover:border-wd-primary-600/30 transition-colors whitespace-nowrap"
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
                                className="h-12 bg-bg-primary border-border-medium focus:border-wd-primary-600/50 focus:ring-1 focus:ring-wd-primary-600/50 pl-4 rounded-xl shadow-inner"
                                autoFocus
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="h-12 w-12 rounded-xl p-0 bg-wd-primary-600 text-white hover:bg-wd-primary-600/90 shadow-lg shadow-wd-primary-600/20"
                        >
                            <Send size={20} />
                        </Button>
                    </form>

                    <div className="text-center mt-3">
                        <p className="text-[10px] text-text-tertiary flex items-center justify-center gap-1.5">
                            <Sparkles size={10} className="text-wd-primary-400" />
                            AI responses may vary. Always verify in game.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
