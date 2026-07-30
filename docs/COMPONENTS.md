# Компоненты

## Обзор

Компоненты организованы по назначению в `src/components/`. Основной компонент приложения — `App.tsx`, который рендерит роутинг, layout и lazy-loaded страницы.

## Каталог компонентов

### Layout и навигация

| Компонент | Путь | Назначение |
|-----------|------|------------|
| `Layout` | `src/layouts/Layout.tsx` | Основной layout: sidebar + mobile header + `<Outlet />` |
| `Sidebar` | `src/components/sidebar/Sidebar.tsx` | Боковая навигация (desktop): бренд, пользователь, темы, навигация |
| `MobileHeader` | `src/components/sidebar/MobileHeader.tsx` | Верхний header для мобильных устройств |
| `PrivateRoute` | `src/components/privateRoute/PrivateRoute.tsx` | Обёртка маршрутов — доступ только авторизованным |
| `PublicRoute` | `src/components/publicRoute/PublicRoute.tsx` | Обёртка маршрутов — доступ только неавторизованным |

### Страницы (Views)

| Компонент | Путь | Назначение |
|-----------|------|------------|
| `DashboardPage` | `src/views/dashboardPage/DashboardPage.tsx` | Дашборд: редирект на `/home` или `/game` в зависимости от состояния игры |
| `HomeTab` | `src/components/homeTab/HomeTab.tsx` | Домашняя вкладка: меню выбора режима игры |
| `GameBoard` | `src/components/gameBoard/GameBoard.tsx` | Интерактивная шахматная доска |
| `Statistics` | `src/components/statistics/Statistics.tsx` | Страница статистики (заглушка) |
| `LoginPage` | `src/views/loginPage/LoginPage.tsx` | Страница входа (lazy-loaded) |
| `RegisterPage` | `src/views/registerPage/RegisterPage.tsx` | Страница регистрации (lazy-loaded) |

### Игровые компоненты

| Компонент | Путь | Назначение |
|-----------|------|------------|
| `GameMenu` | `src/components/gameMenu/GameMenu.tsx` | Меню новой игры: выбор тайм-контроля, режима |
| `HelperBoard` | `src/components/helperBoard/HelperBoard.tsx` | Вспомогательная панель рядом с доской |
| `ModalFindGame` | `src/components/modalFindGame/ModalFindGame.tsx` | Модальное окно поиска оппонента |

### Формы и авторизация

| Компонент | Путь | Назначение |
|-----------|------|------------|
| `LoginForm` | `src/components/loginForm/LoginForm.tsx` | Форма входа (Formik + Yup) |
| `RegisterForm` | `src/components/registerForm/RegisterForm.tsx` | Форма регистрации |

### UI-компоненты

| Компонент | Путь | Назначение |
|-----------|------|------------|
| `Modal` | `src/components/modal/Modal.tsx` | Универсальный модальный компонент |
| `ModalLogOut` | `src/components/modalLogOut/modalLogOut.tsx` | Модальное окно подтверждения выхода |
| `ThemeSwitcher` | `src/components/themeSwitcher/ThemeSwitcher.tsx` | Переключатель тем |
| `UserMenu` | `src/components/userMenu/UserMenu.tsx` | Меню пользователя (avatar, имя) |
| `GeneralButton` | `src/components/generalButton/GeneralButton.tsx` | Универсальная кнопка |
| `TitleApp` | `src/components/titleApp/TitleApp.tsx` | Заголовок приложения |
| `Loader` | `src/components/loader/Loader.tsx` | Индикатор загрузки |
| `BackgroundPage` | `src/components/backgroundPage/BackgroundPage.tsx` | Фоновый элемент страницы |

### Вспомогательные компоненты

| Компонент | Путь | Назначение |
|-----------|------|------------|
| `showFigure` | `src/helpers/showFigure.ts` | Отображение SVG-фигур на доске |

## Принципы именования

- **PascalCase** для имён компонентов (например, `GameBoard`, `LoginForm`)
- **camelCase** для хелперов и утилит (например, `requestWs`, `validationForm`)
- **kebab-case** для CSS-классов и имён файлов в `src/styles/`
- Пути импорта используют алиасы: `@components/`, `@layouts/`, `@redux/`, `@helpers/`, `@views/`

## Lazy Loading

Страницы загружаются лениво через `React.lazy()` для уменьшения начального бандла:

```tsx
const LoginPage = React.lazy(() => import("@views/loginPage/LoginPage"));
const RegisterPage = React.lazy(() => import("@views/registerPage/RegisterPage"));
const DashboardPage = React.lazy(() => import("@views/dashboardPage/DashboardPage"));
```

`<Suspense fallback={<Loader />}` оборачивает `Layout` для показа индикатора загрузки.
