import React from "react";
import GameMenu from "@features/game/GameMenu";
import s from "./HomeTab.module.css";

const HomeTab: React.FC = () => {
    return (
        <div className={s.root} style={{ position: "relative" }}>
            <GameMenu />
        </div>
    );
};

export default HomeTab;
