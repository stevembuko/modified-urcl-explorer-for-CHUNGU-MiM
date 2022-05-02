import { Device } from "../device.js";
import { IO_Port } from "../../instructions.js";

export class PlayerInput implements Device {
    constructor () {
        
    }
    inputs = {
        [IO_Port.PI1]: () => {
            return 0; //TODO
        },
        [IO_Port.PI2]: () => {
            return 0; //TODO
        }
    }
}