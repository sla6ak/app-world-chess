import React from "react";

const Statistics = () => {
    // const { data } = useStatisticaQuery(param);

    return (
        <div className="p-4 md:p-8 bg-theme-primary min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold font-poppins tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                        Statistics
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Your chess performance overview
                    </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    {[
                        { label: "Rating", value: "—", icon: "⚡" },
                        { label: "Max Rating", value: "—", icon: "🏆" },
                        { label: "Games", value: "—", icon: "♟️" },
                        { label: "Wins", value: "—", icon: "✨" },
                        { label: "Losses", value: "—", icon: "📉" },
                        { label: "Draws", value: "—", icon: "🤝" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="card flex flex-col items-center text-center py-5 md:py-6 hover:-translate-y-0.5 transition-transform duration-200"
                        >
                            <span className="text-2xl mb-2">{stat.icon}</span>
                            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                                {stat.label}
                            </span>
                            <span className="text-2xl font-bold mt-1" style={{ color: "var(--color-text-primary)" }}>
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
