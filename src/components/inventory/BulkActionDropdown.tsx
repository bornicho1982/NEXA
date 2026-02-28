import { Menu } from "@headlessui/react";
import { ChevronDown, Star, Check, Trash2, Archive, X } from "lucide-react";
import type { InventoryItem } from "@/lib/inventory/service";
import { useInventoryStore } from "@/lib/store/inventory";

interface BulkActionDropdownProps {
    items: InventoryItem[];
}

export function BulkActionDropdown({ items }: BulkActionDropdownProps) {
    const { bulkSetAnnotation } = useInventoryStore();

    if (items.length === 0) return null;

    const handleBulkTag = (tag: string | null) => {
        bulkSetAnnotation(items, tag);
    };

    return (
        <Menu as="div" className="relative inline-block text-left z-40 shrink-0">
            <Menu.Button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-all font-medium text-sm h-10">
                <span>Bulk Action</span>
                <span className="bg-indigo-500/30 px-1.5 py-0.5 rounded text-xs font-bold text-white">
                    {items.length}
                </span>
                <ChevronDown size={14} className="opacity-70" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-[#0f172a] border border-white/10 shadow-xl shadow-black focus:outline-none divide-y divide-white/5 overflow-hidden">
                <div className="py-1">
                    <div className="px-4 py-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                        Apply to {items.length} items
                    </div>
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => handleBulkTag("favorite")}
                                className={`${active ? 'bg-white/10 text-white' : 'text-white/70'} group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                            >
                                <Star size={14} className="mr-3 text-red-400 group-hover:fill-current" />
                                Tag as Favorite
                            </button>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => handleBulkTag("keep")}
                                className={`${active ? 'bg-white/10 text-white' : 'text-white/70'} group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                            >
                                <Check size={14} className="mr-3 text-green-400" />
                                Tag as Keep
                            </button>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => handleBulkTag("junk")}
                                className={`${active ? 'bg-white/10 text-white' : 'text-white/70'} group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                            >
                                <Trash2 size={14} className="mr-3 text-orange-400" />
                                Tag as Junk
                            </button>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => handleBulkTag("archive")}
                                className={`${active ? 'bg-white/10 text-white' : 'text-white/70'} group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                            >
                                <Archive size={14} className="mr-3 text-blue-400" />
                                Tag as Archive
                            </button>
                        )}
                    </Menu.Item>
                </div>
                <div className="py-1">
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => handleBulkTag(null)}
                                className={`${active ? 'bg-white/10 text-red-400' : 'text-red-400/80'} group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                            >
                                <X size={14} className="mr-3" />
                                Clear All Tags
                            </button>
                        )}
                    </Menu.Item>
                </div>
            </Menu.Items>
        </Menu>
    );
}
