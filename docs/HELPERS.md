# Утилиты и хелперы

## Обзор

Вспомогательные модули, используемые по всему приложению.

---

## `src/helpers/theme.ts`

Утилиты для работы с темами.

### Экспорты

| Экспорт | Тип | Описание |
|----------|-----|----------|
| `THEMES` | `readonly ["theme-light", "theme-dark", "theme-chess-classic", "theme-ocean"]` | Массив доступных тем |
| `ThemeName` | type | Тип для имени темы |
| `applyTheme(themeId: string)` | function | Применяет тему, устанавливая класс на `<html>` |
| `getCurrentTheme()` | function | Возвращает текущую тему из `<html>` |

### Использование

```tsx
import { applyTheme, THEMES, getCurrentTheme } from "@helpers/theme";

// Применить тему
applyTheme("theme-dark");

// Получить текущую тему
const current = getCurrentTheme(); // "theme-light" | "theme-dark" | ...
```

---

## `src/helpers/validationForm.ts`

Схемы валидации форм через Yup.

### Экспорты

| Экспорт | Тип | Описание |
|----------|-----|----------|
| `loginSchema` | Yup schema | Валидация формы входа |
| `registerSchema` | Yup schema | Валидация формы регистрации |

### loginSchema

```ts
email: string().email("Invalid email").required("Email must by required")
password: string()
    .min(6, "Password must be longer than 6 letters!")
    .max(18, "Password must be shorts than 18 letters!")
    .required("Password must by required")
```

### registerSchema

```ts
firstName: string()
    .min(2, "Name must be longer than 2 letters!")
    .max(30, "Name must be shorts than 30 letters!")
    .required("Name must by required")
password: string()
    .min(6, "Password must be longer than 6 letters!")
    .max(18, "Password must be shorts than 18 letters!")
    .required("Password must by required")
dublePassword: string()  // Note: typo in field name
    .min(6, "Password must be longer than 6 letters!")
    .max(18, "Password must be shorts than 18 letters!")
    .required("Password must by required")
email: string().email("Invalid email").required("Email must by required")
```

---

## `src/helpers/showFigure.ts`

Отображение шахматных фигур как SVG-изображений на доске.

### Экспорт

| Экспорт | Тип | Описание |
|----------|-----|----------|
| `showFigure(cord: number, figure: string)` | function | Возвращает путь к SVG-файлу фигуры |

### Маппинг фигур

| Символ | Файл | Цвет |
|--------|------|------|
| `K` | `Chess_tile_kl-whitebg.svg.png` | Белый король |
| `Q` | `Chess_tile_ql-whitebg.svg.png` | Белый ферзь |
| `R` | `Chess_rlt26.svg.png` | Белая ладья |
| `B` | `Chess_tile_bl.svg.png` | Белый слон |
| `N` | `Chess_clt26.svg.png` | Белый конь |
| `P` | `Chess_tile_pl.svg.png` | Белая пешка |
| `k` | `Chess_tile_kd.svg.png` | Чёрный король |
| `q` | `Chess_qdt26.svg.png` | Чёрный ферзь |
| `r` | `Chess_rdt26.svg.png` | Чёрная ладья |
| `b` | `Chess_tile_bd.svg.png` | Чёрный слон |
| `n` | `Chess_cdt45.svg.png` | Чёрный конь |
| `p` | `Chess_tile_pd.svg.png` | Чёрная пешка |
| другое | `""` (пустая строка) | Нет фигуры |

### Использование

```tsx
import showFigure from "@helpers/showFigure";

<img src={showFigure(index, element.figure)} alt="" className="w-[80%] h-[80%] object-contain" />
```

---

## `src/services/wsMessages.ts`

Фабрики WebSocket-сообщений. Генерируют JSON-объекты для отправки через Colyseus room.

### Экспорты

| Экспорт | Сигнатура | Описание |
|----------|-----------|----------|
| `reqWsStartApp` | `(idWs, token, color) => object` | Сообщение подключения |
| `reqWsGame` | `(data) => object` | Сообщение хода |
| `reqWsStartGame` | `(timeControl, timePluse, typeGame, token, idWs, color) => object` | Сообщение поиска игры |

### Использование

```ts
import { reqWsStartApp, reqWsGame, reqWsStartGame } from "@services/wsMessages";

// Подключение
room.send(reqWsStartApp(wsId, token, color));

// Поиск игры
room.send(reqWsStartGame(300, 10, "standart", token, wsId, color));

// Ход
room.send(reqWsGame({ idWs: wsId }));
```

---

## `src/services/client.ts`

Экземпляр Colyseus Client для подключения к WebSocket-серверу.

```ts
import { Client } from "colyseus.js";

const COLYSEUS_URL = "ws://localhost:5000";
const client = new Client(COLYSEUS_URL);

export default client;
```

## `src/services/roomManager.ts`

Простой in-memory менеджер текущей Colyseus комнаты.

```ts
let currentRoom: Room | null = null;

export function setRoom(room: Room | null): void { ... }
export function getRoom(): Room | null { ... }
```

> **Примечание:** Комната хранится в памяти, а не в Redux. Это позволяет получать доступ к комнате из любого места без лишних подключений.
