import { Bet } from "../../models/BetModel";
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
                        <BetListItem key={b.value}
                            bet={b}
                            resultNumber={props.resultNumber}
                            changeStake={(sens: string) => props.changeStake(b.value, sens)}
                            deleteBet={() => props.deleteBet(b.value)} />
                    )
                })}
            </div>
        </div>
    )
}

export default BetList