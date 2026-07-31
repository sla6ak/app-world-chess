import { createAsyncThunk } from "@reduxjs/toolkit";
import client from "@services/client";
import { setRoom, getRoom } from "@services/roomManager";
import { authApi } from "@redux/api/authApi";
import type { RootState } from "@redux/store";

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
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to connect to room");
        }
    }
);

export const sendRoomMessage = createAsyncThunk<
    { success: boolean },
    { event: string; data?: unknown },
    { state: RootState }
>(
    "room/sendMessage",
    async ({ event, data }, { rejectWithValue }) => {
        try {
            const room = getRoom();
            if (!room) {
                return rejectWithValue("Room is not connected");
            }
            room.send(event, data);
            return { success: true };
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to send message");
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
            return { roomId: (getState() as any).room.roomId || "", message: "findGame sent" };
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to find game");
        }
    }
);

export const cancelSearch = createAsyncThunk<
    { success: boolean },
    string | null | undefined,
    { state: RootState }
>(
    "room/cancelSearch",
    async (gameId, { dispatch }) => {
        // REST-запрос на бекенд для удаления незапущенной игры по ID
        if (gameId) {
            try {
                await dispatch(
                    authApi.endpoints.cancelSearchRoom.initiate({ gameId })
                ).unwrap();
            } catch {
                // Не блокируем отмену, если REST-запрос не удался
            }
        }

        // Также отправляем WS-сообщение для уведомления комнаты
        try {
            const room = getRoom();
            if (room) {
                room.send("cancelSearch", { gameId });
            }
        } catch (error: unknown) {
            // ignore WS errors
        }

        return { success: true };
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
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to leave room");
        }
    }
);

const roomThunks = { connectToRoom, sendRoomMessage, findGame, cancelSearch, leaveRoom };
export default roomThunks;
