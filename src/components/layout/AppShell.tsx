"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ScrollArea } from "@/components/ui/ScrollArea";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Close mobile menu on window resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-bg-primary text-text-primary relative font-sans">

            {/* ── Mobile Sidebar Overlay ── */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        {/* Mobile Sidebar */}
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 left-0 w-[275px] z-50 nexa-sidebar shadow-2xl lg:hidden"
                        >
                            <Sidebar isCollapsed={false} toggleCollapse={() => setIsMobileMenuOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Desktop Sidebar (hidden on mobile) ── */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarCollapsed ? 86 : 275 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="hidden lg:block flex-shrink-0 z-20 nexa-sidebar shadow-sm relative overflow-visible"
            >
                <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
            </motion.aside>

            {/* Main Content Area: Header + Body */}
            <div className="flex-1 flex flex-col relative min-w-0 z-10 bg-bg-primary">
                {/* WowDash-style Header Bar */}
                <Header onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

                {/* Page Content with smooth transitions */}
                <ScrollArea className="flex-1 h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="min-h-full p-4 sm:p-6 lg:p-8"
                        >
                            <Breadcrumb />
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </ScrollArea>
            </div>
        </div>
    );
}
