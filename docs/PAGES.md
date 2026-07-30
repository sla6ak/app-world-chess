# Страницы и маршруты

## Обзор

Приложение использует `react-router-dom` v6 с `BrowserRouter`. Базовый путь определяется через `basename={process.env.PUBLIC_URL + "/"}`. Все страницы авторизованных пользователей обёрнуты в `PrivateRoute`, публичные страницы — в `PublicRoute`.

## Маршруты

### `/` — DashboardPage (редирект)

**Компонент:** `src/views/dashboardPage/DashboardPage.tsx`

**Логика:**
- Если игрок уже подключён к Colyseus комнате (`curentG === true`) → редирект на `/game`
- Если нет активной игры → редирект на `/home`

**Доступ:** Только авторизованные пользователи

---

### `/home` — HomeTab

**Компонент:** `src/components/homeTab/HomeTab.tsx`

**Содержимое:**
- `GameMenu` — меню выбора режима игры и тайм-контроля

**Логика:**
- Игрок выбирает тайм-контроль (например, `5min + 2s`)
- При нажатии кнопки отправляется WebSocket-событие `startGame` через `sendRoomMessage` thunk
- Если комната не подключена — показывается ошибка через `react-toastify`

**Доступ:** Только авторизованные пользователи

---

### `/game` — GameBoard

**Компонент:** `src/components/gameBoard/GameBoard.tsx`

**Содержимое:**
- Интерактивная шахматная доска (8×8 клеток)
- `HelperBoard` — вспомогательная панель

**Логика:**
- Доска инициализируется из начальной позиции FEN-подобного формата
- Игрок кликает на фигуру для выбора, затем на целевую клетку для хода
- Визуальное выделение: `selected`, `valid-move`, `check`, `checkmate`, `last-move`
- Доска использует CSS-переменные для темизации (`--color-bg-board`, `--color-bg-board-dark`)

**Данные в состоянии:**
```ts
board: Array<{ _id: number, figure: string }>
// Фигуры: "r"=rook, "n"=knight, "b"=bishop, "q"=queen, "k"=king, "p"=pawn
// Заглавные = белые, строчные = чёрные, "8" = пустая клетка
```

**Доступ:** Только авторизованные пользователи

---

### `/statistic` — Statistics

**Компонент:** `src/components/statistics/Statistics.tsx`

**Содержимое:**
- Сетка статистики: рейтинг, максимальный рейтинг, сыгранные игры, победы, поражения, ничьи
- Заглушка (данные пока не подключены к API)

**Доступ:** Только авторизованные пользователи

---

### `/login` — LoginPage

**Компонент:** `src/views/loginPage/LoginPage.tsx` (lazy-loaded)

**Содержимое:**
- `LoginForm` — форма входа с email и password
- Валидация через `loginSchema` (Yup)
- При успешном входе: сохраняет JWT в Redux, имя пользователя, редирект на `/home`

**Доступ:** Только неавторизованные пользователи

---

### `/register` — RegisterPage

**Компонент:** `src/views/registerPage/RegisterPage.tsx` (lazy-loaded)

**Содержимое:**
- `RegisterForm` — форма регистрации
- Валидация через `registerSchema` (Yup)
- При успешной регистрации: автоматический вход, редирект на `/home`

**Доступ:** Только неавторизованные пользователи

## Схема маршрутов

```
<BrowserRouter basename={PUBLIC_URL + "/"}>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/home" element={<PrivateRoute><HomeTab /></PrivateRoute>} />
      <Route path="/statistic" element={<PrivateRoute><Statistics /></PrivateRoute>} />
      <Route path="/game" element={<PrivateRoute><GameBoard /></PrivateRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    </Route>
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
</BrowserRouter>
```
