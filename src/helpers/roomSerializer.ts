import type { GameOverInfo } from "./gameTypes";

/**
 * Serialize a Colyseus room message into the flat GameData shape used by Redux.
 * Both `game` and `gameStart` events carry the same shape — idGame, position, names, etc.
 */
export interface GameDataPayload {
    idGame: string;
    position: string[];
    playerWite: string;
    playerBlack: string;
    reitingWite: number;
    reitingBlack: number;
    timeWite: number;
    timeBlack: number;
    move: boolean;
    typeGame: string;
    timeControl: number;
    timePluse: number;
    fen?: string;
    message: string;
}

export function toGameData(raw: unknown): GameDataPayload | null {
    if (typeof raw !== "object" || raw === null) return null;
    const m = raw as Partial<Record<string, unknown>>;

    const position = Array.isArray(m.position) ? m.position.map(String) : [];
    const fen = typeof m.fen === "string" ? m.fen : undefined;

    return {
        idGame: String(m.idGame ?? ""),
        position,
        playerWite: String(m.playerWite ?? ""),
        playerBlack: String(m.playerBlack ?? ""),
        reitingWite: Number(m.reitingWite ?? 800),
        reitingBlack: Number(m.reitingBlack ?? 800),
        timeWite: Number(m.timeWite ?? 0),
        timeBlack: Number(m.timeBlack ?? 0),
        move: Boolean(m.move ?? true),
        typeGame: String(m.typeGame ?? "standart"),
        timeControl: Number(m.timeControl ?? 180),
        timePluse: Number(m.timePluse ?? 0),
        fen,
        message: String(m.message ?? ""),
    };
}

/**
 * Normalize a gameOver event. Supports the new `gameOverData` payload
 * ({ result, winnerRole, endReason, ratingChange }) and the older
 * `result + ratingChange` flat shape.
 */
export function parseGameOverEvent(raw: unknown): {
    result: string;
    ratingChange: number;
    winnerRole: string | null;
    endReason: string;
} | null {
    if (typeof raw !== "object" || raw === null) return null;
    const msg = raw as Record<string, unknown>;

    if (msg.gameOverData && typeof msg.gameOverData === "object") {
        const god = msg.gameOverData as GameOverInfo;
        return {
            result: god.result,
            ratingChange: god.ratingChange ?? 0,
            winnerRole: god.winnerRole ?? null,
            endReason: god.endReason ?? "",
        };
    }

    const result = typeof msg.result === "string" ? msg.result : "pending";
    const ratingChange = Number(msg.ratingChange ?? 0);
    if (result === "pending") return null;
    return {
        result,
        ratingChange,
        winnerRole: null,
        endReason: "",
    };
}

export default { toGameData, parseGameOverEvent };
