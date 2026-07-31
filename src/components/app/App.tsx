import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useIsActivTokenQuery } from "@redux/authAPI";
import { setUserName, setUserStats } from "@redux/userSlice";
import { connectToRoom } from "@redux/roomThunks";
import { roomSlice } from "@redux/sliceRoom";
import { setSearchMode, setGameStart, setGameOver, resetGameEvents } from "@redux/sliceGameEvents";
import { getRoom } from "../../colyseus/roomManager";
import Layout from "@layouts/Layout";
import { applyTheme } from "@helpers/theme";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "@components/privateRoute/PrivateRoute";
import PublicRoute from "@components/publicRoute/PublicRoute";
import Statistics from "@components/statistics/Statistics";
import HomeTab from "@components/homeTab/HomeTab";
import GameBoard from "@components/gameBoard/GameBoard";
import type { RootState, AppDispatch } from "@redux/store";

const LoginPage = React.lazy(() => import("@views/loginPage/LoginPage"));
const RegisterPage = React.lazy(() => import("@views/registerPage/RegisterPage"));
const DashboardPage = React.lazy(() => import("@views/dashboardPage/DashboardPage"));

function AppContent() {
    const [curentG, setCurentG] = useState(false);
    const color = useSelector((state: RootState) => state.colorGame);
    const token = useSelector((state: RootState) => state.token);
    const userName: string = useSelector((state: RootState) => state.user.userName);
    const currentTheme: string = useSelector((state: RootState) => state.theme);
    const roomId = useSelector((state: RootState) => state.room.roomId);
    const gameStarted = useSelector((state: RootState) => state.room.gameStarted);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { data: auth } = useIsActivTokenQuery("", { skip: !token });
    const roomRef = useRef<any>(null);
    const prevGameStarted = useRef(false);

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

        const handleGameMessage = (message: any) => {
            console.log("game message:", message);
            setCurentG(true);
        };

        const handleGameStart = (message: any) => {
            console.log("gameStart message:", message);
            dispatch(
                roomSlice.actions.gameStartSuccess({
                    idGame: message.idGame,
                    position: message.position,
                    playerWite: message.playerWite,
                    playerBlack: message.playerBlack,
                    reitingWite: message.reitingWite,
                    reitingBlack: message.reitingBlack,
                    timeWite: message.timeWite,
                    timeBlack: message.timeBlack,
                    move: message.move,
                    message: message.message,
                    typeGame: message.typeGame,
                    timeControl: message.timeControl,
                    timePluse: message.timePluse,
                })
            );
            dispatch(setGameStart());
            setCurentG(true);
            navigate("/game");
            toast.success("Game found! Starting...");
        };

        const handleSearching = (message: any) => {
            console.log("searching message:", message);
            if (message.searchData) {
                dispatch(
                    setSearchMode({
                        typeGame: message.searchData.typeGame,
                        timeControl: message.searchData.timeControl,
                        timePluse: message.searchData.timePluse,
                    })
                );
            }
        };

        const handleGameOver = (message: any) => {
            console.log("gameOver message:", message);
            if (message.gameOverData) {
                dispatch(
                    setGameOver({
                        result: message.gameOverData.result,
                        ratingChange: message.gameOverData.ratingChange,
                    })
                );
            }
            setCurentG(false);
            navigate("/home");
        };

        const handleSearchCancelled = (message: any) => {
            console.log("search_cancelled message:", message);
            dispatch(resetGameEvents());
            toast.info("Game search cancelled");
        };

        const handleSearchCancelledByOpponent = (message: any) => {
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
