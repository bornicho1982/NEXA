import { useLayoutStore } from "@/lib/store/layout";
import { Grid, Sword, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUCKETS } from "@/lib/destiny/buckets";

const ICON_DIR = "/custom-icons/icons-filtros%20de%20busqueda";

export function VaultFilterBar() {
    const { vaultFilter, setVaultFilter } = useLayoutStore();

    return (
        <div className="flex items-center gap-1.5 p-2 bg-bg-primary/50 border-b border-border-subtle overflow-x-auto custom-scrollbar shrink-0">
            {/* All */}
            <button
                onClick={() => setVaultFilter("all")}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shrink-0",
                    vaultFilter === "all" ? "bg-wd-primary-600/15 text-wd-primary-400 shadow-sm" : "text-text-tertiary hover:bg-white/5 hover:text-text-primary"
                )}
            >
                <Grid size={15} /> Todos
            </button>

            <div className="w-px h-5 bg-border-subtle mx-1 shrink-0" />

            {/* Weapons Group */}
            <div className="flex items-center gap-1 bg-bg-primary/40 rounded-md p-1 border border-border-subtle shrink-0">
                <button
                    onClick={() => setVaultFilter("weapons")}
                    className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded text-sm transition-colors",
                        vaultFilter === "weapons" ? "bg-wd-primary-600/15 text-wd-primary-400" : "text-text-tertiary hover:bg-white/5 hover:text-text-primary"
                    )}
                >
                    <Sword size={15} /> Armas
                </button>
                <div className="w-px h-4 bg-border-subtle mx-1" />

                <button onClick={() => setVaultFilter(BUCKETS.KINETIC)} className={cn("p-1 rounded transition-colors flex items-center justify-center", vaultFilter === BUCKETS.KINETIC ? "bg-white/10" : "hover:bg-white/5 opacity-50 hover:opacity-100")} title="Kinetic">
                    <img src={`${ICON_DIR}/Cinetica_512.svg`} alt="Kinetic" className="w-[20px] h-[20px] object-contain" />
                </button>
                <button onClick={() => setVaultFilter(BUCKETS.ENERGY)} className={cn("p-1 rounded transition-colors flex items-center justify-center", vaultFilter === BUCKETS.ENERGY ? "bg-white/10" : "hover:bg-white/5 opacity-50 hover:opacity-100")} title="Energy">
                    <img src={`${ICON_DIR}/Energetica_512.svg`} alt="Energy" className="w-[20px] h-[20px] object-contain" />
                </button>
                <button onClick={() => setVaultFilter(BUCKETS.POWER)} className={cn("p-1 rounded transition-colors flex items-center justify-center", vaultFilter === BUCKETS.POWER ? "bg-white/10" : "hover:bg-white/5 opacity-50 hover:opacity-100")} title="Power">
                    <img src={`${ICON_DIR}/Pesada_512.svg`} alt="Power" className="w-[20px] h-[20px] object-contain" />
                </button>
            </div>

            {/* Armor Group */}
            <div className="flex items-center gap-1 bg-bg-primary/40 rounded-md p-1 border border-border-subtle shrink-0">
                <button
                    onClick={() => setVaultFilter("armor")}
                    className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded text-sm transition-colors",
                        vaultFilter === "armor" ? "bg-wd-success/15 text-wd-success" : "text-text-tertiary hover:bg-white/5 hover:text-text-primary"
                    )}
                >
                    <Shield size={14} /> Armaduras
                </button>
                <div className="w-px h-4 bg-border-subtle mx-1" />

                <button onClick={() => setVaultFilter(BUCKETS.HELMET)} className={cn("p-1 rounded transition-colors", vaultFilter === BUCKETS.HELMET ? "ring-1 ring-white/50 bg-white/10" : "hover:bg-white/5 opacity-70 hover:opacity-100")} title="Helmet">
                    <img src={`${ICON_DIR}/helmet.svg`} alt="Helmet" className="w-[22px] h-[22px] object-contain brightness-0 invert" />
                </button>
                <button onClick={() => setVaultFilter(BUCKETS.GAUNTLETS)} className={cn("p-1 rounded transition-colors", vaultFilter === BUCKETS.GAUNTLETS ? "ring-1 ring-white/50 bg-white/10" : "hover:bg-white/5 opacity-70 hover:opacity-100")} title="Gauntlets">
                    <img src={`${ICON_DIR}/gloves.svg`} alt="Gauntlets" className="w-[22px] h-[22px] object-contain brightness-0 invert" />
                </button>
                <button onClick={() => setVaultFilter(BUCKETS.CHEST)} className={cn("p-1 rounded transition-colors", vaultFilter === BUCKETS.CHEST ? "ring-1 ring-white/50 bg-white/10" : "hover:bg-white/5 opacity-70 hover:opacity-100")} title="Chest">
                    <img src={`${ICON_DIR}/chest.svg`} alt="Chest" className="w-[22px] h-[22px] object-contain brightness-0 invert" />
                </button>
                <button onClick={() => setVaultFilter(BUCKETS.LEG)} className={cn("p-1 rounded transition-colors", vaultFilter === BUCKETS.LEG ? "ring-1 ring-white/50 bg-white/10" : "hover:bg-white/5 opacity-70 hover:opacity-100")} title="Legs">
                    <img src={`${ICON_DIR}/boots.svg`} alt="Legs" className="w-[22px] h-[22px] object-contain brightness-0 invert" />
                </button>
                <button onClick={() => setVaultFilter(BUCKETS.CLASS_ITEM)} className={cn("p-1 rounded transition-colors", vaultFilter === BUCKETS.CLASS_ITEM ? "ring-1 ring-white/50 bg-white/10" : "hover:bg-white/5 opacity-70 hover:opacity-100")} title="Class Item">
                    <img src={`${ICON_DIR}/class.svg`} alt="Class Item" className="w-[22px] h-[22px] object-contain brightness-0 invert" />
                </button>
            </div>
        </div>
    );
}
