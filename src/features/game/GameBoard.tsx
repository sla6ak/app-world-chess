import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import HelperBoard from "@features/game/HelperBoard";
import showFigure from "@helpers/showFigure";
import { getRoom } from "@services/roomManager";
import type { RootState } from "@redux/store";
import s from "./GameBoard.module.css";

const GameBoard: React.FC = () => {
    const startPosition = "rnbqkbnrpppppppp88888888888888888888888888888888PPPPPPPPRNBQKBNR";
    const gameData = useSelector((state: RootState) => (state as any).room.gameData);
    const roomId = useSelector((state: RootState) => (state as any).room.roomId);
    const [board, setBoard] = useState<any[]>([]);
    const [activFigure, setActivFigure] = useState({ _id: 1, figure: "" });
    const boardRef = useRef<any[]>([]);

    const initializeBoard = (position: string[]) => {
        const pos = position && position.length > 0 ? position[0] : startPosition;
        const startPositionArr = pos.split("");
        const boardEmpty: any = [];
        for (let cord = 0; cord < 64; cord++) {
            boardEmpty.push({ _id: cord, figure: startPositionArr[cord] });
        }
        boardRef.current = boardEmpty;
        setBoard(boardEmpty);
    };

    useEffect(() => {
        initializeBoard(gameData?.position);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync board with Redux gameData changes (e.g., after reconnection)
    useEffect(() => {
        if (gameData?.position && gameData.position.length > 0) {
            initializeBoard(gameData.position);
        }
    }, [gameData]);

    // Listen for WS 'game' messages to sync board position
    useEffect(() => {
        const room = getRoom();
        if (!room) return;

        const handleGame = (message: unknown) => {
            const msg = message as { position?: string[]; move?: boolean };
            if (msg.position) {
                initializeBoard(msg.position);
            }
        };

        const unsubscribe = room.onMessage("game", handleGame);
        return () => {
            unsubscribe();
        };
    }, [roomId]);

    const eventHandler = (e: MouseEvent, index: number) => {
        if (activFigure.figure === "" || activFigure.figure === "8") {
            if (board[index].figure === "8" || board[index].figure === "") {
                return;
            }
            return setActivFigure(board[index]);
        }
        setBoard((prevSt) => {
            prevSt.splice(activFigure._id, 1, { _id: activFigure._id, figure: "" });
            prevSt.splice(index, 1, { _id: index, figure: activFigure.figure });
            return prevSt;
        });
        setActivFigure({ _id: 0, figure: "" });
    };

    const squareStyle = (color: string): React.CSSProperties => ({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "1px solid var(--color-border)",
        width: "12.8%",
        height: "12.8%",
        backgroundColor: color === "black" ? "var(--color-bg-board-dark)" : "var(--color-bg-board)",
        color: color === "black" ? "var(--color-bg-board)" : "var(--color-text-primary)",
    });

    return (
        <div className={s.board}>
            {/* Chess board */}
            <div
                className={s.inner}
                style={{
                    backgroundColor: "var(--color-bg-board)",
                    borderWidth: "10px",
                    borderColor: "var(--color-bg-board-dark)",
                }}
            >
                {board.map((element, index) => {
                    const clr = ((index % 8) + Math.floor(index / 8)) % 2 ? "black" : "white";
                    return (
                        <div
                            key={index}
                            className={s.cell}
                            style={{
                                backgroundColor: clr === "black" ? "var(--color-bg-board-dark)" : "var(--color-bg-board)",
                                borderWidth: "1px",
                                borderColor: "var(--color-border)",
                            }}
                            onClick={(e: any) => eventHandler(e, index)}
                        >
                            <img src={showFigure(index, element.figure)} alt="" className={s.piece} style={{ width: '80%', height: '80%' }} />
                        </div>
                    );
                })}
            </div>

            {/* Helper board */}
            <HelperBoard />
        </div>
    );
};

export default GameBoard;
