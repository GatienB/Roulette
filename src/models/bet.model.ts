import { PositionEnum } from "./position.enum"

export interface Bet {
    id: string;
    sqrId: string;
    numbers: number[];
    chip: ChipData;
    stake: number;
    proba: string;
    benef: number;
}

export type ChipData = {
    position: PositionEnum
}
