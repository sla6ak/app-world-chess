import React from "react";
import s from "./HelperBoard.module.css";

const HelperBoard = () => {
    return (
        <div className={s.board}>
            <span className={s.label} style={{ color: "var(--color-text-secondary)" }}>
                Helper Board
            </span>
        </div>
    );
};

export default HelperBoard;
