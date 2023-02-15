import { Bet, ChipData } from "../models/bet.model";


export function createBet(id: string, sqrId: string, numbers: number[], stake: number, chip: ChipData): Bet {
    let bet: Bet = {
        id: id,
        sqrId: sqrId,
        numbers: numbers.slice(),
        stake: stake,
        chip: chip,
        proba: "",
        benef: 0
    };

    setBetProba(bet)

    return bet;
}

export function addStake(bet: Bet, stake: number) {
    bet.stake += stake;
    setBetProba(bet);
}

export function setBetProba(bet: Bet) {
    if (bet.numbers.length === 24) {
        bet.proba = '1/2';
        bet.benef = 0.5 * bet.stake;
    }
    else {
        bet.proba = `${Math.floor(36 / bet.numbers.length) - 1}/1`;
        bet.benef = (Math.floor(36 / bet.numbers.length) - 1) * bet.stake;
    }
}