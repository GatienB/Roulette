
// export interface IBet {
//     value: string,
//     stake: number,
//     proba: string,
//     numbers: number[]
// }

export class Bet {
    value: string;
    coord: Coords;
    stake: number;
    numbers: number[];
    proba: string;
    benef: number;

    constructor(betName: string, stakeValue: number, x: number, y: number) {
        this.value = betName;
        this.coord = { x: x, y: y };
        this.stake = stakeValue;
        this.numbers = [];
        this.proba = "";
        this.benef = 0;
    }
}

export type Coords = {
    x: number, y: number
}
