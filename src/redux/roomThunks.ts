import { createAsyncThunk } from "@reduxjs/toolkit";
import client from "../colyseus/client";
import { setRoom, getRoom } from "../colyseus/roomManager";

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
