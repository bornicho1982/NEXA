"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CharacterRenderer } from "@/lib/destiny/character-renderer";
import { Loader2, Zap } from "lucide-react";

interface Guardian3DProps {
    renderData: any;
    className?: string;
}

export const Guardian3D: React.FC<Guardian3DProps> = ({ renderData, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const characterRenderer = useRef(new CharacterRenderer());

    useEffect(() => {
        console.log("[Guardian3D] Component mounted, initializing 3D viewport...");
        if (!containerRef.current) return;

        // ── Scene Setup ──
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            45,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 1.2, 3);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // ── Lighting ──
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(5, 10, 7.5);
        scene.add(mainLight);

        const fillLight = new THREE.PointLight(0x00ffff, 0.4);
        fillLight.position.set(-5, 0, 5);
        scene.add(fillLight);

        // ── Controls ──
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.minDistance = 1;
        controls.maxDistance = 10;
        controls.target.set(0, 1, 0);

        // ── Character Loading ──
        const loadCharacter = async () => {
            try {
                console.log("[Guardian3D] Starting loadCharacter with data:", renderData);
                setLoading(true);
                const charGroup = await characterRenderer.current.assembleCharacter(renderData);
                console.log("[Guardian3D] Character assembly complete, meshes added:", charGroup.children.length);
                scene.add(charGroup);
                setLoading(false);
            } catch (err) {
                console.error("3D Render Error:", err);
                setError("Ocurrido un error al cargar el modelo 3D.");
                setLoading(false);
            }
        };

        loadCharacter();

        // ── Animation Loop ──
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // ── Resize Handler ──
        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current) return;
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener("resize", handleResize);

        const container = containerRef.current;

        return () => {
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            if (container) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [renderData]);

    return (
        <div className={`relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl bg-slate-950/20 backdrop-blur-sm border border-slate-800/50 shadow-2xl group ${className}`}>
            {/* 3D Viewport */}
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md z-10">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
                        <div className="absolute inset-0 w-12 h-12 border-2 border-cyan-500/20 rounded-full animate-pulse" />
                    </div>
                    <p className="mt-4 text-cyan-100 font-mono text-xs tracking-[0.2em] animate-pulse">
                        ESTABLISHING UPLINK...
                    </p>
                </div>
            )}

            {/* Error UI */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/20 backdrop-blur-md z-10 text-center p-6">
                    <Zap className="w-8 h-8 text-rose-500 mb-2" />
                    <p className="text-rose-100 font-medium text-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs hover:bg-rose-500/20 transition-all"
                    >
                        RETRY CONNECTION
                    </button>
                </div>
            )}

            {/* Interaction Hint */}
            {!loading && !error && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transition-opacity duration-500 opacity-40 group-hover:opacity-100 pointer-events-none">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-700/50 rounded-full text-[10px] text-slate-400 font-mono tracking-wider">
                        <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                        DRAG TO ROTATE • SCROLL TO ZOOM
                    </div>
                </div>
            )}

            {/* HUD Scanlines */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-30" />
            <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>
    );
};
