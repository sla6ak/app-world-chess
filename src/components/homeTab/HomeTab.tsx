// import { useState } from "react";
import GameMenu from "@components/gameMenu/GameMenu";
import PropTypes from "prop-types";
// eslint-disable-next-line @typescript-eslint/no-redeclare
type PropTypes = {
    connect: { sendMessage: any; readyState: any; lastMessage: any };
};
const HomeTab: React.FC<PropTypes> = ({ connect }) => {
    return (
        <div className="h-full" style={{ position: "relative" }}>
            <GameMenu connect={connect} />
        </div>
    );
};

export default HomeTab;
