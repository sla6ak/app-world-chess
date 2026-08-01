import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "@redux/slices/theme";
import type { RootState } from "@redux/store";
import s from "./ThemeSwitcher.module.css";

const themes = [
    { id: "theme-light", label: "Light", color: "#f5f5f5" },
    { id: "theme-dark", label: "Dark", color: "#1a1a2e" },
    { id: "theme-chess-classic", label: "Classic", color: "#faf6f0" },
    { id: "theme-ocean", label: "Ocean", color: "#f0f7fa" },
];

const ThemeSwitcher = () => {
    const dispatch = useDispatch();
    const currentTheme = useSelector((state: RootState) => (state as any).theme);

    const handleThemeChange = (themeId: string) => {
        dispatch(setTheme(themeId));
    };

    return (
        <div className={s.wrap}>
            {themes.map((theme) => (
                <button
                    key={theme.id}
                    type="button"
                    aria-label={`Switch to ${theme.label} theme`}
                    title={theme.label}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`${s.dot} ${currentTheme === theme.id ? s.dotActive : ""}`}
                    style={{
                        backgroundColor: theme.color,
                        border: currentTheme === theme.id ? "2px solid var(--color-accent)" : "2px solid var(--color-border)",
                        boxShadow: currentTheme === theme.id ? "0 0 0 3px var(--color-accent-subtle)" : "none",
                    }}
                >
                    {currentTheme === theme.id && (
                        <svg className={s.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </button>
            ))}
        </div>
    );
};

export default ThemeSwitcher;
