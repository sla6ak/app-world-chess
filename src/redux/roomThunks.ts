import { createAsyncThunk } from "@reduxjs/toolkit";
import client from "../colyseus/client";
import { setRoom, getRoom } from "../colyseus/roomManager";
import type { RootState } from "./store";

export const connectToRoom = createAsyncThunk<
    { roomId: string },
    { token: string; color: string },
    { state: RootState }
>(
    "room/connect",
    async ({ token, color }, { rejectWithValue }) => {
        try {
            const room = await client.joinOrCreate("chess_room", { token, color });
            setRoom(room);
            return { roomId: room.roomId };
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to connect to room");
        }
    }
);

export const sendRoomMessage = createAsyncThunk(
    "room/sendMessage",
    async (
        message: any,
        { rejectWithValue }
    ) => {
        try {
            const room = getRoom();
            if (!room) {
                return rejectWithValue("Room is not connected");
            }
            room.send(message);
            return { success: true };
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to send message");
        }
    }
);

export const findGame = createAsyncThunk<
    { roomId: string; message: string },
    { token: string; color: string; typeGame?: string; timeControl?: number; timePluse?: number },
    { state: RootState }
>(
    "room/findGame",
    async ({ token, color, typeGame, timeControl, timePluse }, { rejectWithValue, getState }) => {
        try {
            const room = getRoom();
            if (!room) {
                return rejectWithValue("Room is not connected");
            }
            room.send("findGame", { token, color, typeGame, timeControl, timePluse });
            return { roomId: (getState() as RootState).room.roomId || "", message: "findGame sent" };
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to find game");
        }
    }
);

export const cancelSearch = createAsyncThunk(
    "room/cancelSearch",
    async (_, { rejectWithValue }) => {
        try {
            const room = getRoom();
            if (!room) {
                return rejectWithValue("Room is not connected");
            }
            room.send("cancelSearch");
            return { success: true };
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to cancel search");
        }
    }
);

export const leaveRoom = createAsyncThunk(
    "room/leave",
    async (_, { rejectWithValue }) => {
        try {
            const room = getRoom();
            if (room) {
                await room.leave();
                setRoom(null);
            }
            return { success: true };
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to leave room");
        }
    }
);
