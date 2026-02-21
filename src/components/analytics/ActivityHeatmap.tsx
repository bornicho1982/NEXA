"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";

interface ActivityData {
    day: string;
    hours: number;
}

const data: ActivityData[] = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 4.0 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 5.2 },
    { day: "Fri", hours: 3.8 },
    { day: "Sat", hours: 8.5 },
    { day: "Sun", hours: 6.0 },
];

export function ActivityHeatmap() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-lg bg-bg-secondary border border-border-subtle h-[300px] flex flex-col"
        >
            <h3 className="text-sm font-medium text-text-primary uppercase tracking-wider mb-6">Activity Heatmap (Last 7 Days)</h3>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis
                            dataKey="day"
                            stroke="#52525b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#18181b',
                                borderColor: '#27272a',
                                borderRadius: '4px',
                                color: '#f4f4f5'
                            }}
                            cursor={{ fill: '#27272a', opacity: 0.4 }}
                        />
                        <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.hours > 5 ? '#eab308' : '#3f3f46'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
