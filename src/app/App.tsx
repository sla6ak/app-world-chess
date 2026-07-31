import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useIsActivTokenQuery } from "@redux/api/authApi";
import { setUserName, setUserStats } from "@redux/slices/user";
import { connectToRoom } from "@redux/thunks/roomThunks";
import { roomSlice } from "@redux/slices/room";
import { setSearchMode, setGameStart, setGameOver, resetGameEvents, GameType, GameResult } from "@redux/slices/gameEvents";
import { getRoom } from "@services/roomManager";
import Layout from "@layouts/Layout";
import { applyTheme } from "@helpers/theme";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "@components/privateRoute/PrivateRoute";
import PublicRoute from "@components/publicRoute/PublicRoute";
import Statistics from "@features/home/Statistics";
import HomeTab from "@features/home/HomeTab";
import GameBoard from "@features/game/GameBoard";
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
    const { data: auth } = useIsActivTokenQuery("", { skip: !token });
    const roomRef = useRef<any>(null);

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

    // Автоподключение к Colyseus комнате при логине
    useEffect(() => {
        if (userName.length > 1 && token && !roomId) {
            dispatch(connectToRoom({ token, color }))
                .unwrap()
                .then((result) => {
                    dispatch(roomSlice.actions.connectRoomSuccess(result));
                    roomRef.current = getRoom();
                    toast.success(`Connected to room ${result.roomId}`);
                })
                .catch((err) => {
                    dispatch(roomSlice.actions.connectRoomFailure(err || "Failed to connect"));
                });
        }
    }, [userName, token, roomId, dispatch, color]);

    // Подписка на сообщения комнаты
    useEffect(() => {
        const room = roomRef.current || getRoom();
        if (!room) return;

        const handleGameMessage = (message: unknown) => {
            console.log("game message:", message);
            setCurentG(true);
        };

        const handleGameStart = (message: unknown) => {
            console.log("gameStart message:", message);
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
            navigate("/game");
            toast.success("Game found! Starting...");
        };

        const handleSearching = (message: unknown) => {
            console.log("searching message:", message);
            const msg = message as { searchData: { typeGame: GameType; timeControl: number; timePluse: number } };
            if (msg.searchData) {
                dispatch(
                    setSearchMode({
                        typeGame: msg.searchData.typeGame,
                        timeControl: msg.searchData.timeControl,
                        timePluse: msg.searchData.timePluse,
                    })
                );
            }
        };

        const handleGameOver = (message: unknown) => {
            console.log("gameOver message:", message);
            const msg = message as { gameOverData: { result: GameResult; ratingChange: number } };
            if (msg.gameOverData) {
                dispatch(
                    setGameOver({
                        result: msg.gameOverData.result,
                        ratingChange: msg.gameOverData.ratingChange,
                    })
                );
            }
            setCurentG(false);
            navigate("/home");
        };

        const handleSearchCancelled = (message: unknown) => {
            console.log("search_cancelled message:", message);
            dispatch(resetGameEvents());
            toast.info("Game search cancelled");
        };

        const handleSearchCancelledByOpponent = (message: unknown) => {
            console.log("search_cancelled_by_opponent message:", message);
            dispatch(resetGameEvents());
            toast.info("Opponent cancelled the search");
        };

        const unsubscribeGame = room.onMessage("game", handleGameMessage);
        const unsubscribeGameStart = room.onMessage("gameStart", handleGameStart);
        const unsubscribeSearching = room.onMessage("searching", handleSearching);
        const unsubscribeSearchCancelled = room.onMessage("search_cancelled", handleSearchCancelled);
        const unsubscribeSearchCancelledByOpponent = room.onMessage("search_cancelled_by_opponent", handleSearchCancelledByOpponent);
        const unsubscribeGameOver = room.onMessage("gameOver", handleGameOver);

        return () => {
            unsubscribeGame();
            unsubscribeGameStart();
            unsubscribeSearching();
            unsubscribeSearchCancelled();
            unsubscribeSearchCancelledByOpponent();
            unsubscribeGameOver();
        };
    }, [roomId, dispatch, navigate]);

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
                <Route path="/game" element={<GameBoard />} />
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
