import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { THEMES, type ThemeName } from "@helpers/theme";

const initialTheme: ThemeName = "theme-light";

export const themeSlice = createSlice({
    name: "theme",
    initialState: initialTheme as ThemeName,
    reducers: {
        setTheme(_state, action: PayloadAction<ThemeName>) {
            return action.payload;
        },
    },
});

export const isThemeName = (value: unknown): value is ThemeName =>
    typeof value === "string" && (THEMES as readonly string[]).includes(value);

export const { setTheme } = themeSlice.actions;

export default themeSlice;
