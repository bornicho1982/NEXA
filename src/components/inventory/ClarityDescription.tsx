import React from "react";
import { ClarityLine, ClarityClassName } from "@/lib/clarity/types";
import { cn } from "@/lib/utils";

// Mapping Clarity class definitions from DIM to our Tailwind theme
const CLARITY_CLASS_MAP: Record<ClarityClassName, string> = {
    background: "bg-[#181C25] p-2 rounded",
    blue: "text-[#3B82F6]", // or an Arc color
    bold: "font-bold",
    breakSpaces: "whitespace-pre-wrap",
    center: "text-center",
    communityDescription: "opacity-90",
    descriptionDivider: "border-t border-white/20 my-2 w-full",
    enhancedArrow: "text-wd-primary-400 mr-1",
    green: "text-[#10B981]", // Strand/Generic green
    link: "underline cursor-pointer",
    purple: "text-[#8B5CF6]", // Void color
    pve: "text-blue-400 font-semibold", // Often represents PvE specifically 
    pvp: "text-red-400 font-semibold",  // Often represents PvP specifically
    spacer: "mt-1",
    title: "text-sm font-bold text-white mb-1",
    yellow: "text-wd-primary-400", // Solar/Highlight
};

export function ClarityDescription({ lines }: { lines: ClarityLine[] }) {
    if (!lines || lines.length === 0) return null;

    return (
        <div className="flex flex-col gap-1 mt-2 text-[11px] leading-relaxed text-text-tertiary">
            {lines.map((line, i) => (
                <div key={i} className={cn("flex flex-wrap items-baseline gap-x-[2px]", line.classNames?.map(c => CLARITY_CLASS_MAP[c]).filter(Boolean))}>
                    {line.linesContent ? (
                        line.linesContent.map((content, j) => {
                            if (!content.text && !content.classNames?.includes('spacer') && !content.classNames?.includes('descriptionDivider')) return null;

                            const contentClasses = content.classNames?.map(c => CLARITY_CLASS_MAP[c]).filter(Boolean).join(" ");

                            return (
                                <span key={j} className={cn(contentClasses, content.classNames?.includes('bold') ? "text-white" : "")}>
                                    {content.text}
                                </span>
                            );
                        })
                    ) : (
                        // If there's no linesContent, it might just be a divider or spacer on the line itself
                        line.classNames?.includes('descriptionDivider') && <div className="border-t border-white/10 w-full my-1" />
                    )}
                </div>
            ))}
        </div>
    );
}
