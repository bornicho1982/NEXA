import { useFarmingStore } from "@/lib/store/farming";
import { cn } from "@/lib/utils";
import { Tractor } from "lucide-react";
import { useState } from "react";

export function FarmingToggle() {
    const isEnabled = useFarmingStore(s => s.isEnabled);
    const toggle = useFarmingStore(s => s.toggleFarming);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={toggle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title="Farming Mode: Automatically moves Postmaster overflow to the Vault"
            className={cn(
                "relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 overflow-hidden",
                isEnabled
                    ? "bg-wd-success/10 border-wd-success/30 text-wd-success shadow-[0_0_15px_rgba(69,179,105,0.15)]"
                    : "bg-bg-tertiary border-border-subtle text-text-tertiary hover:text-text-primary hover:bg-glass-highlight"
            )}
        >
            {isEnabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-wd-success/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
            )}

            <div className="relative z-10">
                {isEnabled && !isHovered ? (
                    <Tractor size={18} className="animate-bounce" />
                ) : (
                    <Tractor size={18} />
                )}
            </div>

            <span className="relative z-10 text-xs font-bold uppercase tracking-wider">
                {isEnabled ? "Farming Active" : "Farming Mode"}
            </span>

            {isEnabled && (
                <span className="relative z-10 flex h-2 w-2 ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wd-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-wd-success"></span>
                </span>
            )}
        </button>
    );
}
