import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthorizationUrl } from "@/lib/bungie/auth";

export async function GET() {
    // Generate random state for CSRF protection
    const state = crypto.randomUUID();

    // Store state in a short-lived cookie for validation on callback
    const cookieStore = await cookies();
    cookieStore.set("oauth-state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 300, // 5 minutes
    });

    const authUrl = getAuthorizationUrl(state);
    return NextResponse.redirect(authUrl);
}
