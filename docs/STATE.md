# Redux-состояние

## Обзор

Состояние приложения управляется через Redux Toolkit с использованием `redux-persist` для сохранения данных между сессиями. Хранилище настраивается в `src/redux/store.ts`.

## Store

```ts
// src/redux/store.ts
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(authApi.middleware),
});

export const persistor = persistStore(store);
```

**Persist config:** `whitelist: ["token", "wsId"]` — эти данные сохраняются в `localStorage` и восстанавливаются при перезагрузке.

> **Примечание:** В отличие от предыдущих версий документации, `colorGame` и `theme` **не** входят в whitelist persist. Тема применяется через `applyTheme()` в `App.tsx` при изменении `state.theme`, но сама тема не персистируется автоматически (это можно добавить при необходимости).

## Слайсы

### `token` — JWT-токен

| Поле | Тип | Начальное значение |
|------|-----|-------------------|
| `token` | `string` | `""` |

**Действия:**
- `newToken(token)` — устанавливает новый JWT-токен

**Источник:** устанавливается после успешного `loginUser` или `registrationUser`

---

### `user` — Пользователь и статистика

```ts
interface UserState {
    userName: string;
    stats: UserStats;
}

interface UserStats {
    rating: number;       // Текущий рейтинг (по умолчанию 800)
    gamesPlayed: number;  // Сыгранные игры
    wins: number;         // Победы
    losses: number;       // Поражения
    draws: number;        // Ничьи
    maxRating: number;    // Максимальный рейтинг
}
```

**Действия:**
- `setUserName(name)` — устанавливает имя пользователя
- `setUserStats(stats)` — устанавливает статистику (рейтинг, победы и т.д.)
- `resetUserStats()` — сбрасывает статистику к начальным значениям
- `resetUser()` — сбрасывает имя и статистику

**Источник:** устанавливается после успешного ответа `isActivToken` или `loginUser`/`registrationUser`

---

### `colorGame` — Выбранная сторона

| Поле | Тип | Начальное значение |
|------|-----|-------------------|
| `colorGame` | `"wite" \| "black"` | `"wite"` (по умолчанию) |

**Действия:**
- `newColorGame(color)` — устанавливает выбранную сторону

**Источник:** устанавливается при выборе стороны в интерфейсе

---

### `theme` — Текущая тема

| Поле | Тип | Начальное значение |
|------|-----|-------------------|
| `theme` | `string` | `"theme-light"` |

**Действия:**
- `setTheme(themeName)` — устанавливает тему (CSS-класс)

**Источник:** устанавливается через `ThemeSwitcher` или восстанавливается при инициализации

---

### `room` — Состояние Colyseus комнаты

```ts
interface RoomState {
    roomId: string | null;
    connected: boolean;
    connecting: boolean;
    error: string | null;
    gameStarted: boolean;
    gameData: {
        idGame: string;
        position: string[];
        playerWite: string;
        playerBlack: string;
        reitingWite: number;
        reitingBlack: number;
        timeWite: number;
        timeBlack: number;
        move: boolean;
        message: string;
        typeGame: string;
        timeControl: number;
        timePluse: number;
    } | null;
}
```

**Действия:**
| Действие | Описание |
|----------|----------|
| `connectRoomStart()` | Начало подключения |
| `connectRoomSuccess({ roomId })` | Успешное подключение |
| `connectRoomFailure(error)` | Ошибка подключения |
| `disconnectRoom()` | Полное отключение от комнаты |
| `setRoomError(error)` | Установка ошибки |
| `gameStartSuccess(data)` | Начало игры с данными |
| `gameReset()` | Сброс игровых данных |

---

### `gameEvents` — Состояние поиска и игровых событий

```ts
type GameStatus = "idle" | "searching" | "playing" | "gameover";

interface SearchGameData {
    typeGame: "standart" | "fisher";
    timeControl: number;   // секунды
    timePluse: number;     // секунды за ход
}

interface GameOverData {
    result: "win" | "loss" | "draw";
    ratingChange: number;
}

interface GameEventsState {
    status: GameStatus;
    searchData: SearchGameData | null;
    gameOverData: GameOverData | null;
    searchGameId: string | null;
}
```

**Действия:**
| Действие | Описание |
|----------|----------|
| `setSearchMode({ typeGame, timeControl, timePluse })` | Устанавливает статус `"searching"` и данные поиска |
| `setSearchGameId(gameId)` | Сохраняет ID созданной игры для отмены |
| `setGameStart()` | Устанавливает статус `"playing"` |
| `setGameOver({ result, ratingChange })` | Устанавливает статус `"gameover"` |
| `resetGameEvents()` | Сбрасывает всё в начальное состояние |

> `searchGameId` сохраняется после `createSearchRoom` и передаётся при отмене поиска (`cancelSearch`), чтобы бекенд мог найти и удалить именно эту игру.

---

### `wsID` — WebSocket ID

| Поле | Тип | Начальное значение |
|------|-----|-------------------|
| `wsId` | `string` | `""` |

**Действия:**
- `newWsID(id)` — устанавливает WebSocket ID клиента

---

### `colorGame` — Выбранная сторона

| Поле | Тип | Начальное значение |
|------|-----|-------------------|
| `colorGame` | `"wite" \| "black"` | `"wite"` |

**Действия:**
- `newColorGame(color)` — устанавливает выбранную сторону

---

### `authApi` (RTK Query)

Автоматически сгенерированный слайс для управления REST API запросами авторизации.

**Endpoints:**

| Endpoint | Тип | URL | Кештеги |
|----------|-----|-----|---------|
| `isActivToken` | query | `/auth/current` | `["user"]` |
| `registrationUser` | mutation | `/auth/signup` | `["user"]` |
| `loginUser` | mutation | `/auth/login` | `["user"]` |
| `emailVerify` | mutation | `/auth/login/:token` | `["user"]` |
| `unLoginUser` | mutation | `/auth/logout` | `["user"]` |
| `createSearchRoom` | mutation | `/game/find` | `["user"]` |
| `cancelSearchRoom` | mutation | `/game/cancel` | `["user"]` |

`cancelSearchRoom` — удаляет созданную, но не начатую игру (`statusGame: "open"`, `result: "pending"`) по `gameId`.

## Типы состояния

```ts
// src/redux/store.ts
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
```

## Персистенция

Данные, сохраняемые между сессиями:

| Ключ persist | Данные | Назначение |
|-------------|--------|------------|
| `token` | JWT-токен | Авторизация без повторного входа |
| `wsId` | WebSocket ID | Идентификация клиента при переподключении |

При перезагрузке страницы `redux-persist` восстанавливает эти данные, `useIsActivTokenQuery` проверяет токен и восстанавливает имя пользователя и статистику.
