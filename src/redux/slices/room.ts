import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resolvePlayerColor } from "@helpers/theme";

export interface RoomState {
    roomId: string | null;
    connected: boolean;
    connecting: boolean;
    error: string | null;
    gameStarted: boolean;
    gameData: {
        idGame: string;
        position: string[];
        playerWite: string;
        playerBlack: string;
        reitingWite: number;
        reitingBlack: number;
        timeWite: number;
        timeBlack: number;
        move: boolean;
        message: string;
        typeGame: string;
        timeControl: number;
        timePluse: number;
        fen?: string;
        /** ms-timestamp последнего хода (или момента восстановления часов) по серверу —
         *  нужен для корректировки локального отсчёта (см. GameArea). */
        lastMoveTimestamp?: number;
        /** ms-timestamp начала паузы (disconnect соперника) — если задан,
         *  серверные часы заморожены, клиент НЕ должен продолжать локальный отсчёт. */
        pausedSince?: number | null;
    } | null;
}

const initialState: RoomState = {
    roomId: null,
    connected: false,
    connecting: false,
    error: null,
    gameStarted: false,
    gameData: null,
};

const roomSlice = createSlice({
    name: "room",
    initialState,
    reducers: {
        connectRoomStart(state) {
            state.connecting = true;
            state.error = null;
        },
        connectRoomSuccess(state, action: PayloadAction<{ roomId: string }>) {
            state.connecting = false;
            state.connected = true;
            state.roomId = action.payload.roomId;
            state.error = null;
        },
        connectRoomFailure(state, action: PayloadAction<string>) {
            state.connecting = false;
            state.connected = false;
            state.error = action.payload;
        },
        disconnectRoom(state) {
            state.roomId = null;
            state.connected = false;
            state.connecting = false;
            state.error = null;
            state.gameStarted = false;
            state.gameData = null;
        },
        setRoomError(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
        gameStartSuccess(state, action: PayloadAction<{ idGame: string; position: string[]; playerWite: string; playerBlack: string; reitingWite: number; reitingBlack: number; timeWite: number; timeBlack: number; move: boolean; message: string; typeGame: string; timeControl: number; timePluse: number; fen?: string; lastMoveTimestamp?: number; pausedSince?: number | null }>) {
            state.gameStarted = true;
            state.gameData = action.payload;
        },
        gameReset(state) {
            state.gameStarted = false;
            state.gameData = null;
        },
    },
});

export const {
    connectRoomStart,
    connectRoomSuccess,
    connectRoomFailure,
    disconnectRoom,
    setRoomError,
    gameStartSuccess,
    gameReset,
} = roomSlice.actions;

/** Which color the current user plays in the active game: "wite" | "black" | null. */
export const selectPlayerColor = (state: {
    user: { userName: string };
    room: RoomState;
}): "wite" | "black" | null =>
    resolvePlayerColor(state.user.userName, state.room.gameData);

export const roomReducer = roomSlice.reducer;
export { roomSlice };

export default roomSlice.reducer;
