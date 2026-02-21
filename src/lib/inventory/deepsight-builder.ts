/**
 * Deepsight Builder — Extract deepsight resonance information
 *
 * Deepsight items have a resonance objective that tracks pattern progress.
 */

import type { DeepsightInfo } from "@/types/dim-types";

/**
 * Build deepsight info from item state.
 */
export function buildDeepsightInfo(
    itemState: number,
): DeepsightInfo | null {
    const hasDeepsight = (itemState & 16) === 16;
    if (!hasDeepsight) return null;

    return {
        hasDeepsight: true,
        complete: false,
        progress: 0,
        // Full objective data would come from objectives component
    };
}
