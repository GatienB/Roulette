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
            const stakeLost = wonLostBets.lost.reduce((total, next) => { console.log(total, next); return total + next.stake }, 0);
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