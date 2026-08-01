import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@redux/store";
import s from "./Statistics.module.css";

const Statistics = () => {
    const stats = useSelector((state: RootState) => (state as any).user.stats);

    const statCards = [
        { label: "Rating", value: stats.rating, icon: "⚡" },
        { label: "Max Rating", value: stats.maxRating, icon: "🏆" },
        { label: "Games", value: stats.gamesPlayed, icon: "♟️" },
        { label: "Wins", value: stats.wins, icon: "✨" },
        { label: "Losses", value: stats.losses, icon: "📉" },
        { label: "Draws", value: stats.draws, icon: "🤝" },
    ];

    return (
        <div className={s.root}>
            <div className={s.container}>
                {/* Header */}
                <div className={s.header}>
                    <h2 className={s.title} style={{ color: "var(--color-text-primary)" }}>
                        Statistics
                    </h2>
                    <p className={s.sub} style={{ color: "var(--color-text-secondary)" }}>
                        Your chess performance overview
                    </p>
                </div>

                {/* Stats grid */}
                <div className={s.grid}>
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className={s.card}
                        >
                            <span className={s.cardIcon}>{stat.icon}</span>
                            <span className={s.cardLabel} style={{ color: "var(--color-text-muted)" }}>
                                {stat.label}
                            </span>
                            <span className={s.cardValue} style={{ color: "var(--color-text-primary)" }}>
                                {stat.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Statistics;
