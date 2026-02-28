import * as THREE from "three";

/**
 * TGXLoader - A custom Three.js loader for Bungie's proprietary TGX 3D format.
 * This parser extracts geometry data (vertex/index buffers) and textures.
 */
export class TGXLoader extends THREE.Loader {
    constructor(manager?: THREE.LoadingManager) {
        super(manager);
    }

    /**
     * Loads a TGX container file and returns its parsed contents.
     */
    async load(url: string): Promise<any> {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load TGX: ${url}`);
        const buffer = await response.arrayBuffer();
        return this.parse(buffer);
    }

    /**
     * Parses the binary TGX container.
     * Bungie's TGX (Container) usually has:
     * - A magic string (TGXM)
     * - A header with an entry table
     * - Raw binary blobs for textures, vertex buffers, etc.
     */
    parse(buffer: ArrayBuffer): any {
        const view = new DataView(buffer);
        const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));

        if (magic !== "TGXM") {
            // Some TGX files might be raw blobs or different versions
            console.warn("TGXLoader: Magic string is not TGXM, but continuing...", magic);
        }

        const entries: any[] = [];
        const entryCount = view.getUint32(8, true);
        let offset = 12;

        for (let i = 0; i < entryCount; i++) {
            // Each entry is usually 256 bytes (name) + 8 bytes (offset/size)
            // Simplified for this prototype
            const entryOffset = view.getUint32(offset + 256, true);
            const entrySize = view.getUint32(offset + 260, true);

            // Extracting the filename (null-terminated)
            let name = "";
            for (let j = 0; j < 256; j++) {
                const charCode = view.getUint8(offset + j);
                if (charCode === 0) break;
                name += String.fromCharCode(charCode);
            }

            entries.push({
                name,
                data: buffer.slice(entryOffset, entryOffset + entrySize)
            });

            offset += 264;
        }

        return entries;
    }

    /**
     * Creates a Three.js BufferGeometry from TGX vertex/index buffers.
     * @param vertexBuffer The TGX entry containing position data (usually 0.0.vertexbuffer.tgx)
     * @param indexBuffer The TGX entry containing face indices (usually 0.indexbuffer.tgx)
     * @param metadata The render metadata describing the buffer structure (stride, offsets)
     */
    createGeometry(vertexBuffer: ArrayBuffer, indexBuffer: ArrayBuffer, metadata: any): THREE.BufferGeometry {
        const geometry = new THREE.BufferGeometry();

        // Index Buffer
        const indexData = new Uint16Array(indexBuffer);
        geometry.setIndex(new THREE.BufferAttribute(indexData, 1));

        // Vertex Buffer (Interleaved)
        // Position is typically at the start of the stride
        const stride = metadata.vertex_stride_0 || 12; // Default 12 for 3 floats
        const floatData = new Float32Array(vertexBuffer);

        // We need to carefully map attributes based on the metadata
        // For the prototype, we assume common offsets
        geometry.setAttribute("position", new THREE.BufferAttribute(floatData, 3, true));

        // If UVs exist in metadata (typically vertex_stride_1)
        // geometry.setAttribute("uv", ...);

        geometry.computeVertexNormals();
        return geometry;
    }
}
