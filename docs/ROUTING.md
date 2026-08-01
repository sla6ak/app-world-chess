# Маршруты и навигация

## Обзор

Приложение использует `react-router-dom` v6 с `BrowserRouter`. Базовый путь определяется через `basename={process.env.PUBLIC_URL + "/"}`. Все страницы авторизованных пользователей обёрнуты в `PrivateRoute`, публичные страницы — в `PublicRoute`.

## Структура роутов

```
/ (Layout — PrivateRoute)
├── /                  → DashboardPage (редирект)
├── /home              → HomeTab (выбор режима игры)
├── /statistic         → Statistics (статистика)
├── /game              → GameBoard (интерактивная доска)
├── /register          → RegisterPage (публичный)
├── /login             → LoginPage (публичный)
└── *                  → Navigate to "/"
```

## Детали маршрутов

### `/` — DashboardPage

**Компонент:** `src/pages/dashboardPage/DashboardPage.tsx`

**Логика:**
- Если игрок подключён к Colyseus комнате (`gameStarted === true`) → редирект на `/game`
- Если нет активной игры → редирект на `/home`

**Доступ:** Только авторизованные пользователи

---

### `/home` — HomeTab

**Компонент:** `src/features/home/HomeTab.tsx`

**Содержимое:**
- `GameMenu` — меню выбора режима игры и тайм-контроля

**Логика:**
- Игрок выбирает тайм-контроль (например, `5min + 2s`)
- При нажатии кнопки запускается поиск оппонента через WebSocket
- Если комната не подключена — показывается ошибка через `react-toastify`

**Доступ:** Только авторизованные пользователи

---

### `/game` — GameBoard

**Компонент:** `src/features/game/GameBoard.tsx`

**Содержимое:**
- Интерактивная шахматная доска (8×8 клеток)
- `HelperBoard` — вспомогательная панель

**Логика:**
- Доска инициализируется из начальной позиции (FEN-подобный формат)
- Игрок кликает на фигуру для выбора, затем на целевую клетку для хода
- Визуальное выделение: `selected`, `valid-move`, `check`, `checkmate`, `last-move`
- Доска использует CSS-переменные для темизации

**Данные в состоянии:**
```ts
board: Array<{ _id: number, figure: string }>
// Фигуры: "r"=rook, "n"=knight, "b"=bishop, "q"=queen, "k"=king, "p"=pawn
// Заглавные = белые, строчные = чёрные, "8" = пустая клетка
```

**Доступ:** Только авторизованные пользователи

---

### `/statistic` — Statistics

**Компонент:** `src/features/home/Statistics.tsx`

**Содержимое:**
- Сетка статистики: рейтинг, максимальный рейтинг, сыгранные игры, победы, поражения, ничьи
- Данные берутся из Redux `user.stats`

**Доступ:** Только авторизованные пользователи

---

### `/login` — LoginPage

**Компонент:** `src/pages/loginPage/LoginPage.tsx` (lazy-loaded)

**Содержимое:**
- `LoginForm` — форма входа с email и password
- Валидация через `loginSchema` (Yup)
- При успешном входе: сохраняет JWT в Redux, имя пользователя, редирект на `/home`

**Доступ:** Только неавторизованные пользователи

---

### `/register` — RegisterPage

**Компонент:** `src/pages/registerPage/RegisterPage.tsx` (lazy-loaded)

**Содержимое:**
- `RegisterForm` — форма регистрации
- Валидация через `registerSchema` (Yup)
- При успешной регистрации: автоматический вход, редирект на `/home`

**Доступ:** Только неавторизованные пользователи

## Схема маршрутов (код)

```tsx
// src/app/App.tsx
<Routes>
  <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
    <Route index element={<DashboardPage curentG={curentG} />} />
    <Route path="/home" element={<HomeTab />} />
    <Route path="/statistic" element={<Statistics />} />
    <Route path="/game" element={<GameBoard />} />
  </Route>
  <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
  <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
```

## Навигация

### Sidebar (desktop)

Боковая панель отображается для авторизованных пользователей. Содержит:
- Логотип/название приложения
- Меню навигации (Home, Game, Statistics)
- Переключатель тем
- Меню пользователя (avatar, имя, выход)

### MobileHeader (mobile)

Верхний header для мобильных устройств с аналогичной навигацией.

### Lazy Loading

Страницы загружаются лениво для уменьшения начального бандла:

```tsx
const LoginPage = React.lazy(() => import("@pages/loginPage/LoginPage"));
const RegisterPage = React.lazy(() => import("@pages/registerPage/RegisterPage"));
const DashboardPage = React.lazy(() => import("@pages/dashboardPage/DashboardPage"));
```

`<Suspense fallback={<Loader />}` оборачивает `Layout` для показа индикатора загрузки.
