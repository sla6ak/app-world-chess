import { createSlice } from "@reduxjs/toolkit";

const initialColor = "wite";

export const colorGame = createSlice({
    name: "colorGame",
    initialState: initialColor,
    reducers: {
        newColorGame(_state, action) {
            return action.payload;
        },
    },
});

export const { newColorGame } = colorGame.actions;
