import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, getBungieMemberships } from "@/lib/bungie/auth";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const cookieStore = await cookies();
    const storedState = cookieStore.get("oauth-state")?.value;

    // Clean up the state cookie
    cookieStore.delete("oauth-state");

    // Validate state for CSRF protection
    if (!state || !storedState || state !== storedState) {
        return NextResponse.redirect(
            new URL("/?error=invalid_state", request.url)
        );
    }

    if (!code) {
        return NextResponse.redirect(
            new URL("/?error=no_code", request.url)
        );
    }

    try {
        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code);

        // Get Bungie memberships to identify the user
        const memberships = await getBungieMemberships(tokens.access_token);

        // Determine primary Destiny 2 membership (Cross Save logic)
        let destinyMembership = memberships.destinyMemberships[0];

        if (destinyMembership) {
            const crossSaveType = destinyMembership.crossSaveOverride;
            if (crossSaveType !== 0) {
                const primary = memberships.destinyMemberships.find(m => m.membershipType === crossSaveType);
                if (primary) {
                    destinyMembership = primary;
                }
            }
        }

        const bungieUser = memberships.bungieNetUser;

        // Upsert user in database
        const user = await prisma.user.upsert({
            where: { bungieId: bungieUser.membershipId },
            update: {
                displayName: bungieUser.displayName,
                profilePicturePath: bungieUser.profilePicturePath || null,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
                membershipType: destinyMembership?.membershipType ?? null,
                destinyMembershipId: destinyMembership?.membershipId ?? null,
            },
            create: {
                bungieId: bungieUser.membershipId,
                displayName: bungieUser.displayName,
                profilePicturePath: bungieUser.profilePicturePath || null,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
                membershipType: destinyMembership?.membershipType ?? null,
                destinyMembershipId: destinyMembership?.membershipId ?? null,
            },
        });

        // Create session cookie
        await createSession({
            id: user.id,
            bungieId: user.bungieId,
            displayName: user.displayName,
            profilePicturePath: user.profilePicturePath,
            membershipType: user.membershipType,
            destinyMembershipId: user.destinyMembershipId,
        });

        return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) {
        console.error("[Auth Callback] Error:", error);
        return NextResponse.redirect(
            new URL("/?error=auth_failed", request.url)
        );
    }
}
