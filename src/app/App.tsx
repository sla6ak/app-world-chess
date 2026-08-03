import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useIsActivTokenQuery } from "@redux/api/authApi";
import { setUserName, setUserStats } from "@redux/slices/user";
import { connectToRoom, reconnectToActiveGame } from "@redux/thunks/roomThunks";
import { roomSlice } from "@redux/slices/room";
import { newColorGame } from "@redux/slices/color";
import { resolvePlayerColor } from "@helpers/theme";
import { setSearchMode, setGameStart, setGameOver, resetGameEvents, GameResult, setDrawOffer, clearDrawOffer } from "@redux/slices/gameEvents";
import { getRoom } from "@services/roomManager";
import { store } from "@redux/store";
import Layout from "@components/layout/Layout";
import { applyTheme } from "@helpers/theme";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "@components/privateRoute/PrivateRoute";
import PublicRoute from "@components/publicRoute/PublicRoute";
import Statistics from "@features/home/Statistics";
import HomeTab from "@features/home/HomeTab";
import GameArea from "@features/game/GameArea";
import type { RootState, AppDispatch } from "@redux/store";

const LoginPage = React.lazy(() => import("@pages/loginPage/LoginPage"));
const RegisterPage = React.lazy(() => import("@pages/registerPage/RegisterPage"));
const DashboardPage = React.lazy(() => import("@pages/dashboardPage/DashboardPage"));

function AppContent() {
    const [curentG, setCurentG] = useState(false);
    const color = useSelector((state: RootState) => (state as any).colorGame);
    const token = useSelector((state: RootState) => (state as any).token);
    const userName: string = useSelector((state: RootState) => (state as any).user.userName);
    const currentTheme: string = useSelector((state: RootState) => (state as any).theme);
    const roomId = useSelector((state: RootState) => (state as any).room.roomId);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: auth } = useIsActivTokenQuery("", { skip: !token });
    const roomRef = useRef<any>(null);
    const reconnectingRef = useRef(false);

    useEffect(() => {
        if (auth === undefined || !auth.user) {
            return;
        }
        dispatch(setUserName(auth.user.name));
        dispatch(
            setUserStats({
                rating: auth.user.currentReiting ?? 800,
                gamesPlayed: auth.user.gamesPlayed ?? 0,
                wins: auth.user.wins ?? 0,
                losses: auth.user.losses ?? 0,
                draws: auth.user.draws ?? 0,
                maxRating: auth.user.maxRating ?? 800,
            })
        );
    }, [auth, dispatch]);

    useEffect(() => {
        applyTheme(currentTheme);
    }, [currentTheme]);

    // Перевірка активної гри при вході на сайт або перезавантаженні сторінки
    useEffect(() => {
        // Не перевіряємо, якщо вже йде перепідключення, користувач не авторизований,
        // або вже є активна гра (curentG === true)
        if (reconnectingRef.current || !auth?.user || curentG) {
            return;
        }

        // Якщо roomId вже є в Redux, гра вже підключена
        if (roomId) {
            return;
        }

        reconnectingRef.current = true;
        console.log("[Reconnect] Checking for active game | pathname:", location.pathname);

        dispatch(reconnectToActiveGame({ token, color }))
            .unwrap()
            .then((result) => {
                reconnectingRef.current = false;

                if (result.status === "matched" && result.game && result.gameId) {
                    console.log("[Reconnect] ✅ Active game found, reconnecting | gameId:", result.gameId);

                    const gameId = result.gameId!;
                    const gameData = result.game;

                    // WS кімната вже підключена всередині reconnectToActiveGame
                    dispatch(roomSlice.actions.connectRoomSuccess({ roomId: gameId }));

                    // Відновлюємо дані партії з документа MongoDB
                    // (getActiveGame повертає nameWite/nameBlack/...)
                    const restored = {
                        idGame: String(gameData._id ?? gameId),
                        position: gameData.position ?? [],
                        playerWite: gameData.nameWite ?? gameData.playerWite ?? "",
                        playerBlack: gameData.nameBlack ?? gameData.playerBlack ?? "",
                        reitingWite: gameData.reitingWite ?? 800,
                        reitingBlack: gameData.reitingBlack ?? 800,
                        timeWite: Number(gameData.timeWite) || gameData.timeControl || 180,
                        timeBlack: Number(gameData.timeBlack) || gameData.timeControl || 180,
                        move: gameData.move ?? true,
                        message: gameData.message ?? "",
                        typeGame: gameData.typeGame || "standart",
                        timeControl: gameData.timeControl || 180,
                        timePluse: gameData.timePluse || 0,
                        fen: (gameData as any).pgn || undefined, // using pgn field for now
                    };
                    dispatch(roomSlice.actions.gameStartSuccess(restored));
                    const resolvedColor = resolvePlayerColor(userName, restored);
                    if (resolvedColor) dispatch(newColorGame(resolvedColor));
                    dispatch(setSearchMode({
                        typeGame: gameData.typeGame || "standart",
                        timeControl: gameData.timeControl || 180,
                        timePluse: gameData.timePluse || 0,
                    }));
                    setCurentG(true);
                    toast.info("Reconnected to your active game!");
                } else {
                    // Немає активної гри — перенаправляємо на /home
                    console.log("[Reconnect] No active game found, redirecting to /home");
                    toast.info("No active game found");
                    navigate("/home");
                }
            })
            .catch((err) => {
                reconnectingRef.current = false;
                console.error("[Reconnect] Failed to check for active game:", err);
            });
    }, [auth, dispatch, navigate, token, color, curentG, roomId, location.pathname]);

    // Підписка на повідомлення комнаты (тільки для ігрового процесу — ходи, завершення)
    // WS підключення до конкретної кімнати відбувається при пошуку гри або перепідключенні
    useEffect(() => {
        const room = roomRef.current || getRoom();
        if (!room) return;

        console.log("[WS] Subscribing to room messages, roomId:", room.id);

        const handleGameMessage = (message: unknown) => {
            console.log("[WS] Received 'game' event:", JSON.stringify(message));
            const msg = message as {
                position?: string[];
                move?: boolean;
                timeWite?: number;
                timeBlack?: number;
                fen?: string;
            };
            if (msg.position && msg.position.length > 0) {
                dispatch(clearDrawOffer());
            }
            const current = (store.getState() as RootState).room.gameData;
            if (current?.idGame) {
                dispatch(
                    roomSlice.actions.gameStartSuccess({
                        ...current,
                        position: msg.position ?? current.position,
                        move: msg.move ?? current.move,
                        timeWite: msg.timeWite ?? current.timeWite,
                        timeBlack: msg.timeBlack ?? current.timeBlack,
                        ...(msg.fen ? { fen: msg.fen } : {}),
                    })
                );
            }
            setCurentG(true);
        };

        const handleGameStart = (message: unknown) => {
            console.log("[WS] Received 'gameStart' event:", JSON.stringify(message));
            const msg = message as {
                idGame?: string;
                position?: string[];
                playerWite?: string;
                playerBlack?: string;
                reitingWite?: number;
                reitingBlack?: number;
                timeWite?: number;
                timeBlack?: number;
                move?: boolean;
                message?: string;
                typeGame?: string;
                timeControl?: number;
                timePluse?: number;
                fen?: string;
            };
            if (!msg.idGame || msg.idGame === "undefined") {
                console.error("[WS] gameStart missing idGame — ignoring");
                return;
            }
            console.log(
                "[WS] gameStart — idGame:",
                msg.idGame,
                "| white:",
                msg.playerWite,
                "| black:",
                msg.playerBlack
            );
            const payload = {
                idGame: msg.idGame,
                position: msg.position ?? [],
                playerWite: msg.playerWite ?? "",
                playerBlack: msg.playerBlack ?? "",
                reitingWite: msg.reitingWite ?? 800,
                reitingBlack: msg.reitingBlack ?? 800,
                timeWite: msg.timeWite ?? 180,
                timeBlack: msg.timeBlack ?? 180,
                move: msg.move ?? true,
                message: msg.message ?? "",
                typeGame: msg.typeGame ?? "standart",
                timeControl: msg.timeControl ?? 180,
                timePluse: msg.timePluse ?? 0,
                fen: msg.fen,
            };
            const resolvedColor = resolvePlayerColor(userName, payload);
            if (resolvedColor) dispatch(newColorGame(resolvedColor));
            dispatch(roomSlice.actions.gameStartSuccess(payload));
            dispatch(setGameStart());
            setCurentG(true);
            console.log("[WS] Navigating to /game");
            navigate("/game");
            toast.success("Game found! Starting...");
        };

        const handleGameOver = (message: unknown) => {
            console.log("[WS] Received 'gameOver' event:", JSON.stringify(message));
            const msg = message as {
                gameOverData?: {
                    result: string;
                    winnerRole?: string | null;
                    endReason?: string;
                    ratingChange: number;
                };
            };
            if (msg.gameOverData) {
                const god = msg.gameOverData;
                console.log("[WS] gameOver — result:", god.result,
                    "| winnerRole:", god.winnerRole, "| endReason:", god.endReason);
                const gameData = (store.getState() as RootState).room.gameData;
                const myRole = gameData ? resolvePlayerColor(userName, {
                    playerWite: gameData.playerWite,
                    playerBlack: gameData.playerBlack,
                }) : null;
                let personal: GameResult;
                if (god.result === "0.5-0.5") personal = "draw";
                else if (
                    (god.result === "1-0" && myRole === "wite") ||
                    (god.result === "0-1" && myRole === "black")
                ) personal = "win";
                else personal = "loss";
                dispatch(
                    setGameOver({
                        result: personal,
                        ratingChange: god.ratingChange,
                    })
                );
            }
            setCurentG(false);
            console.log("[WS] Navigating to /home (game over)");
            navigate("/home");
        };

        const handleDrawOffered = (message: unknown) => {
            console.log("[WS] Received 'draw_offered' event:", JSON.stringify(message));
            const msg = message as { byRole?: "wite" | "black" };
            if (!msg.byRole) return;
            // Сверяем роль отправителя предложения с нашей ролью в текущей партии
            // (playerWite/playerBlack хранят никнеймы — сравниваем по ним).
            const gameData = (store.getState() as RootState).room.gameData;
            const myRole = gameData ? resolvePlayerColor(userName, gameData) : null;
            if (myRole && msg.byRole === myRole) {
                // Мы предложили ничью — ждём ответа соперника
                dispatch(setDrawOffer("me"));
            } else if (myRole) {
                // Соперник предложил ничью — пульсирующая кнопка «Ничья» у нас
                dispatch(setDrawOffer("opponent"));
            }
        };

        const handleGameDeclinedDraw = (message: unknown) => {
            console.log("[WS] Received 'draw_cleared' event:", JSON.stringify(message));
            dispatch(clearDrawOffer());
        };

        const handleMoveMade = (message: unknown) => {
            console.log("[WS] Received 'move_made':", JSON.stringify(message));
            const msg = message as {
                move?: { from: string; to: string; promotion?: string };
                fen?: string;
                position?: string[];
                timers?: { white: number; black: number };
                nextTurn?: string;
            };
            // Обновляем состояние через GameArea (у него есть свой обработчики)
            // Здесь только подчищаем любые предложения ничьей
            dispatch(clearDrawOffer());
        };

        const handleMoveError = (message: unknown) => {
            console.log("[WS] Received 'move_error':", JSON.stringify(message));
            const msg = message as {
                code: string;
                message: string;
                fen?: string;
                position?: string;
            };
            toast.error(msg.message || "Invalid move");
        };

        const handleTimers = (message: unknown) => {
            // Авторитетные часы от сервера каждую секунду
            const timers = message as { white: number; black: number };
            const current = (store.getState() as RootState).room.gameData;
            if (!current) return;
            dispatch(
                roomSlice.actions.gameStartSuccess({
                    ...current,
                    timeWite: timers.white,
                    timeBlack: timers.black,
                })
            );
        };

        const handleGameResumed = (message: unknown) => {
            console.log("[WS] Received 'gameResumed':", JSON.stringify(message));
            const msg = message as {
                timers?: { white: number; black: number };
                fen?: string;
            };
            const current = (store.getState() as RootState).room.gameData;
            if (current && msg.timers) {
                dispatch(
                    roomSlice.actions.gameStartSuccess({
                        ...current,
                        timeWite: msg.timers.white,
                        timeBlack: msg.timers.black,
                    })
                );
            }
            toast.info("Игра восстановлена");
        };

        const unsubscribeGame = room.onMessage("game", handleGameMessage);
        const unsubscribeGameStart = room.onMessage("gameStart", handleGameStart);
        const unsubscribeGameOver = room.onMessage("gameOver", handleGameOver);
        const unsubscribeDrawOffered = room.onMessage("draw_offered", handleDrawOffered);
        const unsubscribeGameDeclinedDraw = room.onMessage("draw_cleared", handleGameDeclinedDraw);
        const unsubscribeMoveMade = room.onMessage("move_made", handleMoveMade);
        const unsubscribeMoveError = room.onMessage("move_error", handleMoveError);
        const unsubscribeTimers = room.onMessage("timers", handleTimers);
        const unsubscribeGameResumed = room.onMessage("gameResumed", handleGameResumed);

        return () => {
            unsubscribeGame();
            unsubscribeGameStart();
            unsubscribeGameOver();
            unsubscribeDrawOffered();
            unsubscribeGameDeclinedDraw();
            unsubscribeMoveMade();
            unsubscribeMoveError();
            unsubscribeTimers();
            unsubscribeGameResumed();
        };
    }, [roomId, dispatch, navigate, token, color, userName]);

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route index element={<DashboardPage curentG={curentG} />} />
                <Route path="/home" element={<HomeTab />} />
                <Route path="/statistic" element={<Statistics />} />
                <Route path="/game" element={<GameArea />} />
            </Route>
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter basename={process.env.PUBLIC_URL + "/"}>
            <React.Suspense fallback={<div>Loading...</div>}>
                <AppContent />
            </React.Suspense>
        </BrowserRouter>
    );
}

export default App;
