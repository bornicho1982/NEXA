import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { refreshAccessToken } from "@/lib/bungie/auth";

export async function getAuthenticatedUser() {
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.id },
    });

    if (!user) return null;

    // Check if token expired (with 5 min buffer)
    if (user.tokenExpiresAt.getTime() - 5 * 60 * 1000 < Date.now()) {
        try {
            console.log(`[Auth] Refreshing token for user ${user.id}`);
            const newTokens = await refreshAccessToken(user.refreshToken);

            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    accessToken: newTokens.access_token,
                    refreshToken: newTokens.refresh_token,
                    tokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
                },
            });

            console.log(`[Auth] Token refreshed successfully`);
            return updatedUser;
        } catch (e) {
            console.error("[Auth] Token refresh failed:", e);
            // If refresh fails, user must re-login. We return null.
            return null;
        }
    }

    return user;
}
