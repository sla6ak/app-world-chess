import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "@redux/sliceTheme";
import type { RootState } from "@redux/store";

const themes = [
    { id: "theme-light", label: "Light", color: "#f5f5f5" },
    { id: "theme-dark", label: "Dark", color: "#1a1a2e" },
    { id: "theme-chess-classic", label: "Classic", color: "#faf6f0" },
    { id: "theme-ocean", label: "Ocean", color: "#f0f7fa" },
];

const ThemeSwitcher = () => {
    const dispatch = useDispatch();
    const currentTheme = useSelector((state: RootState) => state.theme);

    const handleThemeChange = (themeId: string) => {
        dispatch(setTheme(themeId));
    };

    return (
        <div className="flex items-center gap-1.5 p-1.5 rounded-full border transition-colors duration-200" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-secondary)" }}>
            {themes.map((theme) => (
                <button
                    key={theme.id}
                    type="button"
                    aria-label={`Switch to ${theme.label} theme`}
                    title={theme.label}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`relative w-6 h-6 rounded-full transition-all duration-200 ${currentTheme === theme.id ? "scale-110 shadow-md" : "opacity-60 hover:opacity-100 hover:scale-105"}`}
                    style={{
                        backgroundColor: theme.color,
                        border: currentTheme === theme.id ? "2px solid var(--color-accent)" : "2px solid var(--color-border)",
                        boxShadow: currentTheme === theme.id ? "0 0 0 3px var(--color-accent-subtle)" : "none",
                    }}
                >
                    {currentTheme === theme.id && (
                        <svg className="absolute inset-0 m-auto w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-accent)" }}>
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </button>
            ))}
        </div>
    );
};

export default ThemeSwitcher;
