import React from "react";
import s from "./PlayerInfo.module.css";

interface PlayerInfoProps {
    playerName: string;
    rating: number;
    time: number;
    isWhite: boolean;
    isYou: boolean;
    isActive: boolean;
    className?: string;
    position?: 'top' | 'bottom';
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({
    playerName,
    rating,
    time,
    isWhite,
    isYou,
    isActive,
    className,
    position,
}) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const positionClass = position === 'top' ? s.containerTop : position === 'bottom' ? s.containerBottom : '';

    return (
        <div
            className={`${s.container} ${positionClass} ${className ?? ""} ${isActive ? s.active : ""} ${!isActive && !isYou ? s.inactive : ""}`}
        >
            {/* Color indicator */}
            <div
                className={`${s.colorDot} ${isWhite ? s.dotWhite : s.dotBlack}`}
            >
                {isWhite ? "♔" : "♚"}
            </div>

            {/* Player name */}
            <span className={s.name}>
                {playerName || "—"}
                {isYou && <span className={s.youBadge}>You</span>}
            </span>

            {/* Desktop: show rating and time */}
            <span className={s.rating}>
                {rating}
            </span>
            <span className={s.time}>{timeStr}</span>
        </div>
    );
};

export default PlayerInfo;
