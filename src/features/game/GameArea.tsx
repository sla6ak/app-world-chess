import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import PlayerInfo from "@components/playerInfo/PlayerInfo";
import GameHeader from "@components/gameHeader/GameHeader";
import showFigure from "@helpers/showFigure";
import { getRoom } from "@services/roomManager";
import type { RootState } from "@redux/store";
import { selectPlayerColor } from "@redux/slices/room";
import { useSelector } from "react-redux";
import s from "./GameArea.module.css";

/* ───────────────────────────────────────────
   Types
   ─────────────────────────────────────────── */
interface Square {
    _id: number;
    figure: string;
}

interface LastMove {
    from: number;
    to: number;
}

/* ───────────────────────────────────────────
   Constants
   ─────────────────────────────────────────── */
const START_POSITION =
    "rnbqkbnrpppppppp88888888888888888888888888888888PPPPPPPPRNBQKBNR";
const EMPTY = "8";

/* ───────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────── */

/** Convert display index → board index (handles flip for black player) */
const displayToBoard = (displayIdx: number, flipped: boolean): number => {
    if (!flipped) return displayIdx;
    const row = Math.floor(displayIdx / 8);
    const col = displayIdx % 8;
    return (7 - row) * 8 + col;
};

/** Get row and col from a flat board index */
const rowOf = (i: number) => Math.floor(i / 8);
const colOf = (i: number) => i % 8;

/** Basic move validator — returns target board indices */
const getValidMoves = (board: Square[], index: number): number[] => {
    const piece = board[index].figure;
    if (!piece || piece === EMPTY) return [];

    const row = rowOf(index);
    const isWhite = piece === piece.toUpperCase();
    const type = piece.toLowerCase();
    const moves: number[] = [];

    const isEnemy = (target: Square) =>
        target.figure !== EMPTY &&
        target.figure !== "" &&
        (isWhite
            ? target.figure === target.figure.toLowerCase()
            : target.figure === target.figure.toUpperCase());

    const addIfValid = (to: number) => {
        if (to < 0 || to > 63) return;
        const target = board[to];
        if (target.figure === EMPTY || target.figure === "") {
            moves.push(to);
        } else if (isEnemy(target)) {
            moves.push(to);
        }
    };

    const slide = (deltas: number[]) => {
        for (const delta of deltas) {
            let cur = index;
            while (true) {
                const curCol = cur % 8;
                const next = cur + delta;
                if (next < 0 || next > 63) break;
                if (delta === 1 && curCol === 7) break;
                if (delta === -1 && curCol === 0) break;
                if (delta === 9 && curCol === 7) break;
                if (delta === 7 && curCol === 0) break;
                if (delta === -9 && curCol === 0) break;
                if (delta === -7 && curCol === 7) break;

                const target = board[next];
                if (target.figure === EMPTY || target.figure === "") {
                    moves.push(next);
                } else {
                    if (isEnemy(target)) moves.push(next);
                    break;
                }
                cur = next;
            }
        }
    };

    switch (type) {
        case "p": {
            const dir = isWhite ? -8 : 8;
            const startRow = isWhite ? 6 : 1;
            const f1 = index + dir;
            if (f1 >= 0 && f1 < 64 && board[f1].figure === EMPTY) {
                moves.push(f1);
                if (row === startRow) {
                    const f2 = f1 + dir;
                    if (board[f2].figure === EMPTY) moves.push(f2);
                }
            }
            for (const dc of [-1, 1]) {
                addIfValid(index + dir + dc);
            }
            break;
        }
        case "r":
            slide([8, -8, 1, -1]);
            break;
        case "n":
            for (const m of [17, 15, 10, 6, -6, -10, -15, -17]) {
                addIfValid(index + m);
            }
            break;
        case "b":
            slide([9, 7, -9, -7]);
            break;
        case "q":
            slide([9, 7, -9, -7, 8, -8, 1, -1]);
            break;
        case "k":
            for (const m of [9, 7, -9, -7, 8, -8, 1, -1]) {
                addIfValid(index + m);
            }
            break;
    }

    return moves;
};

/* ───────────────────────────────────────────
   Component
   ─────────────────────────────────────────── */
const GameArea: React.FC = () => {
    const userName = useSelector((state: RootState) => state.user.userName);
    const gameData = useSelector((state: RootState) => state.room.gameData);

    // Explicit who-is-who check: our color is derived from the match between
    // the authorized user and the game's white/black player names.
    // Defaults (games before matching completes) show the white perspective.
    const isWhite = useSelector(selectPlayerColor) !== "black";
    const [boardFlipped, setBoardFlipped] = useState(false);

    // ── Board state ──
    const [board, setBoard] = useState<Square[]>([]);
    const [activFigure, setActivFigure] = useState<{ _id: number; figure: string }>({
        _id: -1,
        figure: "",
    });
    const [validMoves, setValidMoves] = useState<number[]>([]);
    const [lastMove, setLastMove] = useState<LastMove | null>(null);
    const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
    const [animatingSquare, setAnimatingSquare] = useState<number | null>(null);
    const boardRef = useRef<Square[]>([]);

    // Our color is always at the bottom by default;
    // flip only via the flip button (to view from the opponent's side).
    const playerColor = isWhite ? "w" : "b";
    const flipped = boardFlipped;
    const bottomColor: "w" | "b" = !flipped ? playerColor : playerColor === "w" ? "b" : "w";

    const initializeBoard = useCallback((position: string[]) => {
        const pos = position && position.length > 0 ? position[0] : START_POSITION;
        const arr = pos.split("");
        const newBoard: Square[] = [];
        for (let i = 0; i < 64; i++) {
            newBoard.push({ _id: i, figure: arr[i] || EMPTY });
        }
        boardRef.current = newBoard;
        setBoard(newBoard);
    }, []);

    useEffect(() => {
        if (gameData?.position) {
            initializeBoard(gameData.position);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (gameData?.position && gameData.position.length > 0) {
            initializeBoard(gameData.position);
        }
    }, [gameData, initializeBoard]);

    useEffect(() => {
        const room = getRoom();
        if (!room) return;
        const handleGame = (message: unknown) => {
            const msg = message as { position?: string[] };
            if (msg.position) {
                initializeBoard(msg.position);
            }
        };
        const unsubscribe = room.onMessage("game", handleGame);
        return () => unsubscribe();
    }, [initializeBoard]);

    /* ── Click handler ── */
    const handleClick = useCallback(
        (displayIdx: number) => {
            const boardIdx = displayToBoard(displayIdx, flipped);
            const clicked = board[boardIdx];

            if (activFigure.figure !== "" && activFigure.figure !== EMPTY) {
                if (boardIdx === activFigure._id) {
                    setActivFigure({ _id: -1, figure: "" });
                    setValidMoves([]);
                    return;
                }
                if (validMoves.includes(boardIdx)) {
                    const fromIdx = activFigure._id;
                    const piece = board[fromIdx].figure;
                    setBoard((prev) => {
                        const next = [...prev];
                        next[fromIdx] = { _id: fromIdx, figure: EMPTY };
                        next[boardIdx] = { _id: boardIdx, figure: piece };
                        return next;
                    });
                    setLastMove({ from: fromIdx, to: boardIdx });
                    setAnimatingSquare(boardIdx);
                    setTimeout(() => setAnimatingSquare(null), 250);
                    setActivFigure({ _id: -1, figure: "" });
                    setValidMoves([]);
                    return;
                }
                if (clicked.figure !== EMPTY && clicked.figure !== "") {
                    const moves = getValidMoves(board, boardIdx);
                    setActivFigure({ _id: boardIdx, figure: clicked.figure });
                    setValidMoves(moves);
                    return;
                }
                setActivFigure({ _id: -1, figure: "" });
                setValidMoves([]);
                return;
            }

            if (clicked.figure !== EMPTY && clicked.figure !== "") {
                const moves = getValidMoves(board, boardIdx);
                setActivFigure({ _id: boardIdx, figure: clicked.figure });
                setValidMoves(moves);
            }
        },
        [board, activFigure, validMoves, flipped]
    );

    /* ── Hover handlers ── */
    const handleMouseEnter = useCallback((displayIdx: number) => {
        setHoveredSquare(displayIdx);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredSquare(null);
    }, []);

    /* ── Derived data ── */
    const kingInCheck = useMemo(() => {
        const playerIsWhite = playerColor === "w";
        const kingChar = playerIsWhite ? "K" : "k";
        const kingIdx = board.findIndex((sq) => sq.figure === kingChar);
        if (kingIdx === -1) return false;

        for (let i = 0; i < 64; i++) {
            const piece = board[i].figure;
            if (!piece || piece === EMPTY) continue;
            const isEnemyPiece = playerIsWhite
                ? piece === piece.toLowerCase()
                : piece === piece.toUpperCase();
            if (!isEnemyPiece) continue;
            const moves = getValidMoves(board, i);
            if (moves.includes(kingIdx)) return true;
        }
        return false;
    }, [board, playerColor]);

    /* ── Coordinate labels ── */
    const fileLabels = useMemo(() => {
        const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
        return flipped ? [...files].reverse() : files;
    }, [flipped]);

    const rankLabels = useMemo(() => {
        const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];
        return flipped ? [...ranks] : [...ranks].reverse();
    }, [flipped]);

    /* ── Derived player info ── */
    const ourName = gameData
        ? isWhite
            ? gameData.playerWite
            : gameData.playerBlack
        : "";

    const opponentName = gameData
        ? isWhite
            ? gameData.playerBlack
            : gameData.playerWite
        : "";

    const ourRating = gameData
        ? isWhite
            ? gameData.reitingWite
            : gameData.reitingBlack
        : 0;

    const opponentRating = gameData
        ? isWhite
            ? gameData.reitingBlack
            : gameData.reitingWite
        : 0;

    const ourTime = gameData
        ? isWhite
            ? gameData.timeWite
            : gameData.timeBlack
        : 0;

    const opponentTime = gameData
        ? isWhite
            ? gameData.timeBlack
            : gameData.timeWite
        : 0;

    const whiteToMove = gameData?.move ?? true;
    const ourIsActive = isWhite ? whiteToMove : !whiteToMove;

    const topPlayer =
        bottomColor === playerColor
            ? {
                  name: opponentName || "Opponent",
                  rating: opponentRating,
                  time: opponentTime,
                  isWhite: !isWhite,
                  isYou: false,
                  isActive: !ourIsActive,
              }
            : {
                  name: ourName || userName || "You",
                  rating: ourRating,
                  time: ourTime,
                  isWhite,
                  isYou: true,
                  isActive: ourIsActive,
              };

    const bottomPlayer =
        bottomColor === playerColor
            ? {
                  name: ourName || userName || "You",
                  rating: ourRating,
                  time: ourTime,
                  isWhite,
                  isYou: true,
                  isActive: ourIsActive,
              }
            : {
                  name: opponentName || "Opponent",
                  rating: opponentRating,
                  time: opponentTime,
                  isWhite: !isWhite,
                  isYou: false,
                  isActive: !ourIsActive,
              };

    return (
        /* ── Page Wrapper: 100vw × 100dvh, centered, no scroll ── */
        <div className={s.pageWrapper}>
            <GameHeader />

            {/* ── Game Container: vertical stack, auto-scaled ── */}
            <div className={s.gameContainer}>
                {/* Top bar — shows our info when flipped to opponent's side */}
                <PlayerInfo
                    playerName={topPlayer.name}
                    rating={topPlayer.rating}
                    time={topPlayer.time}
                    isWhite={topPlayer.isWhite}
                    isYou={topPlayer.isYou}
                    isActive={topPlayer.isActive}
                    position="top"
                />

                {/* Board area */}
                <div className={s.boardWrap}>
                    <button
                        className={s.flipBtn}
                        onClick={() => setBoardFlipped((prev) => !prev)}
                        title="Перевернуть доску"
                        aria-label="Перевернуть доску"
                        type="button"
                    >
                        ⇅
                    </button>

                    {/* ── Chess Board with coordinate frame ── */}
                    <div className={s.boardWrapper}>
                        {/* Top file labels (a–h) */}
                        <div className={s.topLabels} aria-hidden="true">
                            {fileLabels.map((label) => (
                                <span key={label} className={s.topLabel}>
                                    {label}
                                </span>
                            ))}
                        </div>

                        {/* Left rank labels (1–8) */}
                        <div className={s.rankLabels} aria-hidden="true">
                            {rankLabels.map((label) => (
                                <span key={label} className={s.rankLabel}>
                                    {label}
                                </span>
                            ))}
                        </div>

                        {/* 8×8 grid */}
                        <div
                            className={s.grid}
                            role="grid"
                            aria-label="Шахматная доска"
                        >
                            {board.map((_element, displayIdx) => {
                                const boardIdx = displayToBoard(displayIdx, flipped);
                                const square = board[boardIdx];
                                const row = rowOf(displayIdx);
                                const col = colOf(displayIdx);
                                const isDark = (row + col) % 2 === 1;

                                const isSelected = activFigure._id === boardIdx;
                                const isValidMove = validMoves.includes(boardIdx);
                                const isLastMove =
                                    lastMove?.from === boardIdx ||
                                    lastMove?.to === boardIdx;
                                const isHovered = hoveredSquare === displayIdx;
                                const isAnimating = animatingSquare === displayIdx;
                                const isCheck =
                                    kingInCheck &&
                                    square.figure ===
                                        (playerColor === "w" ? "K" : "k");
                                const showMoveDot = isValidMove && !isSelected;

                                return (
                                    <div
                                        key={displayIdx}
                                        className={`${s.cell} ${
                                            isDark ? s.dark : s.light
                                        } ${isSelected ? s.selected : ""} ${
                                            isLastMove ? s.lastMove : ""
                                        } ${isValidMove ? s.validMove : ""} ${
                                            isHovered ? s.hovered : ""
                                        } ${isAnimating ? s.animating : ""} ${
                                            isCheck ? s.check : ""
                                        }`}
                                        role="gridcell"
                                        aria-label={`${fileLabels[col]}${rankLabels[row]}`}
                                        onClick={() => handleClick(displayIdx)}
                                        onMouseEnter={() =>
                                            handleMouseEnter(displayIdx)
                                        }
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {square.figure !== EMPTY &&
                                            square.figure !== "" && (
                                                <img
                                                    src={showFigure(
                                                        boardIdx,
                                                        square.figure
                                                    )}
                                                    alt={square.figure}
                                                    className={`${s.piece} ${
                                                        isSelected
                                                            ? s.pieceSelected
                                                            : ""
                                                    } ${
                                                        isHovered && !isSelected
                                                            ? s.pieceHovered
                                                            : ""
                                                    }`}
                                                    draggable={false}
                                                />
                                            )}
                                        {showMoveDot && (
                                            <span className={s.moveDot} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right rank labels (1–8) */}
                        <div className={s.rightLabels} aria-hidden="true">
                            {rankLabels.map((label) => (
                                <span key={label} className={s.rightLabel}>
                                    {label}
                                </span>
                            ))}
                        </div>

                        {/* Bottom file labels (a–h) */}
                        <div className={s.fileLabels} aria-hidden="true">
                            {fileLabels.map((label) => (
                                <span key={label} className={s.fileLabel}>
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar — always our side by default */}
                <PlayerInfo
                    playerName={bottomPlayer.name}
                    rating={bottomPlayer.rating}
                    time={bottomPlayer.time}
                    isWhite={bottomPlayer.isWhite}
                    isYou={bottomPlayer.isYou}
                    isActive={bottomPlayer.isActive}
                    position="bottom"
                />
            </div>
        </div>
    );
};

export default GameArea;
