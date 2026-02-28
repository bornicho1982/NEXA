import { useMemo, useState } from "react";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Search Logic ───
// Define available filters for autocomplete
const FILTERS = [
    { type: "is", values: ["weapon", "armor", "exotic", "legendary", "rare", "masterwork", "locked"] },
    { type: "stat", values: ["mobility", "resilience", "recovery", "discipline", "intellect", "strength"] },
    { type: "element", values: ["arc", "solar", "void", "stasis", "strand", "kinetic"] },
    { type: "bucket", values: ["kinetic", "energy", "power", "helmet", "gauntlets", "chest", "leg", "class"] },
];

export function AdvancedSearch({
    onSearch,
    placeholder = "Search (e.g. is:weapon stat:resilience:>80)",
    className
}: {
    onSearch?: (query: string) => void;
    placeholder?: string;
    className?: string;
}) {
    const [query, setQuery] = useState("");


    // Parse the current query word being typed to suggest relevant filters
    const suggestions = useMemo(() => {
        const words = query.split(" ");
        const lastWord = words[words.length - 1].toLowerCase();

        // 1. Suggest Filter Types (e.g. "is:", "stat:") if starting a new word or matching a type
        if (!lastWord.includes(":")) {
            return FILTERS.filter(f => f.type.startsWith(lastWord)).map(f => ({
                id: f.type,
                label: `${f.type}:`,
                desc: `Filter by ${f.type}`,
                value: `${f.type}:`
            }));
        }

        // 2. Suggest Values (e.g. "weapon", "armor") if typing after "is:"
        const [type, val] = lastWord.split(":");
        const filter = FILTERS.find(f => f.type === type);
        if (filter) {
            return filter.values
                .filter(v => v.startsWith(val))
                .map(v => ({
                    id: `${type}:${v}`,
                    label: v,
                    desc: `${type} ${v}`,
                    value: `${type}:${v}`
                }));
        }

        return [];
    }, [query]);

    // Update parent and local state
    const handleChange = (value: string | null) => {
        if (!value) return;

        // Smart replace: Split query by space, replace last part with selection
        const words = query.split(" ");
        words[words.length - 1] = value;
        const newQuery = words.join(" ") + " "; // Add space for next term
        setQuery(newQuery);
        onSearch?.(newQuery);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        onSearch?.(e.target.value);
    };

    return (
        <div className={cn("relative w-full z-40 group", className)}>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-wd-primary-600/20 to-blue-vanguard/20 opacity-0 group-focus-within:opacity-100 transition-opacity blur duration-500" />
            <Combobox value={query} onChange={handleChange} immediate>
                <div className="relative w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary group-focus-within:text-wd-primary-400 transition-colors" />

                    <ComboboxInput
                        className={cn(
                            "w-full rounded-xl bg-bg-secondary/80 backdrop-blur-sm border border-border-medium py-2.5 pl-10 pr-12 text-sm text-text-primary placeholder:text-text-tertiary",
                            "focus:outline-none focus:bg-bg-secondary focus:border-wd-primary-600/50 transition-all font-medium",
                            "shadow-inner shadow-black/20"
                        )}
                        placeholder={placeholder}
                        onChange={handleInputChange}
                        autoComplete="off"
                    />

                    {/* Right Side Actions */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {query ? (
                            <button
                                onClick={() => { setQuery(""); onSearch?.(""); }}
                                className="text-text-tertiary hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                        ) : (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-medium">
                                <span className="text-[10px] font-bold text-text-tertiary font-sans">Ctrl K</span>
                            </div>
                        )}
                    </div>
                </div>

                {suggestions.length > 0 && (
                    <ComboboxOptions
                        className={cn(
                            "absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-bg-secondary/95 backdrop-blur-md py-1",
                            "border border-border-medium shadow-2xl shadow-black/50 ring-1 ring-white/5",
                            "z-50 animate-in fade-in zoom-in-95 duration-100 ease-out origin-top"
                        )}
                    >
                        <div className="px-2 py-1.5 pb-0">
                            <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider px-2">Suggestions</span>
                        </div>
                        {suggestions.map((suggestion) => (
                            <ComboboxOption
                                key={suggestion.id}
                                value={suggestion.value}
                                className={({ focus }) =>
                                    cn(
                                        "relative cursor-pointer select-none py-2 px-3 mx-1 my-0.5 rounded-lg transition-colors",
                                        focus ? "bg-wd-primary-600/10 text-wd-primary-400" : "text-text-secondary"
                                    )
                                }
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">{suggestion.label}</span>
                                    <span className="text-[10px] opacity-70 border border-white/10 px-1 rounded bg-black/20">{suggestion.desc}</span>
                                </div>
                            </ComboboxOption>
                        ))}
                    </ComboboxOptions>
                )}
            </Combobox>
        </div>
    );
}
