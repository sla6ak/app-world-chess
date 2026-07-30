import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useIsActivTokenQuery } from "@redux/authAPI";
import { isUserName } from "@redux/sliceUserName";
import { newWsID } from "@redux/sliceWsID";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Layout from "@layouts/Layout";
import { applyTheme } from "@helpers/theme";
import { toast } from "react-toastify";
import PrivateRoute from "@components/privateRoute/PrivateRoute";
import PublicRoute from "@components/publicRoute/PublicRoute";
import Statistics from "@components/statistics/Statistics";
import HomeTab from "@components/homeTab/HomeTab";
import GameBoard from "@components/gameBoard/GameBoard";
import { reqWsStartApp } from "@helpers/requestWs";
import { socketUrl } from "@redux/testURL";

const LoginPage = React.lazy(() => import("@views/loginPage/LoginPage"));
const RegisterPage = React.lazy(() => import("@views/registerPage/RegisterPage"));
const DashboardPage = React.lazy(() => import("@views/dashboardPage/DashboardPage"));

function App() {
    const [curentG, setCurentG] = useState(false);
    const color = useSelector((state: any) => state.colorGame);
    const token = useSelector((state: any) => state.token);
    const userName: string = useSelector((state: any) => state.userName);
    const currentTheme: string = useSelector((state: any) => state.theme);
    const dispatch = useDispatch();
    const { data: auth } = useIsActivTokenQuery("", { skip: !token });
    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

    const connectionStatus = {
        [ReadyState.CONNECTING]: "Connecting",
        [ReadyState.OPEN]: "Open",
        [ReadyState.CLOSING]: "Closing",
        [ReadyState.CLOSED]: "Closed",
        [ReadyState.UNINSTANTIATED]: "Uninstantiated",
    }[readyState];

    useEffect(() => {
        if (auth === undefined) {
            return;
        }
        dispatch(isUserName(auth.user.name));
    }, [auth, dispatch]);

    useEffect(() => {
        applyTheme(currentTheme);
    }, [currentTheme]);

    useEffect(() => {
        if (userName.length > 1) {
            if (lastMessage !== null) {
                const data = JSON.parse(lastMessage.data);
                const { mesRes } = data;
                console.log("last WS message:", mesRes);
                if (mesRes.message === "ws connect") {
                    dispatch(newWsID(mesRes.idWs));
                    sendMessage(JSON.stringify(reqWsStartApp(mesRes.idWs, token, color)));
                    return;
                }
                if (mesRes.message === "game") {
                    setCurentG(true);
                    toast.info(`We find curent game!${mesRes.idGame}`);
                    return;
                }
                console.log("no find curent game...");
            }
        }
    }, [dispatch, lastMessage, sendMessage, token, userName, setCurentG, color]);

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
                                    <HomeTab connect={{ sendMessage, readyState, lastMessage }} />
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
                                    <GameBoard connect={{ sendMessage, readyState, lastMessage }} />
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
