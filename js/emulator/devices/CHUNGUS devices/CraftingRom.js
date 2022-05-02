import { IO_Port } from "../../instructions.js";
export class CraftingRom {
    constructor() {
        this.recipes = {};
        this.mode = 0;
        this.currentRecipe = "000000000"; //use string because 9 hex values just barely don't fit into 32 bits
        this.inputs = {
            [IO_Port.CRAFTROM]: () => {
                var _a, _b;
                if (this.mode == Mode.crafting) {
                    return (_a = this.recipes[this.currentRecipe.toUpperCase()]) !== null && _a !== void 0 ? _a : 0;
                }
                else {
                    return (_b = this.recipes[this.currentRecipe.substring(8, 9).toUpperCase()]) !== null && _b !== void 0 ? _b : 0;
                }
            }
        };
        this.outputs = {
            [IO_Port.CRAFTROM]: (i) => {
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
    }
    ;
}
var Mode;
(function (Mode) {
    Mode[Mode["crafting"] = 0] = "crafting";
    Mode[Mode["smelting"] = 1] = "smelting";
})(Mode || (Mode = {}));
;
var Ingredients;
(function (Ingredients) {
    Ingredients[Ingredients["air"] = 0] = "air";
    Ingredients[Ingredients["nonstackable"] = 1] = "nonstackable";
    Ingredients[Ingredients["dirt"] = 2] = "dirt";
    Ingredients[Ingredients["stone"] = 3] = "stone";
    Ingredients[Ingredients["cobble"] = 4] = "cobble";
    Ingredients[Ingredients["log"] = 5] = "log";
    Ingredients[Ingredients["leaves"] = 6] = "leaves";
    Ingredients[Ingredients["plank"] = 7] = "plank";
    Ingredients[Ingredients["table"] = 8] = "table";
    Ingredients[Ingredients["coal"] = 9] = "coal";
    Ingredients[Ingredients["ironOre"] = 10] = "ironOre";
    Ingredients[Ingredients["sapling"] = 11] = "sapling";
    Ingredients[Ingredients["furnace"] = 12] = "furnace";
    Ingredients[Ingredients["ironIngot"] = 13] = "ironIngot";
    Ingredients[Ingredients["stick"] = 14] = "stick";
    Ingredients[Ingredients["apple"] = 15] = "apple"; //0xF
})(Ingredients || (Ingredients = {}));
var Results;
(function (Results) {
    Results[Results["stone"] = 49] = "stone";
    Results[Results["plank"] = 116] = "plank";
    Results[Results["table"] = 129] = "table";
    Results[Results["coal"] = 145] = "coal";
    Results[Results["furnace"] = 193] = "furnace";
    Results[Results["ironIngot"] = 209] = "ironIngot";
    Results[Results["stick"] = 228] = "stick";
    Results[Results["woodPick"] = 16] = "woodPick";
    Results[Results["woodAxe"] = 17] = "woodAxe";
    Results[Results["woodShovel"] = 18] = "woodShovel";
    Results[Results["woodSword"] = 19] = "woodSword";
    Results[Results["stonePick"] = 20] = "stonePick";
    Results[Results["stoneAxe"] = 21] = "stoneAxe";
    Results[Results["stoneShovel"] = 22] = "stoneShovel";
    Results[Results["stoneSword"] = 23] = "stoneSword";
    Results[Results["ironPick"] = 24] = "ironPick";
    Results[Results["ironAxe"] = 25] = "ironAxe";
    Results[Results["ironShovel"] = 26] = "ironShovel";
    Results[Results["ironSword"] = 27] = "ironSword";
    Results[Results["shears"] = 28] = "shears";
})(Results || (Results = {}));