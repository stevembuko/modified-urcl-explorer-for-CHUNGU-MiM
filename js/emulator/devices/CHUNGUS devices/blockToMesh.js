import { IO_Port } from "../../instructions.js";
export class BlockToMesh {
    constructor(blockRam, amogus) {
        this.blockRAM = undefined;
        this.amogus = undefined;
        this.blockX = 0;
        this.blockY = 0;
        this.blockZ = 0;
        this.blockID = 0;
        this.breakPhase = 0;
        this.outputs = {
            [IO_Port.MESHGEN_XY]: (i) => {
                this.blockX = i >> 4;
                this.blockY = i & 0xF;
            },
            [IO_Port.MESHGEN_ZI]: (i) => {
                this.blockZ = i >> 4;
                this.blockID = i & 0xF;
            },
            [IO_Port.MESHGEN_BREAKPHASE]: (i) => {
                this.breakPhase = i;
            },
            //TODO: item output ports
        };
        this.inputs = {
            [IO_Port.MESHGEN_RENDERBLOCK]: () => {
                //TODO: render block
                return 0;
            },
            [IO_Port.MESHGEN_RENDERSCENE]: () => {
                //TODO: render scene
                return 0;
            },
            //TODO: render item
        };
        this.blockRAM = blockRam;
        this.amogus = amogus;
    }
}