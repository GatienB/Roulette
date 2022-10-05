class BetStats {
    #outputDivId = "bet-stats";
    #tapis = null;

    constructor(tapis) {
        this.#initStats();
        this.#tapis = tapis;
    }

    #initStats() {
        this.stats = {
            totalBets: 0,
            totalStake: 0,
            potentialWinPerNumber: {}
        }
    }

    getNetGainByNumber(wonLostBets) {
        if (wonLostBets && (wonLostBets.won.length > 0 || wonLostBets.lost.length > 0)) {
            const stakeLost = wonLostBets.lost.reduce((total, next) => { /*console.log(total, next);*/ return total + next.stake }, 0);
            const benefits = wonLostBets.won.reduce((total, next) => { return total + next.benef }, 0);
            return benefits - stakeLost;
        }
        return -Infinity;
    }

    saveBets(bets) {
        if (bets && bets.length > 0) {
            this.stats.totalStake = bets.reduce((tot, next) => { return tot + next.stake; }, 0);
            this.stats.totalBets = bets.length;
            this.stats.bets = JSON.parse(JSON.stringify(bets));
        }
    }

    showStats(nbResult) {
        let div = document.getElementById(this.#outputDivId);
        div.innerText = `Bets : ${this.stats.totalBets}\nStake : ${this.stats.totalStake}\n`;
        let betsResult = this.#tapis.getWinBets(nbResult);
        console.log(betsResult);
        div.innerText += `Bets won : ${betsResult.won.length}`;
        let benef = this.getNetGainByNumber(betsResult);
        div.innerText += `\nGains : ${benef} €`;
    }

    clear() {
        let div = document.getElementById(this.#outputDivId);
        while (div.hasChildNodes()) {
            div.removeChild(div.lastChild);
        }
    }

}

class Tapis {
    #tapisCanvasId = "tapis";
    #betListContainerId = "bet-list";
    rectWidth = 40;
    rectHeight = 50;
    lineOffsetPixels = 6;
    startNumber = [3, 2, 1]
    step = 3
    roulette = null
    #bets = [];
    #canPlaceBet = false;
    stakeValue = 10;
    constructor(offsetX = 70, offsetY = 30) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.roulette = new Roulette();
        this.stats = new BetStats(this);
    }

    getNumberColor(number) {
        const indexNb0 = this.roulette.getNumberIndex(0);
        let indexNb = this.roulette.getNumberIndex(number);
        if (indexNb > indexNb0) {
            indexNb -= 1;
        }
        return (indexNb % 2 == 1 ? "red" : "black");
    }

    displayTapis(nbResult = -1/*offsetX = 100, offsetY = 50*/) {
        let offsetX = this.offsetX, offsetY = this.offsetY;
        let c = document.getElementById(this.#tapisCanvasId);
        let ctx = c.getContext("2d");
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
                ctx.fillStyle = col < 12 ? this.getNumberColor(nb) : "transparent"
                ctx.rect(x, y, rectWidth, rectHeight)
                ctx.fill()
                let gain = this.stats.getNetGainByNumber(this.getWinBets(nb));
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
                    ctx.fillText(nb, -25, 25);
                }
                else {
                    if (col < 12)
                        ctx.fillText(nb, -30, 25);
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
        let gain = this.stats.getNetGainByNumber(this.getWinBets(0));
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

    /* Return true if (x,y) is in number area */
    isInNumberArea(x, y) {
        if (x > (this.offsetX - this.rectWidth - 5 - this.lineOffsetPixels) && x < (this.offsetX + this.rectWidth * 13 + this.lineOffsetPixels)
            && y > this.offsetY - this.lineOffsetPixels && y < this.offsetY + this.rectHeight * 3 + this.lineOffsetPixels) {
            // console.log("In numbers");
            return true;
        }

        return false;
    }

    getColumnValues(intIndexX) {
        let str = "";
        let isPrefix0 = false;
        for (let i = this.startNumber.length - 1; i >= 0; i--) {
            const elmt = this.startNumber[i];
            if (intIndexX < 0) {
                if (!isPrefix0) {
                    str = "0-" + str;
                    isPrefix0 = true;
                }
                continue;
            }
            str += (elmt + (intIndexX * this.step)) + "-";
        }
        return str.substring(0, str.length - 1);
    }

    getCarre(intIndexX, intIndexYStart) {
        let str = "";
        let isPrefix0 = false;
        if (intIndexYStart >= 0 && intIndexYStart < this.startNumber.length) {
            // get Carré
            for (let j = intIndexX; j <= intIndexX + 1; j++) {
                for (let i = intIndexYStart; i > intIndexYStart - 2; i--) {
                    const elmt = this.startNumber[i];
                    if (j < 0) {
                        if (!isPrefix0) {
                            str = "0-" + str;
                            isPrefix0 = true;
                        }
                        continue;
                    }
                    str += (elmt + (j * this.step)) + "-";
                }
            }
            return str.substring(0, str.length - 1);
        }
        return "";
    }

    getNumberFromCoords(x, y) {
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

                    this.addBetSingleNumber(this.startNumber[intIndexY] + (intIndexX * this.step));
                    return this.startNumber[intIndexY] + (intIndexX * this.step);
                }
            } else if (isLineV && !isLineH) {
                if (intIndexX === 12)
                    return -1;//`line ${3 - intIndexY}`;
                else if (indexX < -1 || intIndexX > 12 || indexX < -1 + lineOffset)
                    return -1;
                else if (/*intIndexX === 0 || */intIndexX === 11) {
                    this.addBetSingleNumber(this.startNumber[intIndexY] + (intIndexX * this.step));
                    return this.startNumber[intIndexY] + (intIndexX * this.step);
                }
                else if (intIndexY >= 0 && intIndexY < 3) {
                    if (intIndexX === -1 || (indexX <= lineOffset && indexX >= -lineOffset)) {
                        let _y = this.offsetY + intIndexY * this.rectHeight + this.rectHeight / 2;
                        this.#addBet("0-" + this.startNumber[intIndexY], this.offsetX, _y);
                        return "0-" + this.startNumber[intIndexY];
                    }
                    if (Math.ceil(indexX) - indexX <= lineOffset) {
                        // click on end of rect (right)
                        let _x = this.offsetX + (intIndexX + 1) * this.rectWidth;
                        let _y = this.offsetY + intIndexY * this.rectHeight + this.rectHeight / 2;
                        let bet = (this.startNumber[intIndexY] + (intIndexX * this.step)) + "-" + (this.startNumber[intIndexY] + ((intIndexX + 1) * this.step));
                        this.#addBet(bet, _x, _y);
                        return bet;
                    } else {
                        // click on start of rect (left)
                        let _x = this.offsetX + intIndexX * this.rectWidth;
                        let _y = this.offsetY + intIndexY * this.rectHeight + this.rectHeight / 2;
                        let bet = (this.startNumber[intIndexY] + (intIndexX * this.step)) + "-" + (this.startNumber[intIndexY] + ((intIndexX - 1) * this.step));
                        this.#addBet(bet, _x, _y);
                        return bet;
                    }
                }
            } else if (!isLineV && isLineH) {
                if (intIndexX >= 12 || intIndexX < 0) {
                    if (intIndexX < 0 && (indexY > lineOffset && indexY < 2 + lineOffset)) {
                        this.addBetSingleNumber(0);
                        return "0";
                    } else
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
                            let bet = (this.startNumber[intIndexY + 1] + (intIndexX * this.step)) + "-" + (this.startNumber[intIndexY] + (intIndexX * this.step));
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
                            let bet = (this.startNumber[intIndexY] + (intIndexX * this.step)) + "-" + (this.startNumber[intIndexY - 1] + (intIndexX * this.step));
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

    getBottomBetFromCoords(x, y) {
        if (this.isInBottomBets(x, y)) {
            let offsetInCase = 3;
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
                const results = ["1 to 12", "13 to 24", "25 to 36"];
                for (let i = 0; i < results.length; i++) {
                    if (x > this.offsetX + offsetInCase + i * 4 * this.rectWidth && x < this.offsetX - offsetInCase + (4 * (i + 1)) * this.rectWidth) {
                        let _x = this.offsetX + offsetInCase + i * 4 * this.rectWidth + (this.rectWidth * 4 / 2);
                        let _y = this.offsetY + offsetInCase + this.rectHeight * 3 + (this.rectHeight / 2);
                        this.#addBet(results[i], _x, _y);
                        return results[i];
                    }
                }
            }
            else if (y > this.offsetY + this.rectHeight * 4 + offsetInCase && y < this.offsetY + this.rectHeight * 5 - offsetInCase) {
                // 1st half, even (pair), red, black, odd (impair), 2nd half
                const results = ["1 to 18", "Even", "Red", "Black", "Odd", "19 to 36"];
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

    isInBottomBets(x, y) {
        if (x > this.offsetX && x < (this.offsetX + this.rectWidth * 12)
            && y > this.offsetY + this.rectHeight * 3 && y < this.offsetY + this.rectHeight * 5) {
            console.log("In bottom bets");
            return true;
        }
        return false;
    }

    getBetFromCoord(x, y) {
        if (this.isInNumberArea(x, y)) {
            return this.getNumberFromCoords(x, y);
        }
        else if (this.isInBottomBets(x, y)) {
            return this.getBottomBetFromCoords(x, y);
        }

        return null;
    }

    addBetColumn(bet, colIndex, isClickOnTop) {
        let _x = this.offsetX + colIndex * this.rectWidth + this.rectWidth / 2;
        let _y = this.offsetY + (isClickOnTop ? 0 : 3) * this.rectHeight;
        this.#addBet(bet, _x, _y);
    }

    addBetSingleNumber(nb) {
        if (nb > 0) {
            for (let start = this.startNumber.length - 1; start >= 0; start--) {
                let n = this.startNumber[start];
                for (let j = 0; j < 36 / this.startNumber.length; j++) {
                    if (n === nb) {
                        let _x = this.offsetX + j * this.rectWidth + this.rectWidth / 2;
                        let _y = this.offsetY + start * this.rectHeight + this.rectHeight / 2;
                        this.#addBet(nb, _x, _y);
                    }
                    n += this.step;
                }
            }
        }
        else {
            let _x = this.offsetX - this.rectWidth / 2;
            let _y = this.offsetY + this.rectHeight * 1.5;
            this.#addBet(nb, _x, _y);
        }
    }

    #getNumbersFromBetValue(betValue) {
        betValue = betValue + ""
        const lineBet = "line "; // line 1, line 2, line 3
        const secondTolastLineBets = ["1 to 12", "13 to 24", "25 to 36"];
        const lastLineBets = ["1 to 18", "Even", "Red", "Black", "Odd", "19 to 36"];
        let numbers = [];

        if (betValue.startsWith(lineBet) && betValue.match(/^line \d$/)) {
            // line x (column)
            let lineNb = +betValue[betValue.length - 1];
            if (this.startNumber.some(n => n === lineNb)) {
                for (let i = lineNb; i <= 36; i += 3) {
                    numbers.push(i);
                }
            }
            else {
                console.error("Invalid line number");
            }
        }
        else if (betValue.match(/^\d{1,2} to \d{2}$/) && (secondTolastLineBets.indexOf(betValue) >= 0 || [0, lastLineBets.length - 1].some(v => v === lastLineBets.indexOf(betValue)))) {
            // x to y
            let min_max = betValue.split(" ").filter(v => !isNaN(+v)).map(v => +v);
            for (let i = min_max[0]; i <= min_max[1]; i++) {
                numbers.push(i);
            }
        }
        else if ([1, 2, 3, 4].some(v => v === lastLineBets.indexOf(betValue))) {
            // "Even", "Red", "Black", "Odd"
            let index = lastLineBets.indexOf(betValue);
            for (let _n = 1; _n <= 36; _n++) {
                let nb = -1;
                if (index === 1 || index === 4) {
                    // "Even", "Odd"
                    nb = _n % 2 == 0 && index === 1 ? _n : (_n % 2 == 1 && index === 4 ? _n : -1);
                }
                else {
                    // "Red", "Black"
                    let c = this.getNumberColor(_n);
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
                if (n.length === 0 || isNaN(n))
                    throw new Error("Invalid number list", betValue);
                else {
                    numbers.push(+n);
                }
            }
        }

        return numbers;
    }

    #setBetProba(bet) {
        let chance = bet.numbers.length / 37;
        // bet.proba = Math.round(((Math.round(chance * 10000) / 10000) * 100) * 100) / 100 + " % - ";
        bet.proba = `${Math.floor(36 / bet.numbers.length) - 1}/1`;
        bet.benef = (Math.floor(36 / bet.numbers.length) - 1) * bet.stake;
    }

    #addBet(bet, x, y) {
        if (this.#canPlaceBet) {
            if (bet != null && bet !== -1) {
                let sameBet = this.#bets.find((v) => v.value === bet);
                if (sameBet) {
                    this.changeStake(sameBet.value, this.stakeValue);
                }
                else {
                    let newBet = { value: bet, coord: { x, y }, stake: this.stakeValue, numbers: [], proba: -1 };
                    this.#bets.push(newBet);
                    let div = document.getElementById(this.#betListContainerId);
                    newBet.numbers = this.#getNumbersFromBetValue(newBet.value);
                    this.#setBetProba(newBet);
                    div.appendChild(this.createBetListItem(newBet));
                    console.log("newBet: ", newBet);
                    this.deleteBetList();
                    this.displayTapis();
                    this.writeBetList(true);
                }
            }
        }
        else {
            alert("You cannot place a bet now");
        }
    }

    createBetListItem(bet) {
        let d = document.createElement("div");
        // d.style.width = "100%";
        d.style.display = "flex";
        d.style.alignItems = "center";
        d.style.marginLeft = "5px";

        let spanResult = document.createElement("span");
        spanResult.style.height = "10px";
        spanResult.style.width = "10px";
        spanResult.style.borderRadius = "50%";
        spanResult.setAttribute("data", "bullet");

        let span_betvalue = document.createElement("span");
        let span_stake = document.createElement("span");
        let b_del = document.createElement("button");
        let b_plus = document.createElement("button");
        let b_minus = document.createElement("button");
        let span_proba = document.createElement("span");

        span_betvalue.setAttribute("data", "bet-value");
        span_betvalue.style.width = "30%";
        span_betvalue.style.minWidth = "100px";
        span_betvalue.innerText = bet.value;

        span_stake.style.width = "15%";
        span_stake.style.minWidth = "80px";
        span_stake.style.wordBreak = "break-all";
        span_stake.innerText = bet.stake + " €";

        span_proba.innerText = bet.proba;
        span_proba.style.marginLeft = "10px";

        b_del.onclick = () => this.removeBet(bet.value);
        b_del.classList.add("btn-delete");
        b_del.title = "Delete";

        b_minus.innerText = "-";
        b_minus.onclick = () => this.changeStake(bet.value, -this.stakeValue);
        b_minus.classList.add("btn-change_stake");
        b_plus.innerText = "+";
        b_plus.onclick = () => this.changeStake(bet.value, this.stakeValue);
        b_plus.classList.add("btn-change_stake");

        d.append(spanResult);
        d.append(span_betvalue);
        d.append(b_minus);
        d.append(span_stake);
        d.append(b_plus);
        d.append(b_del);
        d.append(span_proba);

        return d;
    }

    deleteBetList() {
        let div = document.getElementById(this.#betListContainerId);
        while (div.hasChildNodes()) {
            div.removeChild(div.lastChild);
        }
    }

    writeBetList(placeOnTapis = false) {
        let div = document.getElementById(this.#betListContainerId);
        for (const _bet of this.#bets) {
            if (placeOnTapis)
                this.placeBet(_bet.coord.x, _bet.coord.y);
            div.appendChild(this.createBetListItem(_bet));
        }
    }

    removeBet(betValue) {
        if (this.#canPlaceBet) {
            let i = this.#bets.findIndex(v => v.value === betValue);
            if (i >= 0) {
                this.#bets.splice(i, 1);
                this.deleteBetList();
                this.displayTapis();
                this.writeBetList(true);
            }
            else {
                console.warn("Can't find betValue", betValue);
            }
        }
    }

    placeBet(x, y) {
        if (x && y) {
            let c = document.getElementById(this.#tapisCanvasId);
            let ctx = c.getContext("2d");
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

    changeStake(betValue, stakeToAdd) {
        if (this.#canPlaceBet) {
            let sameBet = this.#bets.find((v) => v.value === betValue);
            if (sameBet) {
                sameBet.stake += stakeToAdd;
                if (sameBet.stake <= 0) {
                    this.removeBet(sameBet.value);
                } else {
                    this.#setBetProba(sameBet);
                }
                this.deleteBetList();
                this.displayTapis();
                this.writeBetList(true);
            }
            else {
                console.warn("Can't find bet", betValue);
            }
        }
    }

    getClickedPosition(canvas, tapis, event) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        // console.log("Coordinate x: " + x,
        //     "Coordinate y: " + y);

        let bet = this.getBetFromCoord(x, y);
        console.log(bet)

        // if (bet && bet !== -1) {
        //     let div = document.getElementById(this.#betListContainerId);
        //     let p = document.createElement("p");
        //     p.innerText = bet;
        //     div.appendChild(p);
        // }
    }

    getWinBets(nbResult) {
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

    highlightBets(nbResult) {
        this.deleteBetList();
        this.displayTapis(nbResult);
        this.writeBetList(true);
        let wonLost = this.getWinBets(nbResult);
        let betValuesSpans = Array.from(document.querySelectorAll("span[data=bet-value]"));
        for (const betWon of wonLost.won) {
            const span = betValuesSpans.filter(el => el.innerText == betWon.value)[0];
            if (span) {
                span.parentElement.firstElementChild.style.background = "rgb(0,230,0)";
            }
        }
        for (const betLost of wonLost.lost) {
            const span = betValuesSpans.filter(el => el.innerText == betLost.value)[0];
            if (span) {
                span.parentElement.firstElementChild.style.background = "red"; // "#ff5959";
            }
        }
    }

    hasStake() {
        return this.#bets.length > 0;
    }

    stopBetting() {
        this.#canPlaceBet = false;
    }

    startBetting() {
        this.#canPlaceBet = true;
    }

    clear() {
        this.#bets = [];
        this.deleteBetList();
        this.displayTapis();
        this.startBetting();
    }

    getBets() {
        return JSON.parse(JSON.stringify(this.#bets));
    }
}
