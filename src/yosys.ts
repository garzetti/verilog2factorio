import * as fs from "fs";
import { exec } from "child_process";

import { logger } from "./logger.js";

interface IDict<T> {
    [index: string]: T;
}

export interface Port {
    direction: "input" | "output";
    bits: number[];
}

type Conn = (number | string)[];

export interface CellBase {
    hide_name: number;
    type: string;
    parameters: IDict<number | string>;
    attributes: {
        src: string;
        full_case?: string;
    };
    port_directions: IDict<"input" | "output">;
    connections: any;
}
export interface UnaryCell extends CellBase {
    type: "$not" | "$pos" | "$neg" | "$reduce_and" | "$reduce_or" | "$reduce_xor" | "$reduce_xnor" | "$reduce_bool" | "$logic_not";
    parameters: {
        A_SIGNED: number;
        A_WIDTH: number;
        Y_WIDTH: number;
    };
    connections: {
        A: Conn;
        Y: number[];
    };
}
export interface BinaryCell extends CellBase {
    type: "$and" | "$or" | "$xor" | "$xnor" | "$shl" | "$shr" | "$sshl" | "$sshr" | "$logic_and" | "$logic_or" | "$eqx" | "$nex" | "$lt" | "$le" | "$eq" | "$ne" | "$ge" | "$gt" | "$add" | "$sub" | "$mul" | "$div" | "$mod" | "$pow";
    parameters: {
        A_SIGNED: number;
        A_WIDTH: number;
        B_SIGNED: number;
        B_WIDTH: number;
        Y_WIDTH: number;
    };
    port_directions: {
        A: "input";
        B: "input";
        Y: "output";
    };
    connections: {
        A: Conn;
        B: Conn;
        Y: number[];
    };
}

// == Multiplexers ==
export interface Mux extends CellBase {
    type: "$mux";
    parameters: {
        WIDTH: number;
    };
    connections: {
        A: Conn;
        B: Conn;
        S: Conn;
        Y: number[];
    };
}

export interface PMux extends CellBase {
    type: "$pmux";
    parameters: {
        WIDTH: number;
        S_WIDTH: number;
    };
    connections: {
        A: Conn;
        B: Conn;
        S: Conn;
        Y: number[];
    };
}

// == Registers ==
export interface SR extends CellBase {
    type: "$sr";
    parameters: {
        WIDTH: number;
        SET_POLARITY: number;
        CLR_POLARITY: number;
    };
    connections: {
        SET: Conn;
        CLR: Conn;
        Q: number[];
    };
}
export interface Dff extends CellBase {
    type: "$dff";
    parameters: {
        WIDTH: number;
        CLK_POLARITY: number;
    };
    connections: {
        CLK: Conn;
        D: Conn;
        Q: number[];
    };
}
export interface ADff extends CellBase {
    type: "$adff";
    parameters: {
        WIDTH: number;
        CLK_POLARITY: number;
        ARST_POLARITY: number;
        ARST_VALUE: number;
    };
    connections: {
        CLK: Conn;
        D: Conn;
        ARST: Conn;
        Q: number[];
    };
}
export interface SDff extends CellBase {
    type: "$sdff";
    parameters: {
        WIDTH: number;
        CLK_POLARITY: number;
        SRST_POLARITY: number;
        SRST_VALUE: number;
    };
    connections: {
        CLK: Conn;
        D: Conn;
        SRST: Conn;
        Q: number[];
    };
}
export interface Dffsr extends CellBase {
    type: "$dffsr";
    parameters: {
        WIDTH: number;
        CLK_POLARITY: number;
        SET_POLARITY: number;
        CLR_POLARITY: number;
    };
    connections: {
        CLK: Conn;
        D: Conn;
        SET: Conn;
        CLR: Conn;
        Q: number[];
    };
}

// same as the ones before but with added enable
export interface Dffe extends CellBase {
    type: "$dffe";
    parameters: {
        WIDTH: number;
        CLK_POLARITY: number;
        EN_POLARITY: number;
    };
    connections: {
        CLK: Conn;
        D: Conn;
        EN: Conn;
        Q: number[];
    };
}
export interface ADffe extends CellBase {
    type: "$adffe";
    parameters: {
        WIDTH: number;
        CLK_POLARITY: number;
        EN_POLARITY: number;
        ARST_POLARITY: number;
        ARST_VALUE: number;
    };
    connections: {
        CLK: Conn;
        D: Conn;
        EN: Conn;
        ARST: Conn;
        Q: number[];
    };
}
export interface SDffe extends CellBase {
    type: "$sdffe" | "$sdffce";
    parameters: {
        WIDTH: number;
        CLK_POLARITY: number;
        EN_POLARITY: number;
        SRST_POLARITY: number;
        SRST_VALUE: number;
    };
    connections: {
        CLK: Conn;
        D: Conn;
        EN: Conn;
        SRST: Conn;
        Q: number[];
    };
}
export interface Dffsre extends CellBase {
    type: "$dffsre";
    parameters: {
        WIDTH: number;
        CLK_POLARITY: number;
        EN_POLARITY: number;
        SET_POLARITY: number;
        CLR_POLARITY: number;
    };
    connections: {
        CLK: Conn;
        D: Conn;
        EN: Conn;
        SET: Conn;
        CLR: Conn;
        Q: number[];
    };
}

export interface Mem extends CellBase {
    type: "$mem_v2";
    parameters: {
        MEMID: string;
        SIZE: number;
        ABITS: number;
        WIDTH: number;
        INIT: string;
        OFFSET: number;

        RD_PORTS: number;
        RD_WIDE_CONTINUATION: number;
        RD_CLK_ENABLE: number;
        RD_CLK_POLARITY: number;
        RD_TRANSPARENCY_MASK: number;
        RD_COLLISION_X_MASK: number;
        RD_CE_OVER_SRST: number;

        RD_INIT_VALUE: string;
        RD_ARST_VALUE: string;
        RD_SRST_VALUE: string;

        WR_PORTS: number;
        WR_WIDE_CONTINUATION: number;
        WR_CLK_ENABLE: number;
        WR_CLK_POLARITY: number;
        WR_PRIORITY_MASK: number;
    };
    connections: {
        RD_CLK: Conn;
        RD_EN: Conn;
        RD_ADDR: Conn;
        RD_DATA: number[];
        RD_ARST: Conn;
        RD_SRST: Conn;

        WR_CLK: Conn;
        WR_EN: Conn;
        WR_ADDR: Conn;
        WR_DATA: Conn;
    }
}

export interface Print extends CellBase { 
    type: "$print";
}

export type Cell = UnaryCell | BinaryCell |
    Mux | PMux |
    SR | Dff | ADff | SDff | Dffsr |
    Dffe | ADffe | SDffe | Dffsre |
    Mem | Print;

export interface Module {
    attributes: IDict<string>;
    parameter_default_values?: IDict<string>;

    ports: IDict<Port>;
    cells: IDict<Cell>;
    netnames: IDict<Object>;

}

export interface YosysData {
    creator: string;
    modules: IDict<Module>;
}


function execYosys(files: string[], command: string): Promise<YosysData> {

    const proc_ghdl = exec(`ghdl -a "${files.join(' ')}"`);


    proc_ghdl.stderr.on("data", (data) => {
        logger.log(data);
    });
    proc_ghdl.on("exit", (code) => {
        if (code != 0) {
            throw new Error("An error occurred while GHDL tried to analyze your code.");
        }
    });


    const proc = exec(`yosys -m ghdl -o temp.json ${command}`);
    console.log("Eseguo yosys -m ghdl -o temp.json " + command);
    return new Promise(res => {
        proc.stderr.on("data", (data) => {
            logger.log(data);
        });
        proc.on("exit", (code) => {
            if (code != 0) {
                throw new Error("An error occurred while yosys tried to compile your code.");
            }
            const data = JSON.parse(fs.readFileSync("./temp.json", 'utf8'));
            fs.unlinkSync("temp.json");
            console.log(JSON.stringify(data));
            res(data);
        });
    })
}

export async function genNetlist(files: string[]): Promise<YosysData> {
    for (const file of files) {
        if (!fs.existsSync(file)) {
            logger.log(`error: file ${file} not found`);
        }
    }

    let first = await execYosys(files, `-p "ghdl; proc"`); // run empty pass to find all module names
    let modules = Object.keys(first.modules);//.map(x => x.substring(10));

    console.log("Moduli: " + modules);
    console.log("First: " + first.modules);

    let res: YosysData = {
        creator: first.creator,
        modules: {}
    };
    console.log("Cacca");
    const commands = "ghdl; proc; flatten; wreduce; opt; fsm; opt; memory -nomap -nordff; opt; muxpack; peepopt; async2sync; wreduce; opt -mux_bool";
    for (const module of modules) {
        try {
            console.log("Caccona " + module);
            const proc = await execYosys(files, `-p "${commands}"`); //-r "${module}"`);
            res.modules[module] = proc.modules[module];
        } catch (e) {
            console.warn(`Failed to elaborate design for module "${module}"`);
        }
    }
    return res;
}
