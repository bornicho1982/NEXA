import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types";
import { env } from "@/lib/config/env";

const SESSION_COOKIE = "nexa-session";
const SECRET = new TextEncoder().encode(env.SESSION_SECRET);

/**
 * Create a session cookie containing encrypted user data.
 */
export async function createSession(user: SessionUser): Promise<void> {
    const token = await new SignJWT({ user })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .setIssuedAt()
        .sign(SECRET);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });
}

/**
 * Read and validate the session cookie. Returns the user if valid, null otherwise.
 */
export async function getSession(): Promise<SessionUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, SECRET);
        return (payload as unknown as { user: SessionUser }).user;
    } catch {
        return null;
    }
}

/**
 * Destroy the session by clearing the cookie.
 */
export async function destroySession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}
