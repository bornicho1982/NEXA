import { getAuthenticatedUser } from "@/lib/auth/user";
import { bungieRequest } from "@/lib/bungie/client";

// ── Types ──

export interface RecentActivity {
    activityHash: number;
    activityName: string;
    mode: string;
    dateStarted: string;
    duration: number; // seconds
    isCompleted: boolean;
    standing: number; // 0 = victory, 1 = defeat
    kills: number;
    deaths: number;
    assists: number;
    kd: number;
    pgcrImage?: string;
}

export interface AggregateStats {
    activitiesEntered: number;
    activitiesWon: number;
    kills: number;
    deaths: number;
    assists: number;
    kd: number;
    kdRatio: number;
    kda: number;
    winRate: number;
    bestWeaponType: string;
    hoursPlayed: number;
    longestKillStreak: number;
    precisionKills: number;
    suicides: number;
    avgLifespan: number; // seconds
}

export interface ClanInfo {
    name: string;
    motto: string;
    memberCount: number;
    clanBannerData?: {
        decalBackgroundColorId: number;
        decalColorId: number;
        decalId: number;
        gonfalonColorId: number;
        gonfalonDetailColorId: number;
        gonfalonDetailId: number;
        gonfalonId: number;
    };
    level: number;
    clanCallsign: string;
}

export interface RaidEntry {
    name: string;
    completions: number;
    kills: number;
    deaths: number;
    kd: number;
}

export interface TopWeapon {
    weaponName: string;
    kills: number;
    precisionKills: number;
    precisionPercent: number;
}

export interface ProfileExtended {
    pvpStats: AggregateStats;
    pveStats: AggregateStats;
    recentActivities: RecentActivity[];
    clan: ClanInfo | null;
    activityDays: string[];
    raidReport: RaidEntry[];
    topWeapons: TopWeapon[];
}

// ── Mode name lookup ──
const MODE_NAMES: Record<number, string> = {
    0: "None",
    2: "Story",
    3: "Strike",
    4: "Raid",
    5: "AllPvP",
    6: "Patrol",
    7: "AllPvE",
    9: "Reserved9",
    10: "Control",
    12: "Clash",
    15: "CrimsonDoubles",
    16: "Nightfall",
    17: "HeroicNightfall",
    18: "AllStrikes",
    19: "IB",
    25: "AllMayhem",
    31: "Supremacy",
    32: "PrivateMatchesAll",
    37: "Survival",
    38: "Countdown",
    39: "TrialsOfTheNine",
    40: "Social",
    41: "TrialsCountdown",
    42: "TrialsSurvival",
    43: "IronBannerControl",
    44: "IronBannerClash",
    46: "Nightfall46",
    47: "Nightfall47",
    48: "Rumble",
    58: "Showdown",
    59: "Lockdown",
    60: "Scorched",
    61: "ScorchedTeam",
    62: "Gambit",
    63: "AllPvECompetitive",
    64: "Breakthrough",
    65: "BlackArmoryRun",
    66: "Salvage",
    67: "IronBannerSalvage",
    69: "Competitive",
    70: "Quickplay",
    71: "ClashQuickplay",
    72: "ClashCompetitive",
    73: "ControlQuickplay",
    74: "ControlCompetitive",
    75: "GambitPrime",
    76: "Reckoning",
    77: "Menagerie",
    78: "VexOffensive",
    79: "NightmareHunt",
    80: "Elimination",
    81: "Momentum",
    82: "Dungeon",
    83: "Sundial",
    84: "TrialsOfOsiris",
};

function getModeName(mode: number): string {
    return MODE_NAMES[mode] || `Mode_${mode}`;
}

function parseStatValue(stat: { basic?: { value?: number } } | undefined): number {
    return stat?.basic?.value ?? 0;
}

function parseAggregateStats(stats: Record<string, { basic?: { value?: number; displayValue?: string } }> | undefined): AggregateStats {
    if (!stats) {
        return {
            activitiesEntered: 0, activitiesWon: 0,
            kills: 0, deaths: 0, assists: 0,
            kd: 0, kdRatio: 0, kda: 0, winRate: 0,
            bestWeaponType: "—",
            hoursPlayed: 0, longestKillStreak: 0,
            precisionKills: 0, suicides: 0, avgLifespan: 0,
        };
    }

    const kills = parseStatValue(stats.kills);
    const deaths = parseStatValue(stats.deaths);
    const assists = parseStatValue(stats.assists);
    const activitiesEntered = parseStatValue(stats.activitiesEntered);
    const activitiesWon = parseStatValue(stats.activitiesWon);

    const kd = deaths > 0 ? kills / deaths : kills;
    const kda = deaths > 0 ? (kills + assists) / deaths : (kills + assists);
    const winRate = activitiesEntered > 0 ? (activitiesWon / activitiesEntered) * 100 : 0;

    return {
        activitiesEntered,
        activitiesWon,
        kills,
        deaths,
        assists,
        kd: Math.round(kd * 100) / 100,
        kdRatio: parseStatValue(stats.killsDeathsRatio),
        kda: Math.round(kda * 100) / 100,
        winRate: Math.round(winRate * 100) / 100,
        bestWeaponType: stats.weaponBestType?.basic?.displayValue || "—",
        hoursPlayed: Math.round(parseStatValue(stats.secondsPlayed) / 3600),
        longestKillStreak: parseStatValue(stats.longestKillSpree),
        precisionKills: parseStatValue(stats.precisionKills),
        suicides: parseStatValue(stats.suicides),
        avgLifespan: Math.round(parseStatValue(stats.averageLifespan)),
    };
}

export async function getProfileExtended(): Promise<ProfileExtended> {
    const user = await getAuthenticatedUser();
    if (!user) throw new Error("Not authenticated");

    // Get the user's characters first to know which character to query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileData: any = await bungieRequest(
        `/Destiny2/${user.membershipType}/Profile/${user.destinyMembershipId}/?components=100,200`,
        { accessToken: user.accessToken }
    );

    const charMap = profileData.characters?.data || {};
    const charIds = Object.keys(charMap);
    const primaryCharId = charIds[0]; // Most recently played is usually first

    // ── Parallel fetches ──
    const [historicalStatsResult, activitiesResult, clanResult, raidActivitiesResult] = await Promise.allSettled([
        // Historical stats (all characters merged)
        bungieRequest<Record<string, { allTime?: Record<string, unknown> }>>(
            `/Destiny2/${user.membershipType}/Account/${user.destinyMembershipId}/Stats/`,
            { accessToken: user.accessToken }
        ),
        // Recent activities (from primary character)
        primaryCharId ? bungieRequest<{ activities?: unknown[] }>(
            `/Destiny2/${user.membershipType}/Account/${user.destinyMembershipId}/Character/${primaryCharId}/Stats/Activities/?count=15&mode=0&page=0`,
            { accessToken: user.accessToken }
        ) : Promise.resolve({ activities: [] }),
        // Clan info
        bungieRequest<{ results?: unknown[] }>(
            `/GroupV2/User/${user.membershipType}/${user.destinyMembershipId}/0/1/`,
            { accessToken: user.accessToken }
        ),
        // Raid activities (from primary character, mode=4)
        primaryCharId ? bungieRequest<{ activities?: unknown[] }>(
            `/Destiny2/${user.membershipType}/Account/${user.destinyMembershipId}/Character/${primaryCharId}/Stats/Activities/?count=50&mode=4&page=0`,
            { accessToken: user.accessToken }
        ) : Promise.resolve({ activities: [] }),
    ]);

    // ── Parse Historical Stats ──
    let pvpStats: AggregateStats = parseAggregateStats(undefined);
    let pveStats: AggregateStats = parseAggregateStats(undefined);

    if (historicalStatsResult.status === "fulfilled") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statsData = historicalStatsResult.value as any;
        const mergedAllCharacters = statsData?.mergedAllCharacters;
        if (mergedAllCharacters) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pvpRaw = (mergedAllCharacters?.results?.allPvP?.allTime || mergedAllCharacters?.allPvP?.allTime) as any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pveRaw = (mergedAllCharacters?.results?.allPvE?.allTime || mergedAllCharacters?.allPvE?.allTime) as any;
            pvpStats = parseAggregateStats(pvpRaw);
            pveStats = parseAggregateStats(pveRaw);
        }
    }

    // ── Parse Recent Activities ──
    const recentActivities: RecentActivity[] = [];
    const activityDays: string[] = [];

    if (activitiesResult.status === "fulfilled") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const activitiesData = activitiesResult.value as any;
        const activities = activitiesData?.activities || [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const act of activities.slice(0, 10) as any[]) {
            const values = act.values || {};
            const kills = parseStatValue(values.kills);
            const deaths = parseStatValue(values.deaths);

            recentActivities.push({
                activityHash: act.activityDetails?.referenceId || 0,
                activityName: getModeName(act.activityDetails?.mode || 0),
                mode: getModeName(act.activityDetails?.mode || 0),
                dateStarted: act.period || "",
                duration: parseStatValue(values.activityDurationSeconds),
                isCompleted: parseStatValue(values.completed) === 1,
                standing: parseStatValue(values.standing),
                kills,
                deaths,
                assists: parseStatValue(values.assists),
                kd: deaths > 0 ? Math.round((kills / deaths) * 100) / 100 : kills,
                pgcrImage: undefined, // Would need manifest lookup
            });

            // Track day for heatmap
            if (act.period) {
                const day = act.period.split("T")[0];
                if (!activityDays.includes(day)) activityDays.push(day);
            }
        }
    }

    // ── Parse Clan ──
    let clan: ClanInfo | null = null;
    if (clanResult.status === "fulfilled") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const clanData = clanResult.value as any;
        const firstResult = clanData?.results?.[0] || clanData;
        const group = firstResult?.group || firstResult?.detail;
        if (group?.name) {
            clan = {
                name: group.name,
                motto: group.motto || "",
                memberCount: group.memberCount || 0,
                clanBannerData: group.clanInfo?.clanBannerData,
                level: group.clanInfo?.d2ClanProgressions?.["584850370"]?.level || 0,
                clanCallsign: group.clanInfo?.clanCallsign || group.clanCallsign || "",
            };
        }
    }

    // ── Raid Report ──
    const raidReport: RaidEntry[] = [];
    if (raidActivitiesResult.status === "fulfilled") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raidData = raidActivitiesResult.value as any;
        const raidActivities = raidData?.activities || [];

        // Group by activityHash to count completions per raid
        const raidMap: Record<string, { completions: number; kills: number; deaths: number }> = {};

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const act of raidActivities as any[]) {
            // Use directorActivityHash for grouping raids
            const dirHash = act.activityDetails?.directorActivityHash || act.activityDetails?.referenceId || 0;
            const key = `Raid_${dirHash}`;
            const values = act.values || {};
            const completed = parseStatValue(values.completed) === 1;

            if (!raidMap[key]) {
                raidMap[key] = { completions: 0, kills: 0, deaths: 0 };
            }
            if (completed) raidMap[key].completions++;
            raidMap[key].kills += parseStatValue(values.kills);
            raidMap[key].deaths += parseStatValue(values.deaths);
        }

        for (const [key, data] of Object.entries(raidMap)) {
            const kd = data.deaths > 0 ? Math.round((data.kills / data.deaths) * 100) / 100 : data.kills;
            raidReport.push({
                name: key.replace("Raid_", "Raid "),
                completions: data.completions,
                kills: data.kills,
                deaths: data.deaths,
                kd,
            });
        }
        raidReport.sort((a, b) => b.completions - a.completions);
    }

    // ── Top Weapons (from historical stats) ──
    const topWeapons: TopWeapon[] = [];
    if (historicalStatsResult.status === "fulfilled") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statsData = historicalStatsResult.value as any;
        const merged = statsData?.mergedAllCharacters;
        // Try to find weapon-specific stats
        // The Bungie API returns weapon stats under mergedAllCharacters.merged.allTime
        const allPvE = merged?.results?.allPvE?.allTime || merged?.allPvE?.allTime;
        const allPvP = merged?.results?.allPvP?.allTime || merged?.allPvP?.allTime;

        // Get weapon type kills from both PvP and PvE
        const weaponTypes = [
            "weaponKillsAutoRifle", "weaponKillsBeamRifle", "weaponKillsBow",
            "weaponKillsFusionRifle", "weaponKillsGlaive", "weaponKillsGrenade",
            "weaponKillsGrenadeLauncher", "weaponKillsHandCannon", "weaponKillsMachineGun",
            "weaponKillsPulseRifle", "weaponKillsRocketLauncher", "weaponKillsScoutRifle",
            "weaponKillsShotgun", "weaponKillsSideArm", "weaponKillsSniper",
            "weaponKillsSubmachinegun", "weaponKillsSword", "weaponKillsTraceRifle",
        ];

        const weaponNameMap: Record<string, string> = {
            weaponKillsAutoRifle: "Auto Rifle",
            weaponKillsBeamRifle: "Trace Rifle",
            weaponKillsBow: "Bow",
            weaponKillsFusionRifle: "Fusion Rifle",
            weaponKillsGlaive: "Glaive",
            weaponKillsGrenade: "Grenade",
            weaponKillsGrenadeLauncher: "Grenade Launcher",
            weaponKillsHandCannon: "Hand Cannon",
            weaponKillsMachineGun: "Machine Gun",
            weaponKillsPulseRifle: "Pulse Rifle",
            weaponKillsRocketLauncher: "Rocket Launcher",
            weaponKillsScoutRifle: "Scout Rifle",
            weaponKillsShotgun: "Shotgun",
            weaponKillsSideArm: "Sidearm",
            weaponKillsSniper: "Sniper Rifle",
            weaponKillsSubmachinegun: "SMG",
            weaponKillsSword: "Sword",
            weaponKillsTraceRifle: "Trace Rifle",
        };

        for (const wkKey of weaponTypes) {
            const pveKills = parseStatValue(allPvE?.[wkKey]);
            const pvpKills = parseStatValue(allPvP?.[wkKey]);
            const totalKills = pveKills + pvpKills;

            const precKey = wkKey.replace("weaponKills", "weaponPrecisionKills");
            const pvePrec = parseStatValue(allPvE?.[precKey]);
            const pvpPrec = parseStatValue(allPvP?.[precKey]);
            const totalPrec = pvePrec + pvpPrec;

            if (totalKills > 0) {
                topWeapons.push({
                    weaponName: weaponNameMap[wkKey] || wkKey,
                    kills: totalKills,
                    precisionKills: totalPrec,
                    precisionPercent: Math.round((totalPrec / totalKills) * 100),
                });
            }
        }
        topWeapons.sort((a, b) => b.kills - a.kills);
    }

    return {
        pvpStats,
        pveStats,
        recentActivities,
        clan,
        activityDays,
        raidReport,
        topWeapons,
    };
}
