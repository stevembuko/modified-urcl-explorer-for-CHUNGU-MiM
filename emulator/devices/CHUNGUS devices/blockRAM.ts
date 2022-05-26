import { Device } from "../device.js";
import { IO_Port } from "../../instructions.js";
import { Block } from "./blockToMesh.js"

export class BlockRAM implements Device {
    blockGrid:number[][][] = [
        [
            [ Block.stone , Block.stone , Block.stone , Block.stone , Block.stone , Block.stone , Block.stone , Block.grass , ],
            [ Block.stone , Block.stone , Block.stone , Block.stone , Block.stone , Block.stone , Block.grass , Block.grass , ],
            [ Block.stone , Block.stone , Block.stone , Block.stone , Block.stone , Block.stone , Block.grass , Block.grass , ],
    		[ Block.stone , Block.stone , Block.stone , Block.stone , Block.stone , Block.stone , Block.grass , Block.grass , ],
    		[ Block.stone , Block.stone , Block.stone , Block.stone , Block.stone , Block.grass , Block.grass , Block.grass , ],
    		[ Block.stone , Block.stone , Block.stone , Block.stone , Block.stone , Block.grass , Block.grass , Block.grass , ],
    		[ Block.stone , Block.stone , Block.stone , Block.stone , Block.grass , Block.grass , Block.grass , Block.grass , ],
    		[ Block.stone , Block.stone , Block.stone , Block.grass , Block.grass , Block.grass , Block.grass , Block.grass , ],
        ],
        [
    		[ Block.stone , Block.stone , Block.stone , Block.stone , Block.grass , Block.grass , Block.grass , Block.air   , ],
    		[ Block.stone , Block.stone , Block.stone , Block.grass , Block.grass , Block.grass , Block.air   , Block.air   , ],
    		[ Block.stone , Block.stone , Block.grass , Block.grass , Block.grass , Block.grass , Block.air   , Block.air   , ],
    		[ Block.stone , Block.stone , Block.grass , Block.grass , Block.grass , Block.grass , Block.air   , Block.air   , ],
    		[ Block.stone , Block.grass , Block.grass , Block.grass , Block.grass , Block.air   , Block.air   , Block.air   , ],
    		[ Block.grass , Block.grass , Block.grass , Block.grass , Block.grass , Block.air   , Block.air   , Block.air   , ],
    		[ Block.grass , Block.grass , Block.grass , Block.grass , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.grass , Block.grass , Block.grass , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
        ],
        [
    		[ Block.grass , Block.grass , Block.grass , Block.grass , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.grass , Block.grass , Block.grass , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.grass , Block.grass , Block.air   , Block.air   , Block.log   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.grass , Block.grass , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.grass , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
        ],
        [
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.log   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
        ],
        [
    		[ Block.air   , Block.air   , Block.air   , Block.leaves, Block.leaves, Block.leaves, Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.air   , ],
    		[ Block.air   , Block.air   , Block.leaves, Block.leaves, Block.log   , Block.leaves, Block.leaves, Block.air   , ],
    		[ Block.air   , Block.air   , Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.leaves, Block.leaves, Block.leaves, Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
        ],
        [
    		[ Block.air   , Block.air   , Block.air   , Block.leaves, Block.leaves, Block.leaves, Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.air   , ],
    		[ Block.air   , Block.air   , Block.leaves, Block.leaves, Block.log   , Block.leaves, Block.leaves, Block.air   , ],
    		[ Block.air   , Block.air   , Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.leaves, Block.leaves, Block.leaves, Block.leaves, Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
        ],
        [
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.leaves, Block.leaves, Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.leaves, Block.leaves, Block.leaves, Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.leaves, Block.leaves, Block.leaves, Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
        ],
        [
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.leaves, Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.leaves, Block.leaves, Block.leaves, Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.leaves, Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
    		[ Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , Block.air   , ],
        ]
    ];
    x = 0;
    y = 0;
    z = 0;
    id = 0;
    constructor() {

    }
    inputs = { //TODO ensure all ports properly supported
        [IO_Port.BLOCKRAM_ID]: () => {
            return this.getBlock(this.x, this.y, this.z);
        },
        [IO_Port.BLOCKRAM_ZI]: () => {
            return (this.z << 4) | this.getBlock(this.x, this.y, this.z);
        }
    }
    outputs = {
        [IO_Port.BLOCKRAM_XY]: (i:number) => {
            this.x = i >> 4;
            this.y = i & 0x0F;
        },
        [IO_Port.BLOCKRAM_ZI]: (i:number) => {
            this.z = i >> 4;
            this.id = i & 0x0F;
        }
    }

	public getBlock(x:number, y:number, z:number):number {
		if (0 <= x && x < 8) {
			if (0 <= y && y < 8) {
				if (0 <= z && z < 8) {
					return this.blockGrid[y][7-z][x];
				}
			}
		}
		return 0;
	}

	public setBlock(x:number, y:number, z:number, id:number) {
		if (0 <= x && x < 8) {
			if (0 <= y && y < 8) {
				if (0 <= z && z < 8) {
					this.blockGrid[y][7-z][x] = id;
				}
			}
		}
	}
}