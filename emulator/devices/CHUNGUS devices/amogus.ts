import { Device } from "../device.js";
import { IO_Port } from "../../instructions.js";
//TODO import screen

export class Amogus implements Device {
    camX = 0;
    camY = 0;
    camZ = 0;
    camMatrix:number[][] = [];
    currentVertex:Vertex = new Vertex();
    quad:Vertex[] = [new Vertex(), new Vertex(), new Vertex(), new Vertex()];
    texture = {
        transparent: false,
        inverted: false,
        overlay: false,
        id: 0
    };
    settings = {
        cullBackface: true
    }
    outputs = {
        [IO_Port.AMOGUS_CAMX]: (i:number) => {
            this.camX = i;
        },
        [IO_Port.AMOGUS_CAMY]: (i:number) => {
            this.camY = i;
        },
        [IO_Port.AMOGUS_CAMZ]: (i:number) => {
            this.camZ = i;
        },
        [IO_Port.AMOGUS_CAMROT]: (i:number) => {
            this.camMatrix = this.CamRotToMatrix(i >> 4, i & 0xF);
        },
        [IO_Port.AMOGUS_VERTX]: (i:number) => {
            this.currentVertex.x = i;
        },
        [IO_Port.AMOGUS_VERTY]: (i:number) => {
            this.currentVertex.y = i;
        },
        [IO_Port.AMOGUS_VERTZ]: (i:number) => {
            this.currentVertex.z = i;
        },
        [IO_Port.AMOGUS_VERTUV]: (i:number) => {
            this.currentVertex.u = i >> 4;
            this.currentVertex.v = i & 0xF;
        },
        [IO_Port.AMOGUS_TEX]: (i:number) => {
            this.texture.transparent = (i & 0x80) != 0;
            this.texture.inverted = (i & 0x40) != 0;
            this.texture.overlay = (i & 0x20) != 0;
            this.texture.id = i & 0x0F;
        },
        [IO_Port.AMOGUS_SETTINGS]: (i:number) => {
            this.settings.cullBackface = (i & 0x80) != 0;
        }
    }
    inputs = {
        [IO_Port.AMOGUS_CAMDIRX]: () => {
            return this.camMatrix[2][0];
        },
        [IO_Port.AMOGUS_CAMDIRY]: () => {
            return this.camMatrix[2][1];
        },
        [IO_Port.AMOGUS_CAMDIRZ]: () => {
            return this.camMatrix[2][2];
        },
        [IO_Port.AMOGUS_SUBMITVERT]: () => {
            this.quad.shift();
            this.quad.push(this.world_to_cam(this.currentVertex));
            return 0;
        },
        [IO_Port.AMOGUS_DRAWQUAD]: () => {
            //TODO
            return 0;
        },
        [IO_Port.AMOGUS_CLEARBUFFER]: () => {
            //TODO
            return 0;
        }
    }

    CamRotToMatrix(pitchIndex:number, yawIndex:number):number[][] {
        let c = Math.PI * 2 * (pitchIndex / 16);
        let b = Math.PI * 2 * (yawIndex / 16);

        let sin = (ang:number) => {
            return this.FixedPointNumber(Math.abs(Math.sin(ang)), 16, 14) * (Math.sin(ang) > 0 ? 1 : -1);
        };

        let cos = (ang:number) => {
            return this.FixedPointNumber(Math.abs(Math.cos(ang)), 16, 14) * (Math.cos(ang) > 0 ? 1 : -1);
        };

        return [
            [cos(c),            0,      sin(c)          ],
            [sin(b) * sin(c),   cos(b), -sin(b) * cos(c)],
            [-cos(b) * sin(c),  sin(b), cos(b) * cos(c) ]
        ]
    }

    world_to_cam(vertex:Vertex) {
        var ovx, ovy, ovz, vx, vy, vz;
      
        ovx = vertex.x - this.camX;
        ovy = vertex.y - this.camY;
        ovz = vertex.z - this.camZ;
        vx = this.FixedPointNumber(this.camMatrix[0][0] * ovx + this.camMatrix[0][1] * ovy + this.camMatrix[0][2] * ovz, 16, 11, true );
        vy = this.FixedPointNumber(this.camMatrix[1][0] * ovx + this.camMatrix[1][1] * ovy + this.camMatrix[1][2] * ovz, 16, 11, true );
        vz = this.FixedPointNumber(16 * (this.camMatrix[2][0] * ovx + this.camMatrix[2][1] * ovy + this.camMatrix[2][2] * ovz), 16, 7, true );
        return new Vertex(vx, vy, vz, vertex.u, vertex.v);
    }

    operations:number = 0;
    FixedPointNumber(value:number, bits:number, precision:number, signed = false, f = false) {
        this.operations += 1;
        let bitmask = (1 << bits) - 1;
        let shiftamount = 1 << precision;
        value = Math.floor(value * shiftamount) & bitmask;

        if (signed && value > 1 << bits - 1) {
            return (value - (1 << bits)) / shiftamount;
        }

        return value / shiftamount;
    }

}

class Vertex {
    constructor(x:number = 0, y:number = 0, z:number = 0, u:number = 0, v:number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.u = u;
        this.v = v;
    }
    x = 0;
    y = 0;
    z = 0;
    u = 0;
    v = 0;
};