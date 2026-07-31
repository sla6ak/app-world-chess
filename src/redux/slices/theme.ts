import { createSlice } from "@reduxjs/toolkit";

const initialTheme = "theme-light" as const;

export const themeSlice = createSlice({
    name: "theme",
    initialState: initialTheme,
    reducers: {
        setTheme(state, action) {
            return action.payload;
        },
    },
});

export const { setTheme } = themeSlice.actions;

export default themeSlice;
