import React, { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useIsActivTokenQuery } from "@redux/authAPI";
import { isUserName } from "@redux/sliceUserName";
import { connectToRoom } from "@redux/roomThunks";
import { roomSlice } from "@redux/sliceRoom";
import { getRoom } from "../colyseus/roomManager";
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

function App() {
    const [curentG, setCurentG] = useState(false);
    const color = useSelector((state: RootState) => state.colorGame);
    const token = useSelector((state: RootState) => state.token);
    const userName: string = useSelector((state: RootState) => state.userName);
    const currentTheme: string = useSelector((state: RootState) => state.theme);
    const roomId = useSelector((state: RootState) => state.room.roomId);
    const dispatch = useDispatch<AppDispatch>();
    const { data: auth } = useIsActivTokenQuery("", { skip: !token });
    const roomRef = useRef<any>(null);

    useEffect(() => {
        if (auth === undefined) {
            return;
        }
        dispatch(isUserName(auth.user.name));
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

        room.onMessage("game", handleGameMessage);

        return () => {
            room.offMessage("game", handleGameMessage);
        };
    }, [roomId]);

    return (
        <BrowserRouter basename={process.env.PUBLIC_URL + "/"}>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <DashboardPage curentG={curentG} />
                            </PrivateRoute>
                        }
                    >
                        <Route
                            path="/home"
                            element={
                                <PrivateRoute>
                                    <HomeTab />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/statistic"
                            element={
                                <PrivateRoute>
                                    <Statistics />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/game"
                            element={
                                <PrivateRoute>
                                    <GameBoard />
                                </PrivateRoute>
                            }
                        />
                    </Route>
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <RegisterPage />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
