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
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`[TGXLoader] Failed to load TGX: ${url} (Status: ${response.status})`);
                return [];
            }
            const buffer = await response.arrayBuffer();
            return this.parse(buffer);
        } catch (error) {
            console.error(`[TGXLoader] Fetch error for TGX: ${url}`, error);
            return [];
        }
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
        // Position is typically at the start of the stride (first 3 floats = 12 bytes)
        // Bungie typically uses a stride of 32, 36, 48, or 64 bytes for their vertex buffers.
        // If metadata is missing or we don't have the exact stride, we'll try to infer it.
        // In most tgx files, vertex data has an implicit structure, often 32 bytes total.
        // Positions (12), Normals (12), UVs (8)
        let strideBytes = metadata.vertex_stride_0 || 32;

        // Safety check: Ensure the stride evenly divides the buffer
        // If it doesn't, try other common strides (like 48 or 64)
        if (vertexBuffer.byteLength % strideBytes !== 0) {
            if (vertexBuffer.byteLength % 48 === 0) strideBytes = 48;
            else if (vertexBuffer.byteLength % 64 === 0) strideBytes = 64;
            else if (vertexBuffer.byteLength % 36 === 0) strideBytes = 36;
            // Fallback to 32 if nothing matches perfectly, though this implies corrupted reading
        }

        const strideFloats = strideBytes / 4;

        try {
            const floatData = new Float32Array(vertexBuffer);

            // We use THREE.InterleavedBuffer to correctly map the positions
            // assuming the first 3 floats (x, y, z) are the position.
            const interleavedBuffer = new THREE.InterleavedBuffer(floatData, strideFloats);

            // Add the position attribute, reading 3 values starting at offset 0
            geometry.setAttribute("position", new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0, false));

            // Optional: If we knew the exact layout, we could map normals and UVs here
            // e.g., geometry.setAttribute("normal", new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 3, false));
            // e.g., geometry.setAttribute("uv", new THREE.InterleavedBufferAttribute(interleavedBuffer, 2, 6, false));

            // Compute our own normals since we only extracted positions
            geometry.computeVertexNormals();

            // Center the geometry so it always appears in the middle of our scene
            geometry.center();

        } catch (error) {
            console.error("[TGXLoader] Error creating geometry buffers", error);
            // Return empty geometry if parsing fails
        }

        return geometry;
    }
}
