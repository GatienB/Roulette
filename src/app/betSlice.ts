import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addStake } from "../helpers/bet-helper";
import { ChipStakeEnum } from "../helpers/constants";
import { Bet } from "../models/bet.model";

export const betSlice = createSlice({
    name: "bet",
    initialState: {
        bets: [] as Bet[],
        selectedStake: ChipStakeEnum.VALUE_2
    },
    reducers: {
        addBet: (state, { payload }: PayloadAction<Bet>) => {
            console.log("betSlice: addBet")
            state.bets.push(payload);
        },
        updateBet: (state, { payload }: PayloadAction<{ id: string, stakeToAdd: number }>) => {
            console.log("betSlice: updateBet")
            const bet = state.bets.find(b => b.id === payload.id);
            if (bet) {
                addStake(bet, payload.stakeToAdd);
            }
        },
        deleteBet: (state, { payload }: PayloadAction<string>) => {
            console.log("betSlice: deleteBet")
            state.bets = state.bets.filter(b => b.id !== payload);
            return state;
        },
        setBets: (state, { payload }: PayloadAction<Bet[]>) => {
            console.log("betSlice: setBets")
            state.bets = payload;
            return state;
        },
        setSelectedStake: (state, { payload }: PayloadAction<ChipStakeEnum>) => {
            console.log("betSlice: setSelectedStake")
            state.selectedStake = payload;
        }
    }
})

export const { addBet, updateBet, deleteBet, setBets, setSelectedStake } = betSlice.actions

export default betSlice.reducer