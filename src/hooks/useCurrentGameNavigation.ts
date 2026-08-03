import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { authApi } from "@redux/api/authApi";
import { newColorGame } from "@redux/slices/color";
import { roomSlice } from "@redux/slices/room";
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

/**
 * Возвращает обработчик перехода к текущей активной игре:
 * - если неоконченная партия есть на сервере — восстанавливает состояние и ведёт на /game,
 * - иначе показывает toast "Текущая игра не найдена".
 */
const useCurrentGameNavigation = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
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
            // Восстанавливаем состояние партии и переходим на страницу игры;
            // App.tsx сам переподключится к WS-комнате по gameId.
            const restored = {
                idGame: String(g._id),
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
            dispatch(roomSlice.actions.gameStartSuccess(restored));
            const myName = getUserNameFromStorage();
            const resolved = resolvePlayerColor(myName, restored);
            if (resolved) dispatch(newColorGame(resolved));
            navigate("/game");
        } catch {
            toast.info("Текущая игра не найдена");
        }
    }, [checkActiveGame, dispatch, navigate]);

    return { handleCurrentGame, checkingGame };
};

export default useCurrentGameNavigation;
