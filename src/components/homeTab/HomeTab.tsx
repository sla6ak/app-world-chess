import React from "react";
import GameMenu from "@components/gameMenu/GameMenu";

const HomeTab: React.FC = () => {
    return (
        <div className="h-full" style={{ position: "relative" }}>
            <GameMenu />
        </div>
    );
};

export default HomeTab;
