"use client";

import { ChatWindow } from "@/components/ai/ChatWindow";

export default function AIAdvisorPage() {
    return (
        <div className="h-full bg-bg-primary overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 pointer-events-none opacity-5">
                    <div className="absolute inset-0 bg-[url('https://www.bungie.net/img/theme/destiny/icons/icon_warlock_supers.png')] bg-repeat bg-[length:200px]" />
                </div>

                <div className="h-full max-w-5xl mx-auto border-x border-border-subtle bg-bg-primary/95 shadow-2xl">
                    <ChatWindow />
                </div>
            </div>
        </div>
    );
}
