import { Device } from "../device.js";
import { IO_Port } from "../../instructions.js";
import { BlockRAM } from "./blockRAM.js";
import { Amogus } from "./amogus.js";

export class BlockToMesh implements Device {
    blockRAM:BlockRAM | undefined = undefined;
    amogus:Amogus | undefined = undefined;
    constructor(blockRam:BlockRAM, amogus:Amogus) {
        this.blockRAM = blockRam;
        this.amogus = amogus;
    }
    blockX = 0;
    blockY = 0;
    blockZ = 0;
    blockID = 0;
    breakPhase = 0;
    outputs = {
        [IO_Port.MESHGEN_XY]: (i:number) => {
            this.blockX = i >> 4;
            this.blockY = i & 0xF;
        },
        [IO_Port.MESHGEN_ZI]: (i:number) => {
            this.blockZ = i >> 4;
            this.blockID = i & 0xF;
        },
        [IO_Port.MESHGEN_BREAKPHASE]: (i:number) => {
            this.breakPhase = i;
        },
        //TODO: item output ports
    }
    inputs = {
        [IO_Port.MESHGEN_RENDERBLOCK]: () => {
            //TODO: render block
            return 0;
        },
        [IO_Port.MESHGEN_RENDERSCENE]: () => {
            //TODO: render scene
            return 0;
        },
        //TODO: render item
    }
}