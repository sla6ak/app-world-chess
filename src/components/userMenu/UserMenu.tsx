import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import s from "./UserMenu.module.css";

const UserMenu = () => {
    const navigate = useNavigate();
    const userName = useSelector((state: any) => state.user.userName);

    return (
        <div className={s.menu}>
            {/* User avatar + name */}
            <div
                className={s.trigger}
                onClick={() => navigate("/statistic")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/statistic")}
            >
                <div className={s.avatar}>
                    {userName.charAt(0).toUpperCase()}
                </div>
                <span className={s.name} style={{ color: "var(--color-text-primary)" }}>
                    {userName}
                </span>
            </div>
        </div>
    );
};

export default UserMenu;
