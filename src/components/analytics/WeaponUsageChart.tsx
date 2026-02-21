"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const data = [
    { name: "Hand Cannon", value: 450, color: "#eab308" }, // Gold
    { name: "Pulse Rifle", value: 300, color: "#3b82f6" }, // Blue
    { name: "Shotgun", value: 200, color: "#ef4444" }, // Red
    { name: "Rocket", value: 150, color: "#a855f7" }, // Purple
    { name: "Other", value: 100, color: "#71717a" }, // Gray
];

export function WeaponUsageChart() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 rounded-lg bg-bg-secondary border border-border-subtle h-[300px] flex flex-col"
        >
            <h3 className="text-sm font-medium text-text-primary uppercase tracking-wider mb-2">Weapon Usage</h3>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#18181b',
                                borderColor: '#27272a',
                                borderRadius: '4px',
                                color: '#f4f4f5'
                            }}
                        />
                        <Legend
                            verticalAlign="middle"
                            align="right"
                            layout="vertical"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
