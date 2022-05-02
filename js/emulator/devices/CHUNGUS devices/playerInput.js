import { IO_Port } from "../../instructions.js";
export class PlayerInput {
    constructor() {
        this.inputs = {
            [IO_Port.PI1]: () => {
                return 0; //TODO
            },
            [IO_Port.PI2]: () => {
                return 0; //TODO
            }
        };
    }
}