import React from "react";

const HelperBoard = () => {
    return (
        <div className="flex flex-col sm:flex-row w-full flex-grow bg-theme-surface justify-between items-center p-4">
            <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Helper Board
            </span>
        </div>
    );
};

export default HelperBoard;
