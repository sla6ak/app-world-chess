# Redux-состояние

## Обзор

Состояние приложения управляется через Redux Toolkit с использованием `redux-persist` для сохранения данных между сессиями. Хранилище настроено в `src/redux/store.ts`.

## Store

```ts
// src/redux/store.ts
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                ignoredPaths: ["room.room"],
            },
        }).concat(authApi.middleware),
});
```

**Persist config:** `whitelist: ["token", "colorGame", "theme"]` — эти данные сохраняются в `localStorage` и восстанавливаются при перезагрузке.

## Слайсы и их состояние

### `token` — JWT-токен

| Поле | Тип | Начальное значение |
|------|-----|-------------------|
| `token` | `string` | `""` |

**Действия:**
- `newToken(token)` — устанавливает новый JWT-токен

**Источник:** устанавливается после успешного `loginUser` или `registrationUser`

---

### `userName` — Имя пользователя

| Поле | Тип | Начальное значение |
|------|-----|-------------------|
| `userName` | `string` | `""` |

**Действия:**
- `isUserName(name)` — устанавливает имя пользователя

**Источник:** устанавливается после успешного ответа `isActivToken` (проверка токена)

---

### `colorGame` — Выбранная сторона

| Поле | Тип | Начальное значение |
|------|-----|-------------------|
| `colorGame` | `"wite" \| "black"` | `"wite"` (по умолчанию) |

**Действия:**
- `setColor(color)` — устанавливает выбранную сторону

**Источник:** устанавливается при выборе стороны в интерфейсе

---

### `theme` — Текущая тема

| Поле | Тип | Начальное значение |
|------|-----|-------------------|
| `theme` | `string` | `"theme-light"` |

**Действия:**
- `setTheme(themeName)` — устанавливает тему (CSS-класс)

**Источник:** устанавливается через `ThemeSwitcher` или восстанавливается из persist

---

### `room` — Состояние Colyseus комнаты

| Поле | Тип | Начальное значение |
|------|-----|-------------------|
| `roomId` | `string \| null` | `null` |
| `connected` | `boolean` | `false` |
| `connecting` | `boolean` | `false` |
| `error` | `string \| null` | `null` |

**Действия:**
- `connectRoomStart()` — начало подключения
- `connectRoomSuccess({ roomId })` — успешное подключение
- `connectRoomFailure(error)` — ошибка подключения
- `disconnectRoom()` — отключение от комнаты
- `setRoomError(error)` — установка ошибки

---

### `WsID` — WebSocket ID

| Поле | Тип | Начальное значение |
|------|-----|-------------------|
| `WsID` | `string` | `""` |

**Действия:**
- `setWsID(id)` — устанавливает WebSocket ID клиента

---

### `gameEvents` — Состояние поиска и игровых событий

| Поле | Тип | Начальное значение |
|------|-----|-------------------|
| `status` | `"idle" \| "searching" \| "playing" \| "gameover"` | `"idle"` |
| `searchData` | `SearchGameData \| null` | `null` |
| `gameOverData` | `GameOverData \| null` | `null` |
| `searchGameId` | `string \| null` | `null` |

**Действия:**
- `setSearchMode({ typeGame, timeControl, timePluse })` — устанавливает статус `"searching"` и данные поиска
- `setSearchGameId(gameId)` — сохранает ID созданной игры для последующей отмены
- `setGameStart()` — устанавливает статус `"playing"`
- `setGameOver({ result, ratingChange })` — устанавливает статус `"gameover"` и данные завершения
- `resetGameEvents()` — сбрасывает всё в начальное состояние, включая `searchGameId`

> `searchGameId` сохраняется после `createSearchRoom` и передаётся при отмене поиска (`cancelSearch`), чтобы бекенд мог найти и удалить именно эту игру.

---

### `authApi` (RTK Query)

Автоматически сгенерированный слайс для управления REST API запросами авторизации.

**Endpoints:**
| Endpoint | Тип | Кештеги |
|----------|-----|---------|
| `isActivToken` | query | `["user"]` |
| `registrationUser` | mutation | `["user"]` |
| `loginUser` | mutation | `["user"]` |
| `emailVerify` | mutation | `["user"]` |
| `unLoginUser` | mutation | `["user"]` |
| `createSearchRoom` | mutation | `["user"]` |
| `cancelSearchRoom` | mutation | `["user"]` |

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
| `colorGame` | `"wite" \| "black"` | Запоминание выбранной стороны |
| `theme` | CSS-класс темы | Сохранение выбранной темы |

При перезагрузке страницы `redux-persist` восстанавливает эти данные из `localStorage`, и приложение остаётся авторизованным с сохранённой темой и стороной.
