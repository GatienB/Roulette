import React from 'react';
import './App.css';
import Tapis from './components/Tapis/Tapis';
import Roulette from './components/Roulette/Roulette';
import Banque from './components/Banque/Banque';
import BetList from './components/Bets/BetList';
import { BankDetails } from './models/BankModel';
import { Bet } from './models/BetModel';
import { Pagination } from './components/Pagination/Pagination';

type AppState = {
  bets: Bet[],
  bankDetails: BankDetails,
  resultNumber: number,
  history: Bet[][],
  historyIndex: number,
  isRouletteLocked: boolean,
  isBettingLocked: boolean
}

class App extends React.Component<{}, AppState> {
  #rouletteRef: React.RefObject<Roulette>;
  #tapisRef: React.RefObject<Tapis>;
  initialBank: number = 100;

  constructor(props: any) {
    super(props);
    this.#rouletteRef = React.createRef();
    this.#tapisRef = React.createRef();
    this.state = {
      bets: [],
      bankDetails: {
        bank: this.initialBank,
        totalStake: 0
      },
      resultNumber: -1,
      history: [],
      historyIndex: -1,
      isRouletteLocked: false,
      isBettingLocked: false
    }
  }

  async spin() {
    console.log("spinning", this.state.isRouletteLocked, this.#rouletteRef.current?.canSpin());
    // if (this.#rouletteRef.current?.canSpin()) {
    if (!this.state.isRouletteLocked && this.#rouletteRef.current?.canSpin()) {
      if (this.#tapisRef.current?.hasStake()) {
        // this.#tapisRef.current?.stopBetting();
        this.setState({ isBettingLocked: true }, () => {
          let h = this.state.history.slice();
          h.push(this.#tapisRef.current?.getBets() as Bet[]);
          this.setState({
            history: h,
            historyIndex: h.length - 1
          });
          this.#rouletteRef.current?.spin().then((value: number) => {
            console.log("after spin");
            console.log("Result: ", value);
            this.#tapisRef.current?.updateBank(value);
            this.setState({ resultNumber: value, isBettingLocked: false });
          })
        });
      }
      else {
        alert("Place a bet before spinning the wheel.");
      }
    }
    else {
      console.log("Spin locked");
    }
  }

  resetRoulette() {
    console.log("reset roulette");
    this.#tapisRef.current?.clear();
    this.setState({ resultNumber: -1, historyIndex: -1, isRouletteLocked: false });
  }

  updateBank(bankDetails: BankDetails, isRouletteLocked: boolean = false) {
    console.log("UPDATE_BANK: ", bankDetails);
    this.setState({ bankDetails: { bank: bankDetails.bank, totalStake: bankDetails.totalStake }, isRouletteLocked })
  }

  updateBetsList(bets: Bet[]) {
    this.setState({ bets: bets })
  }

  stakeUpdated(betValue: string, sens: string) {
    this.#tapisRef.current?.updateStake(betValue, sens);
  }

  betDeleted(betValue: string) {
    this.#tapisRef.current?.removeBet(betValue);
    this.setState({ historyIndex: -1 });
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
      this.#tapisRef.current?.clear();
      this.setState({ bets: this.state.history[nextIndex].slice() }, () => {
        this.#tapisRef.current?.setBets(this.state.bets);
      })
    })
  }

  render(): React.ReactNode {
    return (
      <div id="main">
        <Banque totalStake={this.state.bankDetails.totalStake} bank={this.state.bankDetails.bank} />
        <div className="row">
          <div className="left-container">
            <BetList bets={this.state.bets}
              resultNumber={this.state.resultNumber}
              changeStake={(bv: string, s: string) => this.stakeUpdated(bv, s)}
              deleteBet={(bv: string) => this.betDeleted(bv)} />
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
            <Tapis ref={this.#tapisRef} initialBank={this.initialBank} isBettingLocked={this.state.isBettingLocked}
              refreshBank={(bankDetails: BankDetails, isRouletteLocked: boolean) => this.updateBank(bankDetails, isRouletteLocked)}
              updateBetsList={(bets: Bet[]) => this.updateBetsList(bets)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
