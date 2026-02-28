"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function SuggestedAction() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 wd-card border-l-2 border-l-wd-warning relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-wd-warning/5 to-transparent pointer-events-none" />
            <div className="flex items-start gap-4 relative z-10">
                <div className="p-2 bg-wd-warning/10 rounded-lg border border-wd-warning/20 text-wd-warning shrink-0">
                    <Sparkles size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                        Optimization Opportunity
                        <span className="wd-badge wd-badge-warning text-[10px]">
                            New
                        </span>
                    </h3>
                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                        Your <strong className="text-text-primary">Solar Warlock Build</strong> can reach <strong className="text-text-primary">Tier 10 Recovery</strong> by swapping your
                        <span className="font-bold text-text-primary"> Gloves of the Healer</span>.
                    </p>
                    <button className="mt-3 text-xs font-bold text-wd-primary-400 hover:text-wd-primary-300 uppercase tracking-wider flex items-center gap-1 group">
                        View Recommendation <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
