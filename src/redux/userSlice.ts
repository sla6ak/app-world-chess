import { createSlice } from "@reduxjs/toolkit";

export interface UserStats {
    rating: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    maxRating: number;
}

const initialState = {
    userName: "",
    stats: {
        rating: 800,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        maxRating: 800,
    } as UserStats,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserName(state, action) {
            state.userName = action.payload;
        },
        setUserStats(state, action) {
            state.stats = action.payload;
        },
        resetUserStats(state) {
            state.stats = initialState.stats;
        },
        resetUser(state) {
            state.userName = "";
            state.stats = initialState.stats;
        },
    },
});

export const { setUserName, setUserStats, resetUserStats, resetUser } = userSlice.actions;
