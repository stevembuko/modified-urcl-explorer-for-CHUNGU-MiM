import { IO_Port } from "../../instructions.js";
//TODO import screen
export class Amogus {
    constructor() {
        this.camX = 0;
        this.camY = 0;
        this.camZ = 0;
        this.camMatrix = [];
        this.currentVertex = new Vertex();
        this.quad = [new Vertex(), new Vertex(), new Vertex(), new Vertex()];
        this.texture = {
            transparent: false,
            inverted: false,
            overlay: false,
            id: 0
        };
        this.settings = {
            cullBackface: true
        };
        this.outputs = {
            [IO_Port.AMOGUS_CAMX]: (i) => {
                this.camX = i;
            },
            [IO_Port.AMOGUS_CAMY]: (i) => {
                this.camY = i;
            },
            [IO_Port.AMOGUS_CAMZ]: (i) => {
                this.camZ = i;
            },
            [IO_Port.AMOGUS_CAMROT]: (i) => {
                this.camMatrix = this.CamRotToMatrix(i >> 4, i & 0xF);
            },
            [IO_Port.AMOGUS_VERTX]: (i) => {
                this.currentVertex.x = i;
            },
            [IO_Port.AMOGUS_VERTY]: (i) => {
                this.currentVertex.y = i;
            },
            [IO_Port.AMOGUS_VERTZ]: (i) => {
                this.currentVertex.z = i;
            },
            [IO_Port.AMOGUS_VERTUV]: (i) => {
                this.currentVertex.u = i >> 4;
                this.currentVertex.v = i & 0xF;
            },
            [IO_Port.AMOGUS_TEX]: (i) => {
                this.texture.transparent = (i & 0x80) != 0;
                this.texture.inverted = (i & 0x40) != 0;
                this.texture.overlay = (i & 0x20) != 0;
                this.texture.id = i & 0x0F;
            },
            [IO_Port.AMOGUS_SETTINGS]: (i) => {
                this.settings.cullBackface = (i & 0x80) != 0;
            }
        };
        this.inputs = {
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
        };
        this.operations = 0;
    }
    CamRotToMatrix(pitchIndex, yawIndex) {
        let c = Math.PI * 2 * (pitchIndex / 16);
        let b = Math.PI * 2 * (yawIndex / 16);
        let sin = (ang) => {
            return this.FixedPointNumber(Math.abs(Math.sin(ang)), 16, 14) * (Math.sin(ang) > 0 ? 1 : -1);
        };
        let cos = (ang) => {
            return this.FixedPointNumber(Math.abs(Math.cos(ang)), 16, 14) * (Math.cos(ang) > 0 ? 1 : -1);
        };
        return [
            [cos(c), 0, sin(c)],
            [sin(b) * sin(c), cos(b), -sin(b) * cos(c)],
            [-cos(b) * sin(c), sin(b), cos(b) * cos(c)]
        ];
    }
    world_to_cam(vertex) {
        var ovx, ovy, ovz, vx, vy, vz;
        ovx = vertex.x - this.camX;
        ovy = vertex.y - this.camY;
        ovz = vertex.z - this.camZ;
        vx = this.FixedPointNumber(this.camMatrix[0][0] * ovx + this.camMatrix[0][1] * ovy + this.camMatrix[0][2] * ovz, 16, 11, true);
        vy = this.FixedPointNumber(this.camMatrix[1][0] * ovx + this.camMatrix[1][1] * ovy + this.camMatrix[1][2] * ovz, 16, 11, true);
        vz = this.FixedPointNumber(16 * (this.camMatrix[2][0] * ovx + this.camMatrix[2][1] * ovy + this.camMatrix[2][2] * ovz), 16, 7, true);
        return new Vertex(vx, vy, vz, vertex.u, vertex.v);
    }
    FixedPointNumber(value, bits, precision, signed = false, f = false) {
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
    constructor(x = 0, y = 0, z = 0, u = 0, v = 0) {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.u = 0;
        this.v = 0;
        this.x = x;
        this.y = y;
        this.z = z;
        this.u = u;
        this.v = v;
    }
}
;