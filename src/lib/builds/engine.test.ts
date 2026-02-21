import { describe, it, expect, vi } from 'vitest';
import { findOptimalBuilds, BuildObjectives } from './engine';
import * as manifestService from '@/lib/manifest/service';
import type { DestinyInventoryItemDefinition } from '@/types';

// Mock ensureManifestLoaded and getAllDefinitions
vi.mock('@/lib/manifest/service', () => ({
    ensureManifestLoaded: vi.fn().mockResolvedValue(undefined),
    getAllDefinitions: vi.fn(),
    getDefinition: vi.fn(),
}));

// Mock Data
const MOCK_ITEMS = [
    { itemHash: 111, itemType: 2, classType: 1, bucketHash: 3448274439 }, // Helm
    { itemHash: 222, itemType: 2, classType: 1, bucketHash: 3551918588 }, // Arms
    { itemHash: 333, itemType: 2, classType: 1, bucketHash: 14239492 },   // Chest
    { itemHash: 444, itemType: 2, classType: 1, bucketHash: 20886954 },   // Legs
    { itemHash: 555, itemType: 2, classType: 1, bucketHash: 1585787867 }, // Class
];

// Mock Definition return
const MOCK_DEFS = {
    "111": { displayProperties: { name: "Mock Helm", icon: "/helm.png" }, inventory: { tierType: 5 }, stats: { stats: { "2996146975": { value: 20 } } } }, // Mob 20
    "222": { displayProperties: { name: "Mock Arms", icon: "/arms.png" }, inventory: { tierType: 5 }, stats: { stats: { "2996146975": { value: 10 } } } },
    "333": { displayProperties: { name: "Mock Chest", icon: "/chest.png" }, inventory: { tierType: 5 }, stats: { stats: { "2996146975": { value: 10 } } } },
    "444": { displayProperties: { name: "Mock Legs", icon: "/legs.png" }, inventory: { tierType: 5 }, stats: { stats: { "2996146975": { value: 10 } } } },
    "555": { displayProperties: { name: "Mock Class", icon: "/class.png" }, inventory: { tierType: 5 }, stats: { stats: { "2996146975": { value: 0 } } } },
};

describe('Build Engine', () => {
    it('should find a valid build from 5 armor pieces', async () => {
        // Setup mock
        vi.mocked(manifestService.getAllDefinitions).mockReturnValue(MOCK_DEFS as unknown as Record<string, DestinyInventoryItemDefinition>);

        const objectives: BuildObjectives = {
            classType: 1, // Hunter (matching mock items)
            statPriority: [40, 0, 0, 0, 0, 0],
            maxExotics: 1,
            assumeMasterwork: false
        };

        const results = await findOptimalBuilds(objectives, MOCK_ITEMS);

        expect(results.length).toBeGreaterThan(0);
        const build = results[0];
        expect(build.pieces.length).toBe(5);
        expect(build.stats[0]).toBe(50); // 20+10+10+10+0
        expect(build.tiers[0]).toBe(5);
    });

    it('should handle masterwork assumption', async () => {
        vi.mocked(manifestService.getAllDefinitions).mockReturnValue(MOCK_DEFS as unknown as Record<string, DestinyInventoryItemDefinition>);

        const objectives: BuildObjectives = {
            classType: 1,
            statPriority: [0, 0, 0, 0, 0, 0],
            maxExotics: 1,
            assumeMasterwork: true
        };

        const results = await findOptimalBuilds(objectives, MOCK_ITEMS);
        const build = results[0];

        // Base Mob: 50. MW adds +2 per piece per stat = +10 total per stat.
        // Mob: 50 + 10 = 60.
        // Res: 0 + 10 = 10.
        expect(build.stats[0]).toBe(60);
        expect(build.stats[1]).toBe(10);
    });
});
