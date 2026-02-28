"use client";

import { useEffect, useState } from "react";
import { LoadoutBuilder } from "@/components/loadouts/LoadoutBuilder";
import { Loader2 } from "lucide-react";

export default function LoadoutsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadInventory() {
            try {
                const res = await fetch("/api/inventory");
                if (res.ok) {
                    const data = await res.json();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mapped = (data.items || []).map((i: any, index: number) => ({
                        id: i.itemInstanceId || `${i.itemHash}-${index}`,
                        hash: i.itemHash,
                        name: i.name,
                        icon: i.icon,
                        bucketHash: i.bucketHash,
                        type: i.itemType === 3 ? "Weapon" : "Armor"
                    }));
                    setItems(mapped);
                }
            } catch (error) {
                console.error("Failed to load inventory for loadouts", error);
            } finally {
                setLoading(false);
            }
        }

        loadInventory();
    }, []);

    return (
        <div className="flex flex-col h-full bg-bg-primary animate-fade-in">
            <main className="flex-1 p-6 overflow-hidden">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-wd-primary-400" />
                    </div>
                ) : (
                    <LoadoutBuilder inventory={items} />
                )}
            </main>
        </div>
    );
}

