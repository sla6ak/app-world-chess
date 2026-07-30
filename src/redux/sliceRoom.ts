import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Room } from "colyseus.js";

interface RoomState {
    roomId: string | null;
    connected: boolean;
    connecting: boolean;
    error: string | null;
    room: Room | null;
}

const initialState: RoomState = {
    roomId: null,
    connected: false,
    connecting: false,
    error: null,
    room: null,
};

const roomSlice = createSlice({
    name: "room",
    initialState,
    reducers: {
        connectRoomStart(state) {
            state.connecting = true;
            state.error = null;
        },
        connectRoomSuccess(state, action: PayloadAction<{ roomId: string; room: Room }>) {
            state.connecting = false;
            state.connected = true;
            state.roomId = action.payload.roomId;
            state.room = action.payload.room;
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
            state.room = null;
            state.error = null;
        },
        setRoomError(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
    },
});

export const {
    connectRoomStart,
    connectRoomSuccess,
    connectRoomFailure,
    disconnectRoom,
    setRoomError,
} = roomSlice.actions;

export default roomSlice.reducer;
