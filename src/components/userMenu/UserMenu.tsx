import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
    const navigate = useNavigate();
    const userName = useSelector((state: any) => state.user.userName);

    return (
        <div className="flex items-center gap-3 sm:gap-4">
            {/* User avatar + name */}
            <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => navigate("/statistic")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/statistic")}
            >
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold border border-accent/30 group-hover:bg-accent/30 transition-colors duration-200">
                    {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium transition-colors duration-200 group-hover:underline" style={{ color: "var(--color-text-primary)" }}>
                    {userName}
                </span>
            </div>


        </div>
    );
};

export default UserMenu;
