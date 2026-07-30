import React, { useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { sendRoomMessage } from "@redux/roomThunks";
import { useAppDispatch } from "@redux/store";
import { getRoom } from "@colyseus/roomManager";
import type { RootState } from "@redux/store";
import Modal from "../modal/Modal";
import ModalFindGame from "../modalFindGame/ModalFindGame";

// eslint-disable-next-line @typescript-eslint/no-redeclare
type PropTypes = {};

const GameMenu: React.FC<PropTypes> = () => {
    const [modal, setModal] = useState(false);
    const color = useSelector((state: RootState) => state.colorGame);
    const token = useSelector((state: RootState) => state.token);
    const connected = useSelector((state: RootState) => state.room.connected);
    const dispatch = useAppDispatch();
    const [typeGame, setTypeGame] = useState("standart");

    const gameRegim = () => {
        setTypeGame((prev) => (prev === "standart" ? "fisher" : "standart"));
    };

    const handleClickSendMessage = async (timeControl: number, timePluse: number) => {
        const room = getRoom();
        if (!room) {
            toast.error("Room is not connected");
            return;
        }
        setModal(true);
        try {
            await dispatch(
                sendRoomMessage({
                    event: "startGame",
                    timeControl,
                    timePluse,
                    typeGame,
                    token,
                    color,
                })
            ).unwrap();
            toast.info(`Finding game ${timeControl} + ${timePluse} min, wite please...`);
        } catch (error) {
            toast.error("error");
        }
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
                            onClick={() => handleClickSendMessage(tc, tp)}
                            disabled={!connected}
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

            {modal ? (
                <Modal onModalClose={() => setModal(false)}>
                    <ModalFindGame onModalClose={() => setModal(false)} />
                </Modal>
            ) : null}
        </div>
    );
};

export default GameMenu;
