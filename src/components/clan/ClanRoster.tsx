"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Star, MessageSquare } from "lucide-react";

interface ClanMember {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    activity?: string;
    role: "Admin" | "Member" | "Founder";
    joinDate: string;
}

const MOCK_MEMBERS: ClanMember[] = [
    // Online
    { id: "1", name: "bornicho1982", avatar: "/icons/icon-192.png", isOnline: true, activity: "Raid: Last Wish", role: "Founder", joinDate: "2017" },
    { id: "2", name: "Zavala_Official", avatar: "/icons/icon-192.png", isOnline: true, activity: "Tower: Hangar", role: "Admin", joinDate: "2017" },
    { id: "3", name: "Ikora_Rey", avatar: "/icons/icon-192.png", isOnline: true, activity: "Crucible: Control", role: "Admin", joinDate: "2018" },
    { id: "4", name: "Cayde_6", avatar: "/icons/icon-192.png", isOnline: true, activity: "Patrol: Nessus", role: "Member", joinDate: "2018" },
    // Offline
    { id: "5", name: "Eris_Morn", avatar: "/icons/icon-192.png", isOnline: false, role: "Member", joinDate: "2019" },
    { id: "6", name: "Drifter", avatar: "/icons/icon-192.png", isOnline: false, role: "Member", joinDate: "2019" },
    { id: "7", name: "Saint_14", avatar: "/icons/icon-192.png", isOnline: false, role: "Member", joinDate: "2020" },
    { id: "8", name: "Osiris", avatar: "/icons/icon-192.png", isOnline: false, role: "Member", joinDate: "2020" },
];

export function ClanRoster() {
    return (
        <div className="bg-bg-secondary rounded-xl border border-border-subtle overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-tertiary/20">
                <h2 className="font-bold text-text-primary uppercase tracking-wider">Roster</h2>
                <div className="flex gap-2">
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">4 Online</span>
                    <span className="text-xs text-text-tertiary bg-white/5 px-2 py-1 rounded">82 Total</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {MOCK_MEMBERS.sort((a, b) => (a.isOnline === b.isOnline ? 0 : a.isOnline ? -1 : 1)).map((member, i) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded hover:bg-bg-tertiary transition-colors group cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            {/* Avatar & Status */}
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-bg-tertiary overflow-hidden border border-border-medium">
                                    <Image src={member.avatar} width={40} height={40} alt={member.name} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-bg-secondary", member.isOnline ? "bg-green-500" : "bg-text-disabled")} />
                            </div>

                            {/* Name & Activity */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={cn("font-medium", member.isOnline ? "text-text-primary" : "text-text-secondary")}>
                                        {member.name}
                                    </span>
                                    {member.role !== "Member" && (
                                        <Star size={12} className={cn("fill-current", member.role === "Founder" ? "text-gold-primary" : "text-text-tertiary")} />
                                    )}
                                </div>
                                <div className="text-xs text-text-tertiary">
                                    {member.isOnline ? (
                                        <span className="text-gold-highlight">{member.activity}</span>
                                    ) : (
                                        <span>Last seen 2d ago</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button className="p-2 rounded hover:bg-bg-primary text-text-secondary hover:text-text-primary">
                                <MessageSquare size={16} />
                            </button>
                            <div className="text-xs font-mono text-text-tertiary py-2 px-3 border border-white/5 rounded">
                                JOIN
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
