"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const data = [
    { name: 'Mon', kills: 400, deaths: 240 },
    { name: 'Tue', kills: 300, deaths: 139 },
    { name: 'Wed', kills: 520, deaths: 280 },
    { name: 'Thu', kills: 450, deaths: 200 },
    { name: 'Fri', kills: 600, deaths: 350 },
    { name: 'Sat', kills: 800, deaths: 400 },
    { name: 'Sun', kills: 750, deaths: 380 },
];

export function AnalyticsDashboard() {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorKills" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EA580C" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDeaths" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0f172a', /* Dark Blue/Grey */
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#F8FAFC',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#F8FAFC' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="kills"
                        stroke="#EA580C"
                        fillOpacity={1}
                        fill="url(#colorKills)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="deaths"
                        stroke="#0D9488"
                        fillOpacity={1}
                        fill="url(#colorDeaths)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
