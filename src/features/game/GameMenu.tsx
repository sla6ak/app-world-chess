import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useCreateSearchRoomMutation } from "@redux/api/authApi";
import { startSearch, cancelSearch, connectToRoom } from "@redux/thunks/roomThunks";
import { resetGameEvents, setSearchMode, setSearchGameId } from "@redux/slices/gameEvents";
import { connectRoomSuccess } from "@redux/slices/room";
import { useAppDispatch } from "@redux/store";
import type { RootState } from "@redux/store";
import Modal from "@components/modal/Modal";
import ModalFindGame from "@features/game/ModalFindGame";

// eslint-disable-next-line @typescript-eslint/no-redeclare
type PropTypes = {};

const GameMenu: React.FC<PropTypes> = () => {
    const [creatingRoom, setCreatingRoom] = useState(false);
    const gameStatus = useSelector((state: RootState) => (state as any).gameEvents.status);
    const color = useSelector((state: RootState) => (state as any).colorGame);
    const token = useSelector((state: RootState) => (state as any).token);
    const searchGameId = useSelector((state: RootState) => (state as any).gameEvents.searchGameId);
    const dispatch = useAppDispatch();
    const [typeGame, setTypeGame] = useState<"standart" | "fisher">("standart");
    const [createSearchRoom] = useCreateSearchRoomMutation();

    const isSearching = gameStatus === "searching";

    const gameRegim = () => {
        setTypeGame((prev) => (prev === "standart" ? "fisher" : "standart"));
    };

    /**
     * Почати пошук гри через REST.
     * 1. Створюємо гру через REST (POST /game/find)
     * 2. Якщо matched — одразу підключаємось до WS кімнати
     * 3. Якщо waiting — підключаємось до WS кімнати і чекаємо gameStart через WS push
     */
    const handleStartSearch = async (timeControl: number, timePluse: number) => {
        // Скасовуємо будь-який активний пошук перед новим
        if (isSearching && searchGameId) {
            await dispatch(cancelSearch(searchGameId)).unwrap();
            dispatch(resetGameEvents());
        }

        setCreatingRoom(true);
        try {
            // Крок 1: REST — створюємо пошук гри
            const result = await dispatch(
                startSearch({ typeGame, timeControl, timePluse })
            ).unwrap();

            setCreatingRoom(false);

            if (result.status === "matched" && result.game) {
                // Гру знайдено суперника — підключаємось до WS кімнати
                const gameId = result.game._id;
                console.log("[GameMenu] 🎯 Matched immediately! gameId:", gameId);
                dispatch(setSearchGameId(gameId));
                dispatch(connectToRoom({ token, color, gameId }))
                    .unwrap()
                    .then(() => {
                        dispatch(connectRoomSuccess({ roomId: gameId }));
                        dispatch(setSearchMode({ typeGame, timeControl, timePluse }));
                        toast.info(`Game found! (${timeControl} + ${timePluse} min, ${typeGame})`);
                    })
                    .catch((err) => {
                        toast.error("Failed to connect to game room");
                        dispatch(resetGameEvents());
                    });
            } else if (result.status === "waiting" && result.gameId) {
                // Чекаємо на суперника — підключаємось до WS кімнати і чекаємо gameStart через WS push
                const gameId = result.gameId;
                console.log("[GameMenu] ⏳ Waiting for opponent, gameId:", gameId);
                dispatch(setSearchGameId(gameId));

                // Підключаємось до WS кімнати одразу — сервер pushить gameStart коли обидва гравці в кімнаті
                dispatch(connectToRoom({ token, color, gameId }))
                    .unwrap()
                    .then(() => {
                        dispatch(connectRoomSuccess({ roomId: gameId }));
                        dispatch(setSearchMode({ typeGame, timeControl, timePluse }));
                        toast.info(`Waiting for opponent (${timeControl} + ${timePluse} min, ${typeGame})...`);
                    })
                    .catch((err) => {
                        toast.error("Failed to connect to game room");
                        dispatch(resetGameEvents());
                    });
            } else {
                // Невідома відповідь
                toast.error("Unexpected response from server");
                dispatch(resetGameEvents());
            }
        } catch (error) {
            setCreatingRoom(false);
            console.error("[GameMenu] Failed to start search:", error);
            toast.error("Failed to start game search");
            dispatch(resetGameEvents());
        }
    };

    const handleCancelSearch = async () => {
        try {
            await dispatch(cancelSearch(searchGameId)).unwrap();
        } catch {
            // ignore cancel errors
        }
        dispatch(resetGameEvents());
        toast.info("Game search cancelled");
    };

    const timeControls = [
        { tc: 1, tp: 0, label: "1min" },
        { tc: 3, tp: 0, label: "3min" },
        { tc: 5, tp: 0, label: "5min" },
        { tc: 1, tp: 1, label: "1min+1s" },
        { tc: 3, tp: 2, label: "3min+2s" },
        { tc: 5, tp: 3, label: "5min+3s" },
        { tc: 10, tp: 5, label: "10min+5s" },
        { tc: 15, tp: 10, label: "15min+10s" },
        { tc: 30, tp: 30, label: "30min+30s" },
    ];

    return (
        <div className="h-full flex flex-col bg-theme-primary">
            {/* Header */}
            <header className="max-w-5xl mx-auto w-full px-4 pt-6 pb-2 md:px-8 md:pt-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold font-poppins tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                            New Game
                        </h1>
                        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                            Choose a time control to start playing
                        </p>
                    </div>
                    <button
                        onClick={gameRegim}
                        className="self-start sm:self-auto px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_0_rgba(0,0,0,0.3),0_6px_12px_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-[0_2px_4px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                        style={{
                            backgroundColor: "var(--color-accent-subtle)",
                            color: "var(--color-accent)",
                            border: "1px solid var(--color-accent-border)",
                            boxShadow: "0 3px 0 rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.15)",
                        }}
                    >
                        <span className="hidden sm:inline">Regim:</span> {typeGame}
                    </button>
                </div>
            </header>

            {/* Time controls grid */}
            <div className="flex-1 min-h-0 max-w-5xl mx-auto w-full px-4 md:px-8 pb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 h-full">
                    {timeControls.map(({ tc, tp, label }) => (
                        <button
                            key={`${tc}-${tp}`}
                            onClick={() => handleStartSearch(tc, tp)}
                            disabled={creatingRoom || isSearching}
                            className="group relative flex flex-col items-center justify-center w-full rounded-xl font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(102,53,23,0.35)] active:translate-y-0.5 active:shadow-[0_2px_6px_rgba(102,53,23,0.2)] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent overflow-hidden"
                            style={{
                                backgroundColor: "rgba(102, 53, 23, 0.85)",
                                color: "var(--color-text-on-accent)",
                                boxShadow: "0 4px 0 rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.2), var(--shadow-card)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                transform: "translateY(2px)",
                            }}
                        >
                            {/* Cube top face highlight */}
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-xl" />
                            {/* Subtle shine effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            <span className="relative text-2xl font-bold leading-none">{tc}</span>
                            {tp > 0 && (
                                <span className="relative text-[10px] mt-0.5 opacity-80">
                                    +{tp}s
                                </span>
                            )}
                            <span className="relative text-[9px] mt-1 opacity-60 group-hover:opacity-100 transition-opacity hidden lg:block">
                                {label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {isSearching && (
                <Modal onModalClose={handleCancelSearch}>
                    <ModalFindGame onCancel={handleCancelSearch} />
                </Modal>
            )}
        </div>
    );
};

export default GameMenu;
