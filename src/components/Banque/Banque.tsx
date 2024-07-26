import { BankDetails } from "../../models/BankModel";
import './Banque.css'

function Banque(props: BankDetails) {
    // console.log("Banque", props)
    return (
        <div id="money"><span>Total Stake : <span id="stake-value">{props.totalStake}</span></span><span>Bank : <span
            id="bank-value">{props.bank}</span></span></div>
    )
}

export default Banque