import { createSlice } from "@reduxjs/toolkit";
import { THEMES } from "@helpers/theme";

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
