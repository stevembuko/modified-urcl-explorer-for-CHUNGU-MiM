import { IO_Port } from "../../instructions.js";
import { Block } from "./blockToMesh.js";
export class BlockRAM {
    constructor() {
        this.blockGrid = [
            [
                [Block.stone, Block.stone, Block.stone, Block.stone, Block.stone, Block.stone, Block.stone, Block.grass,],
                [Block.stone, Block.stone, Block.stone, Block.stone, Block.stone, Block.stone, Block.grass, Block.grass,],
                [Block.stone, Block.stone, Block.stone, Block.stone, Block.stone, Block.stone, Block.grass, Block.grass,],
                [Block.stone, Block.stone, Block.stone, Block.stone, Block.stone, Block.stone, Block.grass, Block.grass,],
                [Block.stone, Block.stone, Block.stone, Block.stone, Block.stone, Block.grass, Block.grass, Block.grass,],
                [Block.stone, Block.stone, Block.stone, Block.stone, Block.stone, Block.grass, Block.grass, Block.grass,],
                [Block.stone, Block.stone, Block.stone, Block.stone, Block.grass, Block.grass, Block.grass, Block.grass,],
                [Block.stone, Block.stone, Block.stone, Block.grass, Block.grass, Block.grass, Block.grass, Block.grass,],
            ],
            [
                [Block.stone, Block.stone, Block.stone, Block.stone, Block.grass, Block.grass, Block.grass, Block.air,],
                [Block.stone, Block.stone, Block.stone, Block.grass, Block.grass, Block.grass, Block.air, Block.air,],
                [Block.stone, Block.stone, Block.grass, Block.grass, Block.grass, Block.grass, Block.air, Block.air,],
                [Block.stone, Block.stone, Block.grass, Block.grass, Block.grass, Block.grass, Block.air, Block.air,],
                [Block.stone, Block.grass, Block.grass, Block.grass, Block.grass, Block.air, Block.air, Block.air,],
                [Block.grass, Block.grass, Block.grass, Block.grass, Block.grass, Block.air, Block.air, Block.air,],
                [Block.grass, Block.grass, Block.grass, Block.grass, Block.air, Block.air, Block.air, Block.air,],
                [Block.grass, Block.grass, Block.grass, Block.air, Block.air, Block.air, Block.air, Block.air,],
            ],
            [
                [Block.grass, Block.grass, Block.grass, Block.grass, Block.air, Block.air, Block.air, Block.air,],
                [Block.grass, Block.grass, Block.grass, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.grass, Block.grass, Block.air, Block.air, Block.log, Block.air, Block.air, Block.air,],
                [Block.grass, Block.grass, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.grass, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
            ],
            [
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.log, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
            ],
            [
                [Block.air, Block.air, Block.air, Block.leaves, Block.leaves, Block.leaves, Block.air, Block.air,],
                [Block.air, Block.air, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.air,],
                [Block.air, Block.air, Block.leaves, Block.leaves, Block.log, Block.leaves, Block.leaves, Block.air,],
                [Block.air, Block.air, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.air,],
                [Block.air, Block.air, Block.air, Block.leaves, Block.leaves, Block.leaves, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
            ],
            [
                [Block.air, Block.air, Block.air, Block.leaves, Block.leaves, Block.leaves, Block.air, Block.air,],
                [Block.air, Block.air, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.air,],
                [Block.air, Block.air, Block.leaves, Block.leaves, Block.log, Block.leaves, Block.leaves, Block.air,],
                [Block.air, Block.air, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.air,],
                [Block.air, Block.air, Block.air, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
            ],
            [
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.leaves, Block.leaves, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.leaves, Block.leaves, Block.leaves, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.leaves, Block.leaves, Block.leaves, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
            ],
            [
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.leaves, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.leaves, Block.leaves, Block.leaves, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.leaves, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
                [Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air, Block.air,],
            ]
        ];
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.id = 0;
        this.inputs = {
            [IO_Port.BLOCKRAM_ID]: () => {
                return this.getBlock(this.x, this.y, this.z);
            },
            [IO_Port.BLOCKRAM_ZI]: () => {
                return (this.z << 4) | this.getBlock(this.x, this.y, this.z);
            }
        };
        this.outputs = {
            [IO_Port.BLOCKRAM_XY]: (i) => {
                this.x = i >> 4;
                this.y = i & 0x0F;
            },
            [IO_Port.BLOCKRAM_ZI]: (i) => {
                this.z = i >> 4;
                this.id = i & 0x0F;
            }
        };
    }
    getBlock(x, y, z) {
        if (0 <= x && x < 8) {
            if (0 <= y && y < 8) {
                if (0 <= z && z < 8) {
                    return this.blockGrid[y][7 - z][x];
                }
            }
        }
        return 0;
    }
    setBlock(x, y, z, id) {
        if (0 <= x && x < 8) {
            if (0 <= y && y < 8) {
                if (0 <= z && z < 8) {
                    this.blockGrid[y][7 - z][x] = id;
                }
            }
        }
    }
}