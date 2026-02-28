"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoginButton } from "@/components/auth/LoginButton";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Zap, LayoutTemplate, Sparkles, Target, Layers } from "lucide-react";
import { motion } from "framer-motion";

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number }[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function initStars() {
      if (!canvas) return;
      stars.length = 0;
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.3 + 0.05,
          opacity: Math.random() * 0.8 + 0.2,
        });
      }
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        star.y -= star.speed;
        star.opacity += (Math.random() - 0.5) * 0.02;
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));

        if (star.y < -10) {
          star.y = canvas.height + 10;
          star.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    }

    resize();
    initStars();
    animate();

    window.addEventListener("resize", () => {
      resize();
      initStars();
    });

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const features = [
    { icon: LayoutTemplate, label: "Inventory", desc: "Full vault management", color: "text-wd-primary-400", glowColor: "rgba(72,127,255,0.3)" },
    { icon: Zap, label: "Build Lab", desc: "Stat optimizer", color: "text-wd-warning", glowColor: "rgba(245,158,11,0.3)" },
    { icon: Shield, label: "Loadouts", desc: "Smart presets", color: "text-wd-success", glowColor: "rgba(34,197,94,0.3)" },
    { icon: Sparkles, label: "AI Advisor", desc: "Tactical AI", color: "text-wd-lilac", glowColor: "rgba(139,92,246,0.3)" },
    { icon: Target, label: "Analytics", desc: "Combat stats", color: "text-wd-danger", glowColor: "rgba(239,68,68,0.3)" },
    { icon: Layers, label: "Marketplace", desc: "Vendor tracker", color: "text-wd-info", glowColor: "rgba(56,189,248,0.3)" },
  ];

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary text-text-primary">
      {/* Background */}
      <div className="fixed inset-0 bg-bg-primary" />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 10%, rgba(72,127,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(139,92,246,0.04) 0%, transparent 40%), radial-gradient(ellipse at 80% 60%, rgba(245,158,11,0.03) 0%, transparent 40%)",
        }}
      />
      {/* Bungie destination bg */}
      <div
        className="fixed inset-0 opacity-[0.06] pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: "url(https://www.bungie.net/img/destiny_content/pgcr/raid_deep_stone_crypt.jpg)" }}
      />
      <Starfield />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center max-w-5xl mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-5"
        >
          <div className="relative inline-block">
            <h1 className="text-7xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 drop-shadow-lg">
              NEXA
            </h1>
            <span className="absolute -top-4 -right-10 px-2.5 py-1 rounded-lg bg-wd-primary-600/20 text-wd-primary-400 text-[10px] font-black uppercase tracking-widest border border-wd-primary-600/30 shadow-[0_0_12px_rgba(72,127,255,0.2)]">
              Protocol v4
            </span>
          </div>

          <p className="text-xl sm:text-2xl text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
            Advanced Loadout Intelligence for <span className="text-white font-bold">Destiny 2</span>
          </p>
          <p className="text-xs text-text-tertiary uppercase tracking-[0.25em] font-bold">
            Inventory · Builds · Loadouts · AI Tactical Advisor
          </p>
        </motion.div>

        {/* Feature Grid — WowDash Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full max-w-4xl"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle hover:border-white/15 transition-all duration-300 group cursor-default backdrop-blur-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center ${f.color} group-hover:scale-110 transition-all duration-300`}
                style={{ boxShadow: `0 0 0px ${f.glowColor}` }}
              >
                <f.icon size={20} />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider block">{f.label}</span>
                <span className="text-[10px] text-text-tertiary font-medium">{f.desc}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-4 flex flex-col items-center gap-4"
        >
          {isLoading ? (
            <div className="flex items-center gap-3 px-8 py-3 rounded-full bg-bg-tertiary border border-border-medium text-text-secondary">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-xs uppercase tracking-widest font-semibold">Establishing Uplink...</span>
            </div>
          ) : (
            <div className="transform hover:scale-105 transition-transform duration-300">
              <LoginButton />
            </div>
          )}

          <p className="text-[10px] text-text-tertiary mt-2 max-w-sm leading-relaxed">
            Secure authentication via Bungie.net. <br />
            NEXA does not store your credentials.
          </p>
        </motion.div>

        {/* Error */}
        {typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("error") && (
            <div className="px-4 py-2 rounded-lg bg-wd-danger/10 border border-wd-danger/20 text-wd-danger text-xs font-bold mt-4 animate-pulse uppercase tracking-wider">
              Authentication Handshake Failed. Please retry.
            </div>
          )}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-[10px] text-text-tertiary uppercase tracking-widest opacity-50 font-medium">
        System Operational • Not affiliated with Bungie, Inc.
      </footer>
    </main>
  );
}
