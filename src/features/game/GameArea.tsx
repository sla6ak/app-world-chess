import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Chess } from "chess.js";
import PlayerInfo from "@components/playerInfo/PlayerInfo";
import GameHeader from "@components/gameHeader/GameHeader";
import ConfirmDialog from "@components/modal/ConfirmDialog";
import showFigure from "@helpers/showFigure";
import { boardIndexToSquare, squareToBoardIndex } from "@helpers/boardCoords";
import { getRoom } from "@services/roomManager";
import type { RootState, AppDispatch } from "@redux/store";
import { selectPlayerColor } from "@redux/slices/room";
import { offerDraw, resignGame } from "@redux/thunks/roomThunks";
import { setGameStart } from "@redux/slices/gameEvents";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
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
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const EMPTY = "8";

/* ───────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────── */

/** Convert display index to board index (handles flip for black player) */
const displayToBoard = (displayIdx: number, flipped: boolean): number => {
    if (!flipped) return displayIdx;
    const row = Math.floor(displayIdx / 8);
    const col = displayIdx % 8;
    return (7 - row) * 8 + (7 - col); // ← добавить реверс колонок!
};

/** FEN to flat 64-char board string (index 0 = a8). */
const fenToFlat = (fen: string): string => {
    const boardPart = fen.split(" ")[0];
    let flat = "";
    for (const ch of boardPart) {
        if (ch === "/") continue;
        if (ch >= "1" && ch <= "8") flat += "8".repeat(Number(ch));
        else flat += ch;
    }
    return flat;
};

/** Get valid moves for a square via chess.js (returns UCI strings like "e2e4"). */
const getValidMoves = (chess: Chess, boardIdx: number): number[] => {
    const square = boardIndexToSquare(boardIdx);
    try {
        return chess.moves({ square: square as any, verbose: true }).map((m) => {
            return squareToBoardIndex(m.to);
        });
    } catch {
        return [];
    }
};

/** Check if king of given color is in check. */
const isKingInCheck = (chess: Chess, isWhite: boolean): boolean => {
    if (!chess.inCheck()) return false;
    return chess.turn() === (isWhite ? "w" : "b");
};

/** Get king square index for a color. */
const findKingSquare = (chess: Chess, isWhite: boolean): number => {
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
            const piece = board[r][f];
            if (
                piece &&
                piece.type === "k" &&
                piece.color === (isWhite ? "w" : "b")
            ) {
                return squareToBoardIndex(piece.square);
            }
        }
    }
    return -1;
};

/** Check if move is pawn promotion. Returns "q" if auto-promoting (no UI). */
const autoPromotionSquare = (
    from: number,
    to: number,
    board: Square[]
): string => {
    const piece = board[from]?.figure;
    if (piece !== "P" && piece !== "p") return "";
    const toRank = boardIndexToSquare(to)[1];
    return toRank === "8" || toRank === "1" ? "q" : "";
};

interface GameAreaProps {}

const GameArea: React.FC<GameAreaProps> = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userName = useSelector((state: RootState) => state.user.userName);
    const gameData = useSelector((state: RootState) => state.room.gameData);
    const gameStatus = useSelector((state: RootState) => state.gameEvents.status);
    const drawOfferedBy = useSelector((state: RootState) => state.gameEvents.drawOfferedBy);
    const isGameOver = gameStatus === "gameover";

    const [resignModalOpen, setResignModalOpen] = useState(false);
    const [drawModalOpen, setDrawModalOpen] = useState(false);

    // ── Chess.js engine (local mirror for validation) ──
    const chessRef = useRef<Chess>(new Chess());
    const [board, setBoard] = useState<Square[]>([]);
    const [activFigure, setActivFigure] = useState<{ _id: number; figure: string }>({ _id: -1, figure: "" });
    const [validMoves, setValidMoves] = useState<number[]>([]);
    const [lastMove, setLastMove] = useState<LastMove | null>(null);
    const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
    const [animatingSquare, setAnimatingSquare] = useState<number | null>(null);

    const isWhite = useSelector(selectPlayerColor) !== "black";
    // shouldFlipBoard: true когда игрок играет чёрными
    // → доска перевёрнута, чёрные фигуры снизу
    const [shouldFlipBoard, setShouldFlipBoard] = useState(false);

    // Автоматически переворачиваем доску если игрок играет чёрными
    // срабатывает один раз при монтировании
    const [autoFlipDone, setAutoFlipDone] = useState(false);
    useEffect(() => {
        if (!autoFlipDone) {
            setAutoFlipDone(true);
            if (!isWhite) {
                setShouldFlipBoard(true);
            }
        }
    }, [isWhite, autoFlipDone]);

    // Clocks from server timers
    const timeWite = gameData?.timeWite ?? 180;
    const timeBlack = gameData?.timeBlack ?? 180;
    const [clockWhite, setClockWhite] = useState(timeWite);
    const [clockBlack, setClockBlack] = useState(timeBlack);

    // Sync clocks from server state
    useEffect(() => {
        setClockWhite(gameData?.timeWite ?? 180);
        setClockBlack(gameData?.timeBlack ?? 180);
    }, [gameData?.timeWite, gameData?.timeBlack, gameData?.idGame]);

    // Local tick (server authoritative, client just displays)
    useEffect(() => {
        if (isGameOver) return;
        const timer = setInterval(() => {
            const isWhiteMove = gameData?.move ?? true;
            if (isWhiteMove) setClockWhite((t) => Math.max(0, t - 1));
            else setClockBlack((t) => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [gameData?.move, isGameOver]);

    // Авто-флип для чёрного игрока + ручная кнопка
    const flipped = shouldFlipBoard;
    const playerColor = isWhite ? "w" : "b";

    /*
     * bottomColor — цвет фигур, которые должны быть внизу доски.
     * Каждый игрок должен видеть СВОИ фигуры внизу:
     * - Белый игрок → всегда видит белых снизу
     * - Чёрный игрок → всегда видит чёрных снизу (как будто он "сидит за доской")
     *
     * flip = true  → доска перевёрнута: чёрные снизу, белые сверху
     * flip = false → доска нормальная: белые снизу, чёрные сверху
     */
    const bottomColor: "w" | "b" = isWhite ? "w" : "b";

    /* ── Initialize from FEN ── */
    const initializeFromFen = useCallback((fen: string) => {
        try {
            chessRef.current.load(fen);
            const flat = fenToFlat(fen);
            const newBoard: Square[] = [];
            for (let i = 0; i < 64; i++) {
                newBoard.push({ _id: i, figure: flat[i] || EMPTY });
            }
            setBoard(newBoard);
            console.log("[GameArea] Board initialized from FEN:", fen);
        } catch (e) {
            console.error("[GameArea] Invalid FEN:", fen, e);
            toast.error("Ошибка восстановления позиции");
        }
    }, []);

    /* ── Initialize from gameData (Redux) ── */
    useEffect(() => {
        const fen = gameData?.fen || START_FEN;
        initializeFromFen(fen);
    }, [gameData?.idGame, gameData?.fen, initializeFromFen]);

    /* ── Listen to server messages ── */
    // roomId в зависимостях: комната записывается в roomManager ПОСЛЕ
    // joinOrCreate, а GameArea может примонтироваться раньше — без этого
    // подписки на move_made/move_error/gameResumed не ставились у первого игрока,
    // и ходы соперника визуально «не приходили».
    const roomId = useSelector((state: RootState) => state.room.roomId);

    useEffect(() => {
        const room = getRoom();
        if (!room) return;

        const handleMoveMade = (message: unknown) => {
            const msg = message as {
                fen?: string;
                move?: { from: string; to: string; promotion?: string };
                timers?: { white: number; black: number };
            };
            if (!msg.fen) return;
            initializeFromFen(msg.fen);
            // Сбрасываем выделение фигуры — доска обновилась под ходом оппонента.
            setActivFigure({ _id: -1, figure: "" });
            setValidMoves([]);
            setLastMove({
                from: msg.move ? squareToBoardIndex(msg.move.from) : -1,
                to: msg.move ? squareToBoardIndex(msg.move.to) : -1,
            });
            // Авторитетные часы с сервера — синхронизируемся сразу, не ждём тики.
            if (msg.timers) {
                setClockWhite(msg.timers.white);
                setClockBlack(msg.timers.black);
            }
        };

        const handleMoveError = (message: unknown) => {
            const msg = message as { code?: string; message?: string; fen?: string };
            toast.error(msg.message || "Invalid move");
            // Жёсткий ресинхрон с сервером: откатываем локальный оптимистичный ход.
            if (msg.fen) {
                initializeFromFen(msg.fen);
            } else if (gameData?.fen) {
                initializeFromFen(gameData.fen);
            }
            setActivFigure({ _id: -1, figure: "" });
            setValidMoves([]);
            setLastMove(null);
        };

        const handleOpponentJoined = () => {
            toast.success("Суперника знайдено! Гра почалась");
            dispatch(setGameStart());
        };

        const handleGameResumed = (message: unknown) => {
            const msg = message as { fen: string; timers: { white: number; black: number } };
            if (msg.fen) initializeFromFen(msg.fen);
            if (msg.timers) {
                setClockWhite(msg.timers.white);
                setClockBlack(msg.timers.black);
            }
        };

        const unsubscribeMove = room.onMessage("move_made", handleMoveMade);
        const unsubscribeError = room.onMessage("move_error", handleMoveError);
        const unsubscribeResumed = room.onMessage("gameResumed", handleGameResumed);
        const unsubscribeOpponentJoined = room.onMessage("opponent_joined", handleOpponentJoined);

        return () => {
            unsubscribeMove();
            unsubscribeError();
            unsubscribeResumed();
            unsubscribeOpponentJoined();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initializeFromFen, roomId]);

    /* ── Click handler ── */
    const handleClick = useCallback(
        (displayIdx: number) => {
            if (isGameOver) return;

            const boardIdx = displayToBoard(displayIdx, flipped);
            const clicked = board[boardIdx];
            const chess = chessRef.current;

            const isMyTurn = (chess.turn() === "w" && isWhite) || (chess.turn() === "b" && !isWhite);
            if (!isMyTurn) return;

            if (activFigure.figure !== "" && activFigure.figure !== EMPTY) {
                if (boardIdx === activFigure._id) {
                    setActivFigure({ _id: -1, figure: "" });
                    setValidMoves([]);
                    return;
                }
                if (validMoves.includes(boardIdx)) {
                    const fromSquare = boardIndexToSquare(activFigure._id);
                    const toSquare = boardIndexToSquare(boardIdx);
                    const promotion = autoPromotionSquare(activFigure._id, boardIdx, board);

                    try {
                        const move = chess.move({
                            from: fromSquare,
                            to: toSquare,
                            promotion: promotion || "q",
                        });
                        if (move) {
                            // Optimistic update
                            const next = [...board];
                            next[activFigure._id] = {
                                _id: activFigure._id,
                                figure: EMPTY,
                            };
                            next[boardIdx] = {
                                _id: boardIdx,
                                figure:
                                    move.color === "w"
                                        ? move.piece.toUpperCase()
                                        : move.piece,
                            };
                            setBoard(next);
                            setLastMove({ from: activFigure._id, to: boardIdx });
                            setAnimatingSquare(boardIdx);
                            setTimeout(() => setAnimatingSquare(null), 250);
                            setActivFigure({ _id: -1, figure: "" });
                            setValidMoves([]);

                            // Send to server
                            const room = getRoom();
                            room?.send("make_move", {
                                from: fromSquare,
                                to: toSquare,
                                promotion: promotion || "q",
                            });
                        }
                    } catch {
                        // Re-sync to server state
                        const fallbackFen = gameData?.fen || START_FEN;
                        initializeFromFen(fallbackFen);
                        setActivFigure({ _id: -1, figure: "" });
                        setValidMoves([]);
                    }
                    return;
                }

                const isOwnPiece = chess.turn() === playerColor;
                if (
                    clicked.figure !== EMPTY &&
                    clicked.figure !== "" &&
                    ((chess.turn() === "w" &&
                        clicked.figure === clicked.figure.toUpperCase()) ||
                        (chess.turn() === "b" &&
                            clicked.figure === clicked.figure.toLowerCase()))
                ) {
                    const moves = getValidMoves(chess, boardIdx);
                    setActivFigure({ _id: boardIdx, figure: clicked.figure });
                    setValidMoves(moves);
                    return;
                }
                setActivFigure({ _id: -1, figure: "" });
                setValidMoves([]);
                return;
            }

            if (clicked.figure !== EMPTY && clicked.figure !== "") {
                const isOwnPiece =
                    (chess.turn() === "w" && clicked.figure === clicked.figure.toUpperCase()) ||
                    (chess.turn() === "b" && clicked.figure === clicked.figure.toLowerCase());
                if (!isOwnPiece) return;
                const moves = getValidMoves(chess, boardIdx);
                setActivFigure({ _id: boardIdx, figure: clicked.figure });
                setValidMoves(moves);
            }
        },
        [board, activFigure, validMoves, flipped, isGameOver, isWhite, initializeFromFen, playerColor]
    );

    /* ── Hover handlers ── */
    const handleMouseEnter = useCallback((displayIdx: number) => {
        setHoveredSquare(displayIdx);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredSquare(null);
    }, []);

    /* ── Derived data ── */
    // Пересчитываем шах при каждом изменении доски, а не только цвета игрока —
    // иначе подсветка короля под шахом замирала в неактуальном состоянии.
    const kingInCheck = useMemo(
        () => isKingInCheck(chessRef.current, playerColor === "w"),
        [playerColor, board]
    );

    /* ── Coordinate labels ── */
    const fileLabels = useMemo(() => {
        const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
        return flipped ? [...files].reverse() : files;
    }, [flipped]);

    const rankLabels = useMemo(() => {
        const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];
        return flipped ? ranks : [...ranks].reverse();
    }, [flipped]);

    /* ── Derived player info ── */
    const ourName = gameData ? (isWhite ? gameData.playerWite : gameData.playerBlack) : "";
    const opponentName = gameData ? (isWhite ? gameData.playerBlack : gameData.playerWite) : "";
    const ourRating = gameData ? (isWhite ? gameData.reitingWite : gameData.reitingBlack) : 0;
    const opponentRating = gameData ? (isWhite ? gameData.reitingBlack : gameData.reitingWite) : 0;

    const ourTime = isWhite ? clockWhite : clockBlack;
    const opponentTime = isWhite ? clockBlack : clockWhite;

    const whiteToMove = gameData?.move ?? true;
    const ourIsActive = isWhite ? whiteToMove : !whiteToMove;

    const gameId = gameData?.idGame ?? "";

    const handleConfirmResign = useCallback(() => {
        setResignModalOpen(false);
        dispatch(resignGame({ gameId, userId: userName }));
    }, [dispatch, gameId, userName]);

    const handleOpponentDrawClick = useCallback(() => {
        if (drawOfferedBy === "opponent") {
            dispatch(offerDraw({ gameId, userId: userName }));
            return;
        }
        if (drawOfferedBy === "me") {
            toast.info("Ничья уже предложена — ждём ответа соперника");
            return;
        }
        setDrawModalOpen(true);
    }, [dispatch, drawOfferedBy, gameId, userName]);

    const handleConfirmDraw = useCallback(() => {
        setDrawModalOpen(false);
        dispatch(offerDraw({ gameId, userId: userName }));
    }, [dispatch, gameId, userName]);

    const topPlayer =
        bottomColor === playerColor
            ? { name: opponentName || "Opponent", rating: opponentRating, time: opponentTime, isWhite: !isWhite, isYou: false, isActive: !ourIsActive }
            : { name: ourName || userName || "You", rating: ourRating, time: ourTime, isWhite, isYou: true, isActive: ourIsActive };

    const bottomPlayer =
        bottomColor === playerColor
            ? { name: ourName || userName || "You", rating: ourRating, time: ourTime, isWhite, isYou: true, isActive: ourIsActive }
            : { name: opponentName || "Opponent", rating: opponentRating, time: opponentTime, isWhite: !isWhite, isYou: false, isActive: !ourIsActive };

    return (
        <div className={s.pageWrapper}>
            <GameHeader />

            <div className={s.gameContainer}>
                <PlayerInfo
                    playerName={topPlayer.name}
                    rating={topPlayer.rating}
                    time={topPlayer.time}
                    isWhite={topPlayer.isWhite}
                    isYou={topPlayer.isYou}
                    isActive={topPlayer.isActive}
                    position="top"
                    onResignClick={() => setResignModalOpen(true)}
                    onDrawClick={handleOpponentDrawClick}
                    drawOffered={drawOfferedBy === "opponent"}
                    drawOfferSent={drawOfferedBy === "me"}
                    gameOver={isGameOver}
                />

                <div className={s.boardWrap}>
                    <button className={s.flipBtn} onClick={() => setShouldFlipBoard((prev) => !prev)} title="Flip" type="button">
                        ⇅
                    </button>

                    <div className={s.boardWrapper}>
                        <div className={s.topLabels} aria-hidden="true">
                            {fileLabels.map((label) => (
                                <span key={label} className={s.topLabel}>{label}</span>
                            ))}
                        </div>

                        <div className={s.rankLabels} aria-hidden="true">
                            {rankLabels.map((label) => (
                                <span key={label} className={s.rankLabel}>{label}</span>
                            ))}
                        </div>

                        <div className={s.grid} role="grid" aria-label="Chess board">
                            {board.map((_element, displayIdx) => {
                                const boardIdx = displayToBoard(displayIdx, flipped);
                                const square = board[boardIdx];
                                const row = Math.floor(displayIdx / 8);
                                const col = displayIdx % 8;
                                const isDark = (row + col) % 2 === 1;

                                const isSelected = activFigure._id === boardIdx;
                                const isValidMove = validMoves.includes(boardIdx);
                                const isLastMove = lastMove?.from === boardIdx || lastMove?.to === boardIdx;
                                const isHovered = hoveredSquare === displayIdx;
                                const isAnimating = animatingSquare === displayIdx;
                                const isCheck = kingInCheck && square.figure === (playerColor === "w" ? "K" : "k");
                                const showMoveDot = isValidMove && !isSelected;

                                return (
                                    <div
                                        key={displayIdx}
                                        className={`${s.cell} ${isDark ? s.dark : s.light} ${isSelected ? s.selected : ""} ${isLastMove ? s.lastMove : ""} ${isValidMove ? s.validMove : ""} ${isHovered ? s.hovered : ""} ${isAnimating ? s.animating : ""} ${isCheck ? s.check : ""}`}
                                        role="gridcell"
                                        aria-label={`${fileLabels[col]}${rankLabels[row]}`}
                                        onClick={() => handleClick(displayIdx)}
                                        onMouseEnter={() => handleMouseEnter(displayIdx)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {square.figure !== EMPTY && square.figure !== "" && (
                                            <img
                                                src={showFigure(boardIdx, square.figure)}
                                                alt={square.figure}
                                                className={`${s.piece} ${isSelected ? s.pieceSelected : ""} ${isHovered && !isSelected ? s.pieceHovered : ""}`}
                                                draggable={false}
                                            />
                                        )}
                                        {showMoveDot && <span className={s.moveDot} />}
                                    </div>
                                );
                            })}
                        </div>

                        <div className={s.rightLabels} aria-hidden="true">
                            {rankLabels.map((label) => (
                                <span key={label} className={s.rightLabel}>{label}</span>
                            ))}
                        </div>

                        <div className={s.fileLabels} aria-hidden="true">
                            {fileLabels.map((label) => (
                                <span key={label} className={s.fileLabel}>{label}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <PlayerInfo
                    playerName={bottomPlayer.name}
                    rating={bottomPlayer.rating}
                    time={bottomPlayer.time}
                    isWhite={bottomPlayer.isWhite}
                    isYou={bottomPlayer.isYou}
                    isActive={bottomPlayer.isActive}
                    position="bottom"
                    onResignClick={() => setResignModalOpen(true)}
                    onDrawClick={handleOpponentDrawClick}
                    drawOffered={drawOfferedBy === "opponent"}
                    drawOfferSent={drawOfferedBy === "me"}
                    gameOver={isGameOver}
                />
            </div>

            <ConfirmDialog
                open={resignModalOpen}
                title="Resign"
                description="Are you sure you want to resign? The game will be counted as a loss."
                confirmText="Yes, resign"
                cancelText="Cancel"
                confirmVariant="danger"
                onConfirm={handleConfirmResign}
                onCancel={() => setResignModalOpen(false)}
            />

            <ConfirmDialog
                open={drawModalOpen}
                title="Offer draw"
                description="Do you want to offer a draw?"
                confirmText="Yes, offer"
                cancelText="Cancel"
                onConfirm={handleConfirmDraw}
                onCancel={() => setDrawModalOpen(false)}
            />
        </div>
    );
};

export default GameArea;
