"use client";

import { useCallback } from "react";

type SoundType = "hover" | "click" | "success" | "error";

export function useSoundEffect() {
    const play = useCallback((type: SoundType) => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            switch (type) {
                case "hover":
                    // High pitch, short blip
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;

                case "click":
                    // Mechanical click
                    osc.type = "square";
                    osc.frequency.setValueAtTime(150, now);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;

                case "success":
                    // Major chord arpeggio
                    // ... specific logic omitted for brevity
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(500, now);
                    osc.frequency.setValueAtTime(800, now + 0.1);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.linearRampToValueAtTime(0, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);
                    break;
            }
        } catch (e) {
            // Audio context might be blocked or not supported
        }
    }, []);

    return { play };
}
