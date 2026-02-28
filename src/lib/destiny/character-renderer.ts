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
            return this.loadItem(item.itemHash, item.dyes);
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
     * Loads a single gear piece into a Three.js Mesh.
     */
    async loadItem(itemHash: number, dyes: any[]): Promise<THREE.Object3D | null> {
        try {
            // Fetch definition (we use internal API for manifest)
            const res = await fetch(`/api/manifest/definition?table=DestinyInventoryItemDefinition&hash=${itemHash}`);
            if (!res.ok) return null;
            const data = await res.json();
            const def = data.definition;

            if (!def.translationBlock) return null;

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

            // Create a standard PBR material
            const material = new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.5,
                metalness: 0.5,
                // In Phase 2, we skip textures for now and use solid colors
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.name = def.displayProperties.name;
            console.log(`[CharacterRenderer] Mesh created and named: ${mesh.name}`);

            return mesh;
        } catch (error) {
            console.error(`[CharacterRenderer] Error loading item ${itemHash}:`, error);
            return null;
        }
    }
}
