import { Bet } from "../../models/bet.model";
import './BetList.css'
import BetListItem from "./BetListItem";

type BetListProps = {
    bets: Bet[],
    resultNumber: number,
    changeStake: Function,
    deleteBet: Function
}

function BetList(props: BetListProps) {
    // console.log("BetList", props)
    return (
        <div id="bet-list-container">
            <h2>Bets</h2>
            <div id="bet-list">
                {props.bets.map(b => {
                    return (
                        <BetListItem key={b.id}
                            bet={b}
                            resultNumber={props.resultNumber}
                            changeStake={(sens: string) => props.changeStake(b.id, sens)}
                            deleteBet={() => props.deleteBet(b.id)} />
                    )
                })}
            </div>
        </div>
    )
}

export default BetList