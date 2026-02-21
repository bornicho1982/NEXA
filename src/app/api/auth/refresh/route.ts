import { NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/session";
import { refreshAccessToken } from "@/lib/bungie/auth";
import { prisma } from "@/lib/db";

export async function POST() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.id },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Refresh the access token
        const tokens = await refreshAccessToken(user.refreshToken);

        // Update tokens in database
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
            },
        });

        // Update session with fresh data
        await createSession({
            id: updatedUser.id,
            bungieId: updatedUser.bungieId,
            displayName: updatedUser.displayName,
            profilePicturePath: updatedUser.profilePicturePath,
            membershipType: updatedUser.membershipType,
            destinyMembershipId: updatedUser.destinyMembershipId,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Auth Refresh] Error:", error);
        return NextResponse.json(
            { error: "Token refresh failed" },
            { status: 500 }
        );
    }
}
