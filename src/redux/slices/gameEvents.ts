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

/** Кто сейчас держит активное предложение ничьей (in-memory, сбрасывается после хода). */
export type DrawOfferedBy = "me" | "opponent" | null;

export interface GameEventsState {
    status: GameStatus;
    searchData: SearchGameData | null;
    gameOverData: GameOverData | null;
    searchGameId: string | null;
    pollingInterval: ReturnType<typeof setInterval> | null;
    drawOfferedBy: DrawOfferedBy;
}

const initialState: GameEventsState = {
    status: "idle",
    searchData: null,
    gameOverData: null,
    searchGameId: null,
    pollingInterval: null,
    drawOfferedBy: null,
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
        setSearchGameId(state, action: PayloadAction<string | null>) {
            state.searchGameId = action.payload;
        },
        setGameStart(state) {
            state.status = "playing";
            state.searchData = null;
            state.gameOverData = null;
            state.drawOfferedBy = null;
        },
        setGameOver(state, action: PayloadAction<GameOverData>) {
            state.status = "gameover";
            state.gameOverData = action.payload;
            state.searchData = null;
            state.drawOfferedBy = null;
        },
        setDrawOffer(state, action: PayloadAction<Exclude<DrawOfferedBy, null>>) {
            state.drawOfferedBy = action.payload;
        },
        clearDrawOffer(state) {
            state.drawOfferedBy = null;
        },
        resetGameEvents(state) {
            state.status = "idle";
            state.searchData = null;
            state.gameOverData = null;
            state.searchGameId = null;
            state.drawOfferedBy = null;
            if (state.pollingInterval) {
                clearInterval(state.pollingInterval);
                state.pollingInterval = null;
            }
        },
    },
});

export const {
    setSearchMode,
    setGameStart,
    setGameOver,
    setDrawOffer,
    clearDrawOffer,
    resetGameEvents,
    setSearchGameId,
} = gameEventsSlice.actions;

export const gameEventsReducer = gameEventsSlice.reducer;
export { gameEventsSlice };

export default gameEventsSlice.reducer;
