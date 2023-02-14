import { SpecialBetsEnum } from "../../helpers/constants";
import { getNumberColor, getRedOrBlack } from "../../helpers/roulette-helper";
import { Bet } from "./../../models/bet.model";
import { PositionEnum } from "./../../models/position.enum";

function getColumnValues(sqrValue: number): number[] {
    if (sqrValue === 0) {
        return [0];
    }
    else {
        while (sqrValue % 3 !== 0) {
            sqrValue += 1;
        }
        if (sqrValue > 36) {
            return [];
        }
        return [sqrValue, sqrValue - 1, sqrValue - 2];
    }
}

function getCarre(sqrValue: number, position: PositionEnum): number[] {
    let carre: number[] = [];
    if (position === PositionEnum.TOP_LEFT) {
        if (sqrValue === 0) {
            carre = [0];
        } else if (sqrValue % 3 === 0) {
            // line 3
            carre = [...getColumnValues(sqrValue - 3), ...getColumnValues(sqrValue)]
        } else {
            if (sqrValue <= 3) {
                carre = [0, sqrValue, sqrValue + 1];
            } else {
                carre = [sqrValue - 3, sqrValue - 2, sqrValue, sqrValue + 1];
            }
        }
    } else if (position === PositionEnum.TOP_RIGHT) {
        if (sqrValue === 0) {
            carre = [0, ...getColumnValues(3)];
        } else if (sqrValue % 3 === 0) {
            // line 3
            carre = [...getColumnValues(sqrValue), ...getColumnValues(sqrValue + 3)]
        } else {
            if (sqrValue >= 34) {
                carre = [sqrValue, sqrValue + 1];
            } else {
                carre = [sqrValue, sqrValue + 1, sqrValue + 3, sqrValue + 4];
            }
        }
    } else if (position === PositionEnum.BOTTOM_RIGHT) {
        if (sqrValue === 0) {
            carre = [0, ...getColumnValues(3)];
        } else if ((sqrValue + 2) % 3 === 0) {
            // line 1
            carre = [...getColumnValues(sqrValue), ...getColumnValues(sqrValue + 3)]
        } else {
            if (sqrValue >= 34) {
                carre = [sqrValue - 1, sqrValue];
            } else {
                carre = [sqrValue - 1, sqrValue, sqrValue + 2, sqrValue + 3];
            }
        }
    } else if (position === PositionEnum.BOTTOM_LEFT) {
        if (sqrValue === 0) {
            carre = [0];
        } else if ((sqrValue + 2) % 3 === 0) {
            // line 1
            carre = [...getColumnValues(sqrValue - 3), ...getColumnValues(sqrValue)]
        } else {
            if (sqrValue <= 3) {
                carre = [0, sqrValue - 1, sqrValue];
            } else {
                carre = [sqrValue - 4, sqrValue - 3, sqrValue - 1, sqrValue];
            }
        }
    }
    // console.log(carre)
    return carre;
}

type IdsAndNumbers = {
    betId: string,
    ids: string[],
    numbers: number[]
}

export function getSelectedSqrIds(sqrId: string, position: PositionEnum): IdsAndNumbers {
    let res: number[] = [];
    let extras: string[] = [];
    let n = +sqrId;
    if (!isNaN(n)) {
        // top line
        if (position === PositionEnum.CENTER) {
            res = [n];
        } else if (position === PositionEnum.TOP) {
            if (n % 3 === 0) {
                res = getColumnValues(n);
            } else {
                res = [n, n + 1];
            }
        } else if (position === PositionEnum.BOTTOM) {
            if ((n + 2) % 3 === 0) {
                res = getColumnValues(n);
            } else {
                res = [n, n - 1];
            }
        } else if (position === PositionEnum.LEFT) {
            if (n === 0) {
                res = [0];
            } else if (n <= 3) {
                res = [n, 0];
            } else {
                res = [n, n - 3];
            }
        } else if (position === PositionEnum.RIGHT) {
            if (n === 0) {
                res = [0];
            } else if (n <= 33) {
                res = [n, n + 3];
            }
        } else if ([PositionEnum.TOP_LEFT, PositionEnum.TOP_RIGHT,
        PositionEnum.BOTTOM_RIGHT, PositionEnum.BOTTOM_LEFT].some(v => v === position)) {
            res = getCarre(n, position);
        }
    } else {
        extras.push(sqrId);
        const lineBet = "line ";
        const LAST_LINE_BETS = [SpecialBetsEnum._1_TO_18, SpecialBetsEnum.EVEN, SpecialBetsEnum.RED, SpecialBetsEnum.BLACK
            , SpecialBetsEnum.ODD, SpecialBetsEnum._19_TO_36];
        if (sqrId.match(/^line \d$/)) {
            // line x (column)
            let lineNb = +sqrId[sqrId.length - 1];
            if ([1, 2, 3].indexOf(lineNb) >= 0) {
                let lines: number[] = [lineNb];
                if (position.startsWith(PositionEnum.TOP) && lineNb < 3) {
                    lines.push(lineNb + 1);
                    extras.push(`${lineBet}${(lineNb + 1)}`);
                } else if (position.startsWith(PositionEnum.BOTTOM) && lineNb > 1) {
                    lines.push(lineNb - 1);
                    extras.push(`${lineBet}${(lineNb - 1)}`);
                }

                lines.forEach(l => {
                    for (let i = l; i <= 36; i += 3) {
                        res.push(i);
                    }
                });
            }
            else {
                console.error("Invalid line number " + lineNb);
            }
        }
        else if (sqrId.match(/^\d{1,2} to \d{2}$/)) {
            // x to y
            let min_max = sqrId.split(" ").filter(v => !isNaN(+v)).map(v => +v);
            if (position.endsWith(PositionEnum.LEFT) && min_max[0] > 1) {
                extras.push(`${(min_max[0] - 12)} to ${(min_max[0] - 1)}`);
                min_max[0] -= 12;
            } else if (position.endsWith(PositionEnum.RIGHT) && min_max[1] < 36) {
                extras.push(`${(min_max[1] + 1)} to ${(min_max[1] + 12)}`);
                min_max[1] += 12;
            }

            for (let i = min_max[0]; i <= min_max[1]; i++) {
                res.push(i);
            }
        }
        else if ([1, 2, 3, 4].some(v => v === LAST_LINE_BETS.indexOf(sqrId as SpecialBetsEnum))) {
            // "Even", "Red", "Black", "Odd"
            let index = LAST_LINE_BETS.indexOf(sqrId as SpecialBetsEnum);
            for (let _n = 1; _n <= 36; _n++) {
                let nb = -1;
                if (index === 1 || index === 4) {
                    // "Even", "Odd"
                    nb = _n % 2 === 0 && index === 1 ? _n : (_n % 2 === 1 && index === 4 ? _n : -1);
                }
                else {
                    // "Red", "Black"
                    let c = getRedOrBlack(getNumberColor(_n));
                    nb = c === sqrId.toLowerCase() ? _n : -1;
                }

                if (nb > 0) {
                    res.push(nb);
                }
            }
        }
        else if (sqrId.match(/^\d{1,2}-\d{1,2}$/)) {
            // several numbers : x-x, x-x-x, x-x-x-x, x-x-x-x-x-x
            let nbs = sqrId.split("-").map(v => +v);
            for (let i = nbs[0]; i <= nbs[1]; i++) {
                res.push(i);
            }
        }
    }

    extras = extras.sort();
    res = res.filter(v => v >= 0).sort();
    // console.log(position, " - ", res, res.filter(v => v >= 0).map(v => v + ''), extras)
    return { ids: [...extras, ...res.map(v => v + '')], numbers: res, betId: extras.length > 0 ? extras.join(" ") : res.join("-") };
    // return [...extras.sort(), ...res.filter(v => v >= 0).sort().map(v => v + '')];
}

export function isBetExists(bets: Bet[], newBet: Bet) {
    return bets.some(b => b.id === newBet.id);
}

// export function isBetExists(bets: Bet[], newBet: Bet) {
//     console.log("----- isBetExists -----");
//     console.log(newBet);
//     console.log(bets);
//     for (const b of bets.filter(_b => _b.numbers.length == newBet.numbers.length)) {
//         console.log(b.numbers.toString())
//         console.log(newBet.numbers.toString())
//         let notEqual = false;
//         for (let i = 0; i < newBet.numbers.length; i++) {
//             if (newBet.numbers[i] !== b.numbers[i]) {
//                 notEqual = true;
//                 break;
//             }
//         }
//         if (!notEqual)
//             return true;
//     }

//     return false;
// }
