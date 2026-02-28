"use client";

import React from "react";

/* ── Donut Chart for K/D/A ── */
interface DonutChartProps {
    kills: number;
    deaths: number;
    assists: number;
    size?: number;
    strokeWidth?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
    kills,
    deaths,
    assists,
    size = 160,
    strokeWidth = 12
}) => {
    const total = kills + deaths + assists;
    if (total === 0) return <div className="flex items-center justify-center text-text-tertiary text-[10px]">No Data</div>;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const kPct = kills / total;
    const dPct = deaths / total;
    const aPct = assists / total;

    const kOffset = 0;
    const dOffset = circumference * kPct;
    const aOffset = circumference * (kPct + dPct);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                {/* Background */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                />
                {/* Kills (Primary) */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="rgb(72, 127, 255)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference * kPct} ${circumference}`}
                    strokeDashoffset={-kOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
                {/* Deaths (Danger) */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="rgb(239, 68, 68)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference * dPct} ${circumference}`}
                    strokeDashoffset={-dOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
                {/* Assists (Success/Info) */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="rgb(34, 197, 94)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference * aPct} ${circumference}`}
                    strokeDashoffset={-aOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-text-primary leading-none">{((kills + assists) / (deaths || 1)).toFixed(2)}</span>
                <span className="text-[8px] text-text-tertiary uppercase tracking-widest mt-1">K/D/A</span>
            </div>
        </div>
    );
};

/* ── Bar Chart for Weapons ── */
interface WeaponKill {
    name: string;
    kills: number;
}

interface BarChartProps {
    data: WeaponKill[];
    maxKills?: number;
}

export const WeaponBarChart: React.FC<BarChartProps> = ({ data, maxKills }) => {
    const limit = maxKills || Math.max(...data.map(d => d.kills), 1);

    return (
        <div className="space-y-3 w-full">
            {data.map((item) => (
                <div key={item.name} className="group">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-text-secondary group-hover:text-text-primary transition-colors">{item.name}</span>
                        <span className="text-[10px] font-mono text-text-tertiary">{item.kills.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-wd-primary-600 to-wd-primary-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(72,127,255,0.3)]"
                            style={{ width: `${(item.kills / limit) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ── Radar Chart for Armor Stats ── */
interface RadarChartProps {
    stats: {
        mobility: number;
        resilience: number;
        recovery: number;
        discipline: number;
        intellect: number;
        strength: number;
    };
    size?: number;
    color?: string;
}

export const ArmorRadarChart: React.FC<RadarChartProps> = ({
    stats,
    size = 200,
    color = "rgba(72, 127, 255, 0.5)"
}) => {
    const labels = ["MOB", "RES", "REC", "DIS", "INT", "STR"];
    const values = [
        stats.mobility,
        stats.resilience,
        stats.recovery,
        stats.discipline,
        stats.intellect,
        stats.strength
    ];

    const center = size / 2;
    const r = (size / 2) * 0.8;
    const angleStep = (Math.PI * 2) / 6;

    // Helper to get coordinates
    const getCoords = (val: number, i: number, max = 100) => {
        const radius = (val / max) * r;
        const x = center + radius * Math.cos(i * angleStep - Math.PI / 2);
        const y = center + radius * Math.sin(i * angleStep - Math.PI / 2);
        return [x, y];
    };

    // Generate paths
    const points = values.map((v, i) => getCoords(v, i)).map(p => p.join(",")).join(" ");

    // Grid lines (25, 50, 75, 100)
    const grids = [25, 50, 75, 100].map(level => {
        return labels.map((_, i) => getCoords(level, i)).map(p => p.join(",")).join(" ");
    });

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Grids */}
                {grids.map((g, i) => (
                    <polygon
                        key={i}
                        points={g}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                    />
                ))}
                {/* Axis lines */}
                {labels.map((_, i) => {
                    const [x, y] = getCoords(100, i);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1"
                        />
                    );
                })}
                {/* Data Polygon */}
                <polygon
                    points={points}
                    fill={color}
                    stroke="rgb(72, 127, 255)"
                    strokeWidth="2"
                    className="transition-all duration-1000 ease-out"
                />
                {/* Points */}
                {values.map((v, i) => {
                    const [x, y] = getCoords(v, i);
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="white"
                            className="transition-all duration-1000 ease-out shadow-lg"
                        />
                    );
                })}
                {/* Labels */}
                {labels.map((l, i) => {
                    const [x, y] = getCoords(115, i);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            fill="rgba(255,255,255,0.4)"
                            fontSize="8"
                            fontWeight="bold"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {l}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

/* ── Win Rate Gauge ── */
interface WinRateGaugeProps {
    rate: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export const WinRateGauge: React.FC<WinRateGaugeProps> = ({
    rate,
    size = 100,
    strokeWidth = 8,
    color = "rgb(245, 158, 11)"
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (rate / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-black text-text-primary italic leading-none">{Math.round(rate)}%</span>
                <span className="text-[7px] text-text-tertiary font-bold uppercase tracking-wider mt-0.5">Wins</span>
            </div>
        </div>
    );
};
