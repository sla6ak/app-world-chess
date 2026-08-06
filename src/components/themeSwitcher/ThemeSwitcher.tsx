import React from "react";
import { useDispatch, useSelector } from "react-redux";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import { setTheme } from "@redux/slices/theme";
import type { RootState } from "@redux/store";
import type { ThemeName } from "@helpers/theme";
import s from "./ThemeSwitcher.module.css";

interface ThemeOption {
    id: ThemeName;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
}

const themes: ThemeOption[] = [
    { id: "theme-light", label: "Light", Icon: LightModeIcon },
    { id: "theme-dark", label: "Dark", Icon: DarkModeIcon },
    { id: "theme-chess-classic", label: "Classic", Icon: WbSunnyIcon },
    { id: "theme-ocean", label: "Ocean", Icon: NightsStayIcon },
];

const ThemeSwitcher: React.FC = () => {
    const dispatch = useDispatch();
    const currentTheme = useSelector((state: RootState) => state.theme);

    return (
        <div className={s.wrap} role="radiogroup" aria-label="Theme">
            {themes.map(({ id, label, Icon }) => {
                const isActive = currentTheme === id;
                return (
                    <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        aria-label={`Switch to ${label} theme`}
                        title={label}
                        onClick={() => dispatch(setTheme(id))}
                        className={`${s.option} ${isActive ? s.optionActive : ""}`}
                    >
                        <Icon className={s.icon} />
                    </button>
                );
            })}
        </div>
    );
};

export default ThemeSwitcher;
