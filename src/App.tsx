import React from 'react';
import './App.css';
import Tapis from './components/Tapis/Tapis';
import Roulette from './components/Roulette/Roulette';
import Banque from './components/Banque/Banque';
import BetList from './components/Bets/BetList';
import { Pagination } from './components/Pagination/Pagination';
import { Bet } from './models/bet.model';
import { isBetExists } from './components/Tapis/Tapis-helper';
import { ChipStakeEnum } from './helpers/constants';

type AppState = {
  bets: Bet[],
  bank: number,
  resultNumber: number,
  history: Bet[][],
  historyIndex: number,
  isRouletteLocked: boolean,
  isBettingLocked: boolean,
  selectedStake: ChipStakeEnum
}

class App extends React.Component<{}, AppState> {
  #rouletteRef: React.RefObject<Roulette>;
  initialBank: number = 100;

  constructor(props: any) {
    super(props);
    this.#rouletteRef = React.createRef();
    this.state = {
      bets: [],
      bank: this.initialBank,
      resultNumber: -1,
      history: [],
      historyIndex: -1,
      isRouletteLocked: false,
      isBettingLocked: false,
      selectedStake: ChipStakeEnum.VALUE_1
    }
  }

  async spin() {
    console.log("spinning", this.state.isRouletteLocked, this.#rouletteRef.current?.canSpin());
    if (!this.state.isRouletteLocked && this.#rouletteRef.current?.canSpin()) {
      if (this.state.bets.length > 0) {
        this.setState({ isBettingLocked: true }, () => {
          let h = this.state.history.slice();
          h.push(this.state.bets);
          this.setState({
            history: h,
            historyIndex: h.length - 1
          });
          this.#rouletteRef.current?.spin().then((value: number) => {
            console.log("after spin");
            console.log("Result: ", value);
            let betsResult = this.getWinBets(value);
            let benef = this.getNetGainByNumber(betsResult);
            this.setState({ resultNumber: value, isBettingLocked: false, bank: this.state.bank + benef }, () => {
              this.setState({ isRouletteLocked: this.getTotalStake() > this.state.bank });
            });
          })
        });
      }
      else {
        alert("Place a bet before spinning the wheel.");
      }
    }
    else {
      console.log("Spin locked");
      if (this.getTotalStake() > this.state.bank) {
        this.showAlertStakeSupBank();
      }
    }
  }

  resetRoulette() {
    console.log("reset roulette");
    this.setState({ resultNumber: -1, historyIndex: -1, isRouletteLocked: false, bets: [] });
  }

  updateBetsList(bets: Bet[]) {
    this.setState({ bets: bets })
  }

  stakeUpdated(betId: string, sens: string) {
    if (!this.state.isBettingLocked) {
      let bets = this.state.bets.slice();
      let index = bets.findIndex(_b => _b.id === betId);
      if (index >= 0) {
        if (sens === "+") {
          if (this.canAddStake(this.state.selectedStake)) {
            bets[index].addStake(this.state.selectedStake);
            this.setState({ bets });
          } else {
            this.showAlertStakeSupBank();
          }
        } else if (sens === "-") {
          if (bets[index].stake - this.state.selectedStake <= 0) {
            bets.splice(index, 1);
          }
          else {
            bets[index].addStake(-this.state.selectedStake);
          }
          this.setState({ bets: bets });
        }
      }
    }
  }

  betDeleted(betId: string) {
    if (!this.state.isBettingLocked) {
      let i = this.state.bets.findIndex(b => b.id === betId);
      if (i >= 0) {
        let bets = this.state.bets.slice();
        bets.splice(i, 1);
        this.setState({ bets: bets });
      }
      else {
        console.warn("Can't find bet Id : ", betId);
      }
    }
    this.setState({ historyIndex: -1 });
  }

  addBet(newBet: Bet) {
    if (!this.state.isBettingLocked) {
      if (this.canAddStake(newBet.stake)) {
        if (isBetExists(this.state.bets, newBet)) {
          console.log("exists")
          let b = this.state.bets.findIndex(b => b.id === newBet.id);
          this.state.bets[b].addStake(newBet.stake);
          this.setState({ bets: [...this.state.bets] });
        } else {
          console.log("new")
          this.setState({ bets: [...this.state.bets, newBet] });
        }
      } else {
        this.showAlertStakeSupBank();
      }
    }
  }

  showAlertStakeSupBank() {
    alert("Can't bet more than your bank");
  }

  getTotalStake() {
    return this.state.bets.reduce((accumulator: number, currentValue: Bet) => accumulator + currentValue.stake, 0);
  }

  selectedStakeChanged(newStake: ChipStakeEnum) {
    this.setState({ selectedStake: newStake });
  }

  canAddStake(newStake: number) {
    return this.getTotalStake() + newStake <= this.state.bank;
  }

  getWinBets(nbResult: number) {
    // { value: bet, coord: { x, y }, stake: this.stakeValue, numbers: [] };
    let wonBets = [];
    let lostBets = [];
    if (this.state.bets && this.state.bets.length > 0) {
      for (const bet of this.state.bets) {
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


  onPageIndexChanged(sens: string) {
    let nextIndex: number = -1;
    if (this.state.history.length > 0) {
      if (sens === "-") {
        if (this.state.historyIndex - 1 >= 0)
          nextIndex = this.state.historyIndex - 1;
        else
          nextIndex = this.state.history.length - 1;
      } else if (sens === "+") {
        if (this.state.historyIndex + 1 < this.state.history.length)
          nextIndex = this.state.historyIndex + 1;
        else
          nextIndex = 0;
      }
    }

    this.setState({ historyIndex: nextIndex }, () => {
      this.setState({ bets: this.state.history[nextIndex].slice() }, () => {
        this.setState({ isRouletteLocked: this.getTotalStake() > this.state.bank });
      })
    })
  }

  render(): React.ReactNode {
    return (
      <div id="main">
        <Banque totalStake={this.getTotalStake()} bank={this.state.bank} />
        <div className="row">
          <div className="left-container">
            <BetList bets={this.state.bets}
              resultNumber={this.state.resultNumber}
              changeStake={(betId: string, s: string) => this.stakeUpdated(betId, s)}
              deleteBet={(betId: string) => this.betDeleted(betId)} />
            {/* <h2>Bets stats</h2>
          <div id="bet-stats"></div> */}
            {this.state.history.length > 0 &&
              <Pagination indexMax={this.state.history.length}
                index={this.state.historyIndex}
                onIndexChanged={(sens: string) => this.onPageIndexChanged(sens)} />}
            {/* <div>
              <button id="simulationBtn">Simulate</button>
            </div> */}
          </div>
          <div>
            <div id="spin-output"></div>
            <br></br>
            <Roulette isLocked={this.state.isRouletteLocked} ref={this.#rouletteRef} onSpin={() => this.spin()} onReset={() => this.resetRoulette()} />
            <Tapis isBettingLocked={this.state.isBettingLocked}
              bets={this.state.bets}
              addBet={(bet: Bet) => this.addBet(bet)}
              selectedStakeChanged={(stake: ChipStakeEnum) => this.selectedStakeChanged(stake)} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
