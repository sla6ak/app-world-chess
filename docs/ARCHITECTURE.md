# Архитектура фронтенда

## Обзор

Фронтенд — React Single Page Application (SPA) с авторитарной моделью взаимодействия с сервером. Клиент подключается к Colyseus WebSocket-room для real-time обмена ходами и использует REST API (RTK Query) для авторизации и управления пользователем.

## Слои приложения

```
┌─────────────────────────────────────────────┐
│              UI Layer                        │
│  ┌───────────────────────────────────────┐  │
│  │  Pages (lazy-loaded route components) │  │
│  │  DashboardPage, LoginPage,            │  │
│  │  RegisterPage, HomeTab, GameBoard,    │  │
│  │  Statistics                            │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │  Feature Components                   │  │
│  │  GameMenu, GameBoard, HelperBoard,    │  │
│  │  ModalFindGame, LoginForm,            │  │
│  │  RegisterForm, BackgroundPage         │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │  Shared / Reusable Components         │  │
│  │  Layout, Sidebar, MobileHeader,       │  │
│  │  Modal, ThemeSwitcher, UserMenu,      │  │
│  │  GeneralButton, Loader, TitleApp,     │  │
│  │  PrivateRoute, PublicRoute            │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│              State Layer                     │
│  ┌───────────────────────────────────────┐  │
│  │  Redux Toolkit Store                  │  │
│  │  ├─ authApi (RTK Query)             │  │
│  │  ├─ token, user, colorGame           │  │
│  │  ├─ theme, room, gameEvents, wsID    │  │
│  │  └─ persist (token, wsId)            │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│              Communication Layer             │
│  ┌───────────────────────────────────────┐  │
│  │  REST API (RTK Query → authApi)      │  │
│  │  └─ /auth/signup, /auth/login,       │  │
│  │     /auth/current, /auth/logout,      │  │
│  │     /game/find, /game/cancel          │  │
│  ├───────────────────────────────────────┤  │
│  │  WebSocket (Colyseus.js)              │  │
│  │  └─ client → ws://localhost:5000/     │  │
│  │  └─ room → chess_room                 │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│              Helpers & Utilities             │
│  ┌───────────────────────────────────────┐  │
│  │  showFigure.ts — SVG-фигуры для доски│  │
│  │  theme.ts — применение тем            │  │
│  │  validationForm.ts — схемы Yup        │  │
│  │  wsMessages.ts — фабрики WS-сообщений│  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Поток данных

### Авторизация

```
LoginForm → formik + yup validation → authApi.loginUser → Redux (token, user)
                                                              ↓
                                              useIsActivTokenQuery (auto-refetch)
                                                              ↓
                                          setUserName + setUserStats → Layout renders
```

### Подключение к комнате

```
App.tsx (useEffect on userName+token+roomId)
  → dispatch(connectToRoom({ token, color }))
    → client.joinOrCreate("chess_room", { token, color })
      → setRoom(room) in roomManager (in-memory map)
      → dispatch(connectRoomSuccess({ roomId }))
        → App subscribes to room messages
```

### Поиск игры

```
GameMenu → handleClickSendMessage(timeControl, timePluse)
  → dispatch(createSearchRoom REST) → get gameId
    → dispatch(setSearchGameId(gameId))
  → dispatch(findGame({ token, color, typeGame, timeControl, timePluse }))
    → room.send("findGame", { ... })
      → Server broadcasts "searching" → Redux setSearchMode
      → Server broadcasts "gameStart" → Redux setGameStart + navigate("/game")
      → Server broadcasts "search_cancelled" → Redux resetGameEvents
```

### Игровой процесс

```
GameBoard → user clicks square → select/move figure
  → room.send("game", { position, move })
    → Server validates move, updates state, broadcasts to all clients
      → Client receives "game" event → updates board state
```

### Завершение игры

```
Server broadcasts "gameOver"
  → App handles gameOver message
    → dispatch(setGameOver({ result, ratingChange }))
    → navigate("/home")
```

## Маршрутизация

Маршрутизация через `react-router-dom` v6 с `BrowserRouter` и `basename={PUBLIC_URL + "/"}`.

```
<BrowserRouter basename={PUBLIC_URL + "/"}>
  <Routes>
    <Route path="/" element={<Layout />}>                    ← PrivateRoute wrapper
      <Route index element={<DashboardPage />} />            ← Redirect logic
      <Route path="/home" element={<HomeTab />} />           ← Game selection
      <Route path="/statistic" element={<Statistics />} />   ← Stats (stub)
      <Route path="/game" element={<GameBoard />} />         ← Chess board
    </Route>
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
</BrowserRouter>
```

## Защита маршрутов

| Компонент | Проверка | Поведение при неавторизации |
|------------|----------|----------------------------|
| `PrivateRoute` | `userName.length > 0` | Редирект на `/login` |
| `PublicRoute` | `userName.length === 0` | Редирект на `/` |

## Персистенция

**Persist config** (`src/redux/store.ts`):
```ts
whitelist: ["token", "wsId"]
```

Данные, сохраняемые в `localStorage` между сессиями:

| Ключ | Данные | Назначение |
|------|--------|------------|
| `token` | JWT-токен | Автоматическая авторизация при перезагрузке |
| `wsId` | WebSocket ID | Идентификация клиента при переподключении |

При перезагрузке `redux-persist` восстанавливает эти данные, `useIsActivTokenQuery` проверяет токен и восстанавливает имя пользователя и статистику.
