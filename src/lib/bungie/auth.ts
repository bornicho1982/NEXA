import { env } from "@/lib/config/env";
import type { BungieTokenResponse, BungieMembershipData } from "@/types";
import { bungieRequest } from "./client";

const TOKEN_URL = "https://www.bungie.net/Platform/App/OAuth/token/";
const AUTH_URL = "https://www.bungie.net/en/OAuth/Authorize";

const CLIENT_ID = env.BUNGIE_CLIENT_ID;
const CLIENT_SECRET = env.BUNGIE_CLIENT_SECRET;

/**
 * Build the Bungie OAuth authorization URL.
 * Bungie does not use a `scope` parameter — it's determined by the app registration.
 */
export function getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        state,
    });
    return `${AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for access and refresh tokens.
 */
export async function exchangeCodeForTokens(
    code: string
): Promise<BungieTokenResponse> {
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
    });

    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-API-Key": env.BUNGIE_API_KEY,
        },
        body: body.toString(),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`[BungieAuth] Token exchange failed: ${res.status} ${text}`);
    }

    return res.json();
}

/**
 * Refresh an expired access token using a refresh token.
 */
export async function refreshAccessToken(
    refreshToken: string
): Promise<BungieTokenResponse> {
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
    });

    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-API-Key": env.BUNGIE_API_KEY,
        },
        body: body.toString(),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`[BungieAuth] Token refresh failed: ${res.status} ${text}`);
    }

    return res.json();
}

/**
 * Get the current user's Bungie.net memberships, including Destiny memberships.
 */
export async function getBungieMemberships(
    accessToken: string
): Promise<BungieMembershipData> {
    return bungieRequest<BungieMembershipData>(
        "/User/GetMembershipsForCurrentUser/",
        { accessToken }
    );
}
