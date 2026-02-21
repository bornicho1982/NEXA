/**
 * AI Advisor Service
 * Translates natural language → Build Engine parameters → explanations.
 */

import { chat, streamChat, type ChatMessage } from "./client";
import { findOptimalBuilds, type BuildObjectives, STAT_ORDER } from "@/lib/builds/engine";
import { getFullProfile } from "@/lib/inventory/service";

// ─── System Prompt ───

const SYSTEM_PROMPT = `You are NEXA, a Destiny 2 AI advisor. You help players optimize their armor builds and loadouts.

## Your Knowledge
- Destiny 2 has 3 classes: Titan (0), Hunter (1), Warlock (2)
- 6 armor stats: Mobility, Resilience, Recovery, Discipline, Intellect, Strength
- Stats are divided into tiers (T0-T10), each tier = 10 points
- Higher tiers grant better cooldowns and abilities
- Armor has 5 slots: Helmet, Gauntlets, Chest, Legs, Class Item
- Only 1 Exotic armor piece can be equipped at a time
- Masterworking adds +2 to each stat per armor piece

## PvP Meta Tips
- Resilience T10 is critical for all classes (health boost)
- Recovery is important for all classes (health regen)
- Hunters prioritize Mobility for dodge cooldown
- Titans benefit from Resilience for barricade cooldown
- Warlocks prioritize Recovery for rift cooldown

## PvE Meta Tips
- Resilience T10 gives 40% damage resistance
- Recovery T10 for fastest health regen
- Discipline and Intellect for ability-focused builds
- Strength for melee builds

## Response Rules
1. Be concise and helpful — 2-3 sentences max for simple questions
2. When the user wants a build, extract their needs and I will optimize
3. Always explain WHY certain stats matter for their request
4. Use Destiny 2 terminology naturally
5. If unsure about specific numbers, say so honestly

## Build Request Detection
When the user asks for a build or optimization, respond with a JSON block wrapped in \`\`\`json tags containing:
{
  "action": "optimize",
  "classType": 0|1|2,
  "statPriority": [mob, res, rec, dis, int, str],
  "reason": "brief explanation of choices"
}

Set statPriority values to the target minimum for that stat (0 = don't care, 100 = max priority).
Only include this JSON when the user explicitly wants build optimization.
For general questions, just respond naturally without JSON.`;

// ─── Types ───

export interface AdvisorMessage {
    role: "user" | "assistant";
    content: string;
    buildResults?: unknown;
}

interface BuildAction {
    action: "optimize";
    classType: number;
    statPriority: [number, number, number, number, number, number];
    reason: string;
}

// ─── Service Functions ───

/**
 * Process a chat message and return streaming response.
 * If the AI detects a build request, it runs the optimizer automatically.
 */
export async function advisorChat(
    messages: AdvisorMessage[]
): Promise<ReadableStream<Uint8Array>> {
    const chatMessages: ChatMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        })),
    ];

    return streamChat(chatMessages);
}

/**
 * Process a message with build detection (non-streaming).
 * Returns the AI response + any build results.
 */
export async function advisorChatWithBuilds(
    messages: AdvisorMessage[]
): Promise<{ response: string; buildResults?: unknown }> {
    const chatMessages: ChatMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        })),
    ];

    const response = await chat(chatMessages);

    // Check for build action
    const buildAction = extractBuildAction(response);
    if (buildAction) {
        try {
            const profile = await getFullProfile();
            const objectives: BuildObjectives = {
                classType: buildAction.classType,
                statPriority: buildAction.statPriority,
                maxExotics: 1,
                assumeMasterwork: true,
            };

            const builds = await findOptimalBuilds(objectives, profile.items, 5);

            // Ask AI to explain the results
            const statLabels = STAT_ORDER;
            const buildSummary = builds.slice(0, 3).map((b, i) => {
                const stats = b.tiers.map((t, j) => `${statLabels[j]}: T${t}`).join(", ");
                const pieces = b.pieces.map((p) => p.name).join(", ");
                return `Build #${i + 1}: Total T${b.totalTier} (${stats}) | ${pieces}`;
            }).join("\n");

            const explainMessages: ChatMessage[] = [
                { role: "system", content: SYSTEM_PROMPT },
                ...chatMessages.slice(1),
                { role: "assistant", content: response },
                {
                    role: "user",
                    content: `Here are the optimization results from the player's actual inventory:\n\n${buildSummary}\n\nPlease briefly explain why Build #1 is the best choice and any trade-offs. Keep it to 2-3 sentences.`,
                },
            ];

            const explanation = await chat(explainMessages);

            return {
                response: `${buildAction.reason}\n\n${explanation}`,
                buildResults: builds.slice(0, 5),
            };
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Build optimization failed";
            return {
                response: `${response}\n\n⚠️ Could not run optimizer: ${msg}`,
            };
        }
    }

    return { response };
}

// ─── Helpers ───

function extractBuildAction(text: string): BuildAction | null {
    // Look for ```json ... ``` blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
    if (!jsonMatch) return null;

    try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.action === "optimize" && Array.isArray(parsed.statPriority)) {
            return parsed as BuildAction;
        }
    } catch {
        // Not valid JSON
    }

    return null;
}
