import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/logger";

const SECRET = new TextEncoder().encode(env.SESSION_SECRET);

// ─── Rate Limiting (In-Memory MVP) ───
// Note: This is ephemeral/instance-local. For scale, use Redis/Upstash.
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

// Rate Limiter Logic
const ipMap = new Map<string, { count: number; expires: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();

    // Lazy Cleanup: Randomly (1 in 100) prune expired entries
    if (Math.random() < 0.01) {
        for (const [key, record] of ipMap.entries()) {
            if (now > record.expires) {
                ipMap.delete(key);
            }
        }
    }

    const record = ipMap.get(ip);

    if (!record || now > record.expires) {
        ipMap.set(ip, { count: 1, expires: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= MAX_REQUESTS) {
        return false;
    }

    record.count++;
    return true;
}

// ─── Middleware ───

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const headers = response.headers;
    const path = request.nextUrl.pathname;

    // 0. Observability (Log Requests)
    // Filter out internal Next.js requests if any slip through matcher
    if (!path.startsWith("/_next")) {
        // @ts-expect-error - request.ip is provided by Next.js at runtime
        const ip = request.ip || "unknown";
        logger.info(`Request: ${request.method} ${path}`, {
            ip,
            ua: request.headers.get("user-agent"),
        });
    }

    // 1. Security Headers
    headers.set("X-Frame-Options", "DENY");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (process.env.NODE_ENV === "production") {
        headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }

    // 2. Rate Limiting for API
    if (path.startsWith("/api/")) {
        // @ts-expect-error - request.ip is provided by Next.js at runtime
        const ip = request.ip || "127.0.0.1";
        if (!checkRateLimit(ip)) {
            logger.warn(`Rate Limit Exceeded: ${ip} on ${path}`);
            return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
        }
    }

    // 3. Authentication Guard
    const protectedPaths = [
        "/dashboard",
        "/inventory",
        "/builds",
        "/loadouts",
        "/loadouts/", // Catch subpaths? simple strict check might fail /loadouts/xyz?
        "/api/inventory",
        "/api/loadouts",
        "/api/builds",
        "/api/ai"
    ];

    // Check if path relies on auth
    // Use startsWith for all protected paths to cover sub-routes (e.g. /loadouts/[id])
    const isProtected = protectedPaths.some((prefix) => path.startsWith(prefix)) || path === "/ai";

    if (isProtected) {
        const token = request.cookies.get("nexa-session")?.value;

        if (!token) {
            if (path.startsWith("/api")) {
                logger.warn(`Unauthorized Access Attempt: ${path}`);
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
        }

        try {
            await jwtVerify(token, SECRET);
            // Valid token scope
        } catch {
            if (path.startsWith("/api")) {
                logger.warn(`Invalid Session Token: ${path}`);
                return NextResponse.json({ error: "Invalid Session" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/?error=session_expired", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js).*)",
    ],
};
