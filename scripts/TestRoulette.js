
class TestRoulette {
    constructor() {
        this.roulette = new Roulette();
    }

    async testRandomness(spins = 1000) {
        let div = document.createElement("div");
        document.body.appendChild(div);

        let stats = {};
        for (let i = 0; i < spins; i++) {
            let res = this.roulette.getRandomNumber(0, 37);
            if (res in stats) {
                stats[res] += 1;
            }
            else {
                stats[res] = 1;
            }
            console.log("> " + res);
            div.innerText = `${i + 1}/${spins}`;
            await this.roulette.delay(10);
        }
        console.log(stats);
    }

    async testRotationRandomness(spins = 100) {
        let div = document.createElement("div");
        document.body.appendChild(div);

        let stats = {};
        for (let i = 0; i < spins; i++) {
            // let res = await spin(5000, 7000);
            let res = await this.roulette.spin(0, 100);
            if (res in stats) {
                stats[res] += 1;
            }
            else {
                stats[res] = 1;
            }
            console.log("> " + res);
            div.innerText = `${i + 1}/${spins}`;
        }
        console.log(stats);
    }
}
