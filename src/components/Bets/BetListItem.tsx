import { Component, ReactNode } from "react";
import { Bet } from "../../models/bet.model";
import './BetListItem.css';

type BetListItemProps = {
    bet: Bet,
    resultNumber: number,
    changeStake: Function,
    deleteBet: Function
}

class BetListItem extends Component<BetListItemProps> {

    onBtnChangeStakeClick(sens: string) {
        this.props.changeStake(sens)
    }

    render(): ReactNode {
        let bulletClass = "";
        if (this.props.resultNumber !== -1) {
            if (this.props.bet.numbers.some(n => n === this.props.resultNumber)) {
                bulletClass = " won";
            }
            else {
                bulletClass = " lost";
            }
        }

        return (
            <div className="bet-list-item">
                <span data-type="bullet" className={"bullet" + bulletClass}></span>
                <span data-type="bet-value" className="bet-value">{this.props.bet.id}</span>
                <button className="btn-change_stake" onClick={() => this.onBtnChangeStakeClick("-")}>-</button>
                <span className="stake">{this.props.bet.stake} €</span>
                <button className="btn-change_stake" onClick={() => this.onBtnChangeStakeClick("+")}>+</button>
                <button className="btn-delete" title="Delete" onClick={() => this.props.deleteBet()}></button>
                <span className="proba">{this.props.bet.proba}</span>
            </div>
        )
    }
}

export default BetListItem;