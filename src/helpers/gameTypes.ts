/**
 * Shared types for game events, mirrors the backend GameManager.
 */

export type GameResult = "1-0" | "0-1" | "0.5-0.5";

export type EndReason =
    | "checkmate"
    | "stalemate"
    | "threefold"
    | "fifty_move"
    | "insufficient_material"
    | "timeout"
    | "resignation"
    | "agreed_draw"
    | "abandonment"
    | "";

export type PlayerRole = "wite" | "black";

export interface GameOverInfo {
    result: GameResult;
    winnerRole: PlayerRole | null;
    endReason: EndReason;
    ratingChange?: number;
}

export type DrawOfferedBy = "me" | "opponent" | null;

// A flat 64-char string representing position from white's perspective:
// 'r' at a8, ..., 'P' at h2, ... Uppercase = white, lowercase = black, '8' = empty.
export type FlatPosition = string;
