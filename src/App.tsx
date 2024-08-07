import React from "react";
import "./App.css";
import Tapis from "./components/Tapis/Tapis";
import Roulette from "./components/Roulette/Roulette";
import Banque from "./components/Banque/Banque";
import BetList from "./components/Bets/BetList";
import { Pagination } from "./components/Pagination/Pagination";
import { Bet } from "./models/bet.model";
import { isBetExists } from "./components/Tapis/Tapis-helper";
import { ChipStakeEnum } from "./helpers/constants";
import { addBet, deleteBet, updateBet, setBets } from "./app/betSlice";
import { connect } from "react-redux";
import { StoreState } from "./app/store.model";
import Alert from "./components/Alert/Alert";

type AlertType = {
  showAlert: boolean;
  message: string;
  title: string;
};

type AppState = {
  bank: number;
  resultNumber: number;
  history: Bet[][];
  historyIndex: number;
  isBettingLocked: boolean;
  alert: AlertType;
};

type AppProps = {
  addBet: Function;
  updateBet: Function;
  deleteBet: Function;
  setBets: Function;
  bets: Bet[];
  selectedStake: ChipStakeEnum;
};

class App extends React.Component<AppProps, AppState> {
  #rouletteRef: React.RefObject<Roulette>;
  initialBank: number = 100;

  constructor(props: any) {
    super(props);
    this.#rouletteRef = React.createRef();
    this.state = {
      bank: this.initialBank,
      resultNumber: -1,
      history: [],
      historyIndex: -1,
      isBettingLocked: false,
      alert: {
        showAlert: false,
        message: "",
        title: "",
      },
    };
  }

  async spin() {
    console.log(
      "spinning",
      this.isRouletteLocked(),
      this.#rouletteRef.current?.canSpin()
    );
    if (!this.isRouletteLocked() && this.#rouletteRef.current?.canSpin()) {
      if (this.props.bets.length > 0) {
        this.setState({ isBettingLocked: true }, () => {
          let h = this.state.history.slice();
          h.push(this.props.bets);
          this.setState({
            history: h,
            historyIndex: h.length - 1,
          });
          this.#rouletteRef.current?.spin().then((value: number) => {
            console.log("after spin");
            console.log("Result: ", value);
            let betsResult = this.getWinBets(value);
            let benef = this.getNetGainByNumber(betsResult);
            this.setState({
              resultNumber: value,
              isBettingLocked: false,
              bank: this.state.bank + benef,
            });
          });
        });
      } else {
        this.setState({
          alert: {
            showAlert: true,
            title: "Roulette locked",
            message: "Place a bet before spinning the roulette.",
          },
        });
      }
    } else {
      console.log("Spin locked");
      if (this.getTotalStake() > this.state.bank) {
        this.showAlertStakeSupBank();
      }
    }
  }

  resetRoulette() {
    console.log("reset roulette");
    this.setState({ resultNumber: -1, historyIndex: -1 });
    this.props.setBets([]);
  }

  stakeUpdated(betId: string, sens: string) {
    if (!this.state.isBettingLocked) {
      let bets = this.props.bets.slice();
      let index = bets.findIndex((_b) => _b.id === betId);
      if (index >= 0) {
        if (sens === "+") {
          if (this.canAddStake(this.props.selectedStake)) {
            this.props.updateBet(bets[index].id, this.props.selectedStake);
          } else {
            this.showAlertStakeSupBank();
          }
        } else if (sens === "-") {
          if (bets[index].stake - this.props.selectedStake <= 0) {
            this.props.deleteBet(bets[index].id);
          } else {
            this.props.updateBet(bets[index].id, -this.props.selectedStake);
          }
        }
      }
    }
  }

  betDeleted(betId: string) {
    if (!this.state.isBettingLocked) {
      let bet = this.props.bets.find((b) => b.id === betId);
      if (bet) {
        this.props.deleteBet(bet.id);
      } else {
        console.warn("Can't find bet Id : ", betId);
      }
    }
    this.setState({ historyIndex: -1 });
  }

  addBet(newBet: Bet) {
    if (!this.state.isBettingLocked) {
      if (this.canAddStake(newBet.stake)) {
        if (isBetExists(this.props.bets, newBet)) {
          console.log("exists");
          this.props.updateBet(newBet.id, newBet.stake);
        } else {
          console.log("new");
          this.props.addBet(newBet);
        }
      } else {
        this.showAlertStakeSupBank();
      }
    }
  }

  showAlertStakeSupBank() {
    this.setState({
      alert: {
        title: "Impossible to add bet",
        message: "Your bet must be less than or equal to your bank",
        showAlert: true,
      },
    });
  }

  getTotalStake() {
    return this.props.bets.reduce(
      (accumulator: number, currentValue: Bet) =>
        accumulator + currentValue.stake,
      0
    );
  }

  canAddStake(newStake: number) {
    return this.getTotalStake() + newStake <= this.state.bank;
  }

  isRouletteLocked() {
    return this.getTotalStake() > this.state.bank;
  }

  getWinBets(nbResult: number) {
    // { value: bet, coord: { x, y }, stake: this.stakeValue, numbers: [] };
    let wonBets = [];
    let lostBets = [];
    if (this.props.bets && this.props.bets.length > 0) {
      for (const bet of this.props.bets) {
        if (bet.numbers.some((n) => n === nbResult)) {
          wonBets.push(bet);
        } else {
          lostBets.push(bet);
        }
      }
    }

    return { won: wonBets, lost: lostBets };
  }

  getNetGainByNumber(wonLostBets: { won: Bet[]; lost: Bet[] }) {
    if (
      wonLostBets &&
      (wonLostBets.won.length > 0 || wonLostBets.lost.length > 0)
    ) {
      const stakeLost = wonLostBets.lost.reduce((total: number, next: Bet) => {
        return total + next.stake;
      }, 0);
      const benefits = wonLostBets.won.reduce((total: number, next: Bet) => {
        return total + next.benef;
      }, 0);
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
        else nextIndex = this.state.history.length - 1;
      } else if (sens === "+") {
        if (this.state.historyIndex + 1 < this.state.history.length)
          nextIndex = this.state.historyIndex + 1;
        else nextIndex = 0;
      }
    }

    this.setState({ historyIndex: nextIndex }, () => {
      this.props.setBets(this.state.history[nextIndex]);
    });
  }

  render(): React.ReactNode {
    return (
      <div id="main">
        {this.state.alert.showAlert && (
          <Alert
            title={this.state.alert.title}
            message={this.state.alert.message}
            onClose={() =>
              this.setState({
                alert: { message: "", title: "", showAlert: false },
              })
            }
          />
        )}
        <Banque totalStake={this.getTotalStake()} bank={this.state.bank} />
        <div className="row">
          <div className="bets-list">
            <BetList
              resultNumber={this.state.resultNumber}
              changeStake={(betId: string, s: string) =>
                this.stakeUpdated(betId, s)
              }
              deleteBet={(betId: string) => this.betDeleted(betId)}
            />
            {this.state.history.length > 0 && (
              <div className="pagination-container">
                <Pagination
                  indexMax={this.state.history.length}
                  index={this.state.historyIndex}
                  onIndexChanged={(sens: string) =>
                    this.onPageIndexChanged(sens)
                  }
                />
              </div>
            )}
          </div>
          <Roulette
            isLocked={this.isRouletteLocked()}
            ref={this.#rouletteRef}
            onSpin={() => this.spin()}
            onReset={() => this.resetRoulette()}
          />
          {/* <div>
              <button id="simulationBtn">Simulate</button>
            </div> */}
        </div>
        <div className="tapis-container">
          <Tapis
            isBettingLocked={this.state.isBettingLocked}
            addBet={(bet: Bet) => this.addBet(bet)}
          />
        </div>
      </div>
    );
  }
}

// export default App;

const mapDispatchToProps = (dispatch: any) => {
  return {
    addBet: (bet: Bet) => {
      dispatch(addBet(bet));
    },
    updateBet: (id: string, stakeToAdd: number) => {
      dispatch(updateBet({ id, stakeToAdd }));
    },
    deleteBet: (id: string) => {
      dispatch(deleteBet(id));
    },
    setBets: (bets: Bet[]) => {
      dispatch(setBets(bets));
    },
  };
};

function mapStateToProps(state: StoreState) {
  const bets = state.bets;
  const selectedStake = state.selectedStake;
  return {
    bets,
    selectedStake,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
