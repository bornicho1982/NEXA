"use client";

import { useState, useRef, useMemo } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

const COMMANDS = [
    { cmd: "is:weapon", desc: "Filter by Weapon" },
    { cmd: "is:armor", desc: "Filter by Armor" },
    { cmd: "is:exotic", desc: "Filter Exotics" },
    { cmd: "is:legendary", desc: "Filter Legendaries" },
    { cmd: "is:kinetic", desc: "Kinetic Damage" },
    { cmd: "is:energy", desc: "Energy Damage" },
    { cmd: "is:power", desc: "Power Damage" },
    { cmd: "is:deepsight", desc: "Red Border" },
    { cmd: "is:crafted", desc: "Crafted" },
    { cmd: "is:locked", desc: "Locked Items" },
    { cmd: "tag:favorite", desc: "Favorite Items" },
    { cmd: "tag:junk", desc: "Junk Items" },
];

export function SearchBar({ value, onChange }: SearchBarProps) {
    const [focused, setFocused] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const suggestions = useMemo(() => {
        if (!focused || !value) {
            return [];
        }

        const lastWord = value.split(" ").pop()?.toLowerCase() || "";
        if (lastWord.includes(":") || lastWord.startsWith("is") || lastWord.startsWith("tag")) {
            return COMMANDS.filter(c => c.cmd.startsWith(lastWord));
        } else {
            return [];
        }
    }, [value, focused]);

    const handleSelect = (cmd: string) => {
        const parts = value.split(" ");
        parts.pop();
        const newValue = parts.join(" ") + (parts.length > 0 ? " " : "") + cmd + " ";
        onChange(newValue);
    };

    return (
        <div ref={wrapperRef} className="relative group w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-wd-primary-400 transition-colors" />
            <input
                type="text"
                placeholder="Search (e.g. is:weapon Hand Cannon)"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 200)}
                className="h-10 w-full bg-bg-primary border border-border-subtle rounded-lg pl-9 text-sm text-text-primary focus:border-wd-primary-600/50 focus:ring-1 focus:ring-wd-primary-600/25 focus:outline-none transition-all"
            />

            {focused && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 left-0 w-full bg-bg-secondary border border-border-subtle rounded-lg shadow-elevated z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {suggestions.map((s) => (
                        <button
                            key={s.cmd}
                            onClick={() => handleSelect(s.cmd)}
                            className="w-full text-left px-4 py-2 hover:bg-wd-primary-600/10 text-xs flex justify-between items-center group/item"
                        >
                            <span className="font-mono text-wd-primary-400">{s.cmd}</span>
                            <span className="text-text-tertiary group-hover/item:text-white transition-colors">{s.desc}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
