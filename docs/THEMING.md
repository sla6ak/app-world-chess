# Система тем

## Обзор

Приложение использует CSS Custom Properties (CSS Variables) для темизации с поддержкой четырёх тем. Переключение тем осуществляется заменой CSS-класса на элементе `<html>`.

## Доступные темы

| Тема | CSS-класс | Описание |
|------|-----------|----------|
| Светлая (по умолчанию) | `theme-light` | Тёплая светлая тема |
| Тёмная | `theme-dark` | Тёмный режим |
| Классическая шахматная | `theme-chess-classic` | Тёплые классические шахматные тона |
| Океан | `theme-ocean` | Холодные синие тона |

## Применение темы

Тема применяется добавлением класса к `<html>` элементу:

```html
<html lang="en" class="theme-dark">
```

Или программно через функцию `applyTheme()`:

```tsx
import { applyTheme } from "@helpers/theme";

applyTheme("theme-dark");
```

В `App.tsx` тема применяется автоматически при изменении:

```tsx
const currentTheme: string = useSelector((state: RootState) => (state as any).theme);

useEffect(() => {
    applyTheme(currentTheme);
}, [currentTheme]);
```

## CSS-переменные

Все цвета тем определены в `src/styles/themes.css` как CSS custom properties. Каждая тема — блок с переопределением переменных.

### Общие переменные (все темы)

| Переменная | Описание |
|------------|----------|
| `--color-bg-primary` | Фон страницы |
| `--color-bg-secondary` | Карточки, модальные окна, инпуты |
| `--color-bg-surface` | Фон sidebar/app bar |
| `--color-text-primary` | Основной цвет текста |
| `--color-text-secondary` | Приглушённый/вспомогательный текст |
| `--color-text-muted` | Мутный текст (метки, placeholder) |
| `--color-text-on-accent` | Цвет текста на акцентном фоне |
| `--color-accent` | Основной акцентный цвет бренда |
| `--color-accent-hover` | Состояние hover для акцента |
| `--color-accent-subtle` | Приглушённый акцент (фон) |
| `--color-accent-border` | Граница акцента |
| `--color-bg-board` | Светлая клетка шахматной доски |
| `--color-bg-board-dark` | Тёмная клетка шахматной доски |
| `--color-bg-board-pc` | Доска на ПК (тёмный оттенок) |
| `--color-bg-board-mobile` | Доска на мобильных |
| `--color-green` | Успех/зелёный акцент |
| `--color-error` | Цвет ошибки |
| `--color-border` | Цвет границ |
| `--color-shadow` | Тень по умолчанию |
| `--radius-sm/md/lg/xl` | Скругления |
| `--shadow-card/glow/modal` | Тени |
| `--font-sans/poppins/mono` | Шрифты |
| `--transition-fast/normal/slow` | Переходы |

### Специфичные переменные

Каждая тема имеет дополнительные переменные:
- `--color-bg-accent`, `--color-bg-input`, `--color-bg-hover`
- `--color-text-link`
- `--color-scrollbar-track/thumb`
- `--color-icon-default/muted`

## Tailwind CSS интеграция

Конфигурация Tailwind (`tailwind.config.js`) маппит свои цветовые токены на CSS-переменные:

```js
colors: {
  board: {
    light: 'var(--color-bg-board)',
    dark: 'var(--color-bg-board-dark)',
    bg: 'var(--color-bg-accent)',
    // ...
  },
  accent: 'var(--color-accent)',
  // ...
}
```

Настроен `darkMode: 'class'` для поддержки Tailwind dark mode через CSS-переменные.

### Кастомные анимации Tailwind

```js
animation: {
  'fade-in': 'fadeIn 0.3s ease-in-out',
  'slide-in': 'slideIn 0.3s ease-out',
  'scale-in': 'scaleIn 0.2s ease-out',
  'check-flash': 'checkFlash 1s ease-in-out infinite',
  'last-move-glow': 'lastMoveGlow 2s ease-in-out infinite',
  // ...
}
```

## Добавление новой темы

1. Добавить блок темы в `src/styles/themes.css` с новыми CSS-переменными
2. Добавить класс темы в массив `THEMES` в `src/helpers/theme.ts`
3. Добавить опцию темы в компонент `ThemeSwitcher`
4. При необходимости добавить класс по умолчанию в `index.html`

## Переключение тем

Текущая тема хранится в Redux (`state.theme`). При изменении темы вызывается `applyTheme()` в `App.tsx`.

### ThemeSwitcher компонент

`src/components/themeSwitcher/ThemeSwitcher.tsx` — переключатель тем с визуальными индикаторами для каждой из 4 тем.
