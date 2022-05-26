import { IO_Port } from "../../instructions.js";
import { Vertex, Texture } from "./amogus.js";
export class BlockToMesh {
    constructor(blockRam, amogus) {
        this.block = {
            x: 0,
            y: 0,
            z: 0,
            breakPhase: 0
        };
        this.item = {
            x: 0,
            y: 0,
            z: 0,
            id: 0
        };
        this.face = {
            texture: Texture.empty,
            small: false,
            direction: 0,
            texSettings: 0b0000
        };
        this.outputs = {
            [IO_Port.MESHGEN_BLOCKXY]: (i) => {
                this.block.x = i >> 4;
                this.block.y = i & 0xF;
            },
            [IO_Port.MESHGEN_BLOCKZ]: (i) => {
                this.block.z = i >> 4;
            },
            [IO_Port.MESHGEN_BREAKPHASE]: (i) => {
                this.block.breakPhase = i;
            },
            [IO_Port.MESHGEN_ITEMXZ]: (i) => {
                this.item.x = (i >> 4) / 2;
                this.item.z = (i & 0xF) / 2;
            },
            [IO_Port.MESHGEN_ITEMY]: (i) => {
                this.item.y = i / 16;
            },
            [IO_Port.MESHGEN_ITEMID]: (i) => {
                this.item.id = i;
            },
            [IO_Port.MESHGEN_TEXID]: (i) => {
                this.face.texture = i;
            },
            [IO_Port.MESHGEN_SETTINGS]: (i) => {
                this.face.small = (i & 64) != 0;
                this.face.direction = (i & 48) >> 4;
                this.face.texSettings = i & 15;
            }
        };
        this.inputs = {
            [IO_Port.MESHGEN_RENDEROVERLAY]: () => {
                this.RenderOverlay(this.block.x, this.block.y, this.block.z, this.block.breakPhase);
                return 0;
            },
            [IO_Port.MESHGEN_RENDERSCENE]: () => {
                this.RenderScene();
                return 0;
            },
            [IO_Port.MESHGEN_RENDERITEM]: () => {
                this.RenderItem(this.item.x, this.item.y, this.item.z, this.item.id);
                return 0;
            },
            [IO_Port.MESHGEN_RENDERFACE]: () => {
                this.RenderFace(this.block.x, this.block.y, this.block.z, this.face.texture, this.face.direction, this.face.small);
                return 0;
            }
        };
        this.blockRAM = blockRam;
        this.amogus = amogus;
    }
    RenderItem(x, y, z, itemId) {
        let item = MeshROM[itemId].item;
        if (this.isBlockItem(itemId)) {
            const ItemQuads = [
                Quad.blockItemNegY,
                Quad.blockItemPosY,
                Quad.blockItemNegX,
                Quad.blockItemPosX,
                Quad.blockItemNegZ,
                Quad.blockItemPosZ
            ];
            const TexIndices = [1, 0, 2, 2, 3, 2];
            for (let i = 0; i < 6; i++) {
                let texture = item.textures[i];
                this.RenderQuad(x, y, z, ItemQuads[i], texture.id, texture.settings);
            }
        }
        else {
            for (let i = 0; i < 8; i++) {
                let quad = item.quads[i];
                if (quad.id == 0x1F) {
                    break;
                }
                let texture = item.textures[quad.texIndex];
                this.RenderQuad(x, y, z, quad.id, texture.id, texture.settings);
            }
        }
        this.RenderQuad(x, y, z, Quad.itemShadow, Texture.shadow, 0b1110);
    }
    RenderFace(x, y, z, texId, direction, small) {
        let quadId = direction + (small ? 8 : 0);
        this.RenderQuad(x, y, z, quadId, texId, 0b1000);
    }
    RenderOverlay(x, y, z, breakPhase) {
        let texId = 0x1A + breakPhase;
        const Faces = [
            [-1, 0, 0],
            [1, 0, 0],
            [0, 0, -1],
            [0, 0, 1],
            [0, -1, 0],
            [0, 1, 0],
        ];
        const BlockQuads = [
            Quad.fullBlockNegX,
            Quad.fullBlockPosX,
            Quad.fullBlockNegZ,
            Quad.fullBlockPosZ,
            Quad.fullBlockNegY,
            Quad.fullBlockPosY,
        ];
        for (let i = 0; i < 6; i++) {
            let adj = this.blockRAM.getBlock(x + Faces[i][0], y + Faces[i][1], z + Faces[i][2]);
            if (!this.isTransparent(adj)) {
                this.RenderQuad(x, y, z, BlockQuads[i], texId, 0b1101);
            }
        }
    }
    RenderScene() {
        for (let axis = 0; axis < 3; axis++) {
            let previousFace, currentFace, previousTexIndex, currentTexIndex;
            switch (axis) {
                case 0:
                    currentFace = Quad.fullBlockNegX;
                    previousFace = Quad.fullBlockPosX;
                    currentTexIndex = 2;
                    previousTexIndex = 2;
                    break;
                case 1:
                    currentFace = Quad.fullBlockNegZ;
                    previousFace = Quad.fullBlockPosZ;
                    currentTexIndex = 2;
                    previousTexIndex = 2;
                    break;
                default: //case 2:
                    currentFace = Quad.fullBlockNegY;
                    previousFace = Quad.fullBlockPosY;
                    currentTexIndex = 1;
                    previousTexIndex = 0;
                    break;
            }
            for (let a1 = 0; a1 < 8; a1++) {
                for (let a2 = 0; a2 < 8; a2++) {
                    let previous = Block.air;
                    let previousFull = false;
                    let previousTransparent = false;
                    for (let a3 = 0; a3 < 8; a3++) {
                        let position = [];
                        switch (axis) { //rotate a1, a2, a3 based on axis
                            case 0:
                                position = [a3, a1, a2];
                                break;
                            case 1:
                                position = [a1, a2, a3];
                                break;
                            case 2:
                                position = [a2, a3, a1];
                                break;
                        }
                        let current = this.blockRAM.getBlock(position[0], position[1], position[2]);
                        let currentFull = this.isFull(current);
                        let currentTransparent = this.isTransparent(current);
                        if (axis == 2) {
                            if (position[1] == 0 && currentTransparent) {
                                this.RenderQuad(position[0], position[1], position[2], Quad.bedrock, Texture.stone, 0b1010);
                            }
                            else if (position[1] == 7 && currentFull) {
                                let texture = MeshROM[current].block.textures[0];
                                this.RenderQuad(position[0], position[1], position[2], Quad.fullBlockPosY, texture.id, texture.settings);
                            }
                            if (!currentFull && current != Block.air) {
                                let blockData = MeshROM[current].block;
                                for (let i = 0; i < blockData.quads.length; i++) {
                                    let quad = blockData.quads[i];
                                    let texture = blockData.textures[quad.texIndex];
                                    this.RenderQuad(position[0], position[1], position[2], quad.id, texture.id, texture.settings);
                                }
                            }
                        }
                        if (current == previous) {
                            previous = current;
                            previousFull = currentFull;
                            previousTransparent = currentTransparent;
                            continue;
                        }
                        if (currentTransparent && previousFull) {
                            let texture = MeshROM[previous].block.textures[previousTexIndex];
                            this.RenderQuad(position[0] - (axis == 0 ? 1 : 0), position[1] - (axis == 2 ? 1 : 0), position[2] - (axis == 1 ? 1 : 0), previousFace, texture.id, texture.settings);
                        }
                        if (previousTransparent && currentFull) {
                            let texture = MeshROM[current].block.textures[currentTexIndex];
                            this.RenderQuad(position[0], position[1], position[2], currentFace, texture.id, texture.settings);
                        }
                        previous = current;
                        previousFull = currentFull;
                        previousTransparent = currentTransparent;
                    }
                }
            }
        }
    }
    RenderQuad(x, y, z, quadId, texId, texSettings) {
        let quad = [];
        const Uvs = [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0]
        ];
        let template = Quads[quadId];
        for (let i = 0; i < 4; i++) {
            let vertex = new Vertex(x * 16 + template[i][0], y * 16 + template[i][1], z * 16 + template[i][2], Uvs[i][0], Uvs[i][1]);
            quad[i] = this.amogus.world_to_cam(vertex);
        }
        this.amogus.texture = texId;
        this.amogus.settings.cullBackface = (texSettings & 0b1000) != 0;
        this.amogus.settings.transparent = (texSettings & 0b0100) != 0;
        this.amogus.settings.inverted = (texSettings & 0b0010) != 0;
        this.amogus.settings.overlay = (texSettings & 0b0001) != 0;
        this.amogus.drawQuad(quad);
    }
    isTransparent(blockID) {
        switch (blockID) {
            case Block.air:
            case Block.leaves:
            case Block.sapling:
            case Block.glass:
            case Block.chest:
                return true;
        }
        return false;
    }
    isFull(blockID) {
        switch (blockID) {
            case Block.air:
            case Block.sapling:
            case Block.chest:
                return false;
        }
        return true;
    }
    isBlockItem(itemId) {
        switch (itemId) {
            case Item.coal:
            case Item.sapling:
                return false;
        }
        return true;
    }
}
var Item;
(function (Item) {
    Item[Item["dirt"] = 2] = "dirt";
    Item[Item["cobble"] = 4] = "cobble";
    Item[Item["log"] = 5] = "log";
    Item[Item["leaves"] = 6] = "leaves";
    Item[Item["plank"] = 7] = "plank";
    Item[Item["coal"] = 8] = "coal";
    Item[Item["ironOre"] = 9] = "ironOre";
    Item[Item["sand"] = 10] = "sand";
    Item[Item["sapling"] = 12] = "sapling";
    Item[Item["table"] = 13] = "table";
    Item[Item["furnace"] = 14] = "furnace";
    Item[Item["chest"] = 15] = "chest";
})(Item || (Item = {}));
export var Block;
(function (Block) {
    Block[Block["air"] = 0] = "air";
    Block[Block["grass"] = 1] = "grass";
    Block[Block["dirt"] = 2] = "dirt";
    Block[Block["stone"] = 3] = "stone";
    Block[Block["cobble"] = 4] = "cobble";
    Block[Block["log"] = 5] = "log";
    Block[Block["leaves"] = 6] = "leaves";
    Block[Block["plank"] = 7] = "plank";
    Block[Block["coalOre"] = 8] = "coalOre";
    Block[Block["ironOre"] = 9] = "ironOre";
    Block[Block["sand"] = 10] = "sand";
    Block[Block["glass"] = 11] = "glass";
    Block[Block["sapling"] = 12] = "sapling";
    Block[Block["table"] = 13] = "table";
    Block[Block["furnace"] = 14] = "furnace";
    Block[Block["chest"] = 15] = "chest";
})(Block || (Block = {}));
var Mesh;
(function (Mesh) {
    Mesh[Mesh["none"] = 0] = "none";
    Mesh[Mesh["block"] = 1] = "block";
    Mesh[Mesh["cross"] = 2] = "cross";
    Mesh[Mesh["smallBlock"] = 3] = "smallBlock";
    Mesh[Mesh["blockItem"] = 4] = "blockItem";
    Mesh[Mesh["crossItem2Color"] = 5] = "crossItem2Color";
    Mesh[Mesh["crossItemNoCull"] = 6] = "crossItemNoCull";
    Mesh[Mesh["fullNegXFace"] = 7] = "fullNegXFace";
    Mesh[Mesh["fullPosXFace"] = 8] = "fullPosXFace";
    Mesh[Mesh["fullNegZFace"] = 9] = "fullNegZFace";
    Mesh[Mesh["fullPosZFace"] = 10] = "fullPosZFace";
    Mesh[Mesh["smallNegXFace"] = 11] = "smallNegXFace";
    Mesh[Mesh["smallPosXFace"] = 12] = "smallPosXFace";
    Mesh[Mesh["smallNegZFace"] = 13] = "smallNegZFace";
    Mesh[Mesh["smallPosZFace"] = 14] = "smallPosZFace";
    Mesh[Mesh["bedrock"] = 15] = "bedrock"; //0xF
})(Mesh || (Mesh = {}));
var Quad;
(function (Quad) {
    Quad[Quad["fullBlockNegX"] = 0] = "fullBlockNegX";
    Quad[Quad["fullBlockPosX"] = 1] = "fullBlockPosX";
    Quad[Quad["fullBlockNegZ"] = 2] = "fullBlockNegZ";
    Quad[Quad["fullBlockPosZ"] = 3] = "fullBlockPosZ";
    Quad[Quad["fullBlockNegY"] = 4] = "fullBlockNegY";
    Quad[Quad["fullBlockPosY"] = 5] = "fullBlockPosY";
    Quad[Quad["crossBlock1"] = 6] = "crossBlock1";
    Quad[Quad["crossBlock2"] = 7] = "crossBlock2";
    Quad[Quad["smallBlockNegX"] = 8] = "smallBlockNegX";
    Quad[Quad["smallBlockPosX"] = 9] = "smallBlockPosX";
    Quad[Quad["smallBlockNegZ"] = 10] = "smallBlockNegZ";
    Quad[Quad["smallBlockPosZ"] = 11] = "smallBlockPosZ";
    Quad[Quad["smallBlockNegY"] = 12] = "smallBlockNegY";
    Quad[Quad["smallBlockPosY"] = 13] = "smallBlockPosY";
    Quad[Quad["itemShadow"] = 14] = "itemShadow";
    Quad[Quad["blockItemNegX"] = 15] = "blockItemNegX";
    Quad[Quad["blockItemPosX"] = 16] = "blockItemPosX";
    Quad[Quad["blockItemNegZ"] = 17] = "blockItemNegZ";
    Quad[Quad["blockItemPosZ"] = 18] = "blockItemPosZ";
    Quad[Quad["blockItemNegY"] = 19] = "blockItemNegY";
    Quad[Quad["blockItemPosY"] = 20] = "blockItemPosY";
    Quad[Quad["crossItem1"] = 21] = "crossItem1";
    Quad[Quad["crossItem2"] = 22] = "crossItem2";
    Quad[Quad["crossItem3"] = 23] = "crossItem3";
    Quad[Quad["crossItem4"] = 24] = "crossItem4";
    Quad[Quad["bedrock"] = 25] = "bedrock"; //0x19
})(Quad || (Quad = {}));
const Quads = {
    [Quad.fullBlockNegX]: [
        [0, 0, 16],
        [0, 16, 16],
        [0, 16, 0],
        [0, 0, 0]
    ],
    [Quad.fullBlockPosX]: [
        [16, 0, 0],
        [16, 16, 0],
        [16, 16, 16],
        [16, 0, 16]
    ],
    [Quad.fullBlockNegZ]: [
        [0, 0, 0],
        [0, 16, 0],
        [16, 16, 0],
        [16, 0, 0]
    ],
    [Quad.fullBlockPosZ]: [
        [16, 0, 16],
        [16, 16, 16],
        [0, 16, 16],
        [0, 0, 16]
    ],
    [Quad.fullBlockNegY]: [
        [0, 0, 16],
        [0, 0, 0],
        [16, 0, 0],
        [16, 0, 16]
    ],
    [Quad.fullBlockPosY]: [
        [0, 16, 0],
        [0, 16, 16],
        [16, 16, 16],
        [16, 16, 0]
    ],
    [Quad.crossBlock1]: [
        [2, 0, 2],
        [2, 16, 2],
        [12, 16, 12],
        [12, 0, 12]
    ],
    [Quad.crossBlock2]: [
        [2, 0, 12],
        [2, 16, 12],
        [12, 16, 2],
        [12, 0, 2]
    ],
    [Quad.smallBlockNegX]: [
        [1, 0, 15],
        [1, 14, 15],
        [1, 14, 1],
        [1, 0, 1]
    ],
    [Quad.smallBlockPosX]: [
        [15, 0, 1],
        [15, 14, 1],
        [15, 14, 15],
        [15, 0, 15]
    ],
    [Quad.smallBlockNegZ]: [
        [1, 0, 1],
        [1, 14, 1],
        [15, 14, 1],
        [15, 0, 1]
    ],
    [Quad.smallBlockPosZ]: [
        [15, 0, 15],
        [15, 14, 15],
        [1, 14, 15],
        [1, 0, 15]
    ],
    [Quad.smallBlockNegY]: [
        [1, 0, 15],
        [1, 0, 1],
        [15, 0, 1],
        [15, 0, 15]
    ],
    [Quad.smallBlockPosY]: [
        [1, 14, 1],
        [1, 14, 15],
        [15, 14, 15],
        [15, 14, 1]
    ],
    [Quad.itemShadow]: [
        [0, 0, 0],
        [0, 0, 8],
        [8, 0, 8],
        [8, 0, 0]
    ],
    [Quad.blockItemNegX]: [
        [1, 1, 7],
        [1, 7, 7],
        [1, 7, 1],
        [1, 1, 1]
    ],
    [Quad.blockItemPosX]: [
        [7, 1, 1],
        [7, 7, 1],
        [7, 7, 7],
        [7, 1, 7]
    ],
    [Quad.blockItemNegZ]: [
        [1, 1, 1],
        [1, 7, 1],
        [7, 7, 1],
        [7, 1, 1]
    ],
    [Quad.blockItemPosZ]: [
        [7, 1, 7],
        [7, 7, 7],
        [1, 7, 7],
        [1, 1, 7]
    ],
    [Quad.blockItemNegY]: [
        [1, 1, 7],
        [1, 1, 1],
        [7, 1, 1],
        [7, 1, 7]
    ],
    [Quad.blockItemPosY]: [
        [1, 7, 1],
        [1, 7, 7],
        [7, 7, 7],
        [7, 7, 1]
    ],
    [Quad.crossItem1]: [
        [2, 1, 2],
        [2, 6, 2],
        [6, 6, 6],
        [6, 1, 6]
    ],
    [Quad.crossItem2]: [
        [2, 1, 6],
        [2, 6, 6],
        [6, 6, 2],
        [6, 1, 2]
    ],
    [Quad.crossItem3]: [
        [6, 1, 2],
        [6, 6, 2],
        [2, 6, 6],
        [2, 1, 6]
    ],
    [Quad.crossItem4]: [
        [6, 1, 6],
        [6, 6, 6],
        [2, 6, 2],
        [2, 1, 2]
    ],
    [Quad.bedrock]: [
        [0, 0, 0],
        [0, 0, 16],
        [16, 0, 16],
        [16, 0, 0]
    ]
};
const Meshes = {
    [Mesh.none]: {
        numQuads: 0,
        quads: []
    },
    [Mesh.block]: {
        numQuads: 6,
        quads: [
            { texture: 0, quad: Quad.fullBlockNegX },
            { texture: 0, quad: Quad.fullBlockPosX },
            { texture: 0, quad: Quad.fullBlockNegZ },
            { texture: 0, quad: Quad.fullBlockPosZ },
            { texture: 2, quad: Quad.fullBlockNegY },
            { texture: 1, quad: Quad.fullBlockPosY }
        ]
    },
    [Mesh.cross]: {
        numQuads: 4,
        quads: [
            { texture: 0, quad: Quad.crossBlock1 },
            { texture: 1, quad: Quad.crossBlock1 },
            { texture: 0, quad: Quad.crossBlock2 },
            { texture: 1, quad: Quad.crossBlock2 },
        ]
    },
    [Mesh.smallBlock]: {
        numQuads: 6,
        quads: [
            { texture: 0, quad: Quad.smallBlockNegX },
            { texture: 0, quad: Quad.smallBlockPosX },
            { texture: 0, quad: Quad.smallBlockNegZ },
            { texture: 0, quad: Quad.smallBlockPosZ },
            { texture: 2, quad: Quad.smallBlockNegY },
            { texture: 1, quad: Quad.smallBlockPosY }
        ]
    },
    [Mesh.blockItem]: {
        numQuads: 7,
        quads: [
            { texture: 0, quad: Quad.blockItemNegX },
            { texture: 0, quad: Quad.blockItemPosX },
            { texture: 3, quad: Quad.blockItemNegZ },
            { texture: 0, quad: Quad.blockItemPosZ },
            { texture: 2, quad: Quad.blockItemNegY },
            { texture: 1, quad: Quad.blockItemPosY },
            { texture: 4, quad: Quad.itemShadow } //NOTE: texture 4 is always {texture: Texture.shadow, settings: 0b1110}
        ]
    },
    [Mesh.crossItem2Color]: {
        numQuads: 9,
        quads: [
            { texture: 0, quad: Quad.crossItem1 },
            { texture: 1, quad: Quad.crossItem1 },
            { texture: 0, quad: Quad.crossItem2 },
            { texture: 1, quad: Quad.crossItem2 },
            { texture: 0, quad: Quad.crossItem3 },
            { texture: 1, quad: Quad.crossItem3 },
            { texture: 0, quad: Quad.crossItem4 },
            { texture: 1, quad: Quad.crossItem4 },
            { texture: 4, quad: Quad.itemShadow } //NOTE: texture 4 is always {id: Texture.shadow, settings: 0b1110}
        ]
    },
    [Mesh.crossItemNoCull]: {
        numQuads: 5,
        quads: [
            { texture: 0, quad: Quad.crossItem1 },
            { texture: 1, quad: Quad.crossItem1 },
            { texture: 0, quad: Quad.crossItem2 },
            { texture: 1, quad: Quad.crossItem2 },
            { texture: 4, quad: Quad.crossItem1 } //NOTE: texture 4 is always {id: Texture.shadow, settings: 0b1110}
        ]
    },
    [Mesh.fullNegXFace]: {
        numQuads: 1,
        quads: [
            { texture: 0, quad: Quad.fullBlockNegX }
        ]
    },
    [Mesh.fullPosXFace]: {
        numQuads: 1,
        quads: [
            { texture: 0, quad: Quad.fullBlockPosX }
        ]
    },
    [Mesh.fullNegZFace]: {
        numQuads: 1,
        quads: [
            { texture: 0, quad: Quad.fullBlockNegZ }
        ]
    },
    [Mesh.fullPosZFace]: {
        numQuads: 1,
        quads: [
            { texture: 0, quad: Quad.fullBlockPosZ }
        ]
    },
    [Mesh.smallNegXFace]: {
        numQuads: 1,
        quads: [
            { texture: 0, quad: Quad.smallBlockNegX }
        ]
    },
    [Mesh.smallPosXFace]: {
        numQuads: 1,
        quads: [
            { texture: 0, quad: Quad.smallBlockPosX }
        ]
    },
    [Mesh.smallNegZFace]: {
        numQuads: 1,
        quads: [
            { texture: 0, quad: Quad.smallBlockNegZ }
        ]
    },
    [Mesh.smallPosZFace]: {
        numQuads: 1,
        quads: [
            { texture: 0, quad: Quad.smallBlockPosZ }
        ]
    },
    [Mesh.bedrock]: {
        numQuads: 1,
        quads: [
            { texture: 0, quad: Quad.bedrock }
        ]
    }
};
const ItemMeshProperties = {
    [Item.dirt]: {
        meshType: Mesh.blockItem,
        textures: [
            {
                id: Texture.dirt,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.dirt,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.dirt,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.dirt,
                settings: 0b1000 //Btio
            },
        ]
    },
    [Item.cobble]: {
        meshType: Mesh.blockItem,
        textures: [
            {
                id: Texture.cobble,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.cobble,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.cobble,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.cobble,
                settings: 0b1000 //Btio
            },
        ]
    },
    [Item.log]: {
        meshType: Mesh.blockItem,
        textures: [
            {
                id: Texture.logSide,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.logTop,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.logTop,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.logSide,
                settings: 0b1000 //Btio
            },
        ]
    },
    [Item.leaves]: {
        meshType: Mesh.blockItem,
        textures: [
            {
                id: Texture.leaves,
                settings: 0b1100 //BTio
            },
            {
                id: Texture.leaves,
                settings: 0b1100 //BTio
            },
            {
                id: Texture.leaves,
                settings: 0b1100 //BTio
            },
            {
                id: Texture.leaves,
                settings: 0b1100 //BTio
            },
        ]
    },
    [Item.plank]: {
        meshType: Mesh.blockItem,
        textures: [
            {
                id: Texture.plank,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.plank,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.plank,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.plank,
                settings: 0b1000 //Btio
            },
        ]
    },
    [Item.coal]: {
        meshType: Mesh.crossItem2Color,
        textures: [
            {
                id: Texture.coalItemLight,
                settings: 0b1100 //BTio
            },
            {
                id: Texture.coalItemDark,
                settings: 0b1110 //BTIo
            },
            {
                id: Texture.empty,
                settings: 0b0000
            },
            {
                id: Texture.empty,
                settings: 0b0000
            }
        ]
    },
    [Item.ironOre]: {
        meshType: Mesh.blockItem,
        textures: [
            {
                id: Texture.ironOre,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.ironOre,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.ironOre,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.ironOre,
                settings: 0b1000 //Btio
            }
        ]
    },
    [Item.sand]: {
        meshType: Mesh.blockItem,
        textures: [
            {
                id: Texture.dirt,
                settings: 0b1010 //BtIo
            },
            {
                id: Texture.dirt,
                settings: 0b1010 //BtIo
            },
            {
                id: Texture.dirt,
                settings: 0b1010 //BtIo
            },
            {
                id: Texture.dirt,
                settings: 0b1010 //BtIo
            }
        ]
    },
    [Item.sapling]: {
        meshType: Mesh.crossItemNoCull,
        textures: [
            {
                id: Texture.saplingLight,
                settings: 0b0100 //bTio
            },
            {
                id: Texture.saplingDark,
                settings: 0b0110 //bTIo
            },
            {
                id: Texture.empty,
                settings: 0b0000
            },
            {
                id: Texture.empty,
                settings: 0b0000
            }
        ]
    },
    [Item.table]: {
        meshType: Mesh.blockItem,
        textures: [
            {
                id: Texture.tableSide,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.tableTop,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.plank,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.empty,
                settings: 0b0000
            }
        ]
    },
    [Item.furnace]: {
        meshType: Mesh.blockItem,
        textures: [
            {
                id: Texture.furnaceSide,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.furnaceTop,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.furnaceTop,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.furnaceFrontOff,
                settings: 0b1000 //Btio
            }
        ],
    },
    [Item.chest]: {
        meshType: Mesh.blockItem,
        textures: [
            {
                id: Texture.chestSide,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.chestTop,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.chestTop,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.chestFront,
                settings: 0b1000 //Btio
            }
        ]
    }
};
const BlockMeshProperties = {
    [Block.air]: {
        meshType: Mesh.none,
        textures: [
            {
                id: Texture.empty,
                settings: 0b0000
            },
            {
                id: Texture.empty,
                settings: 0b0000
            },
            {
                id: Texture.empty,
                settings: 0b0000
            }
        ]
    },
    [Block.grass]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.grassSide,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.empty,
                settings: 0b1010 //BtIo
            },
            {
                id: Texture.dirt,
                settings: 0b1000 //Btio
            }
        ]
    },
    [Block.dirt]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.dirt,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.dirt,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.dirt,
                settings: 0b1000 //Btio
            }
        ]
    },
    [Block.stone]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.stone,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.stone,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.stone,
                settings: 0b1000 //Btio
            }
        ]
    },
    [Block.cobble]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.cobble,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.cobble,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.cobble,
                settings: 0b1000 //Btio
            }
        ]
    },
    [Block.log]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.logSide,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.logTop,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.logTop,
                settings: 0b1000 //Btio
            }
        ]
    },
    [Block.leaves]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.leaves,
                settings: 0b1100 //BTio
            },
            {
                id: Texture.leaves,
                settings: 0b1100 //BTio
            },
            {
                id: Texture.leaves,
                settings: 0b1100 //BTio
            }
        ]
    },
    [Block.plank]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.plank,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.plank,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.plank,
                settings: 0b1000 //Btio
            }
        ]
    },
    [Block.coalOre]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.coalOre,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.coalOre,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.coalOre,
                settings: 0b1000 //Btio
            }
        ]
    },
    [Block.ironOre]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.ironOre,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.ironOre,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.ironOre,
                settings: 0b1000 //Btio
            }
        ]
    },
    [Block.sand]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.dirt,
                settings: 0b1010 //BtIo
            },
            {
                id: Texture.dirt,
                settings: 0b1010 //BtIo
            },
            {
                id: Texture.dirt,
                settings: 0b1010 //BtIo
            }
        ]
    },
    [Block.glass]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.glass,
                settings: 0b1110 //BTIo
            },
            {
                id: Texture.glass,
                settings: 0b1110 //BTIo
            },
            {
                id: Texture.glass,
                settings: 0b1110 //BTIo
            }
        ]
    },
    [Block.sapling]: {
        meshType: Mesh.cross,
        textures: [
            {
                id: Texture.saplingLight,
                settings: 0b0100 //bTio
            },
            {
                id: Texture.saplingDark,
                settings: 0b0110 //bTIo
            },
            {
                id: Texture.empty,
                settings: 0b0000
            }
        ]
    },
    [Block.table]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.tableSide,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.tableTop,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.plank,
                settings: 0b1000 //Btio
            }
        ]
    },
    [Block.furnace]: {
        meshType: Mesh.block,
        textures: [
            {
                id: Texture.furnaceSide,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.furnaceTop,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.furnaceTop,
                settings: 0b1000 //Btio
            }
        ],
    },
    [Block.chest]: {
        meshType: Mesh.smallBlock,
        textures: [
            {
                id: Texture.chestSide,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.chestTop,
                settings: 0b1000 //Btio
            },
            {
                id: Texture.chestTop,
                settings: 0b1000 //Btio
            }
        ]
    }
};
const MeshROM = {
    [Block.air]: {
        block: {
            textures: [],
            quads: []
        },
        item: {
            textures: [],
            quads: []
        }
    },
    [Block.grass]: {
        block: {
            textures: [
                {
                    id: Texture.empty,
                    settings: 0b1010 //BtIo
                },
                {
                    id: Texture.dirt,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.grassSide,
                    settings: 0b1000 //Btio
                }
            ],
            quads: []
        },
        item: {} //no item
    },
    [Block.dirt]: {
        block: {
            textures: [
                {
                    id: Texture.dirt,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.dirt,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.dirt,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.dirt,
                    settings: 0b1000 //Btio
                },
            ],
            quads: []
        },
        item: {
            textures: [
                {
                    id: Texture.dirt,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.dirt,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.dirt,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.dirt,
                    settings: 0b1000 //Btio
                },
            ],
            quads: []
        }
    },
    [Block.stone]: {
        block: {
            textures: [
                {
                    id: Texture.cobble,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.cobble,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.cobble,
                    settings: 0b1000 //Btio
                }
            ],
            quads: []
        },
        item: {}
    },
    [Block.cobble]: {
        block: {
            textures: [
                {
                    id: Texture.cobble,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.cobble,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.cobble,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.cobble,
                    settings: 0b1000 //Btio
                }
            ],
            quads: []
        },
        item: {
            textures: [
                {
                    id: Texture.cobble,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.cobble,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.cobble,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.cobble,
                    settings: 0b1000 //Btio
                }
            ],
            quads: []
        }
    },
    [Block.log]: {
        block: {
            textures: [
                {
                    id: Texture.logTop,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.logTop,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.logSide,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.logSide,
                    settings: 0b1000 //Btio
                }
            ],
            quads: []
        },
        item: {
            textures: [
                {
                    id: Texture.logTop,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.logTop,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.logSide,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.logSide,
                    settings: 0b1000 //Btio
                }
            ],
            quads: []
        }
    },
    [Block.leaves]: {
        block: {
            textures: [
                {
                    id: Texture.leaves,
                    settings: 0b1100 //BTio
                },
                {
                    id: Texture.leaves,
                    settings: 0b1100 //BTio
                },
                {
                    id: Texture.leaves,
                    settings: 0b1100 //BTio
                },
                {
                    id: Texture.leaves,
                    settings: 0b1100 //BTio
                }
            ],
            quads: []
        },
        item: {
            textures: [
                {
                    id: Texture.leaves,
                    settings: 0b1100 //BTio
                },
                {
                    id: Texture.leaves,
                    settings: 0b1100 //BTio
                },
                {
                    id: Texture.leaves,
                    settings: 0b1100 //BTio
                },
                {
                    id: Texture.leaves,
                    settings: 0b1100 //BTio
                }
            ],
            quads: []
        }
    },
    [Block.plank]: {
        block: {
            textures: [
                {
                    id: Texture.plank,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.plank,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.plank,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.plank,
                    settings: 0b1000 //Btio
                },
            ],
            quads: []
        },
        item: {
            textures: [
                {
                    id: Texture.plank,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.plank,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.plank,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.plank,
                    settings: 0b1000 //Btio
                },
            ],
            quads: []
        }
    },
    [Block.coalOre]: {
        block: {
            textures: [
                {
                    id: Texture.coalOre,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.coalOre,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.coalOre,
                    settings: 0b1000 //Btio
                },
            ],
            quads: []
        },
        item: {
            textures: [
                {
                    id: Texture.coalItemLight,
                    settings: 0b1100 //BTio
                },
                {
                    id: Texture.coalItemDark,
                    settings: 0b1110 //BTIo
                }
            ],
            quads: [
                { id: Quad.crossItem1, texIndex: 0 },
                { id: Quad.crossItem1, texIndex: 1 },
                { id: Quad.crossItem2, texIndex: 0 },
                { id: Quad.crossItem2, texIndex: 1 },
                { id: Quad.crossItem3, texIndex: 0 },
                { id: Quad.crossItem3, texIndex: 1 },
                { id: Quad.crossItem4, texIndex: 0 },
                { id: Quad.crossItem4, texIndex: 1 },
            ]
        }
    },
    [Block.ironOre]: {
        block: {
            textures: [
                {
                    id: Texture.ironOre,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.ironOre,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.ironOre,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.ironOre,
                    settings: 0b1000 //Btio
                }
            ],
            quads: []
        },
        item: {
            textures: [
                {
                    id: Texture.ironOre,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.ironOre,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.ironOre,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.ironOre,
                    settings: 0b1000 //Btio
                }
            ],
            quads: []
        }
    },
    [Block.sand]: {
        block: {
            textures: [
                {
                    id: Texture.dirt,
                    settings: 0b1010 //BtIo
                },
                {
                    id: Texture.dirt,
                    settings: 0b1010 //BtIo
                },
                {
                    id: Texture.dirt,
                    settings: 0b1010 //BtIo
                },
                {
                    id: Texture.dirt,
                    settings: 0b1010 //BtIo
                }
            ],
            quads: []
        },
        item: {
            textures: [
                {
                    id: Texture.dirt,
                    settings: 0b1010 //BtIo
                },
                {
                    id: Texture.dirt,
                    settings: 0b1010 //BtIo
                },
                {
                    id: Texture.dirt,
                    settings: 0b1010 //BtIo
                },
                {
                    id: Texture.dirt,
                    settings: 0b1010 //BtIo
                }
            ],
            quads: []
        }
    },
    [Block.glass]: {
        block: {
            textures: [
                {
                    id: Texture.glass,
                    settings: 0b1100 //BTio
                },
                {
                    id: Texture.glass,
                    settings: 0b1100 //BTio
                },
                {
                    id: Texture.glass,
                    settings: 0b1100 //BTio
                },
            ],
            quads: []
        },
        item: {}
    },
    [Block.sapling]: {
        block: {
            textures: [
                {
                    id: Texture.saplingLight,
                    settings: 0b0100 //bTio
                },
                {
                    id: Texture.saplingDark,
                    settings: 0b0110 //bTIo
                }
            ],
            quads: [
                { id: Quad.crossBlock1, texIndex: 0 },
                { id: Quad.crossBlock1, texIndex: 1 },
                { id: Quad.crossBlock2, texIndex: 0 },
                { id: Quad.crossBlock2, texIndex: 1 },
                { id: 0x1F, texIndex: 0 }
            ]
        },
        item: {
            textures: [
                {
                    id: Texture.saplingLight,
                    settings: 0b0100 //bTio
                },
                {
                    id: Texture.saplingDark,
                    settings: 0b0110 //bTIo
                }
            ],
            quads: [
                { id: Quad.crossItem1, texIndex: 0 },
                { id: Quad.crossItem1, texIndex: 1 },
                { id: Quad.crossItem2, texIndex: 0 },
                { id: Quad.crossItem2, texIndex: 1 },
                { id: 0x1F, texIndex: 0 }
            ]
        }
    },
    [Block.table]: {
        block: {
            textures: [
                {
                    id: Texture.tableTop,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.plank,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.tableSide,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.tableSide,
                    settings: 0b1000 //Btio
                }
            ],
            quads: []
        },
        item: {
            textures: [
                {
                    id: Texture.tableTop,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.plank,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.tableSide,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.tableSide,
                    settings: 0b1000 //Btio
                }
            ],
            quads: []
        }
    },
    [Block.furnace]: {
        block: {
            textures: [
                {
                    id: Texture.furnaceTop,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.furnaceTop,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.furnaceSide,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.furnaceFrontOff,
                    settings: 0b1000 //Btio
                },
            ],
            quads: []
        },
        item: {
            textures: [
                {
                    id: Texture.furnaceTop,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.furnaceTop,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.furnaceSide,
                    settings: 0b1000 //Btio
                },
                {
                    id: Texture.furnaceFrontOff,
                    settings: 0b1000 //Btio
                },
            ],
            quads: []
        }
    },
    [Block.chest]: {
        block: {
            textures: [
                {
                    id: Texture.chestTop,
                    settings: 0b1000
                },
                {
                    id: Texture.chestTop,
                    settings: 0b1000
                },
                {
                    id: Texture.chestSide,
                    settings: 0b1000
                },
                {
                    id: Texture.chestFront,
                    settings: 0b1000
                },
            ],
            quads: [
                { id: Quad.smallBlockNegX, texIndex: 2 },
                { id: Quad.smallBlockPosX, texIndex: 2 },
                { id: Quad.smallBlockNegZ, texIndex: 2 },
                { id: Quad.smallBlockPosZ, texIndex: 2 },
                { id: Quad.smallBlockNegY, texIndex: 0 },
                { id: Quad.smallBlockPosY, texIndex: 0 },
                { id: 0x1F, texIndex: 0 }
            ]
        },
        item: {
            textures: [
                {
                    id: Texture.chestTop,
                    settings: 0b1000
                },
                {
                    id: Texture.chestTop,
                    settings: 0b1000
                },
                {
                    id: Texture.chestSide,
                    settings: 0b1000
                },
                {
                    id: Texture.chestFront,
                    settings: 0b1000
                },
            ],
            quads: [
                { id: Quad.smallBlockNegX, texIndex: 2 },
                { id: Quad.smallBlockPosX, texIndex: 2 },
                { id: Quad.smallBlockNegZ, texIndex: 2 },
                { id: Quad.smallBlockPosZ, texIndex: 2 },
                { id: Quad.smallBlockNegY, texIndex: 0 },
                { id: Quad.smallBlockPosY, texIndex: 0 },
                { id: 0x1F, texIndex: 0 }
            ]
        }
    }
};