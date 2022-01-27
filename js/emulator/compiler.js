import { Constants, Header_Run, Operant_Prim, Operant_Type, URCL_Header } from "./instructions.js";
export function compile(parsed) {
    const { headers, opcodes, operant_types, operant_values, instr_line_nrs, lines } = parsed;
    const in_ram = parsed.headers[URCL_Header.RUN]?.value === Header_Run.RAM;
    const header_bits = parsed.headers[URCL_Header.BITS].value;
    const bits = header_bits <= 8 ? 8 :
        header_bits <= 16 ? 16 :
            header_bits <= 32 ? 32 : undefined;
    if (bits === undefined) {
        throw new Error("bits must be below 32");
    }
    const msb = 1 << (bits - 1);
    const smsb = 1 << (bits - 2);
    const max = 0xFF_FF_FF_FF >>> (32 - bits);
    const smax = max >>> 1;
    const uhalf = max & (max << (bits / 2));
    const lhalf = max - uhalf;
    const minreg = headers[URCL_Header.MINREG].value;
    const minheap = headers[URCL_Header.MINHEAP].value;
    const minstack = headers[URCL_Header.MINSTACK].value;
    const new_operant_values = operant_values.map(vals => vals.slice());
    const new_operant_types = operant_types.map((types, i) => types.map((t, j) => {
        switch (t) {
            case Operant_Type.Reg: return Operant_Prim.Reg;
            case Operant_Type.Imm: return Operant_Prim.Imm;
            case Operant_Type.Label: return Operant_Prim.Imm;
            case Operant_Type.String: return Operant_Prim.Reg;
            case Operant_Type.Memory: {
                new_operant_values[i][j] += parsed.data.length;
                return Operant_Prim.Imm;
            }
            case Operant_Type.Data_Label: return Operant_Prim.Imm;
            case Operant_Type.Constant: {
                const vals = new_operant_values[i];
                const constant = vals[j];
                switch (constant) {
                    case Constants.BITS:
                        vals[j] = bits;
                        break;
                    case Constants.MSB:
                        vals[j] = msb;
                        break;
                    case Constants.SMSB:
                        vals[j] = smsb;
                        break;
                    case Constants.MAX:
                        vals[j] = max;
                        break;
                    case Constants.SMAX:
                        vals[j] = smax;
                        break;
                    case Constants.UHALF:
                        vals[j] = uhalf;
                        break;
                    case Constants.LHALF:
                        vals[j] = lhalf;
                        break;
                    case Constants.MINREG:
                        vals[j] = minreg;
                        break;
                    case Constants.MINHEAP:
                        vals[j] = minheap;
                        break;
                    case Constants.MINSTACK:
                        vals[j] = minstack;
                        break;
                    default: throw new Error(`Unsupported constant ${constant} ${Constants[constant]}`);
                }
                return Operant_Prim.Imm;
            }
            default: throw new Error(`Unkown opperant type ${t} ${Operant_Type[t]}`);
        }
    }));
    return [
        { headers, opcodes, operant_prims: new_operant_types, operant_values: new_operant_values, data: parsed.data },
        { pc_line_nrs: instr_line_nrs, lines }
    ];
}
function program_to_bytecode(parsed, inst_sizeof = (opcode) => 5) {
    const operant_types = parsed.operant_types;
    const [{ headers, opcodes, operant_prims, operant_values, data }, { lines }] = compile(parsed);
    const pc_line_nrs = [];
    const instr_pc = [];
    let pc = 0;
    for (let inst_i = 0; inst_i < parsed.opcodes.length; inst_i++) {
        pc_line_nrs[pc] = parsed.instr_line_nrs[inst_i];
        instr_pc[inst_i] = pc;
        const opcode = parsed.opcodes[inst_i];
        pc += inst_sizeof(opcode);
    }
    const heap_start = pc;
    for (let inst_i = 0; inst_i < parsed.opcodes.length; inst_i++) {
        const types = operant_types[inst_i];
        const value = operant_values[inst_i];
        for (let i = 0; i < types.length; i++) {
            switch (types[i]) {
                case Operant_Type.Label:
                    value[i] = instr_pc[value[i]];
                    break;
                case Operant_Type.Memory:
                    value[i] += heap_start;
                    break;
            }
        }
    }
    return [
        {
            headers, opcodes,
            operant_prims,
            operant_values,
            data
        },
        { pc_line_nrs, lines }
    ];
}
//# sourceMappingURL=compiler.js.map