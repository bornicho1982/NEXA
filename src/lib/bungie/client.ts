import type { BungieApiResponse } from "@/types";
import { env } from "@/lib/config/env";
import { cookies } from "next/headers";

const BUNGIE_BASE = "https://www.bungie.net/Platform";
const API_KEY = env.BUNGIE_API_KEY;

interface FetchOptions extends Omit<RequestInit, "headers"> {
    accessToken?: string;
}

/**
 * Generic HTTP client for the Bungie.net API.
 * All requests include X-API-Key. If accessToken is provided, Authorization header is added.
 * Handles Server Affinitization (bungie_next cookie) and throttling.
 */
export async function bungieRequest<T>(
    path: string,
    options: FetchOptions = {}
): Promise<T> {
    const { accessToken, ...fetchOpts } = options;

    const headers: Record<string, string> = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
    };

    try {
        const cookieStore = await cookies();
        const bungieNext = cookieStore.get("bungie_next");
        if (bungieNext) {
            headers["Cookie"] = `bungie_next=${bungieNext.value}`;
        }
    } catch {
        // Safe fallback if cookies() is called in an unsupported Next.js context
    }

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const separator = path.includes("?") ? "&" : "?";
    const url = path.startsWith("http")
        ? `${path}${separator}t=${Date.now()}`
        : `${BUNGIE_BASE}${path}${separator}t=${Date.now()}`;

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        attempts++;

        const res = await fetch(url, {
            ...fetchOpts,
            headers,
            cache: "no-store",
            next: { revalidate: 0 } // Extra safety for Next.js App Router
        });

        // Capture and persist bungie_next cookie to maintain Server Affinitization
        try {
            const setCookie = res.headers.get("set-cookie");
            if (setCookie && setCookie.includes("bungie_next=")) {
                const match = setCookie.match(/bungie_next=([^;]+)/);
                if (match && match[1]) {
                    const cookieStore = await cookies();
                    cookieStore.set("bungie_next", match[1], {
                        path: "/",
                        secure: true,
                        httpOnly: true,
                        sameSite: "lax",
                        maxAge: 60 * 60 * 24 * 30 // 30 days
                    });
                }
            }
        } catch {
            // Safe fallback if cookies().set() is called outside Server Action/Route Handler
        }

        // Handle throttling
        if (res.status === 429 || res.headers.get("x-throttle-seconds")) {
            const throttleSeconds = parseInt(
                res.headers.get("x-throttle-seconds") || "2",
                10
            );
            console.warn(`[BungieClient] Throttled. Waiting ${throttleSeconds}s...`);
            await new Promise((r) => setTimeout(r, throttleSeconds * 1000));
            continue;
        }

        // Retry on 5xx
        if (res.status >= 500 && attempts < maxAttempts) {
            console.warn(
                `[BungieClient] Server error ${res.status}. Retrying (${attempts}/${maxAttempts})...`
            );
            await new Promise((r) => setTimeout(r, 1000 * attempts));
            continue;
        }

        if (!res.ok) {
            const body = await res.text();
            throw new Error(
                `[BungieClient] ${res.status} ${res.statusText}: ${body}`
            );
        }

        const json = (await res.json()) as BungieApiResponse<T>;

        if (json.ErrorCode !== 1) {
            throw new Error(
                `[BungieClient] API Error ${json.ErrorCode}: ${json.ErrorStatus} — ${json.Message}`
            );
        }

        return json.Response;
    }

    throw new Error("[BungieClient] Max retry attempts reached");
}
