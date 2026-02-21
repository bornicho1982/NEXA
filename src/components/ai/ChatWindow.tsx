"use client";

import { useRef, useEffect } from "react";
import { useAIChat } from "@/hooks/useAIChat";
import { MessageBubble } from "./MessageBubble";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SUGGESTION_CHIPS = [
    "Analyze my loadout",
    "What is the God Roll for Fatebringer?",
    "Suggest a Solar Warlock build",
    "Explain Armor Mods",
];

export function ChatWindow() {
    const { messages, isLoading, error, sendMessage, clearChat } = useAIChat();
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = () => {
        if (inputRef.current?.value) {
            sendMessage(inputRef.current.value);
            inputRef.current.value = "";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-bg-primary/50 relative overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-bg-secondary/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gold-primary/10 rounded-lg text-gold-primary">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h2 className="font-bold text-text-primary">NEXA Advisor</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-text-tertiary">Online</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    className="p-2 text-text-tertiary hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    title="Clear Chat"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                <div className="min-h-full flex flex-col justify-end gap-4">
                    {/* Welcome State if empty */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                            <Sparkles size={48} className="text-gold-primary mb-4" />
                            <h3 className="text-lg font-bold text-text-primary mb-2">How can I assist you, Guardian?</h3>
                            <p className="text-sm text-text-secondary max-w-xs">
                                I can access the Destiny 2 Manifest to answer questions about items, or analyze your current inventory.
                            </p>

                            {/* Chips */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-8 w-full max-w-md">
                                {SUGGESTION_CHIPS.map((chip) => (
                                    <button
                                        key={chip}
                                        onClick={() => sendMessage(chip)}
                                        className="text-xs text-left p-3 rounded bg-bg-tertiary border border-border-subtle hover:border-gold-primary/50 hover:bg-bg-secondary transition-colors"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                    ))}

                    {isLoading && <ThinkingIndicator />}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-3 mx-auto text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded max-w-md text-center"
                        >
                            Error: {error}. Is Ollama running?
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border-subtle bg-bg-secondary/80 backdrop-blur-sm z-10">
                <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask about loadouts, builds, or item stats..."
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-bg-tertiary border border-border-subtle rounded-full py-3 px-5 text-sm text-text-primary focus:outline-none focus:border-gold-primary/50 transition-colors placeholder:text-text-disabled shadow-inner"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="p-3 bg-gold-primary hover:bg-gold-highlight text-black rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold-primary/10"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="text-[10px] text-center text-text-tertiary mt-2">
                    ⚡ AI responses may vary. Always verify in-game.
                </div>
            </div>
        </div>
    );
}
