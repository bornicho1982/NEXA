"use client";

import { useState } from "react";
import {
    Palette, Globe, Monitor, Database, Trash2, Download,
    Sun, Moon, Gauge, Eye, Zap, Save, RotateCcw, Check
} from "lucide-react";

/* ── Theme color options from WowDash ThemeLayer ── */
const THEME_COLORS = [
    { id: "blue", label: "Blue", primary: "#487fff", focus: "#c3d5ff" },
    { id: "magenta", label: "Magenta", primary: "#8B5CF6", focus: "#DDD6FE" },
    { id: "orange", label: "Orange", primary: "#F59E0B", focus: "#FEF3C7" },
    { id: "green", label: "Green", primary: "#22C55E", focus: "#DCFCE7" },
    { id: "red", label: "Red", primary: "#EF4444", focus: "#FEE2E2" },
    { id: "cyan", label: "Cyan", primary: "#06B6D4", focus: "#CFFAFE" },
];

/* ── Languages ── */
const LANGUAGES = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "pt", label: "Português", flag: "🇧🇷" },
    { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export default function SettingsPage() {
    const [selectedColor, setSelectedColor] = useState("blue");
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const [darkMode, setDarkMode] = useState(true);
    const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
    const [tooltipDetail, setTooltipDetail] = useState<"minimal" | "standard" | "detailed">("standard");
    const [animations, setAnimations] = useState(true);

    return (
        <div className="p-6 animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* ── Section 1: Theme Colors (WowDash ThemeLayer) ── */}
                <div className="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-wd-primary-600/15 flex items-center justify-center">
                            <Palette size={18} className="text-wd-primary-400" />
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-text-primary">Theme Colors</h3>
                            <p className="text-xs text-text-tertiary">Choose your accent color scheme</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {THEME_COLORS.map((color) => (
                                <button
                                    key={color.id}
                                    onClick={() => setSelectedColor(color.id)}
                                    className={`relative rounded-xl p-3 border-2 transition-all duration-200 group ${selectedColor === color.id
                                        ? "border-white/30 bg-white/5 shadow-lg"
                                        : "border-border-subtle hover:border-white/10 hover:bg-white/3"
                                        }`}
                                >
                                    {selectedColor === color.id && (
                                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-wd-success flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                    <div className="flex gap-2 mb-2">
                                        <div className="flex-1 h-16 rounded-lg" style={{ backgroundColor: color.primary }} />
                                        <div className="flex-1 h-16 rounded-lg" style={{ backgroundColor: color.focus }} />
                                    </div>
                                    <p className="text-xs font-semibold text-text-secondary text-center mt-1">{color.label}</p>
                                </button>
                            ))}
                        </div>

                        {/* Dark / Light Toggle */}
                        <div className="mt-6 flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-bg-primary/40">
                            <div className="flex items-center gap-3">
                                {darkMode ? <Moon size={18} className="text-wd-primary-400" /> : <Sun size={18} className="text-wd-warning" />}
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">Dark Mode</p>
                                    <p className="text-xs text-text-tertiary">Toggle between dark and light theme</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`relative w-11 h-6 rounded-full transition-all duration-200 ${darkMode ? "bg-wd-primary-600" : "bg-bg-tertiary"}`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 ${darkMode ? "left-[22px]" : "left-0.5"}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Language ── */}
                <div className="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-wd-success/15 flex items-center justify-center">
                            <Globe size={18} className="text-wd-success" />
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-text-primary">Language</h3>
                            <p className="text-xs text-text-tertiary">Select your preferred interface language</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => setSelectedLanguage(lang.code)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${selectedLanguage === lang.code
                                        ? "border-wd-primary-600/50 bg-wd-primary-600/10 text-wd-primary-400"
                                        : "border-border-subtle hover:bg-white/3 text-text-secondary hover:text-text-primary"
                                        }`}
                                >
                                    <span className="text-xl">{lang.flag}</span>
                                    <span className="text-sm font-medium">{lang.label}</span>
                                    {selectedLanguage === lang.code && <Check size={14} className="ml-auto text-wd-primary-400" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Section 3: Display Preferences ── */}
                <div className="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-wd-warning/15 flex items-center justify-center">
                            <Monitor size={18} className="text-wd-warning" />
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-text-primary">Display Preferences</h3>
                            <p className="text-xs text-text-tertiary">Customize the look and feel</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Density */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-bg-primary/40">
                            <div className="flex items-center gap-3">
                                <Gauge size={18} className="text-text-tertiary" />
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">Display Density</p>
                                    <p className="text-xs text-text-tertiary">How compact the interface appears</p>
                                </div>
                            </div>
                            <div className="flex gap-1 bg-bg-primary rounded-lg p-1">
                                {(["comfortable", "compact"] as const).map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDensity(d)}
                                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${density === d ? "bg-wd-primary-600 text-white" : "text-text-tertiary hover:text-text-primary"}`}
                                    >
                                        {d.charAt(0).toUpperCase() + d.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tooltip Detail */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-bg-primary/40">
                            <div className="flex items-center gap-3">
                                <Eye size={18} className="text-text-tertiary" />
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">Tooltip Detail Level</p>
                                    <p className="text-xs text-text-tertiary">How much info to show on hover</p>
                                </div>
                            </div>
                            <div className="flex gap-1 bg-bg-primary rounded-lg p-1">
                                {(["minimal", "standard", "detailed"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTooltipDetail(t)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${tooltipDetail === t ? "bg-wd-primary-600 text-white" : "text-text-tertiary hover:text-text-primary"}`}
                                    >
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Animations Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-bg-primary/40">
                            <div className="flex items-center gap-3">
                                <Zap size={18} className="text-text-tertiary" />
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">Animations</p>
                                    <p className="text-xs text-text-tertiary">Enable or disable UI animations</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAnimations(!animations)}
                                className={`relative w-11 h-6 rounded-full transition-all duration-200 ${animations ? "bg-wd-primary-600" : "bg-bg-tertiary"}`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 ${animations ? "left-[22px]" : "left-0.5"}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Section 4: Data & Privacy ── */}
                <div className="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-wd-danger/15 flex items-center justify-center">
                            <Database size={18} className="text-wd-danger" />
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-text-primary">Data & Privacy</h3>
                            <p className="text-xs text-text-tertiary">Manage your data and cache</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button className="flex flex-col items-center gap-2 p-5 rounded-xl border border-border-subtle hover:bg-white/3 transition-colors group">
                                <Trash2 size={22} className="text-wd-danger group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-text-primary">Clear Cache</span>
                                <span className="text-xs text-text-tertiary text-center">Remove cached manifest &amp; item data</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-5 rounded-xl border border-border-subtle hover:bg-white/3 transition-colors group">
                                <Download size={22} className="text-wd-primary-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-text-primary">Export Data</span>
                                <span className="text-xs text-text-tertiary text-center">Download your builds &amp; loadouts as JSON</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 p-5 rounded-xl border border-border-subtle hover:bg-white/3 transition-colors group">
                                <RotateCcw size={22} className="text-wd-warning group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-text-primary">Reset Settings</span>
                                <span className="text-xs text-text-tertiary text-center">Restore all settings to defaults</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save All */}
                <div className="flex items-center justify-center gap-3 pb-4">
                    <button className="px-10 py-3 rounded-xl bg-wd-primary-600 text-white hover:bg-wd-primary-700 text-sm font-bold transition-colors shadow-lg shadow-wd-primary-600/25 flex items-center gap-2">
                        <Save size={16} /> Save All Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
