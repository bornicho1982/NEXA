"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export function ThinkingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 self-start max-w-[85%]"
        >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-bg-tertiary border-wd-primary-600/20 text-wd-primary-400">
                <Bot size={16} />
            </div>

            <div className="p-3 rounded-2xl bg-bg-tertiary/50 border border-border-subtle rounded-tl-sm flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-wd-primary-600/50 rounded-full"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                ))}
                <span className="ml-2 text-xs text-text-tertiary">Analyzing...</span>
            </div>
        </motion.div>
    );
}
