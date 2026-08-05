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

    // --- Часы: гибридная модель ---
    // Сервер авторитетен, клиент показывает локальный отсчёт между тиками.
    // ВСЕ значения времени в этой системе — СЕКУНДЫ.
    const rawControl = gameData?.timeControl && gameData.timeControl > 0
        ? gameData.timeControl
        : 180;
    const fallbackTime = rawControl < 60 ? rawControl * 60 : rawControl;
    const initialClock = (v?: number) => (typeof v === "number" && v > 0 ? v : fallbackTime);

    // «Якорная» модель часов (см. ниже): ref — мгновенные значения, используемые
    // якорной синхронизацией и локальным тиком. Объявляем до эффектов.
    /** ВАЖНО: первичную инициализацию делаем на gameStart/gameResumed/move_made.
     *  Redux (gameData.timeWite/timeBlack) — медленный авторитет: при no-op тике
     *  значение может отставать на секунды, и рескейлинг по нему дрожал на каждом тике.
     */
    const anchorRef = useRef<null | {
        white: number;
        black: number;
        isWhiteMove: boolean;
        anchoredAt: number; // ms — момент, когда якорь был принят от сервера
    }>(null);
    const syncClockFromServer = useCallback(
        (timers: { white: number; black: number }, isWhiteMove: boolean, source: string) => {
            if (!timers) return;
            const prev = anchorRef.current;
            anchorRef.current = {
                white: timers.white,
                black: timers.black,
                isWhiteMove,
                anchoredAt: Date.now(),
            };
            // МАЛОЕ расхождение НЕ правим — иначе при сдвинутом ходе серверного
            // Math.floor() пользователь видит дёрганье ±1 с на каждый move_made.
            // Порог 2 с: дрейф сети обычно < 0.5 c; если больше — скорее всего баг
            // или reconnect, и тогда синхронизируем жёстко.
            const prevActive = prev
                ? prev.isWhiteMove
                    ? prev.white
                    : prev.black
                : null;
            const drift = prevActive !== null ? Math.abs(prevActive - (isWhiteMove ? timers.white : timers.black)) : Infinity;
            const shouldHardSync = prev === null || drift > 2;

            if (shouldHardSync) {
                clockRefTick.current.white = timers.white;
                clockRefTick.current.black = timers.black;
                setClockWhite(Math.ceil(timers.white));
                setClockBlack(Math.ceil(timers.black));
            } else {
                // Мягкая синхронизация: якорь обновили, UI не трогаем —
                // следующий tick пойдёт от нового якоря, переход будет без скачка.
                console.debug(
                    "[clock-anchor] soft resync | source:", source,
                    "| drift:", `${drift.toFixed(2)}s`,
                    "| ignored from UI"
                );
            }

            if (prev && drift > 1.5 && drift !== Infinity) {
                console.debug(
                    "[clock-anchor] resync | source:", source,
                    "| activeDrift:", `${drift.toFixed(2)}s`,
                    "| now:", JSON.stringify(timers)
                );
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // Серверная пауза (соперник отключился): часы стоят, локальный отсчёт ЗАПРЕЩЁН.
    const pausedSince = gameData?.pausedSince ?? null;
    // ms-timestamp последнего авторитетного сообщения от сервера.
    // Синхронизация: remote = «часы в момент X», а НА ЭКРАНЕ надо показать
    // remote − (now − X), иначе часы «отстают» после перезагрузки.
    const lastMoveTimestamp = gameData?.lastMoveTimestamp;
    // roomId для диагностики замены комнаты внутри игровой сессии:
    // две РАЗНЫЕ комнаты при одном idGame = явное пересоздание и источник бага с часами.
    const roomId = useSelector((state: RootState) => state.room.roomId) as string | undefined;

    // Храним часы в ref, чтобы интервал не зависел от частых setState,
    // а в state — отображаемые целые секунды.
    // `clockRefTick` — «рабочие» часы, которыми владеет тикающий interval и якорные
    // синхронизации. ОБЯЗАТЕЛЬНО отдельные от Redux, чтобы перепроверка по polling
    // не затирала локальное плавное значение.
    const clockRefTick = useRef({ white: initialClock(gameData?.timeWite), black: initialClock(gameData?.timeBlack) });
    const [clockWhite, setClockWhite] = useState(() => Math.ceil(clockRefTick.current.white));
    const [clockBlack, setClockBlack] = useState(() => Math.ceil(clockRefTick.current.black));

    // --- Якорная модель часов (вместо дёрганной жёсткой) ---
    // Причина дёрганности раньше: Redux-эффект вызывался на КАЖДЫЙ tick (1 Гц) и
    // приравнивал часы к «округлённым» timeWite/timeBlack, перетирая результат
    // локального тика 10 Гц. Это давало микро-прыжки в ±0.1..1 сек каждую секунду.
    //
    // Сейчас:
    //  1) живая частота — локальный тик в ref (ниже);
    //  2) серверные тики здесь ИГНОРИРУЮТСЯ (см. комментарий в handleTimers App.tsx);
    //  3) якоря ставят СОБЫТИЯ: gameStart/move_made/gameResumed/первичный mount.
    //
    // Redux-поля timeWite/timeBlack мы используем ТОЛЬКО как начальную инициализацию,
    // пока anchorRef ещё пуст, иначе любые no-op тики от сервера будут дёргать часы
    // назад/вперёд по ±1–2 мс RTT.
    useEffect(() => {
        if (anchorRef.current) return;
        if (initialClock(gameData?.timeWite) === fallbackTime && initialClock(gameData?.timeBlack) === fallbackTime) {
            // Нет данных от сервера (ни тиков, ни событий) — нечего якорить.
            // Показываем UI-controllable дефолт, тикаем с него до первого якоря.
        }
        const w = initialClock(gameData?.timeWite);
        const b = initialClock(gameData?.timeBlack);
        anchorRef.current = {
            white: w,
            black: b,
            isWhiteMove: gameData?.move ?? true,
            anchoredAt: Date.now(),
        };
        clockRefTick.current.white = w;
        clockRefTick.current.black = b;
        setClockWhite(Math.ceil(w));
        setClockBlack(Math.ceil(b));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameData?.idGame]);

    // --- ОСНОВНОЙ ТИК (плавный, использует якорь) ---
    // Вместо «‐ 0.1с в ref» интерполируем от ЯКОРЯ: так ошибки не накапливаются
    // на setState-рендерах, и этот блок индиферентен к пропускам React-рендера.
    //
    // - идёт ТОЛЬКО сторона, чей сейчас ход (по Redux gameData.move),
    // - во время серверной паузы (pausedSince) локальный тик ВЫКЛЮЧЕН,
    // - публичное состояние обновляем ТОЛЬКО когда целая секунда поменялась,
    //   чтобы не заставлять React перерендеривать 10 раз в секунду.
    useEffect(() => {
        if (isGameOver) return;
        if (pausedSince !== null) return;

        const timer = setInterval(() => {
            const anchor = anchorRef.current;
            if (!anchor) return;
            // Чей ход: предпочитаем Redux, иначе якорь. Это позволяет
            // якорной синхронизации корректно переключать сторону на ходе.
            const isWhiteMove = gameData?.move ?? anchor.isWhiteMove;
            const key = isWhiteMove ? ("white" as const) : ("black" as const);
            const elapsed = (Date.now() - anchor.anchoredAt) / 1000;
            const target = Math.max(
                0,
                isWhiteMove ? anchor.white - elapsed : anchor.black - elapsed,
            );
            clockRefTick.current[key] = target;

            const shownW = Math.ceil(key === "white" ? target : clockRefTick.current.white);
            const shownB = Math.ceil(key === "black" ? target : clockRefTick.current.black);
            setClockWhite((prev) => (prev !== shownW ? shownW : prev));
            setClockBlack((prev) => (prev !== shownB ? shownB : prev));
        }, 100);
        return () => clearInterval(timer);
    }, [gameData?.move, isGameOver, pausedSince]);

    // ДИАГНОСТИКА: отслеживаем замены комнаты внутри одной игровой сессии.
    // Две комнаты при одном idGame = комната пересоздалась → главная причина
    // «часы заново» (новый GameManager берёт snapshot из Mongo, старый убит).
    const firstRoomIdRef = useRef<string | null>(null);
    useEffect(() => {
        if (!roomId) return;
        if (firstRoomIdRef.current === null) {
            firstRoomIdRef.current = roomId;
            console.log("[GameArea] initial roomId:", roomId, "| idGame:", gameData?.idGame);
        } else if (firstRoomIdRef.current !== roomId) {
            console.warn(
                "[ROOMMANAGER] ⚠️ Room replaced mid-game — clocks reset likely | old:",
                firstRoomIdRef.current,
                "| new:", roomId,
                "| idGame:", gameData?.idGame,
            );
            firstRoomIdRef.current = roomId;
        }
    }, [roomId, gameData?.idGame]);

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
    // roomId уже объявлен вверху (для диагностики замены комнаты).

    useEffect(() => {
        const room = getRoom();
        if (!room) return;

        const handleMoveMade = (message: unknown) => {
            const msg = message as {
                fen?: string;
                move?: { from: string; to: string; promotion?: string };
                timers?: { white: number; black: number };
                nextTurn?: string | boolean;
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
            // Авторитетные часы с сервера — якорная синхронизация: задаём базис,
            // от которого локальный интервал равномерно «дотикает», без прыжков.
            if (msg.timers) {
                const nextIsWhite =
                    msg.nextTurn === "w" ||
                    msg.nextTurn === true ||
                    msg.nextTurn === undefined
                        ? true
                        : false;
                syncClockFromServer(
                    { white: msg.timers.white, black: msg.timers.black },
                    nextIsWhite,
                    "move_made"
                );
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
                // Якорный ресинк на resume: сервер ответил точными таймерами,
                // ставим якорь без подстраивания локальной исносуммы.
                syncClockFromServer(
                    { white: msg.timers.white, black: msg.timers.black },
                    gameData?.move ?? true,
                    "gameResumed"
                );
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

                            // Отправляем на сервер ТОЛЬКО если партия реально активна —
                            // иначе сервер ответит move_error с текстом про завершение.
                            if (gameStatus !== "playing") {
                                console.warn("[GameArea] Move blocked: game status is", gameStatus);
                                initializeFromFen(gameData?.fen || START_FEN);
                                setActivFigure({ _id: -1, figure: "" });
                                setValidMoves([]);
                                setLastMove(null);
                                return;
                            }
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
        [board, activFigure, validMoves, flipped, isGameOver, isWhite, initializeFromFen, playerColor, gameStatus, gameData?.fen]
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
