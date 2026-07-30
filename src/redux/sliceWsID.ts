import { createSlice } from "@reduxjs/toolkit";

const initialWsID = "";

export const curentWsID = createSlice({
    name: "wsId",
    initialState: initialWsID,
    reducers: {
        newWsID(_state, action) {
            return action.payload;
        },
    },
});

export const { newWsID } = curentWsID.actions;
