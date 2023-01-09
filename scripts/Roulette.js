
class Roulette {
    #canSpin = false;
    #isResetButton = false;
    constructor() {
        this.ROULETTE_RADIUS = 150;
    }

    #getNumberColor(number) {
        const indexNb0 = this.getNumberIndex(0);
        let indexNb = this.getNumberIndex(number);
        if (indexNb > indexNb0) {
            indexNb -= 1;
        }
        return number === 0 ? "green" : (indexNb % 2 == 1 ? "red" : "black");
    }

    #getRouletteNumberFrom0To2piCounterclockwise() {
        return [6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25, 17, 34];
    }

    getNumberIndex(number) {
        return this.#getRouletteNumberFrom0To2piCounterclockwise().indexOf(number);
    }

    #getAngleFromNumberIndex(index, offset = 0) {
        return ((index * Math.PI * 2) / 37) + offset;
    }

    #getNumberFromAngle(angle) {
        return this.#getRouletteNumberFrom0To2piCounterclockwise()[Math.floor((angle * 37 / (Math.PI * 2)) % 37)]
    }

    displayRoulette() {
        let c = document.getElementById("roulette");
        // let c = new HTMLCanvasElement()
        let ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.clientWidth, c.clientHeight)
        const width = c.clientWidth, height = c.clientHeight;
        // console.log(c.clientWidth, c.clientHeight)
        const numbers = this.#getRouletteNumberFrom0To2piCounterclockwise()
        const radius = this.ROULETTE_RADIUS;
        const cases = 37;
        const _angle = 2 * Math.PI / cases;
        let isBlack = true;
        for (let nbSplit = 0; nbSplit < cases; nbSplit++) {
            let angle = _angle * nbSplit;
            ctx.beginPath()
            ctx.strokeStyle = "white"
            ctx.moveTo(width / 2, height / 2);
            ctx.arc(width / 2, height / 2, radius, angle, angle + _angle)
            ctx.lineTo(width / 2, height / 2);
            if (numbers[nbSplit] == 0) {
                ctx.fillStyle = "green";
            }
            else {
                ctx.fillStyle = isBlack ? "black" : "red";
                isBlack = !isBlack;
            }
            ctx.fill()
            ctx.stroke()
        }

        // interior circle
        ctx.beginPath()
        ctx.fillStyle = "black"
        ctx.arc(width / 2, height / 2, radius / 2, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()

        // exterior circle
        ctx.beginPath()
        ctx.strokeStyle = "black"
        ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI)
        ctx.stroke()

        for (let nbSplit = 0; nbSplit < cases; nbSplit++) {
            let angle = _angle * nbSplit;
            let radiusTxt = radius;
            if (Math.sin(angle) > 0) {
                // radiusTxt -= 10
            }
            ctx.beginPath()
            // ctx.translate(width/2, height/2)
            // ctx.strokeStyle = "white"
            // ctx.strokeText(nbSplit+1, Math.cos(angle+_angle) * radiusTxt + width / 2, Math.sin(angle+_angle) * radiusTxt + height / 2, 10)
            // ctx.stroke()
            // break
            ctx.font = "12px Arial";
            ctx.strokeStyle = "white";
            ctx.fillStyle = "white";
            ctx.lineWidth = 1;
            // let radiusTxt = radius - 10
            let angleTxt = angle + (_angle / 5);
            let x = Math.cos(angleTxt) * radiusTxt + width / 2;
            let y = Math.sin(angleTxt) * radiusTxt + height / 2;

            const max_width = 10;
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(((nbSplit + 1) * 2 * Math.PI) / (37 + 1) + (Math.PI / 2))
            // ctx.rotate(this.#getAngleFromNumberIndex(nbSplit))
            let offsetX = 0;
            if (numbers[nbSplit] < 10) {
                offsetX = 2;
            }
            ctx.fillText(numbers[nbSplit], Math.cos(angleTxt) + offsetX, Math.sin(angleTxt) + 10, max_width)
            // console.log(x, y)
            // ctx.moveTo(width / 2, height / 2)
            // ctx.lineTo(width / 2 + 10, height / 2)
            ctx.stroke()
            ctx.restore()
            // break
        }

        this.#displayArrow();

        // spin button
        ctx.beginPath();
        ctx.arc(20 + 30, 20 + 30, 40, 0, 2 * Math.PI);
        ctx.strokeStyle = 'silver';
        ctx.lineWidth = 6;
        ctx.fillStyle = "#B21F18";
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.font = "20px Arial";
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.fillText("Spin", 30, 55);
        ctx.stroke();
    }

    showResetButton() {
        let c = document.getElementById("roulette");
        let ctx = c.getContext("2d");
        ctx.arc(20 + 30, c.clientHeight - 50, 40, 0, 2 * Math.PI);
        ctx.strokeStyle = 'silver';
        ctx.lineWidth = 6;
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.font = "20px Arial";
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.fillText("Reset", 23, c.clientHeight - 45);
        ctx.stroke();
        this.#isResetButton = true;
    }

    hideResetButton() {
        let c = document.getElementById("roulette");
        let ctx = c.getContext("2d");
        ctx.fillStyle = "white";
        ctx.arc(20 + 30, c.clientHeight - 50, 40 + 10, 0, 2 * Math.PI);
        ctx.fill();
        this.#isResetButton = false;
    }

    onRouletteClick(canvas, event, callbackSpin, callbackReset) {
        // if spin button zone
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        const radiusSpinButton = 40, x_spin = 20 + 30, y_spin = 20 + 30;
        const radiusResetButton = 40, x_reset = 20 + 30, y_reset = canvas.clientHeight - 50;
        // (x1-x)² + (y1-y)² <= r²
        if ((x - x_spin) ** 2 + (y - y_spin) ** 2 <= radiusSpinButton ** 2) {
            console.log("IN CIRCLE");
            callbackSpin();
        } else if ((x - x_reset) ** 2 + (y - y_reset) ** 2 <= radiusResetButton ** 2) {
            console.log("IN CIRCLE 2");
            if (this.#isResetButton) {
                this.hideResetButton();
                this.displayRoulette();
                callbackReset();
            }
        }
    }

    #showResult(nb) {
        let c = document.getElementById("roulette");
        let ctx = c.getContext("2d");
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.arc(c.clientWidth - 50, c.clientHeight - 50, 40, 0, 2 * Math.PI);
        ctx.fillStyle = this.#getNumberColor(nb);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.fillText(nb, c.clientWidth - 50 - (nb < 10 ? 15 : 30), c.clientHeight - 50 + 15);
        ctx.stroke();
        this.showResetButton();
    }

    #displayArrow() {
        let c = document.getElementById("roulette");
        // let c = new HTMLCanvasElement()
        let ctx = c.getContext("2d");
        const arrowLength = this.ROULETTE_RADIUS / 2;//50;
        const arrowWidth = 5;
        const width = c.clientWidth, height = c.clientHeight;
        ctx.strokeStyle = "black";
        ctx.rect(width / 2 - arrowLength / 2, height / 2 - arrowWidth / 2, arrowLength, arrowWidth);
        ctx.fillStyle = "white";
        ctx.moveTo(width / 2 + arrowLength / 2, height / 2 - arrowWidth / 2 - 5);
        ctx.lineTo(width / 2 + arrowLength / 2, height / 2 + arrowWidth / 2 + 5);
        ctx.lineTo(width / 2 + arrowLength / 2 + 20, height / 2 - arrowWidth / 2 + arrowWidth / 2);
        ctx.fill();
    }

    async delay(delayMs) {
        return await new Promise((resolve, reject) => {
            setTimeout(resolve, delayMs);
        }).then(() => {
            // console.log("ok")
            return true;
        }).catch(() => { return false; })
    }

    getRandomNumber(min, max) {
        return Math.floor((max + 1 - min) * Math.random() + min);
    }

    async spin(minWaitTimeMs = 500, maxWaitTimeMs = 1000) {
        if (this.canSpin()) {
            this.disableSpinning();
            let i = 0;
            let end = false;
            let startTime = Date.now();
            let spinTime = Math.floor((maxWaitTimeMs + 1000 - minWaitTimeMs) * Math.random()) + minWaitTimeMs;
            console.log(spinTime);
            const numbers = this.#getRouletteNumberFrom0To2piCounterclockwise();
            const randomIndex = this.getRandomNumber(0, numbers.length - 1);
            while (!end) {
                for (const index in numbers) {
                    i = index;
                    this.#drawArrow(index);
                    await this.delay(10);
                    if (startTime + spinTime < Date.now() && i == randomIndex) {
                        end = true;
                        this.#showResult(numbers[i]);
                        break;
                    }
                }
            }
            console.log("Fin");
            // i -= this.step;
            // 0 -> 2pi  + PI/2
            // 0 -> 36

            // let div = document.createElement("div");
            // document.body.appendChild(div)
            // div.innerText = i + ", " + (i % (2 * Math.PI)) + ", " + Math.cos(i % (2 * Math.PI)) + ", " + Math.sin(i % (2 * Math.PI)) +
            //     "\n" + ((i * 37 / (Math.PI * 2)) % 37);
            // div.innerHTML += "\n" + numbers[Math.floor((i * 37 / (Math.PI * 2)) % 37)]

            // let divOut = document.getElementById("spin-output");
            // divOut.innerText = numbers[i];
            return numbers[i];
        }
    }

    spinLite() {
        const numbers = this.#getRouletteNumberFrom0To2piCounterclockwise();
        return numbers[this.getRandomNumber(0, numbers.length - 1)]
    }

    #moveArrowToNumber(number) {
        let c = document.getElementById("roulette");
        let ctx = c.getContext("2d");
        ctx.strokeStyle = "black";
        const step = Math.PI * 2 / 37;
        const numberIndex = this.getNumberIndex(number);
        let divOut = document.getElementById("spin-output");
        if (numberIndex < 0) {
            divOut.innerText = "Le nombre doit être compris entre 0 et 37";
        }
        else {
            this.#drawArrow(numberIndex);
            divOut.innerText = this.#getNumberFromAngle(this.#getAngleFromNumberIndex(numberIndex, step / 2));
        }
    }

    #drawArrow(numberIndex) {
        if (numberIndex < 0 || numberIndex > 37) {
            let divOut = document.getElementById("spin-output");
            divOut.innerText = "Le nombre doit être compris entre 0 et 37 inclus";
        }
        else {
            let c = document.getElementById("roulette");
            let ctx = c.getContext("2d");
            const arrowLength = this.ROULETTE_RADIUS / 2;
            const arrowWidth = 5;
            const width = c.clientWidth, height = c.clientHeight;
            ctx.strokeStyle = "black"
            const step = Math.PI * 2 / 37;
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.rotate(this.#getAngleFromNumberIndex(numberIndex, step / 2));
            ctx.beginPath();
            // ctx.strokeStyle = "white";
            ctx.arc(0, 0, this.ROULETTE_RADIUS / 2 - 5, 0, Math.PI * 2);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.rect(- arrowLength / 2, - arrowWidth / 2, arrowLength, arrowWidth);
            ctx.moveTo(arrowLength / 2, - arrowWidth / 2 - 5);
            ctx.lineTo(arrowLength / 2, arrowWidth / 2 + 5);
            ctx.lineTo(arrowLength / 2 + 20, - arrowWidth / 2 + arrowWidth / 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            // let divOut = document.getElementById("spin-output");
            // divOut.innerText = this.#getNumberFromAngle(this.#getAngleFromNumberIndex(numberIndex, step / 2));
        }
    }

    canSpin() {
        return this.#canSpin;
    }

    enableSpinning() {
        this.#canSpin = true;
    }

    disableSpinning() {
        this.#canSpin = false;
    }
}
