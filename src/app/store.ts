import { configureStore } from "@reduxjs/toolkit";
import betReducer from "./betSlice";

export default configureStore({
    reducer: {
        bets: betReducer
    }
})