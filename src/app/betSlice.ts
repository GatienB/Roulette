import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { addStake } from "../helpers/bet-helper";
import { Bet } from "../models/bet.model";

export const betSlice = createSlice({
    name: "bet",
    initialState: [] as Bet[],
    reducers: {
        addBet: (state, { payload }: PayloadAction<Bet>) => {
            console.log("betSlice: addBet")
            state.push(payload);
        },
        updateBet: (state, { payload }: PayloadAction<{ id: string, stakeToAdd: number }>) => {
            console.log("betSlice: updateBet")
            const bet = state.find(b => b.id === payload.id);
            if (bet) {
                addStake(bet, payload.stakeToAdd);
            }
        },
        deleteBet: (state, { payload }: PayloadAction<string>) => {
            console.log("betSlice: deleteBet")
            state = state.filter(b => b.id !== payload);
            return state;
        },
        setBets: (state, { payload }: PayloadAction<Bet[]>) => {
            console.log("betSlice: setBets")
            state = payload;
            return state;
        }
    }
})

export const { addBet, updateBet, deleteBet, setBets } = betSlice.actions

export default betSlice.reducer