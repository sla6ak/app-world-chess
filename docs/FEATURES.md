# Функциональные области

## Обзор

Фронтенд организован по функциональным областям (feature-based). Каждая область содержит связанные компоненты, хуки и логику.

---

## 1. Авторизация (`features/auth/`)

### Компоненты

| Компонент | Файл | Описание |
|------------|------|----------|
| `LoginForm` | `LoginForm.tsx` | Форма входа с email/password |
| `RegisterForm` | `RegisterForm.tsx` | Форма регистрации с подтверждением пароля |
| `ModalLogOut` | `ModalLogOut.tsx` | Модальное окно подтверждения выхода |

### Поток авторизации

1. Пользователь вводит email и password в `LoginForm`
2. Formik + Yup валидируют данные (`loginSchema`)
3. При отправке вызывается `authApi.loginUser` (RTK Query mutation)
4. При успехе:
   - `newToken(response.token)` → сохраняет JWT в Redux
   - `setUserName(response.user.name)` → сохраняет имя
   - `setUserStats(...)` → сохраняет рейтинг и статистику
   - `toast.success("Welcome ...")` → уведомление
   - `navigate("/home")` → переход на домашнюю страницу
5. При ошибке — `toast.error("Email or password is wrong")`

### Валидация

```ts
// loginSchema — src/helpers/validationForm.ts
email: string().email("Invalid email").required("Email must by required")
password: string()
    .min(6, "Password must be longer than 6 letters!")
    .max(18, "Password must be shorts than 18 letters!")
    .required("Password must by required")
```

### Автоматическое восстановление сессии

При загрузке приложения `App.tsx` вызывает `useIsActivTokenQuery`:
1. Если токен есть в Redux (восстановлен из persist) → запрос `/auth/current`
2. При успешном ответе → восстанавливается `userName` и `stats`
3. Затем автоматически подключается к Colyseus комнате

---

## 2. Игровой модуль (`features/game/`)

### Компоненты

| Компонент | Файл | Описание |
|------------|------|----------|
| `GameBoard` | `GameBoard.tsx` | Интерактивная шахматная доска 8×8 |
| `GameMenu` | `GameMenu.tsx` | Меню выбора режима и тайм-контроля |
| `HelperBoard` | `HelperBoard.tsx` | Вспомогательная панель |
| `ModalFindGame` | `ModalFindGame.tsx` | Модальное окно поиска оппонента |

### GameBoard

**Состояние:**
```ts
const [board, setBoard] = useState<Array<{ _id: number, figure: string }>>([]);
const [activFigure, setActivFigure] = useState({ _id: 1, figure: "" });
```

**Начальная позиция** (FEN-подобная строка):
```
"rnbqkbnrpppppppp88888888888888888888888888888888PPPPPPPPRNBQKBNR"
```

**Взаимодействие:**
1. Клик на фигуру текущего игрока → выбор (`setActivFigure`)
2. Клик на подсвеченную клетку → перемещение фигуры
3. Визуальные классы: `selected`, `valid-move`, `check`, `checkmate`, `last-move`

**Фигуры:**
| Символ | Фигура | Цвет |
|--------|--------|------|
| `r` | Rook (Ладья) | Чёрный |
| `n` | Knight (Конь) | Чёрный |
| `b` | Bishop (Слон) | Чёрный |
| `q` | Queen (Ферзь) | Чёрный |
| `k` | King (Король) | Чёрный |
| `p` | Pawn (Пешка) | Чёрный |
| `R`–`P` | Аналогично | Белый |
| `8` | Пустая клетка | — |

### GameMenu

**Тайм-контроли:**
| Кнопка | timeControl | timePluse |
|--------|-------------|-----------|
| 1min | 60 | 0 |
| 3min | 180 | 0 |
| 5min | 300 | 0 |
| 1min+1s | 60 | 1 |
| 3min+2s | 180 | 2 |
| 5min+3s | 300 | 3 |
| 10min+5s | 600 | 5 |
| 15min+10s | 900 | 10 |
| 30min+30s | 1800 | 30 |

**Режимы:** `standart` (классические) и `fisher` (Fischer random)

**Поиск игры:**
1. `createSearchRoom` REST mutation → создаёт запись в БД со статусом `"open"` или находит существующую и меняет статус на `"close"`
2. При подключении второго игрока к WebSocket комнате сервер автоматически рассылает событие `gameStart` обоим клиентам
3. Клиент также отправляет `findGame` WS-событие для передачи параметров поиска (тайм-контроль, тип игры); если игра уже стартовала, повторная рассылка `gameStart` не происходит

**Отмена поиска:**
1. `cancelSearch(gameId)` → REST mutation + WS `cancelSearch`
2. `resetGameEvents()` → сброс Redux состояния

---

## 3. Домашняя страница (`features/home/`)

### Компоненты

| Компонент | Файл | Описание |
|------------|------|----------|
| `HomeTab` | `HomeTab.tsx` | Контейнер для `GameMenu` |
| `Statistics` | `Statistics.tsx` | Отображение статистики игрока |
| `BackgroundPage` | `BackgroundPage.tsx` | Декоративный фон |

### Statistics

Отображает данные из `user.stats`:
- Текущий рейтинг (`rating`)
- Максимальный рейтинг (`maxRating`)
- Сыгранные игры (`gamesPlayed`)
- Победы (`wins`)
- Поражения (`losses`)
- Ничьи (`draws`)

---

## 4. Навигация (`components/sidebar/`)

### Sidebar (desktop)

Боковая панель для авторизованных пользователей:
- Бренд/логотип
- Навигация (Home, Game, Statistics)
- ThemeSwitcher
- UserMenu (avatar, имя, выход)

### MobileHeader

Адаптивный header для мобильных устройств с аналогичной навигацией.
