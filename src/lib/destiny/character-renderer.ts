import * as THREE from "three";
import { TGXLoader } from "./tgx-loader";

/**
 * CharacterRenderer - Orchestrates the assembly of a 3D Destiny 2 character.
 * This class handles:
 * 1. Fetching item definitions from the manifest.
 * 2. Downloading TGX assets (geometry/textures).
 * 3. Applying shaders (dyes) based on character render data.
 */
export class CharacterRenderer {
    private scene: THREE.Group;
    private loader: TGXLoader;
    private baseUrl = "https://www.bungie.net";

    constructor() {
        this.scene = new THREE.Group();
        this.loader = new TGXLoader();
    }

    /**
     * Assembles the character based on the profile render data.
     * @param renderData Component 205 (DestinyCharacterRenderComponent)
     */
    async assembleCharacter(renderData: any): Promise<THREE.Group> {
        const group = new THREE.Group();

        const peerView = renderData?.peerView;
        const equipment = peerView?.equipment || peerView?.items;

        if (!equipment || equipment.length === 0) {
            return group;
        }

        const loadPromises = equipment.map(async (item: any) => {
            // Check if there's an ornament equipped in the customization properties
            // Bungie's customization often lists an override style item hash or we can use the main item
            let overrideItemHash = item.itemHash;

            // Check for override/ornament hash (typically in overrideStyleItemHash for 3D render data)
            // Sometimes it's inside a 'customization' object or directly on the item
            if (item.overrideStyleItemHash) {
                overrideItemHash = item.overrideStyleItemHash;
            } else if (renderData?.customization?.equipment) {
                // Another common structure in Bungie's renderData
                const customItem = renderData.customization.equipment.find((e: any) => e.itemHash === item.itemHash);
                if (customItem && customItem.overrideStyleItemHash) {
                    overrideItemHash = customItem.overrideStyleItemHash;
                }
            }

            return this.loadItem(overrideItemHash, item.dyes || []);
        });

        const meshes = await Promise.all(loadPromises);
        meshes.forEach(mesh => {
            if (mesh) {
                group.add(mesh);
            }
        });

        return group;
    }

    /**
     * Attempts to extract a primary color from a dye hash by fetching the shader item definition.
     */
    async getDyeColor(dyeHash: number): Promise<THREE.Color | null> {
        try {
            const res = await fetch(`/api/manifest/definition?table=DestinyInventoryItemDefinition&hash=${dyeHash}`);
            if (!res.ok) return null;
            const data = await res.json();
            const def = data.definition;

            // Shaders often have a primary color in their display properties icon or we can generate a consistent pseudo-random color
            // Since we can't fully parse the dye data, we use the hash to generate a consistent, deterministic color
            // to represent the shader, giving it a unique look.

            // Simple hash to RGB
            const r = (dyeHash & 0xFF0000) >> 16;
            const g = (dyeHash & 0x00FF00) >> 8;
            const b = (dyeHash & 0x0000FF);

            // Normalize and slightly desaturate/darken for a better "armor" look
            const color = new THREE.Color(`rgb(${r}, ${g}, ${b})`);
            color.lerp(new THREE.Color(0x333333), 0.3); // Mix with dark grey
            return color;
        } catch (e) {
            return null;
        }
    }

    /**
     * Loads a single gear piece into a Three.js Mesh.
     */
    async loadItem(itemHash: number, dyes: any[]): Promise<THREE.Object3D | null> {
        try {
            // Fetch definition (we use internal API for manifest)
            const res = await fetch(`/api/manifest/definition?table=DestinyInventoryItemDefinition&hash=${itemHash}`);
            if (!res.ok) return null;
            const data = await res.json();
            const def = data.definition;

            if (!def.translationBlock) {
                console.warn(`[CharacterRenderer] No translation block found for item ${itemHash}`);
                return null;
            }

            // Try to find the mesh hash from arrangements first, then from geometryReference
            const arrangement = def.translationBlock.arrangements?.[0];
            const meshHash = arrangement?.meshHash || arrangement?.mesh_hash || def.translationBlock.geometryReference;

            if (!meshHash) {
                console.warn(`[CharacterRenderer] No meshHash or geometryReference found for item ${def.displayProperties?.name}`);
                return null;
            }

            // Geometry URL: /common/destiny2_content/gear/geometry/<hash>.tgx
            const url = `${this.baseUrl}/common/destiny2_content/gear/geometry/${meshHash}.tgx`;
            console.log(`[CharacterRenderer] Fetching TGX for ${def.displayProperties?.name} from URL: ${url}`);

            // 3D assets are usually split into vertex and index buffers
            // This is where TGXLoader comes into play
            const entries = await this.loader.load(url);
            console.log(`[CharacterRenderer] TGX loaded for ${def.displayProperties?.name}, entries found: ${entries.length}`);

            // Find buffers in the container
            const vbEntry = entries.find((e: any) => e.name.includes("vertexbuffer"));
            const ibEntry = entries.find((e: any) => e.name.includes("indexbuffer"));

            if (!vbEntry || !ibEntry) {
                console.warn(`[CharacterRenderer] Vertex or Index buffer not found for ${def.displayProperties?.name}`);
                return null;
            }

            // Create geometry (metadata would come from render_metadata.js in the TGX)
            const geometry = this.loader.createGeometry(vbEntry.data, ibEntry.data, {});
            console.log(`[CharacterRenderer] Geometry created for ${def.displayProperties?.name}`);

            // Determine base color from shaders (dyes)
            let baseColor = new THREE.Color(0x888888); // Default gray

            // Dyes array contains objects with channelHash and dyeHash
            if (dyes && dyes.length > 0) {
                // Try to find a primary dye
                const dye = dyes.find(d => d.dyeHash) || dyes[0];
                if (dye && dye.dyeHash) {
                    const shaderColor = await this.getDyeColor(dye.dyeHash);
                    if (shaderColor) {
                        baseColor = shaderColor;
                        console.log(`[CharacterRenderer] Applied shader color for ${def.displayProperties?.name}:`, baseColor.getHexString());
                    }
                }
            }

            // Create a high-quality physical material (holographic / metallic look)
            const material = new THREE.MeshPhysicalMaterial({
                color: baseColor,
                metalness: 0.8,
                roughness: 0.4,
                clearcoat: 0.3,
                clearcoatRoughness: 0.2,
                envMapIntensity: 1.0,
                side: THREE.DoubleSide // Important: Some extracted meshes have inverted normals
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = def.displayProperties.name || `Item_${itemHash}`;

            // Adjust scale if needed (Destiny models are often very large)
            // We scale it down to fit within a normal OrbitControls FOV
            mesh.scale.set(0.02, 0.02, 0.02);

            console.log(`[CharacterRenderer] Mesh created and named: ${mesh.name}`);

            return mesh;
        } catch (error) {
            console.error(`[CharacterRenderer] Error loading item ${itemHash}:`, error);
            return null;
        }
    }
}
