import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { ScrollArea } from "@/components/ui/ScrollArea";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-full overflow-hidden bg-bg-primary text-text-primary relative font-sans">

            {/* Fixed Sidebar (Professional) */}
            <aside className="w-64 flex-shrink-0 z-20 border-r border-border-subtle bg-bg-secondary shadow-sm">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative min-w-0 z-10 bg-bg-primary">
                <ScrollArea className="flex-1 h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="min-h-full p-6 lg:p-8"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </ScrollArea>
            </div>
        </div>
    );
}
