import { useLayoutStore } from "@/lib/store/layout";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DensityToggle() {
    const { isCompactMode, setCompactMode } = useLayoutStore();

    return (
        <button
            onClick={() => setCompactMode(!isCompactMode)}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                isCompactMode
                    ? "bg-wd-primary-600/10 hover:bg-wd-primary-600/20 text-wd-primary-400 border-wd-primary-600/30"
                    : "bg-bg-tertiary hover:bg-glass-highlight text-text-secondary border-border-subtle"
            )}
            title={isCompactMode ? "Cambiar a Vista Detallada" : "Cambiar a Vista Compacta"}
        >
            {isCompactMode ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            <span className="hidden md:inline text-sm font-medium">
                {isCompactMode ? "Normal" : "Compacto"}
            </span>
        </button>
    );
}
