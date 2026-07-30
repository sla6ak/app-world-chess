# Архитектура фронтенда

## Обзор

Фронтенд — React Single Page Application (SPA) с авторитарной моделью взаимодействия с сервером. Клиент подключается к Colyseus WebSocket-room для real-time обмена ходами и использует REST API (RTK Query) для авторизации и управления пользователем.

## Слои приложения

```
┌─────────────────────────────────────────┐
│           UI Components                 │  ← React компоненты (TSX)
│  ┌─────────────────────────────────┐    │
│  │     Pages (Route components)    │    │
│  │  DashboardPage, HomeTab,        │    │
│  │  GameBoard, Statistics,         │    │
│  │  LoginPage, RegisterPage        │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │   Shared/Reusable Components    │    │
│  │  Layout, Sidebar, GameMenu,     │    │
│  │  Modal, ThemeSwitcher, etc.     │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│           State Management              │  ← Redux Toolkit
│  ┌─────────────────────────────────┐    │
│  │  Redux Store                    │    │
│  │  ├─ authApi (RTK Query)        │    │
│  │  ├─ token, userName, colorGame │    │
│  │  ├─ theme, room, WsID          │    │
│  │  └─ persist (token, theme,     │    │
│  │     colorGame)                  │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│           Communication                 │  ← HTTP + WebSocket
│  ┌─────────────────────────────────┐    │
│  │  REST API (RTK Query)          │    │
│  │  └─ authApi → /auth/*          │    │
│  ├─────────────────────────────────┤    │
│  │  WebSocket (Colyseus.js)        │    │
│  │  └─ client → ws://localhost:5000│   │
│  │  └─ room → chess_room          │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│           Helpers & Utilities           │
│  ┌─────────────────────────────────┐    │
│  │  theme.ts, validationForm.ts,   │    │
│  │  requestWs.ts, showFigure.ts    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Маршрутизация

Маршрутизация осуществляется через `react-router-dom` v6 с `BrowserRouter` и `basename={PUBLIC_URL + "/"}`.

### Структура роутов

```
/ (Layout)
├── /                  → DashboardPage (редирект на /home или /game)
├── /home              → HomeTab (выбор режима игры)
├── /statistic         → Statistics (статистика игрока)
├── /game              → GameBoard (интерактивная доска)
├── /login             → LoginPage (публичный)
└── /register          → RegisterPage (публичный)
```

### Защита маршрутов

- **PrivateRoute** — проверяет наличие `userName` в Redux. Если пусто — редирект на `/login`
- **PublicRoute** — позволяет доступ только неавторизованным пользователям

## Управление состоянием

### Redux Store

Центральное хранилище настраивается в `src/redux/store.ts` с использованием `configureStore` из Redux Toolkit.

**Persist-конфигурация:**
- `whitelist: ["token", "colorGame", "theme"]` — эти данные сохраняются в `localStorage`
- `redux-persist` восстанавливает состояние при перезагрузке страницы

### Слайсы

| Слайс | Состояние | Назначение |
|-------|-----------|------------|
| `token` | `string` | JWT-токен авторизации |
| `userName` | `string` | Имя текущего пользователя |
| `colorGame` | `"wite" \| "black"` | Выбранная сторона игрока |
| `theme` | `string` | Текущая тема (CSS-класс) |
| `room` | `{ roomId, connected, connecting, error }` | Состояние Colyseus комнаты |
| `WsID` | `string` | WebSocket ID клиента |

### RTK Query (`authApi`)

Все REST-запросы к бэкенду инкапсулированы в `authApi`:

| Endpoint | Метод | URL | Назначение |
|----------|-------|-----|------------|
| `registrationUser` | POST | `/auth/signup` | Регистрация |
| `loginUser` | POST | `/auth/login` | Авторизация |
| `emailVerify` | PATCH | `/auth/login/:token` | Подтверждение email |
| `unLoginUser` | POST | `/auth/logout` | Выход |
| `isActivToken` | GET | `/auth/current` | Проверка актуальности токена |

### Async Thunks (`roomThunks`)

Для WebSocket-операций используются async thunks:

| Thunk | Назначение |
|-------|------------|
| `connectToRoom` | Подключение к Colyseus комнате `chess_room` |
| `sendRoomMessage` | Отправка сообщения в комнату |
| `leaveRoom` | Покинуть комнату |

## WebSocket-коммуникация

### Подключение

```
ws://localhost:5000/
```

Клиент использует `colyseus.js` SDK (`src/colyseus/client.ts`). Подключение инициируется при логине через `connectToRoom` thunk.

### Протокол сообщений (клиент → сервер)

Все сообщения — JSON-объекты с полем `event`.

| Событие | Описание | Поля |
|---------|----------|------|
| `startApp` | Подключение/переподключение | `token`, `color`, `idWs` |
| `startGame` | Начать игру / искать оппонента | `token`, `color`, `typeGame`, `timeControl`, `timePluse`, `idWs` |
| `game` | Отправить ход | `idWs`, `event: "game"`, позиция |

### События сервера → клиент

| Событие | Описание |
|---------|----------|
| `mesRes` | Ответ сервера на `startApp` / `startGame` / `game` |

Подробный протокол описан в `docs/WEBSOCKET.md`.

## Тема и стилизация

- **CSS Custom Properties** — все цвета определены в `src/styles/themes.css`
- **Tailwind CSS** — утилитарный CSS, настроен через `tailwind.config.js`
- **Темы** — переключение через замену класса на `<html>` элементе
- **Dark mode** — поддержка через `darkMode: 'class'` в Tailwind

Подробнее: `docs/THEMING.md`
