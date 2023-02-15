import { ChipStakeEnum } from "../helpers/constants"
import { Bet } from "../models/bet.model"

export interface StoreState {
    bets: Bet[],
    selectedStake: ChipStakeEnum
}