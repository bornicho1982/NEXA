"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoginButton } from "@/components/auth/LoginButton";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Zap, Search, LayoutTemplate } from "lucide-react";

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
        // Premium subtle white/gold tint
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

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary text-text-primary">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-bg-primary" />
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 10%, rgba(247, 181, 56, 0.08) 0%, transparent 50%)", // Gold top highlight
        }}
      />
      <Starfield />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center max-w-4xl mx-auto animate-fade-in">

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="relative inline-block">
            <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-lg">
              NEXA
            </h1>
            <span className="absolute -top-4 -right-8 px-2 py-0.5 rounded bg-gold-primary/20 text-gold-primary text-[10px] font-bold uppercase tracking-widest border border-gold-primary/30">
              v4.0 Premium
            </span>
          </div>

          <p className="text-xl sm:text-2xl text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
            Advanced Loadout Intelligence for <span className="text-white font-semibold">Destiny 2</span>.
          </p>
          <p className="text-sm text-text-tertiary">
            Inventory Management · Build Optimization · AI Tactical Advisor
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
          <FeatureCard icon={LayoutTemplate} label="Inventory" />
          <FeatureCard icon={Zap} label="Build Lab" />
          <FeatureCard icon={Shield} label="Loadouts" />
          <FeatureCard icon={Search} label="AI Insights" />
        </div>

        {/* CTA Section */}
        <div className="mt-8 flex flex-col items-center gap-4">
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

          <p className="text-xs text-text-tertiary mt-4 max-w-sm">
            Secure authentication via Bungie.net. <br />
            NEXA does not store your credentials.
          </p>
        </div>

        {/* Error Feedback */}
        {typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("error") && (
            <div className="px-4 py-2 rounded-md bg-status-error/10 border border-status-error/20 text-status-error text-xs font-medium mt-4 animate-pulse">
              Authentication Handshake Failed. Please retry.
            </div>
          )}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-[10px] text-text-tertiary uppercase tracking-widest opacity-60">
        System Operational • Not affiliated with Bungie, Inc.
      </footer>
    </main>
  );
}

function FeatureCard({ icon: Icon, label }: { icon: React.ElementType, label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-bg-secondary/50 border border-border-subtle hover:border-gold-primary/30 hover:bg-bg-tertiary transition-all duration-300 group cursor-default backdrop-blur-sm">
      <div className="p-2 rounded-full bg-bg-tertiary text-text-secondary group-hover:text-gold-primary group-hover:bg-gold-primary/10 transition-colors">
        <Icon size={20} />
      </div>
      <span className="text-xs font-semibold text-text-secondary group-hover:text-white uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
