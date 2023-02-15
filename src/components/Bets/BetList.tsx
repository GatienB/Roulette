import { useSelector } from "react-redux";
import { StoreState } from "../../app/store.model";
import './BetList.css'
import BetListItem from "./BetListItem";

type BetListProps = {
    resultNumber: number,
    changeStake: Function,
    deleteBet: Function
}

function BetList(props: BetListProps) {
    // console.log("BetList", props)
    const bets = useSelector((state: StoreState) => state.bets);

    return (
        <div id="bet-list-container">
            <h2>Bets</h2>
            <div id="bet-list">
                {bets.map(b => {
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