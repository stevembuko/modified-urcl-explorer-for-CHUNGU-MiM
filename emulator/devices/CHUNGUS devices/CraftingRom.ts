import { Device } from "../device.js";
import { IO_Port } from "../../instructions.js";

export class CraftingRom implements Device {
    recipes: any = {};
    mode:number = 0;
    currentRecipe:string = "000000000"; //use string because 9 hex values just barely don't fit into 32 bits
    constructor () {
        //smelting recipes
        this.recipes[Ingredients.cobble] = Results.stone;
        this.recipes[Ingredients.log] = Results.coal;
        this.recipes[Ingredients.ironOre] = Results.ironIngot;

        //crafting recipes
        this.recipes["770770000"] = Results.table; //TODO add other locations
        this.recipes["500000000"] = Results.plank; //TODO add other locations
        this.recipes["444404444"] = Results.furnace;
        this.recipes["700700000"] = Results.stick; //TODO add other locations

        this.recipes["7770E00E0"] = Results.woodPick;
        this.recipes["3330E00E0"] = Results.stonePick;
        this.recipes["DDD0E00E0"] = Results.ironPick;

        this.recipes["7707E00E0"] = Results.woodAxe;
        this.recipes["07707E00E"] = Results.woodAxe;
        this.recipes["3303E00E0"] = Results.stoneAxe;
        this.recipes["03303E00E"] = Results.stoneAxe;
        this.recipes["DD0DE00E0"] = Results.ironAxe;
        this.recipes["0DD0DE00E"] = Results.ironAxe;

        this.recipes["0700E00E0"] = Results.woodShovel;
        this.recipes["700E00E00"] = Results.woodShovel;
        this.recipes["00700E00E"] = Results.woodShovel;
        this.recipes["0300E00E0"] = Results.stoneShovel;
        this.recipes["300E00E00"] = Results.stoneShovel;
        this.recipes["00300E00E"] = Results.stoneShovel;
        this.recipes["0D00E00E0"] = Results.ironShovel;
        this.recipes["00D00E00E"] = Results.ironShovel;
        this.recipes["D00E00E00"] = Results.ironShovel;

        this.recipes["0700700E0"] = Results.woodSword;
        this.recipes["00700700E"] = Results.woodSword;
        this.recipes["700700E00"] = Results.woodSword;
        this.recipes["0300300E0"] = Results.stoneSword;
        this.recipes["00300300E"] = Results.stoneSword;
        this.recipes["300300E00"] = Results.stoneSword;
        this.recipes["0D00D00E0"] = Results.ironSword;
        this.recipes["00D00D00E"] = Results.ironSword;
        this.recipes["D00D00E00"] = Results.ironSword;

        this.recipes["0D0D00000"] = Results.shears; //TODO add other locations
    };
    inputs = {
        [IO_Port.CRAFTROM]: () => {
            if (this.mode == Mode.crafting) {
                return this.recipes[this.currentRecipe.toUpperCase()] ?? 0
            } else {
                return this.recipes[this.currentRecipe.substring(8, 9).toUpperCase()] ?? 0
            }
        }
    };
    outputs = {
        [IO_Port.CRAFTROM]: (i: number) => {
            switch (i) {
                case Ingredients.table:
                    this.mode = Mode.crafting;
                    break;
                case Ingredients.furnace:
                    this.mode = Mode.smelting;
                    break;
                default:
                    this.currentRecipe = this.currentRecipe.substring(1, 9) + (i >> 4).toString(16);
            }
        }
    };
}

enum Mode { crafting, smelting };

enum Ingredients {
    air, //0x0
    nonstackable, //0x1
    dirt, //0x2
    stone, //0x3
    cobble, //0x4
    log, //0x5
    leaves, //0x6
    plank, //0x7
    table, //0x8
    coal, //0x9
    ironOre, //0xA
    sapling, //0xB
    furnace, //0xC
    ironIngot, //0xD
    stick, //0xE
    apple //0xF
}

enum Results {
    stone = 0x31,
    plank = 0x74,
    table = 0x81,
    coal = 0x91,
    furnace = 0xC1,
    ironIngot = 0xD1,
    stick = 0xE4,
    woodPick = 0x10,
    woodAxe = 0x11,
    woodShovel = 0x12,
    woodSword = 0x13,
    stonePick = 0x14,
    stoneAxe = 0x15,
    stoneShovel = 0x16,
    stoneSword = 0x17,
    ironPick = 0x18,
    ironAxe = 0x19,
    ironShovel = 0x1A,
    ironSword = 0x1B,
    shears = 0x1C,
}