import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type GameType = "standart" | "fisher";

export type GameResult = "win" | "loss" | "draw";

export type GameStatus = "idle" | "searching" | "playing" | "gameover";

export interface SearchGameData {
    typeGame: GameType;
    timeControl: number;
    timePluse: number;
}

export interface GameOverData {
    result: GameResult;
    ratingChange: number;
}

export interface GameEventsState {
    status: GameStatus;
    searchData: SearchGameData | null;
    gameOverData: GameOverData | null;
}

const initialState: GameEventsState = {
    status: "idle",
    searchData: null,
    gameOverData: null,
};

const gameEventsSlice = createSlice({
    name: "gameEvents",
    initialState,
    reducers: {
        setSearchMode(state, action: PayloadAction<SearchGameData>) {
            state.status = "searching";
            state.searchData = action.payload;
            state.gameOverData = null;
        },
        setGameStart(state) {
            state.status = "playing";
            state.searchData = null;
            state.gameOverData = null;
        },
        setGameOver(state, action: PayloadAction<GameOverData>) {
            state.status = "gameover";
            state.gameOverData = action.payload;
            state.searchData = null;
        },
        resetGameEvents(state) {
            state.status = "idle";
            state.searchData = null;
            state.gameOverData = null;
        },
    },
});

export const { setSearchMode, setGameStart, setGameOver, resetGameEvents } =
    gameEventsSlice.actions;

export const gameEventsReducer = gameEventsSlice.reducer;
export { gameEventsSlice };

export default gameEventsSlice.reducer;
