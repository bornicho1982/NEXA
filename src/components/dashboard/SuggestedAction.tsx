"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

export function SuggestedAction() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-50 to-white border border-orange-100 shadow-sm flex items-start gap-4"
        >
            <div className="p-2 bg-white rounded-lg shadow-sm text-gold-primary shrink-0">
                <Sparkles size={20} />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    Optimization Opportunity
                    <span className="px-1.5 py-0.5 rounded bg-gold-primary text-white text-[10px] uppercase font-black tracking-widest">
                        New
                    </span>
                </h3>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                    Your <strong>Solar Warlock Build</strong> can reach <strong>Tier 10 Recovery</strong> by swapping your
                    <span className="font-bold text-text-primary"> Gloves of the Healer</span>.
                </p>
                <button className="mt-3 text-xs font-bold text-gold-primary hover:text-gold-secondary uppercase tracking-wider flex items-center gap-1 group">
                    View Recommendation <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
}
