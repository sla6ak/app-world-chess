import rookB from "../images/Chess_rdt26.svg.png";
import rookW from "../images/Chess_rlt26.svg.png";
import kingB from "../images/Chess_tile_kd.svg.png";
import kingW from "../images/Chess_tile_kl-whitebg.svg.png";
import quinB from "../images/Chess_qdt26.svg.png";
import quinW from "../images/Chess_tile_ql-whitebg.svg.png";
import nitB from "../images/Chess_cdt45.svg.png";
import nitW from "../images/Chess_clt26.svg.png";
import bishB from "../images/Chess_tile_bd.svg.png";
import bishW from "../images/Chess_tile_bl.svg.png";
import pinB from "../images/Chess_tile_pd.svg.png";
import pinW from "../images/Chess_tile_pl.svg.png";

const showFigure = (cord: number, figure: string) => {
    const fig = "";
    if (figure === "N") {
        return nitW;
    }
    if (figure === "B") {
        return bishW;
    }
    if (figure === "Q") {
        return quinW;
    }
    if (figure === "R") {
        return rookW;
    }
    if (figure === "P") {
        return pinW;
    }
    if (figure === "K") {
        return kingW;
    }
    if (figure === "b") {
        return bishB;
    }
    if (figure === "k") {
        return kingB;
    }
    if (figure === "q") {
        return quinB;
    }
    if (figure === "r") {
        return rookB;
    }
    if (figure === "n") {
        return nitB;
    }
    if (figure === "p") {
        return pinB;
    }
    return fig;
};
export default showFigure;
