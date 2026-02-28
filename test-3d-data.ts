import { getProfileStats } from "./src/lib/profile/stats-service.ts";

async function test() {
    try {
        const stats = await getProfileStats();
        console.log("Profile Stats Keys:", Object.keys(stats));
        console.log("RenderData available:", !!stats.renderData);
        if (stats.renderData) {
            console.log("Characters in RenderData:", Object.keys(stats.renderData));
            for (const charId of Object.keys(stats.renderData)) {
                console.log(`Char ${charId} peerView items:`, stats.renderData[charId]?.peerView?.items?.length || 0);
            }
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
