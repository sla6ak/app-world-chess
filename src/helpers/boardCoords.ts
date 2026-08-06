/**
 * Board coordinate utilities for the 64-index flat board representation.
 * Board[0] = a8 (top-left), board[63] = h1 (bottom-right).
 * This matches showFigure and the on-screen square layout.
 */

/** Index (0-63) to algebraic square (a1–h8). */
export function boardIndexToSquare(idx: number): string {
    const fileIdx = idx % 8;
    const rankIdx = 8 - Math.floor(idx / 8);
    const file = String.fromCharCode(97 + fileIdx);
    return `${file}${rankIdx}`;
}

/** Algebraic square (a1–h8) to index (0-63). */
export function squareToBoardIndex(square: string): number {
    const fileIdx = square.charCodeAt(0) - 97;
    const rankIdx = Number(square[1]);
    return (8 - rankIdx) * 8 + fileIdx;
}

/** True when an index is within bounds. */
export function isValidBoardIndex(idx: number): boolean {
    return idx >= 0 && idx < 64;
}
