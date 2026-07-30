import { createAsyncThunk } from "@reduxjs/toolkit";
import client from "../colyseus/client";
import type { Room } from "colyseus.js";
import { RootState } from "./store";

export const connectToRoom = createAsyncThunk<
    { roomId: string; room: Room },
    { token: string; color: string },
    { state: RootState }
>(
    "room/connect",
    async ({ token, color }, { rejectWithValue }) => {
        try {
            let room: Room;

            if (roomId) {
                // Переподключение к существующей комнате по reconnectionToken
                room = await client.reconnect(token);
            } else {
                // Создание или поиск комнаты
                room = await client.joinOrCreate("chess_room", { token, color });
            }

            return { roomId: room.roomId, room };
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to connect to room");
        }
    }
);

export const sendRoomMessage = createAsyncThunk(
    "room/sendMessage",
    async (
        { room, message }: { room: Room; message: any },
        { rejectWithValue }
    ) => {
        try {
            room.send(message);
            return { success: true };
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to send message");
        }
    }
);

export const leaveRoom = createAsyncThunk(
    "room/leave",
    async (room: Room, { rejectWithValue }) => {
        try {
            await room.leave();
            return { success: true };
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to leave room");
        }
    }
);
