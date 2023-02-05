import React from "react"
import {
    getNumberColor
} from "../../helpers/roulette-helper";
import { Bet } from "../../models/BetModel";
import './Tapis.css';

type TapisProps = {
    offsetX?: number, offsetY?: number,
    initialBank: number,
    refreshBank: Function,
    updateBetsList: Function,
    isBettingLocked: boolean
}

class Tapis extends React.Component<TapisProps, { bank: number, stakeTotal: number }> {
    #canvasRef: React.RefObject<HTMLCanvasElement>;
    offsetX: number;
    offsetY: number;
    rectWidth: number = 40;
    rectHeight: number = 50;
    #bets: Bet[];

    #START_NUMBERS: number[] = [3, 2, 1];
    #STEP: number = 3;
    #LINE_OFFSET_PIXELS: number = 6;
    #SECOND_TO_LAST_LINE_BETS = ["1 to 12", "13 to 24", "25 to 36"];
    #LAST_LINE_BETS = ["1 to 18", "Even", "Red", "Black", "Odd", "19 to 36"];

    // #canPlaceBet: boolean = true;
    stakeValue: number = 10;

    constructor(props: any) {
        // console.log("Tapis", props);
        super(props);
        this.#canvasRef = React.createRef();
        this.offsetX = props.offsetX || 70;
        this.offsetY = props.offsetY || 30;
        this.#bets = [];

        this.state = {
            bank: props.initialBank,
            stakeTotal: 0
        }
    }

    componentDidMount(): void {
        this.displayTapis()
    }

    onMouseDown(event: any) {
        this.getClickedPosition(event);
    }

    render(): React.ReactNode {
        return (
            <canvas ref={this.#canvasRef} id="tapis" height="300" width="600" onMouseDown={(e) => this.onMouseDown(e)}></canvas>
        )
    }

    displayTapis(nbResult = -1) {
        let offsetX = this.offsetX, offsetY = this.offsetY;
        let c = this.#canvasRef.current as HTMLCanvasElement;
        let ctx = c.getContext("2d") as CanvasRenderingContext2D;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        const rectWidth = this.rectWidth, rectHeight = this.rectHeight;
        ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);

        // Numbers
        for (let row = 0; row < 3; row++) {
            let nb = 3 - row;
            for (let col = 0; col < 13; col++) {
                ctx.beginPath();
                let x = offsetX + rectWidth * col;
                let y = offsetY + rectHeight * row;
                ctx.fillStyle = col < 12 ? getNumberColor(nb) : "transparent"
                ctx.rect(x, y, rectWidth, rectHeight)
                ctx.fill()
                let gain = this.getNetGainByNumber(this.getWinBets(nb));
                if (col < 12 && this.hasStake() && gain != -Infinity && this.#bets.some(b => b.numbers.indexOf(nb) >= 0)) {
                    // ctx.fillStyle = nb !== nbResult ? "white" : "rgb(0,230,0)";
                    ctx.fillStyle = "white";
                    ctx.font = "11px Arial";
                    ctx.fillText(gain + "€", x + 3, y + rectHeight - 3)
                }
                ctx.stroke()

                ctx.save()
                ctx.translate(x, y)
                ctx.rotate(-Math.PI / 2);
                ctx.font = "18px Arial";
                ctx.fillStyle = "white";
                // ctx.strokeText(nb, rectWidth * col, rectHeight * row + 10)
                if (nb < 10) {
                    ctx.fillText(nb + '', -25, 25);
                }
                else {
                    if (col < 12)
                        ctx.fillText(nb + '', -30, 25);
                    else {
                        ctx.font = "12px Arial";
                        ctx.fillText("2 to 1", -35, 25);
                    }
                }
                ctx.restore();
                nb += 3
            }
        }
        // 0
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        ctx.lineTo(offsetX - rectWidth, offsetY);
        ctx.lineTo(offsetX - rectWidth - 5, offsetY + rectHeight * 1.5);
        ctx.lineTo(offsetX - rectWidth, offsetY + rectHeight * 3);
        ctx.lineTo(offsetX, offsetY + rectHeight * 3);
        let gain = this.getNetGainByNumber(this.getWinBets(0));
        if (this.hasStake() && gain != -Infinity && this.#bets.some(b => b.numbers.indexOf(0) >= 0)) {
            // ctx.fillStyle = 0 !== nbResult ? "white" : "rgb(0,230,0)";
            ctx.fillStyle = "white";
            ctx.font = "11px Arial";
            ctx.fillText(gain + "€", offsetX - rectWidth + 3, offsetY + 3 * rectHeight - 3)
        }
        ctx.stroke();
        ctx.save();
        ctx.translate(offsetX - rectWidth, offsetY + rectHeight * 1.5)
        ctx.rotate(-Math.PI / 2);
        ctx.font = "18px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("0", -5, rectHeight / 2);
        ctx.restore();

        // Outsides bet line 1
        const labelsL1 = ["1 to 12", "13 to 24", "25 to 36"];
        for (let rect = 0; rect < 3; rect++) {
            let x = offsetX + (rectWidth * 4 * rect);
            let y = offsetY + rectHeight * 3;
            ctx.beginPath();
            ctx.rect(x, y, rectWidth * 4, rectHeight)
            ctx.font = "18px Arial";
            ctx.fillStyle = "white";
            // ctx.strokeText(labelsL1[rect], x + rectWidth, y + rectHeight / 1.5)
            ctx.fillText(labelsL1[rect], x + rectWidth, y + rectHeight / 1.5);
            ctx.stroke();
        }

        // Outsides bet line 2
        const labelsL2 = ["1-18", "EVEN", "RED", "BLACK", "ODD", "19-36"];
        for (let rect = 0; rect < labelsL2.length; rect++) {
            let x = offsetX + (rectWidth * 2 * rect);
            let y = offsetY + rectHeight * 4;
            ctx.beginPath();
            ctx.rect(x, y, rectWidth * 2, rectHeight)
            ctx.fillStyle = ["red", "black"].some(c => c === labelsL2[rect].toLowerCase()) ? labelsL2[rect].toLowerCase() : "transparent";
            ctx.fill();
            ctx.font = "18px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(labelsL2[rect], x + rectWidth / 3, y + rectHeight / 1.5)
            ctx.stroke();
        }
    }

    getWinBets(nbResult: number) {
        // { value: bet, coord: { x, y }, stake: this.stakeValue, numbers: [] };
        let wonBets = [];
        let lostBets = [];
        if (this.#bets && this.#bets.length > 0) {
            for (const bet of this.#bets) {
                if (bet.numbers.some(n => n === nbResult)) {
                    wonBets.push(bet);
                }
                else {
                    lostBets.push(bet);
                }
            }
        }

        return { won: wonBets, lost: lostBets };
    }

    getNetGainByNumber(wonLostBets: { won: Bet[], lost: Bet[] }) {
        if (wonLostBets && (wonLostBets.won.length > 0 || wonLostBets.lost.length > 0)) {
            const stakeLost = wonLostBets.lost.reduce((total: number, next: Bet) => { return total + next.stake }, 0);
            const benefits = wonLostBets.won.reduce((total: number, next: Bet) => { return total + next.benef }, 0);
            return benefits - stakeLost;
        }
        return -Infinity;
    }

    getClickedPosition(event: any) {
        const canvas = this.#canvasRef.current as HTMLCanvasElement;
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        let bet = this.getBetFromCoords(x, y);
        console.log(bet)
    }

    getBetFromCoords(x: number, y: number) {
        if (this.isInNumberArea(x, y)) {
            return this.getNumberFromCoords(x, y);
        }
        else if (this.isInBottomBets(x, y)) {
            return this.getBottomBetFromCoords(x, y);
        }

        return null;
    }

    isInBottomBets(x: number, y: number) {
        if (x > this.offsetX && x < (this.offsetX + this.rectWidth * 12)
            && y > this.offsetY + this.rectHeight * 3 && y < this.offsetY + this.rectHeight * 5) {
            console.log("In bottom bets");
            return true;
        }
        return false;
    }

    /* Return true if (x,y) is in number area */
    isInNumberArea(x: number, y: number) {
        if (x > (this.offsetX - this.rectWidth - 5 - this.#LINE_OFFSET_PIXELS) && x < (this.offsetX + this.rectWidth * 13 + this.#LINE_OFFSET_PIXELS)
            && y > this.offsetY - this.#LINE_OFFSET_PIXELS && y < this.offsetY + this.rectHeight * 3 + this.#LINE_OFFSET_PIXELS) {
            // console.log("In numbers");
            return true;
        }

        return false;
    }

    //#region Define bet from coords

    getNumberFromCoords(x: number, y: number) {
        if (this.isInNumberArea(x, y)) {
            const lineOffset = 1 / 10;
            let indexX = (x - this.offsetX) / this.rectWidth,
                intIndexX = Math.floor(indexX);
            let indexY = (y - this.offsetY) / this.rectHeight,
                intIndexY = Math.floor(indexY);

            console.log("(", indexX, ",", indexY, ")");
            console.log("(", intIndexX, ",", intIndexY, ")");

            let isLineV = indexX - intIndexX < lineOffset || indexX - intIndexX > 1 - lineOffset;
            if (isLineV) {
                console.log("Line X");
            }
            let isLineH = indexY - intIndexY < lineOffset || indexY - intIndexY > 1 - lineOffset;
            if (isLineH) {
                console.log("Line Y");
            }

            if (!isLineV && !isLineH) {
                // no line hit
                if (intIndexX < 0) {
                    if (indexX > -1 + lineOffset) {
                        this.addBetSingleNumber(0);
                        return "0";
                    } else
                        return -1;
                } else if (intIndexX > 12) {
                    // no line out of bounds
                    return -1;
                }
                else if (intIndexY < 0) {
                    this.addBetSingleNumber(0);
                    return "0";
                } else if (intIndexY >= 3) {
                    // no line out of bounds
                    return -1;
                }
                else {
                    if (intIndexX === 12) {
                        let _x = this.offsetX + 12 * this.rectWidth + this.rectWidth / 2;
                        let _y = this.offsetY + intIndexY * this.rectHeight + this.rectHeight / 2;
                        this.#addBet(`line ${3 - intIndexY}`, _x, _y);
                        return `line ${3 - intIndexY}`;
                    }

                    this.addBetSingleNumber(this.#START_NUMBERS[intIndexY] + (intIndexX * this.#STEP));
                    return this.#START_NUMBERS[intIndexY] + (intIndexX * this.#STEP);
                }
            } else if (isLineV && !isLineH) {
                if (intIndexX === 12)
                    return -1;//`line ${3 - intIndexY}`;
                else if (indexX < -1 || intIndexX > 12 || indexX < -1 + lineOffset)
                    return -1;
                else if (/*intIndexX === 0 || */intIndexX === 11) {
                    this.addBetSingleNumber(this.#START_NUMBERS[intIndexY] + (intIndexX * this.#STEP));
                    return this.#START_NUMBERS[intIndexY] + (intIndexX * this.#STEP);
                }
                else if (intIndexY >= 0 && intIndexY < 3) {
                    if (intIndexX === -1 || (indexX <= lineOffset && indexX >= -lineOffset)) {
                        let _y = this.offsetY + intIndexY * this.rectHeight + this.rectHeight / 2;
                        this.#addBet("0-" + this.#START_NUMBERS[intIndexY], this.offsetX, _y);
                        return "0-" + this.#START_NUMBERS[intIndexY];
                    }
                    if (Math.ceil(indexX) - indexX <= lineOffset) {
                        // click on end of rect (right)
                        let _x = this.offsetX + (intIndexX + 1) * this.rectWidth;
                        let _y = this.offsetY + intIndexY * this.rectHeight + this.rectHeight / 2;
                        let bet = (this.#START_NUMBERS[intIndexY] + (intIndexX * this.#STEP)) + "-" + (this.#START_NUMBERS[intIndexY] + ((intIndexX + 1) * this.#STEP));
                        this.#addBet(bet, _x, _y);
                        return bet;
                    } else {
                        // click on start of rect (left)
                        let _x = this.offsetX + intIndexX * this.rectWidth;
                        let _y = this.offsetY + intIndexY * this.rectHeight + this.rectHeight / 2;
                        let bet = (this.#START_NUMBERS[intIndexY] + (intIndexX * this.#STEP)) + "-" + (this.#START_NUMBERS[intIndexY] + ((intIndexX - 1) * this.#STEP));
                        this.#addBet(bet, _x, _y);
                        return bet;
                    }
                }
            } else if (!isLineV && isLineH) {
                if (intIndexX >= 12 || intIndexX < 0) {
                    if (intIndexX < 0 && (indexY > lineOffset && indexY < 2 + lineOffset)) {
                        this.addBetSingleNumber(0);
                        return "0";
                    }
                    else if (intIndexX == 12) {
                        if (indexY > 1 - lineOffset && indexY < 1 + lineOffset) {
                            let _x = this.offsetX + 12 * this.rectWidth + this.rectWidth / 2;
                            let _y = this.offsetY + this.rectHeight;
                            this.#addBet(`line 3-line 2`, _x, _y);
                            return `line 3-line 2`;
                        }
                        else if (indexY > 2 - lineOffset && indexY < 2 + lineOffset) {
                            let _x = this.offsetX + 12 * this.rectWidth + this.rectWidth / 2;
                            let _y = this.offsetY + 2 * this.rectHeight;
                            this.#addBet(`line 2-line 1`, _x, _y);
                            return `line 2-line 1`;
                        }
                    }
                    else
                        return -1;
                }
                else {
                    if (Math.ceil(indexY) - indexY <= lineOffset) {
                        // click on end of rect (bottom)
                        if (intIndexY < 0 || intIndexY >= 2) {
                            let bet = this.getColumnValues(intIndexX);
                            this.addBetColumn(bet, intIndexX, false || intIndexY < 0);
                            return bet;
                        }
                        else {
                            let _x = this.offsetX + intIndexX * this.rectWidth + this.rectWidth / 2;
                            let _y = this.offsetY + (intIndexY + 1) * this.rectHeight;
                            let bet = (this.#START_NUMBERS[intIndexY + 1] + (intIndexX * this.#STEP)) + "-" + (this.#START_NUMBERS[intIndexY] + (intIndexX * this.#STEP));
                            this.#addBet(bet, _x, _y);
                            return bet;
                        }

                    } else {
                        // click on start of rect (top)
                        if (intIndexY <= 0 || intIndexY > 2) {
                            let bet = this.getColumnValues(intIndexX);
                            this.addBetColumn(bet, intIndexX, true && intIndexY < 3);
                            return bet;
                        }
                        else {
                            let _x = this.offsetX + intIndexX * this.rectWidth + this.rectWidth / 2;
                            let _y = this.offsetY + intIndexY * this.rectHeight;
                            let bet = (this.#START_NUMBERS[intIndexY] + (intIndexX * this.#STEP)) + "-" + (this.#START_NUMBERS[intIndexY - 1] + (intIndexX * this.#STEP));
                            this.#addBet(bet, _x, _y);
                            return bet;
                        }
                    }
                }
            } else if (isLineV && isLineH) {
                if (indexX <= -1 + lineOffset || indexX > 11.9) {
                    return -1;
                }
                else {
                    let bet = null, _x = null, _y = null;
                    if (Math.ceil(indexY) - indexY <= lineOffset) {
                        // click on end of rect (bottom)
                        _y = this.offsetY + (intIndexY + 1) * this.rectHeight;
                        if (Math.ceil(indexX) - indexX <= lineOffset) {
                            // click on end of rect (right)
                            _x = this.offsetX + (intIndexX + 1) * this.rectWidth;
                            if (intIndexY < 0 || intIndexY >= 2) {
                                bet = this.getColumnValues(intIndexX) + "-" + this.getColumnValues(intIndexX + 1);
                            } else {
                                bet = this.getCarre(intIndexX, intIndexY + 1);
                            }
                        } else {
                            // click on start of rect (left)
                            _x = this.offsetX + intIndexX * this.rectWidth;
                            if (intIndexY < 0 || intIndexY >= 2) {
                                bet = this.getColumnValues(intIndexX - 1) + "-" + this.getColumnValues(intIndexX);
                            } else {
                                bet = this.getCarre(intIndexX - 1, intIndexY + 1);
                            }
                        }
                    } else {
                        // click on start of rect (top)
                        _y = this.offsetY + intIndexY * this.rectHeight;
                        if (Math.ceil(indexX) - indexX <= lineOffset) {
                            // click on end of rect (right)
                            _x = this.offsetX + (intIndexX + 1) * this.rectWidth;
                            if (indexY < lineOffset || intIndexY > 2) {
                                bet = this.getColumnValues(intIndexX) + "-" + this.getColumnValues(intIndexX + 1);
                            } else {
                                bet = this.getCarre(intIndexX, intIndexY);
                            }
                        } else {
                            // click on start of rect (left)
                            _x = this.offsetX + intIndexX * this.rectWidth;
                            if (indexY < lineOffset || intIndexY > 2) {
                                bet = this.getColumnValues(intIndexX - 1) + "-" + this.getColumnValues(intIndexX);
                            } else {
                                bet = this.getCarre(intIndexX - 1, intIndexY);
                            }
                        }
                    }
                    this.#addBet(bet, _x, _y);
                    return bet;
                }
            }
        }

        return -1;
    }

    getBottomBetFromCoords(x: number, y: number) {
        if (this.isInBottomBets(x, y)) {
            let offsetInCase = 5;
            if (y > this.offsetY + this.rectHeight * 3 + offsetInCase && y < this.offsetY + this.rectHeight * 4 - offsetInCase) {
                /*
                // 1st tier
                if (x > this.offsetX + offsetInCase && x < this.offsetX + 4 * this.rectWidth - offsetInCase) {
                    return "1 to 12";
                }
                // 2nd tier
                else if (x > this.offsetX + offsetInCase + 4 * this.rectWidth && x < this.offsetX + 8 * this.rectWidth - offsetInCase) {
                    return "13 to 24";
                }
                // 3rd tier
                else if (x > this.offsetX + offsetInCase + 8 * this.rectWidth && x < this.offsetX + 12 * this.rectWidth - offsetInCase) {
                    return "25 to 36";
                }
                */
                const lineOffset = 1 / 30;
                let indexX = (x - this.offsetX) / (this.rectWidth * 4),
                    intIndexX = Math.floor(indexX);

                console.log(intIndexX)
                let isLineV = indexX - intIndexX < lineOffset || indexX - intIndexX > 1 - lineOffset;
                if (isLineV) {
                    console.log("x to y LINE");
                }
                const results = this.#SECOND_TO_LAST_LINE_BETS;
                if (isLineV && x > this.offsetX + 4 * this.rectWidth - offsetInCase && x < this.offsetX + 9 * this.rectWidth) {
                    console.log("LIIIINE");
                    if (x < this.offsetX + 5 * this.rectWidth) {
                        let betName = results[0] + "-" + results[1];
                        let _x = this.offsetX + 4 * this.rectWidth;
                        let _y = this.offsetY + this.rectHeight * 3 + (this.rectHeight / 2);
                        this.#addBet(betName, _x, _y);
                        return betName;
                    }
                    else {
                        let betName = results[1] + "-" + results[2];
                        let _x = this.offsetX + 2 * 4 * this.rectWidth;
                        let _y = this.offsetY + this.rectHeight * 3 + (this.rectHeight / 2);
                        this.#addBet(betName, _x, _y);
                        return betName;
                    }
                }
                else {
                    for (let i = 0; i < results.length; i++) {
                        if (x > this.offsetX + offsetInCase + i * 4 * this.rectWidth && x < this.offsetX - offsetInCase + (4 * (i + 1)) * this.rectWidth) {
                            let _x = this.offsetX + offsetInCase + i * 4 * this.rectWidth + (this.rectWidth * 4 / 2);
                            let _y = this.offsetY + offsetInCase + this.rectHeight * 3 + (this.rectHeight / 2);
                            this.#addBet(results[i], _x, _y);
                            return results[i];
                        }
                    }
                }
            }
            else if (y > this.offsetY + this.rectHeight * 4 + offsetInCase && y < this.offsetY + this.rectHeight * 5 - offsetInCase) {
                // 1st half, even (pair), red, black, odd (impair), 2nd half
                const results = this.#LAST_LINE_BETS;
                for (let i = 0; i < results.length; i++) {
                    if (x > this.offsetX + offsetInCase + 2 * i * this.rectWidth && x < this.offsetX - offsetInCase + (2 * (i + 1)) * this.rectWidth) {
                        let _x = this.offsetX + offsetInCase + 2 * i * this.rectWidth + (this.rectWidth * 2 / 2);
                        let _y = this.offsetY + offsetInCase + this.rectHeight * 4 + (this.rectHeight / 2);
                        this.#addBet(results[i], _x, _y);
                        return results[i];
                    }
                }
            }
        }

        return "";
    }

    //#endregion

    addBetColumn(bet: string, colIndex: number, isClickOnTop: boolean) {
        let _x = this.offsetX + colIndex * this.rectWidth + this.rectWidth / 2;
        let _y = this.offsetY + (isClickOnTop ? 0 : 3) * this.rectHeight;
        this.#addBet(bet, _x, _y);
    }

    addBetSingleNumber(nb: number) {
        if (nb > 0) {
            for (let start = this.#START_NUMBERS.length - 1; start >= 0; start--) {
                let n = this.#START_NUMBERS[start];
                for (let j = 0; j < 36 / this.#START_NUMBERS.length; j++) {
                    if (n === nb) {
                        let _x = this.offsetX + j * this.rectWidth + this.rectWidth / 2;
                        let _y = this.offsetY + start * this.rectHeight + this.rectHeight / 2;
                        this.#addBet(nb + '', _x, _y);
                    }
                    n += this.#STEP;
                }
            }
        }
        else {
            let _x = this.offsetX - this.rectWidth / 2;
            let _y = this.offsetY + this.rectHeight * 1.5;
            this.#addBet(nb + '', _x, _y);
        }
    }

    getColumnValues(intIndexX: number) {
        let str = "";
        let isPrefix0 = false;
        for (let i = this.#START_NUMBERS.length - 1; i >= 0; i--) {
            const elmt = this.#START_NUMBERS[i];
            if (intIndexX < 0) {
                if (!isPrefix0) {
                    str = "0-" + str;
                    isPrefix0 = true;
                }
                continue;
            }
            str += (elmt + (intIndexX * this.#STEP)) + "-";
        }
        return str.substring(0, str.length - 1);
    }

    getCarre(intIndexX: number, intIndexYStart: number) {
        let str = "";
        let isPrefix0 = false;
        if (intIndexYStart >= 0 && intIndexYStart < this.#START_NUMBERS.length) {
            // get Carré
            for (let j = intIndexX; j <= intIndexX + 1; j++) {
                for (let i = intIndexYStart; i > intIndexYStart - 2; i--) {
                    const elmt = this.#START_NUMBERS[i];
                    if (j < 0) {
                        if (!isPrefix0) {
                            str = "0-" + str;
                            isPrefix0 = true;
                        }
                        continue;
                    }
                    str += (elmt + (j * this.#STEP)) + "-";
                }
            }
            return str.substring(0, str.length - 1);
        }
        return "";
    }


    #getNumbersFromBetValue(betValue: string) {
        const lineBet = "line "; // line 1, line 2, line 3
        const secondToLastLineBetsCombine = [this.#SECOND_TO_LAST_LINE_BETS[0] + "-" + this.#SECOND_TO_LAST_LINE_BETS[1],
        this.#SECOND_TO_LAST_LINE_BETS[1] + "-" + this.#SECOND_TO_LAST_LINE_BETS[2]]
        let numbers = [];

        if (betValue.startsWith(lineBet)) {
            if (betValue.match(/^line \d$/)) {
                // line x (column)
                let lineNb = +betValue[betValue.length - 1];
                if (this.#START_NUMBERS.some(n => n === lineNb)) {
                    for (let i = lineNb; i <= 36; i += 3) {
                        numbers.push(i);
                    }
                }
                else {
                    console.error("Invalid line number");
                }
            } else if (betValue.match(/^line (\d)-line (\d)$/)) {
                let match = betValue.match(/^line (\d)-line (\d)$/) || [];
                for (let i = 1; i < match.length; i++) {
                    let lineNb = +match[i];
                    if (this.#START_NUMBERS.some(n => n === lineNb)) {
                        for (let i = lineNb; i <= 36; i += 3) {
                            numbers.push(i);
                        }
                    }
                    else {
                        console.error("Invalid line number");
                    }
                }
            }
        }
        else if (betValue.match(/^\d{1,2} to \d{2}$/) && (this.#SECOND_TO_LAST_LINE_BETS.indexOf(betValue) >= 0 || [0, this.#LAST_LINE_BETS.length - 1].some(v => v === this.#LAST_LINE_BETS.indexOf(betValue)))) {
            // x to y
            let min_max = betValue.split(" ").filter(v => !isNaN(+v)).map(v => +v);
            for (let i = min_max[0]; i <= min_max[1]; i++) {
                numbers.push(i);
            }
        }
        else if (betValue.match(/^\d{1,2} to \d{2}-\d{1,2} to \d{2}$/)) {
            if (secondToLastLineBetsCombine.indexOf(betValue) >= 0) {
                let match = betValue.match(/^(\d{1,2}) to \d{2}-\d{1,2} to (\d{2})$/) || [];
                for (let i = +match[1]; i <= +match[2]; i++) {
                    numbers.push(i);
                }
            }
            else {
                throw new Error("Invalid betValue: " + betValue);
            }
        }
        else if ([1, 2, 3, 4].some(v => v === this.#LAST_LINE_BETS.indexOf(betValue))) {
            // "Even", "Red", "Black", "Odd"
            let index = this.#LAST_LINE_BETS.indexOf(betValue);
            for (let _n = 1; _n <= 36; _n++) {
                let nb = -1;
                if (index === 1 || index === 4) {
                    // "Even", "Odd"
                    nb = _n % 2 == 0 && index === 1 ? _n : (_n % 2 == 1 && index === 4 ? _n : -1);
                }
                else {
                    // "Red", "Black"
                    let c = getNumberColor(_n);
                    nb = c === betValue.toLowerCase() ? _n : -1;
                }

                if (nb > 0) {
                    numbers.push(nb);
                }
            }
        }
        else if (betValue.length > 0 && betValue.match(/^\d{1,2}$/)) {
            // single number
            numbers.push(+betValue);
        }
        else if (betValue.indexOf("-") > 0) {
            // several numbers : x-x, x-x-x, x-x-x-x, x-x-x-x-x-x
            let nbs = betValue.split("-");
            for (const n of nbs) {
                if (n.length === 0 || isNaN(+n))
                    throw new Error("Invalid number list " + betValue);
                else {
                    numbers.push(+n);
                }
            }
        }

        return numbers;
    }

    #setBetProba(bet: Bet) {
        // let chance = bet.numbers.length / 37;
        // bet.proba = Math.round(((Math.round(chance * 10000) / 10000) * 100) * 100) / 100 + " % - ";
        if (bet.numbers.length == 24) {
            bet.proba = '1/2';
            bet.benef = 0.5 * bet.stake;
        }
        else {
            bet.proba = `${Math.floor(36 / bet.numbers.length) - 1}/1`;
            bet.benef = (Math.floor(36 / bet.numbers.length) - 1) * bet.stake;
        }
    }

    #addBet(bet: string, x: number, y: number) {
        if (!this.props.isBettingLocked) {
            if (this.canPlaceBet(this.stakeValue)) {
                if (bet != null && +bet !== -1) {
                    let sameBet = this.#bets.find((v) => v.value === bet);
                    if (sameBet) {
                        this.changeStake(sameBet.value, this.stakeValue);
                    }
                    else {
                        let newBet = new Bet(bet, this.stakeValue, x, y)
                        this.#bets.push(newBet);
                        // let div = document.getElementById(this.#betListContainerId);
                        newBet.numbers = this.#getNumbersFromBetValue(newBet.value);
                        this.#setBetProba(newBet);
                        // div.appendChild(this.createBetListItem(newBet));
                        // console.log("newBet: ", newBet);
                        // this.deleteBetList();
                        this.displayTapis();
                        this.writeBetList(true);
                        this.setStake();
                        this.props.updateBetsList(this.#bets.slice());
                    }
                }
            }
            else {
                alert("Mises > Banque");
            }
        }
        else {
            alert("You cannot place a bet now");
        }
    }

    removeBet(betValue: string) {
        if (!this.props.isBettingLocked) {
            let i = this.#bets.findIndex(v => v.value === betValue);
            if (i >= 0) {
                this.#bets.splice(i, 1);
                // this.deleteBetList();
                this.displayTapis();
                this.writeBetList(true);
                this.props.updateBetsList(this.#bets.slice());
                this.setStake();
            }
            else {
                console.warn("Can't find betValue", betValue);
            }
        }
    }

    writeBetList(placeOnTapis = false) {
        this.props.refreshBank({ bank: this.state.bank, totalStake: this.state.stakeTotal });
        // let div = document.getElementById(this.#betListContainerId);
        for (const _bet of this.#bets) {
            if (placeOnTapis)
                this.placeBet(_bet.coord.x, _bet.coord.y);
            // div.appendChild(this.createBetListItem(_bet));
        }
    }

    placeBet(x: number, y: number) {
        if (x && y) {
            const c = this.#canvasRef.current as HTMLCanvasElement;
            let ctx = c.getContext("2d") as CanvasRenderingContext2D;
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2.5
            ctx.beginPath();
            ctx.moveTo(x - 15, y - 15);
            ctx.lineTo(x + 15, y + 15);
            ctx.moveTo(x + 15, y - 15);
            ctx.lineTo(x - 15, y + 15);
            ctx.stroke();
        }
        else {
            console.warn("No coords");
        }
    }

    changeStake(betValue: string, stakeToAdd: number) {
        if (!this.props.isBettingLocked) {
            if (this.canPlaceBet(stakeToAdd)) {
                let sameBet = this.#bets.find((v) => v.value === betValue);
                if (sameBet) {
                    sameBet.stake += stakeToAdd;
                    if (sameBet.stake <= 0) {
                        this.removeBet(sameBet.value);
                    } else {
                        this.#setBetProba(sameBet);
                        this.setStake();
                    }
                    // this.deleteBetList();
                    this.displayTapis();
                    this.writeBetList(true);
                }
                else {
                    console.warn("Can't find bet", betValue);
                }
            }
            else {
                alert("Mises > Banque");
            }
        }
    }

    updateStake(betValue: string, sens: string) {
        if (sens === "+") {
            this.changeStake(betValue, this.stakeValue);
        }
        else if (sens === "-") {
            this.changeStake(betValue, -this.stakeValue);
        }
    }

    setStake() {
        console.log(this.#bets)
        let total = 0;
        if (this.#bets.length > 0) {
            this.#bets.forEach(b => {
                total += b.stake
            });
        }
        this.setState({ stakeTotal: total }, () => {
            this.props.refreshBank({
                bank: this.state.bank,
                totalStake: this.state.stakeTotal,
            }, !this.canPlaceBet(0));
        });
    }

    setBets(bets: Bet[]) {
        this.#bets = bets.slice();
        this.displayTapis();
        this.writeBetList(true);
        this.props.updateBetsList(this.#bets.slice());
        this.setStake();
    }

    updateBank(nbResult: number) {
        let betsResult = this.getWinBets(nbResult);
        let benef = this.getNetGainByNumber(betsResult);
        this.setState({ bank: this.state.bank + benef }, () => {
            // if (this.canPlaceBet(0)) {
                this.props.refreshBank({ bank: this.state.bank, totalStake: this.state.stakeTotal });
            // } else {
            //     this.props.refreshBank({ bank: this.state.bank, totalStake: 0 }, true);
            // }
        });
    }

    canPlaceBet(stake: number) {
        return this.state.bank - (stake + this.state.stakeTotal) >= 0;
    }

    hasStake() {
        return this.#bets.length > 0;
    }

    clear() {
        this.#bets = [];
        this.props.updateBetsList(this.#bets.slice())
        // this.deleteBetList();
        this.displayTapis();
        // this.startBetting();

        this.setStake();
    }

    // startBetting() {
    //     this.#canPlaceBet = true;
    // }

    // stopBetting() {
    //     this.#canPlaceBet = false;
    //     // this.#betsHistory.push(this.#bets);
    // }

    getBets() {
        return this.#bets.slice();
    }
}

export default Tapis