import React from "react"
import './Roulette.css'
import {
    getNumberColor,
    getAngleFromNumberIndex, getRouletteNumberFrom0To2piCounterclockwise
} from "../../helpers/roulette-helper";

class Roulette extends React.Component<{ isLocked: boolean, onSpin: Function, onReset: Function }, { isSpinning: boolean }> {

    #ROULETTE_RADIUS: number = 150;
    #isResetButton: boolean = false;
    #canvasRef: React.RefObject<HTMLCanvasElement>;

    constructor(props: any) {
        // console.log("Roulette", props)
        super(props);
        this.#canvasRef = React.createRef();
        this.state = {
            isSpinning: false
        }
    }

    //#region events

    onMouseDown(event: any) {
        this.onRouletteClick(event);
    }

    componentDidMount(): void {
        this.displayRoulette();
    }

    render(): React.ReactNode {
        return (
            <canvas ref={this.#canvasRef} id="roulette" height="300" width="600" onMouseDown={this.onMouseDown.bind(this)}></canvas>
        )
    }
    //#endregion

    #displayArrow() {
        let c = this.#canvasRef.current as HTMLCanvasElement;
        let ctx = c.getContext("2d") as CanvasRenderingContext2D;
        const arrowLength = this.#ROULETTE_RADIUS / 2;//50;
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

    displayRoulette() {
        let c = this.#canvasRef.current as HTMLCanvasElement;
        let ctx = c.getContext("2d") as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, c.clientWidth, c.clientHeight)
        const width = c.clientWidth, height = c.clientHeight;
        // console.log(c.clientWidth, c.clientHeight)
        const numbers = getRouletteNumberFrom0To2piCounterclockwise()
        const radius = this.#ROULETTE_RADIUS;
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
            if (numbers[nbSplit] === 0) {
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
            ctx.fillText(numbers[nbSplit] + '', Math.cos(angleTxt) + offsetX, Math.sin(angleTxt) + 10, max_width)
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

    onRouletteClick(event: any) {
        let canvas = this.#canvasRef.current || new HTMLCanvasElement();
        // if spin button zone
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        const radiusSpinButton = 40, x_spin = 20 + 30, y_spin = 20 + 30;
        const radiusResetButton = 40, x_reset = 20 + 30, y_reset = canvas.clientHeight - 50;
        // (x1-x)² + (y1-y)² <= r²
        if ((x - x_spin) ** 2 + (y - y_spin) ** 2 <= radiusSpinButton ** 2) {
            console.log("IN CIRCLE");
            this.props.onSpin()
        } else if ((x - x_reset) ** 2 + (y - y_reset) ** 2 <= radiusResetButton ** 2) {
            console.log("IN CIRCLE 2");
            if (this.#isResetButton) {
                this.hideResetButton();
                this.displayRoulette();
                this.props.onReset();
            }
        }
    }

    hideResetButton() {
        let c = this.#canvasRef.current as HTMLCanvasElement;
        let ctx = c.getContext("2d") as CanvasRenderingContext2D;
        ctx.fillStyle = "white";
        ctx.arc(20 + 30, c.clientHeight - 50, 40 + 10, 0, 2 * Math.PI);
        ctx.fill();
        this.#isResetButton = false;
    }

    async spin(minWaitTimeMs = 500, maxWaitTimeMs = 1000) {
        if (this.canSpin()) {
            return await new Promise<number>(resolve => {
                this.setState({ isSpinning: true }, async () => {
                    let i = 0;
                    let end = false;
                    let startTime = Date.now();
                    let spinTime = Math.floor((maxWaitTimeMs + 1000 - minWaitTimeMs) * Math.random()) + minWaitTimeMs;
                    console.log(spinTime);
                    const numbers = getRouletteNumberFrom0To2piCounterclockwise();
                    const randomIndex = this.getRandomNumber(0, numbers.length - 1);
                    while (!end) {
                        for (const index in numbers) {
                            i = +index;
                            this.#drawArrow(+index);
                            await this.delay(10);
                            if (startTime + spinTime < Date.now() && i === randomIndex) {
                                end = true;
                                this.#showResult(numbers[i]);
                                break;
                            }
                        }
                    }
                    console.log("Fin", i);
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
                    this.setState({ isSpinning: false });
                    resolve(numbers[i]);
                })
            });
        }

        return -1;
    }

    #drawArrow(numberIndex: number) {
        if (numberIndex < 0 || numberIndex > 37) {
            // let divOut = document.getElementById("spin-output") as HTMLElement;
            // divOut.innerText = "Le nombre doit être compris entre 0 et 37 inclus";
        }
        else {
            let c = this.#canvasRef.current as HTMLCanvasElement;
            let ctx = c.getContext("2d") as CanvasRenderingContext2D;
            const arrowLength = this.#ROULETTE_RADIUS / 2;
            const arrowWidth = 5;
            const width = c.clientWidth, height = c.clientHeight;
            ctx.strokeStyle = "black"
            const step = Math.PI * 2 / 37;
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.rotate(getAngleFromNumberIndex(numberIndex, step / 2));
            ctx.beginPath();
            // ctx.strokeStyle = "white";
            ctx.arc(0, 0, this.#ROULETTE_RADIUS / 2 - 5, 0, Math.PI * 2);
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

    #showResult(nb: number) {
        let c = this.#canvasRef.current as HTMLCanvasElement;
        let ctx = c.getContext("2d") as CanvasRenderingContext2D;
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.arc(c.clientWidth - 50, c.clientHeight - 50, 40, 0, 2 * Math.PI);
        ctx.fillStyle = getNumberColor(nb);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.fillText(nb + '', c.clientWidth - 50 - (nb < 10 ? 15 : 30), c.clientHeight - 50 + 15);
        ctx.stroke();
        this.#showResetButton();
    }

    #showResetButton() {
        let c = this.#canvasRef.current as HTMLCanvasElement;
        let ctx = c.getContext("2d") as CanvasRenderingContext2D;
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

    async delay(delayMs: number) {
        return await new Promise((resolve, reject) => {
            setTimeout(resolve, delayMs);
        }).then(() => {
            // console.log("ok")
            return true;
        }).catch(() => { return false; })
    }

    getRandomNumber(min: number, max: number) {
        return Math.floor((max + 1 - min) * Math.random() + min);
    }

    canSpin() {
        return !this.state.isSpinning && !this.props.isLocked;
    }
}

export default Roulette