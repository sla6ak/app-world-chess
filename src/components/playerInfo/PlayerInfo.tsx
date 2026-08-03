import React from "react";
import HandshakeIcon from "@mui/icons-material/Handshake";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import s from "./PlayerInfo.module.css";

interface PlayerInfoProps {
    playerName: string;
    rating: number;
    /** Оставшееся время в секундах (инициализируется из настроек режима игры). */
    time: number;
    isWhite: boolean;
    isYou: boolean;
    isActive: boolean;
    className?: string;
    position?: "top" | "bottom";
    /** Клик по кнопке «Сдаться» (рендерится только в своём блоке). */
    onResignClick?: () => void;
    /** Клик по кнопке «Ничья» (рендерится только в блоке соперника). */
    onDrawClick?: () => void;
    /** Соперник предложил ничью — кнопка «Ничья» пульсирует до действия или хода. */
    drawOffered?: boolean;
    /** Мы уже предложили ничью и ждём ответа соперника. */
    drawOfferSent?: boolean;
    /** Партия завершена — кнопки действий отключены. */
    gameOver?: boolean;
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
    onResignClick,
    onDrawClick,
    drawOffered = false,
    drawOfferSent = false,
    gameOver = false,
}) => {
    const minutes = Math.floor(Math.max(time, 0) / 60);
    const seconds = Math.max(time, 0) % 60;
    const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const positionClass =
        position === "top"
            ? s.containerTop
            : position === "bottom"
              ? s.containerBottom
              : "";

    const renderActionButton = () => {
        if (isYou) {
            // Свой блок — кнопка «Сдаться» (белый флаг)
            return (
                <button
                    type="button"
                    className={`${s.actionBtn} ${s.resignBtn}`}
                    onClick={onResignClick}
                    disabled={gameOver}
                    title="Сдаться"
                    aria-label="Сдаться"
                >
                    <OutlinedFlagIcon fontSize="inherit" />
                </button>
            );
        }

        // Блок соперника — кнопка «Предложить ничью» / «Принять ничью»
        const tooltip = drawOffered
            ? "Принять ничью"
            : drawOfferSent
              ? "Ничья предложена — ожидание ответа"
              : "Предложить ничью";

        return (
            <button
                type="button"
                className={`${s.actionBtn} ${s.drawBtn} ${
                    drawOffered ? s.drawBtnPulsing : ""
                } ${drawOfferSent ? s.drawBtnSent : ""}`}
                onClick={onDrawClick}
                disabled={gameOver || drawOfferSent}
                title={tooltip}
                aria-label={tooltip}
            >
                <HandshakeIcon fontSize="inherit" />
                <span className={s.halfMark}>½</span>
            </button>
        );
    };

    return (
        <div
            className={`${s.container} ${positionClass} ${className ?? ""} ${isActive ? s.active : ""} ${!isActive && !isYou ? s.inactive : ""}`}
        >
            {/* ── Left: color dot + player name + rating ── */}
            <div className={s.leftSection}>
                <div className={`${s.colorDot} ${isWhite ? s.dotWhite : s.dotBlack}`}>
                    {isWhite ? "♔" : "♚"}
                </div>

                <span className={s.name}>
                    {playerName || "—"}
                    <span className={s.rating}>({rating})</span>
                    {isYou && <span className={s.youBadge}>You</span>}
                </span>
            </div>

            {/* ── Center: action button ── */}
            <div className={s.centerSection}>{renderActionButton()}</div>

            {/* ── Right: clock ── */}
            <span className={`${s.time} ${isActive ? s.timeActive : ""}`}>
                {timeStr}
            </span>
        </div>
    );
};

export default PlayerInfo;
