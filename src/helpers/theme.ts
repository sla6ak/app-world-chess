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

/** Material theme placeholder — kept for compatibility */
export const materialTheme: any = null;

const theme = { THEMES, applyTheme, getCurrentTheme, materialTheme };
export default theme;
