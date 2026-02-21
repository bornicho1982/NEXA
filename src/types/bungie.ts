// ─── Bungie API types ───

export interface BungieTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    refresh_expires_in: number;
    membership_id: string;
}

export interface BungieUserMembership {
    membershipType: number;
    membershipId: string;
    displayName: string;
    iconPath?: string;
    crossSaveOverride: number;
}

export interface BungieMembershipData {
    destinyMemberships: BungieUserMembership[];
    bungieNetUser: {
        membershipId: string;
        uniqueName: string;
        displayName: string;
        profilePicturePath?: string;
    };
}

export interface BungieApiResponse<T> {
    Response: T;
    ErrorCode: number;
    ThrottleSeconds: number;
    ErrorStatus: string;
    Message: string;
    MessageData: Record<string, string>;
}

// ─── Internal app types ───

export interface SessionUser {
    id: string;
    bungieId: string;
    displayName: string | null;
    profilePicturePath: string | null;
    membershipType: number | null;
    destinyMembershipId: string | null;
}
