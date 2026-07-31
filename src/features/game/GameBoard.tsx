import React, { useEffect, useState } from "react";
import HelperBoard from "@features/game/HelperBoard";
import showFigure from "@helpers/showFigure";

const GameBoard: React.FC = () => {
    const [board, setBoard] = useState([{ _id: 1, figure: "" }]);
    const [activFigure, setActivFigure] = useState({ _id: 1, figure: "" });
    const startPosition = "rnbqkbnrpppppppp88888888888888888888888888888888PPPPPPPPRNBQKBNR";

    useEffect(() => {
        const startPositionArr = startPosition.split("");
        const boardEmpty: any = [];
        const createSquare = () => {
            for (let cord = 0; cord < 64; cord++) {
                boardEmpty.push({ _id: cord, figure: startPositionArr[cord] });
            }
            setBoard(boardEmpty);
        };
        createSquare();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        width: "12.5%",
        height: "12.5%",
        backgroundColor: color === "black" ? "var(--color-bg-board-dark)" : "var(--color-bg-board)",
        color: color === "black" ? "var(--color-bg-board)" : "var(--color-text-primary)",
    });

    return (
        <div className="flex flex-col items-center flex-grow bg-theme-primary md:flex-row md:overflow-hidden">
            {/* Chess board */}
            <div
                className="chess-board flex flex-wrap justify-center items-center w-full max-w-[min(90vw,90vh)] aspect-square border-solid"
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
                            className="flex justify-center items-center border-solid w-[12.5%] h-[12.5%] square"
                            style={{
                                backgroundColor: clr === "black" ? "var(--color-bg-board-dark)" : "var(--color-bg-board)",
                                borderWidth: "1px",
                                borderColor: "var(--color-border)",
                            }}
                            onClick={(e: any) => eventHandler(e, index)}
                        >
                            <img src={showFigure(index, element.figure)} alt="" className="w-[80%] h-[80%] object-contain" />
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
