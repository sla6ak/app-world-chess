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
import s from "./GameMenu.module.css";
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

    const handleStartSearch = async (timeControl: number, timePluse: number) => {
        if (isSearching && searchGameId) {
            await dispatch(cancelSearch(searchGameId)).unwrap();
            dispatch(resetGameEvents());
        }

        setCreatingRoom(true);
        try {
            const result = await dispatch(
                startSearch({ typeGame, timeControl, timePluse })
            ).unwrap();

            setCreatingRoom(false);

            if (result.status === "matched" && result.game) {
                const gameId = result.game._id;
                console.log("[GameMenu] Matched immediately! gameId:", gameId);
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
                const gameId = result.gameId;
                console.log("[GameMenu] Waiting for opponent, gameId:", gameId);
                dispatch(setSearchGameId(gameId));
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
        <div className={s.menu}>
            {/* Header */}
            <header className={s.header}>
                <div className={s.headerRow}>
                    <div>
                        <h1 className={s.title} style={{ color: "var(--color-text-primary)" }}>
                            New Game
                        </h1>
                        <p className={s.sub} style={{ color: "var(--color-text-secondary)" }}>
                            Choose a time control to start playing
                        </p>
                    </div>
                    <button
                        onClick={gameRegim}
                        className={s.btn}
                        style={{
                            backgroundColor: "var(--color-accent-subtle)",
                            color: "var(--color-accent)",
                            border: "1px solid var(--color-accent-border)",
                            boxShadow: "0 3px 0 rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.15)",
                        }}
                    >
                        <span className={s.btnLabel}>Regim:</span> {typeGame}
                    </button>
                </div>
            </header>

            {/* Time controls grid */}
            <div className={s.body}>
                <div className={s.grid}>
                    {timeControls.map(({ tc, tp, label }) => (
                        <button
                            key={`${tc}-${tp}`}
                            onClick={() => handleStartSearch(tc, tp)}
                            disabled={creatingRoom || isSearching}
                            className={s.card}
                            style={{
                                backgroundColor: "rgba(102, 53, 23, 0.85)",
                                color: "var(--color-text-on-accent)",
                                boxShadow: "0 4px 0 rgba(0,0,0,0.3), 0 6px 12px rgba(0,0,0,0.2), var(--shadow-card)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                transform: "translateY(2px)",
                            }}
                        >
                            {/* Cube top face highlight */}
                            <div className={s.cardTop} style={{ height: '50%', backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)', opacity: 0, transition: 'opacity 200ms ease', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }} />
                            {/* Subtle shine effect on hover */}
                            <div className={s.cardShine} style={{ backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent)', opacity: 0, transition: 'opacity 200ms ease' }} />
                            <span className={s.cardIcon}>{tc}</span>
                            {tp > 0 && (
                                <span className={s.cardSub}>
                                    +{tp}s
                                </span>
                            )}
                            <span className={s.cardLabel}>
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
