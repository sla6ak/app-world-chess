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

## CSS-переменные

Все цвета тем определены в `src/styles/themes.css` как CSS custom properties:

| Переменная | Описание |
|------------|----------|
| `--color-bg-primary` | Фон страницы |
| `--color-bg-secondary` | Карточки, модальные окна, инпуты |
| `--color-bg-surface` | Фон sidebar/app bar |
| `--color-text-primary` | Основной цвет текста |
| `--color-text-secondary` | Приглушённый/вспомогательный текст |
| `--color-text-muted` | Мутный текст (метки, placeholder) |
| `--color-accent` | Основной акцентный цвет бренда |
| `--color-accent-hover` | Состояние hover для акцента |
| `--color-accent-subtle` | Приглушённый акцент (фон) |
| `--color-accent-border` | Граница акцента |
| `--color-bg-board` | Светлая клетка шахматной доски |
| `--color-bg-board-dark` | Тёмная клетка шахматной доски |
| `--color-green` | Успех/зелёный акцент |
| `--color-error` | Цвет ошибки |
| `--color-border` | Цвет границ |
| `--color-shadow` | Тень по умолчанию |

## Tailwind CSS интеграция

Конфигурация Tailwind (`tailwind.config.js`) маппит свои цветовые токены на CSS-переменные. Это означает, что все Tailwind утилиты автоматически реагируют на смену темы:

```js
// tailwind.config.js
colors: {
  board: {
    light: 'var(--color-bg-board)',
    dark: 'var(--color-bg-board-dark)',
  },
  accent: 'var(--color-accent)',
  // ...
}
```

Также настроен `darkMode: 'class'` для поддержки Tailwind dark mode через CSS-переменные.

## Добавление новой темы

1. Добавить блок темы в `src/styles/themes.css` с новыми CSS-переменными
2. Добавить класс темы в массив `THEMES` в `src/helpers/theme.ts`
3. Добавить опцию темы в компонент `ThemeSwitcher`
4. При необходимости добавить класс по умолчанию в `index.html`

## Переключение тем

Текущая тема хранится в Redux (`state.theme`) и персистируется через `redux-persist`. При изменении темы вызывается `applyTheme()` в `App.tsx`:

```tsx
useEffect(() => {
    applyTheme(currentTheme);
}, [currentTheme]);
```
