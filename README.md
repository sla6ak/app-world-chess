# Chess-World — React Chess Application

## Theming System

The project uses a CSS custom properties (CSS Variables) theming system with support for multiple themes.

### Available Themes

| Theme Class            | Description              |
| ---------------------- | ------------------------ |
| `theme-light`          | Warm light (default)     |
| `theme-dark`           | Dark mode                |
| `theme-chess-classic`  | Classic chess warm tones |
| `theme-ocean`          | Cool blue ocean theme    |

### How to Switch Themes

Themes are applied by adding a class to the `<html>` element:

```html
<html lang="en" class="theme-dark">
```

Or programmatically via the `ThemeSwitcher` component (included in the app bar).

### CSS Variable Reference

All theme colors are defined in `src/styles/themes.css` as CSS custom properties:

| Variable                    | Description              |
| --------------------------- | ------------------------ |
| `--color-bg-primary`        | Page background          |
| `--color-bg-secondary`      | Cards, modals, inputs    |
| `--color-bg-surface`        | Sidebar/app bar bg       |
| `--color-text-primary`      | Main text color          |
| `--color-text-secondary`    | Muted/helper text        |
| `--color-accent`            | Primary brand color      |
| `--color-accent-hover`      | Accent hover state       |
| `--color-bg-board`          | Chess board light square |
| `--color-bg-board-dark`     | Chess board dark square  |
| `--color-green`             | Success/green accent     |
| `--color-error`             | Error color              |
| `--color-border`            | Border color             |
| `--color-shadow`            | Default shadow           |

### Adding a New Theme

1. Add a new theme block in `src/styles/themes.css`
2. Add the theme class to the `THEMES` array in `src/helpers/theme.ts`
3. Add a theme option in `ThemeSwitcher` component
4. Add the class to `index.html` as a default if desired

### Tailwind CSS Integration

The Tailwind config (`tailwind.config.js`) maps its color tokens to CSS variables, so all Tailwind utilities automatically respond to theme changes.

---

## Application Logic

- Single-page application with React Router
- User authentication via Redux + WebSocket
- Layout with navigation and user menu
- Game board with interactive chess pieces
- Statistics page
- Multiple time control options for games

### Pages:

1. **Home** — choose game mode and time control
2. **Statistics** — player stats, rating, wins/losses
3. **Game** — interactive chess board
