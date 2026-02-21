"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
    role: "user" | "assistant" | "system";
    content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
    const isAi = role === "assistant";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex gap-3 max-w-[85%]",
                isAi ? "self-start" : "self-end flex-row-reverse"
            )}
        >
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                isAi ? "bg-bg-tertiary border-gold-primary/20 text-gold-primary" : "bg-bg-secondary border-border-subtle text-text-secondary"
            )}>
                {isAi ? <Bot size={16} /> : <User size={16} />}
            </div>

            <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed",
                isAi ? "bg-bg-tertiary/50 border border-border-subtle text-text-primary rounded-tl-sm" : "bg-gold-primary/10 border border-gold-primary/20 text-text-primary rounded-tr-sm"
            )}>
                {isAi ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                            components={{
                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                code: ({ node, ...props }) => <code className="bg-black/30 px-1 py-0.5 rounded text-xs font-mono text-gold-highlight" {...props} />
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <p>{content}</p>
                )}
            </div>
        </motion.div>
    );
}
