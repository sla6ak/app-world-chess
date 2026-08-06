import rookB from "../images/Chess_rdt26.svg.png";
import rookW from "../images/Chess_rlt26.svg.png";
import kingB from "../images/Chess_tile_kd.svg.png";
import kingW from "../images/Chess_tile_kl-whitebg.svg.png";
import queenB from "../images/Chess_qdt26.svg.png";
import queenW from "../images/Chess_tile_ql-whitebg.svg.png";
import knightB from "../images/Chess_cdt45.svg.png";
import knightW from "../images/Chess_clt26.svg.png";
import bishopB from "../images/Chess_tile_bd.svg.png";
import bishopW from "../images/Chess_tile_bl.svg.png";
import pawnB from "../images/Chess_tile_pd.svg.png";
import pawnW from "../images/Chess_tile_pl.svg.png";

const pieces: Record<string, string> = {
    // White pieces (uppercase)
    R: rookW,
    N: knightW,
    B: bishopW,
    Q: queenW,
    K: kingW,
    P: pawnW,
    // Black pieces (lowercase)
    r: rookB,
    n: knightB,
    b: bishopB,
    q: queenB,
    k: kingB,
    p: pawnB,
};

/**
 * Returns the SVG/PNG path for a chess piece.
 * @param cord — square index (0–63), unused but kept for API compatibility
 * @param figure — piece character (e.g. "K", "q", "p", "8" for empty)
 */
const showFigure = (cord: number, figure: string): string => {
    return pieces[figure] ?? "";
};

export default showFigure;
