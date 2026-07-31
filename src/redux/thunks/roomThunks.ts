import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "@redux/api/authApi";
import { setRoom, getRoom } from "@services/roomManager";
import client from "@services/client";
import {
    setSearchMode,
    setGameStart,
    setGameOver,
    resetGameEvents,
    setSearchGameId,
} from "@redux/slices/gameEvents";
import { roomSlice } from "@redux/slices/room";
import type { RootState } from "@redux/store";
import type { AppDispatch } from "@redux/store";

/**
 * startSearch — REST: створити пошук гри або підключитися до існуючої.
 *
 * Викликає POST /game/find. Якщо сервер знайшов суперника — повертає
 * status: "matched" з повними даними гри. Якщо створено нову гру —
 * повертає status: "waiting" з gameId.
 *
 * Після цього клієнт підключається до WS кімнати і чекає gameStart
 * через WebSocket (пулінг не потрібний).
 */
export const startSearch = createAsyncThunk<
    { status: string; gameId?: string; game?: any },
    { typeGame: string; timeControl: number; timePluse: number },
    { state: RootState }
>(
    "room/startSearch",
    async ({ typeGame, timeControl, timePluse }, { dispatch, getState, rejectWithValue }) => {
        try {
            console.log("[REST] Starting game search | typeGame:", typeGame,
                "| timeControl:", timeControl, "| timePluse:", timePluse);

            const result = await dispatch(
                authApi.endpoints.createSearchRoom.initiate({
                    typeGame,
                    timeControl,
                    timePluse,
                })
            ).unwrap();

            console.log("[REST] Search response | status:", result.status,
                "| gameId:", result.gameId, "| message:", result.message);

            return result;
        } catch (error: unknown) {
            console.error("[REST] Failed to start search:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Failed to start search");
        }
    }
);

/**
 * cancelSearch — REST: скасувати пошук гри.
 * Видаляє незапущену гру з MongoDB.
 */
export const cancelSearch = createAsyncThunk<
    { success: boolean },
    string | null | undefined,
    { state: RootState }
>(
    "room/cancelSearch",
    async (gameId, { dispatch }) => {
        console.log("[REST] Cancelling search | gameId:", gameId);

        if (!gameId) {
            return { success: true };
        }

        try {
            await dispatch(
                authApi.endpoints.cancelSearchRoom.initiate({ gameId })
            ).unwrap();
            console.log("[REST] Search cancelled successfully | gameId:", gameId);
        } catch (error) {
            console.error("[REST] Failed to cancel search:", error);
        }

        return { success: true };
    }
);



/**
 * connectToRoom — підключення до WS кімнати для ігрового процесу.
 * Тепер підключається з gameId, щоб завантажити ігровий стан з MongoDB.
 */
export const connectToRoom = createAsyncThunk<
    { roomId: string },
    { token: string; color: string; gameId?: string },
    { state: RootState }
>(
    "room/connect",
    async ({ token, color, gameId }, { rejectWithValue }) => {
        try {
            console.log("[WS] Connecting to Colyseus room with gameId:", gameId || "chess_room");
            const room = await client.joinOrCreate("chess_room", { token, color, gameId });
            setRoom(room);
            console.log("[WS] Connected to room, roomId:", room.roomId);
            return { roomId: room.roomId };
        } catch (error: unknown) {
            console.error("[WS] Failed to connect to room:", error);
            return rejectWithValue(error instanceof Error ? error.message : "Failed to connect to room");
        }
    }
);

/**
 * sendGameMove — WS: надіслати хід під час активної партії.
 */
export const sendGameMove = createAsyncThunk<
    { success: boolean },
    { position: string[]; move: boolean },
    { state: RootState }
>(
    "room/sendGameMove",
    async ({ position, move }, { rejectWithValue }) => {
        try {
            const room = getRoom();
            if (!room) {
                return rejectWithValue("Room is not connected");
            }
            room.send("gameMove", { position, move });
            return { success: true };
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to send move");
        }
    }
);

/**
 * sendGameOver — WS: повідомити про завершення гри.
 */
export const sendGameOver = createAsyncThunk<
    { success: boolean },
    { result: string; ratingChange: number },
    { state: RootState }
>(
    "room/sendGameOver",
    async ({ result, ratingChange }, { rejectWithValue }) => {
        try {
            const room = getRoom();
            if (!room) {
                return rejectWithValue("Room is not connected");
            }
            room.send("gameOver", { result, ratingChange });
            return { success: true };
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to send game over");
        }
    }
);

const roomThunks = {
    startSearch,
    cancelSearch,
    connectToRoom,
    sendGameMove,
    sendGameOver,
};
export default roomThunks;
