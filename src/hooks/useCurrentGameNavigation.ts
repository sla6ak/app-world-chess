import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch } from "@redux/store";
import { authApi } from "@redux/api/authApi";
import { newColorGame } from "@redux/slices/color";
import { roomSlice } from "@redux/slices/room";
import { connectToRoom } from "@redux/thunks/roomThunks";
import { resolvePlayerColor } from "@helpers/theme";

const getUserNameFromStorage = (): string => {
    try {
        const root = localStorage.getItem("persist:root");
        if (!root) return "";
        const parsed = JSON.parse(root);
        if (!parsed.user) return "";
        return JSON.parse(parsed.user).userName ?? "";
    } catch {
        return "";
    }
};

/** Get token from localStorage (redux-persist root) */
const getTokenFromStorage = (): string => {
    try {
        const root = localStorage.getItem("persist:root");
        if (!root) return "";
        return JSON.parse(root)?.token ?? "";
    } catch {
        return "";
    }
};

/**
 * Returns a handler to fetch the active game and navigate to /game.
 * Called from "Current game" button in Sidebar/MobileHeader.
 */
const useCurrentGameNavigation = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [checkActiveGame, { isFetching: checkingGame }] =
        authApi.useLazyGetActiveGameQuery();

    const handleCurrentGame = useCallback(async () => {
        try {
            const result = await checkActiveGame(undefined, false).unwrap();
            const g: any = result?.game;

            if (result?.status !== "matched" || !g) {
                toast.info("Текущая игра не найдена");
                return;
            }

            const gameId = String(g._id);
            const restored = {
                idGame: gameId,
                position: g.position ?? [],
                playerWite: g.nameWite ?? g.playerWite ?? "",
                playerBlack: g.nameBlack ?? g.playerBlack ?? "",
                reitingWite: g.reitingWite ?? 800,
                reitingBlack: g.reitingBlack ?? 800,
                timeWite: Number(g.timeWite) || g.timeControl || 180,
                timeBlack: Number(g.timeBlack) || g.timeControl || 180,
                move: g.move ?? true,
                message: g.message ?? "",
                typeGame: g.typeGame || "standart",
                timeControl: g.timeControl || 180,
                timePluse: g.timePluse || 0,
            };

            // Store game data in Redux BEFORE navigation
            dispatch(roomSlice.actions.gameStartSuccess(restored));

            const myName = getUserNameFromStorage();
            const resolved = resolvePlayerColor(myName, restored);
            if (resolved) dispatch(newColorGame(resolved));

            // Join WS room with gameId — server loads the game from MongoDB
            const token = getTokenFromStorage();
            try {
                await dispatch(
                    connectToRoom({
                        token: token || "",
                        color: resolved || "wite",
                        gameId,
                    })
                ).unwrap();
                console.log("[Reconnect] Connected to room | gameId:", gameId);
            } catch (e) {
                console.warn("[Reconnect] connectToRoom failed:", e);
                toast.warn("Не удалось подключиться к серверу — попробуйте снова");
            }

            navigate("/game");
        } catch (err) {
            console.error("[Reconnect] Failed:", err);
            toast.info("Не удалось найти или восстановить игру");
        }
    }, [checkActiveGame, dispatch, navigate]);

    return { handleCurrentGame, checkingGame };
};

export default useCurrentGameNavigation;
