import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useIsActivTokenQuery } from "@redux/api/authApi";
import { setUserName, setUserStats } from "@redux/slices/user";
import { connectToRoom, reconnectToActiveGame } from "@redux/thunks/roomThunks";
import { roomSlice } from "@redux/slices/room";
import { newColorGame } from "@redux/slices/color";
import { resolvePlayerColor } from "@helpers/theme";
import { setSearchMode, setGameStart, setGameOver, resetGameEvents, GameResult } from "@redux/slices/gameEvents";
import { getRoom } from "@services/roomManager";
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
            setCurentG(true);
        };

        const handleGameStart = (message: unknown) => {
            console.log("[WS] Received 'gameStart' event:", JSON.stringify(message));
            const msg = message as {
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
            };
            console.log("[WS] gameStart — idGame:", msg.idGame,
                "| white:", msg.playerWite,
                "| black:", msg.playerBlack);
            const resolvedColor = resolvePlayerColor(userName, msg);
            if (resolvedColor) dispatch(newColorGame(resolvedColor));
            dispatch(
                roomSlice.actions.gameStartSuccess({
                    idGame: msg.idGame,
                    position: msg.position,
                    playerWite: msg.playerWite,
                    playerBlack: msg.playerBlack,
                    reitingWite: msg.reitingWite,
                    reitingBlack: msg.reitingBlack,
                    timeWite: msg.timeWite,
                    timeBlack: msg.timeBlack,
                    move: msg.move,
                    message: msg.message,
                    typeGame: msg.typeGame,
                    timeControl: msg.timeControl,
                    timePluse: msg.timePluse,
                })
            );
            dispatch(setGameStart());
            setCurentG(true);
            console.log("[WS] Navigating to /game");
            navigate("/game");
            toast.success("Game found! Starting...");
        };

        const handleGameOver = (message: unknown) => {
            console.log("[WS] Received 'gameOver' event:", JSON.stringify(message));
            const msg = message as { gameOverData: { result: GameResult; ratingChange: number } };
            if (msg.gameOverData) {
                console.log("[WS] gameOver — result:", msg.gameOverData.result,
                    "| ratingChange:", msg.gameOverData.ratingChange);
                dispatch(
                    setGameOver({
                        result: msg.gameOverData.result,
                        ratingChange: msg.gameOverData.ratingChange,
                    })
                );
            }
            setCurentG(false);
            console.log("[WS] Navigating to /home (game over)");
            navigate("/home");
        };

        const unsubscribeGame = room.onMessage("game", handleGameMessage);
        const unsubscribeGameStart = room.onMessage("gameStart", handleGameStart);
        const unsubscribeGameOver = room.onMessage("gameOver", handleGameOver);

        return () => {
            unsubscribeGame();
            unsubscribeGameStart();
            unsubscribeGameOver();
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
