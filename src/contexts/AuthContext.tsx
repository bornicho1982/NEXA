"use client";

import { createContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { SessionUser } from "@/types";

interface AuthContextValue {
    user: SessionUser | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
    user: null,
    isLoading: true,
    login: () => { },
    logout: () => { },
    refresh: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = () => {
        window.location.href = "/api/auth/login";
    };

    const logout = () => {
        window.location.href = "/api/auth/logout";
    };

    const refresh = async () => {
        try {
            await fetch("/api/auth/refresh", { method: "POST" });
            await fetchUser();
        } catch (err) {
            console.error("[Auth] Refresh failed:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}
