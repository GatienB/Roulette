import { PositionEnum } from "./position.enum"

export class Bet {
    id: string;
    sqrId: string;
    numbers: number[];
    chip: ChipData;
    stake: number;
    proba: string;
    benef: number;

    constructor(id: string, sqrId: string, numbers: number[], stake: number, chip: ChipData) {
        this.id = id;
        this.sqrId = sqrId;
        this.numbers = numbers.slice();
        this.stake = stake;
        this.chip = chip;
        this.proba = "";
        this.benef = 0;

        this.setBetProba();
    }

    addStake(stake: number) {
        this.stake += stake;
        this.setBetProba();
    }

    setBetProba() {
        if (this.numbers.length === 24) {
            this.proba = '1/2';
            this.benef = 0.5 * this.stake;
        }
        else {
            this.proba = `${Math.floor(36 / this.numbers.length) - 1}/1`;
            this.benef = (Math.floor(36 / this.numbers.length) - 1) * this.stake;
        }
    }
}

export type ChipData = {
    position: PositionEnum
}
