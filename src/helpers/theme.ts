/**
 * Theme utilities for the Chess-World application.
 *
 * Themes are applied by adding a class to the <html> element:
 *   - theme-light (default)
 *   - theme-dark
 *   - theme-chess-classic
 *   - theme-ocean
 *
 * All theme colors are defined as CSS custom properties in src/styles/themes.css.
 * The Tailwind config maps its color tokens to these CSS variables,
 * so any Tailwind utility that uses a theme color will automatically
 * update when the theme class changes.
 */

export const THEMES = ["theme-light", "theme-dark", "theme-chess-classic", "theme-ocean"] as const;
export type ThemeName = typeof THEMES[number];

/** Apply a theme by setting the class on <html> */
export function applyTheme(themeId: string): void {
    if (typeof document === "undefined") return;
    THEMES.forEach((t) => document.documentElement.classList.remove(t));
    document.documentElement.classList.add(themeId);
}

/** Get the currently applied theme */
export function getCurrentTheme(): string {
    if (typeof document === "undefined") return "theme-light";
    for (const theme of THEMES) {
        if (document.documentElement.classList.contains(theme)) return theme;
    }
    return "theme-light";
}

// eslint-disable-next-line react-refresh/only-export-components
export const materialTheme: any = null;

/** Resolve which color a player has in a game by matching their user name
 *  against the game's white/black player names.
 *  Returns "wite" / "black", or null when the user is not a participant. */
export function resolvePlayerColor(
    userName: string,
    gameData: { playerWite?: string; playerBlack?: string } | null | undefined
): "wite" | "black" | null {
    if (!userName || !gameData) return null;
    if (gameData.playerWite === userName) return "wite";
    if (gameData.playerBlack === userName) return "black";
    return null;
}

const theme = { THEMES, applyTheme, getCurrentTheme, materialTheme, resolvePlayerColor };
export default theme;
