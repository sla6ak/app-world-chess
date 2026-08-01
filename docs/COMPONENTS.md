# Компоненты

## Обзор

Компоненты организованы по назначению и функциональным областям. Основной компонент приложения — `App.tsx`, который рендерит роутинг, layout и lazy-loaded страницы.

## Структура каталогов

```
src/
├── app/                    # Корневой компонент с роутингом
├── components/             # Переиспользуемые UI-компоненты
├── features/               # Функциональные области (pages + logic)
│   ├── auth/               # Авторизация
│   ├── game/               # Игровые компоненты
│   └── home/               # Домашняя страница
├── layouts/                # Layout-обёртки
├── pages/                  # Страницы (lazy-loaded)
├── redux/                  # State management
├── services/               # Сервисы (Colyseus, WebSocket)
├── helpers/                # Утилиты
├── config/                 # Конфигурация
└── styles/                 # Глобальные стили
```

## Каталог компонентов

### Layout и навигация

| Компонент | Путь | Назначение |
|------------|------|------------|
| `Layout` | `src/layouts/Layout.tsx` | Основной layout: sidebar + mobile header + `<Outlet />` |
| `Sidebar` | `src/components/sidebar/Sidebar.tsx` | Боковая навигация (desktop) |
| `MobileHeader` | `src/components/sidebar/MobileHeader.tsx` | Верхний header для мобильных |
| `PrivateRoute` | `src/components/privateRoute/PrivateRoute.tsx` | Обёртка — доступ только авторизованным |
| `PublicRoute` | `src/components/publicRoute/PublicRoute.tsx` | Обёртка — доступ только неавторизованным |

### Страницы (Pages, lazy-loaded)

| Компонент | Путь | Назначение |
|------------|------|------------|
| `DashboardPage` | `src/pages/dashboardPage/DashboardPage.tsx` | Дашборд: редирект на `/home` или `/game` |
| `LoginPage` | `src/pages/loginPage/LoginPage.tsx` | Страница входа |
| `RegisterPage` | `src/pages/registerPage/RegisterPage.tsx` | Страница регистрации |

### Функциональные компоненты (Features)

#### Auth

| Компонент | Путь | Назначение |
|------------|------|------------|
| `LoginForm` | `src/features/auth/LoginForm.tsx` | Форма входа (Formik + Yup) |
| `RegisterForm` | `src/features/auth/RegisterForm.tsx` | Форма регистрации |
| `ModalLogOut` | `src/features/auth/ModalLogOut.tsx` | Модальное окно подтверждения выхода |

#### Game

| Компонент | Путь | Назначение |
|------------|------|------------|
| `GameBoard` | `src/features/game/GameBoard.tsx` | Интерактивная шахматная доска |
| `GameMenu` | `src/features/game/GameMenu.tsx` | Меню новой игры: выбор тайм-контроля, режима |
| `HelperBoard` | `src/features/game/HelperBoard.tsx` | Вспомогательная панель рядом с доской |
| `ModalFindGame` | `src/features/game/ModalFindGame.tsx` | Модальное окно поиска оппонента |

#### Home

| Компонент | Путь | Назначение |
|------------|------|------------|
| `HomeTab` | `src/features/home/HomeTab.tsx` | Домашняя вкладка: меню выбора режима |
| `Statistics` | `src/features/home/Statistics.tsx` | Страница статистики |
| `BackgroundPage` | `src/features/home/BackgroundPage.tsx` | Фоновый элемент страницы |

### UI-компоненты (Shared)

| Компонент | Путь | Назначение |
|------------|------|------------|
| `Modal` | `src/components/modal/Modal.tsx` | Универсальный модальный компонент |
| `ThemeSwitcher` | `src/components/themeSwitcher/ThemeSwitcher.tsx` | Переключатель тем |
| `UserMenu` | `src/components/userMenu/UserMenu.tsx` | Меню пользователя (avatar, имя) |
| `GeneralButton` | `src/components/generalButton/GeneralButton.tsx` | Универсальная кнопка |
| `TitleApp` | `src/components/titleApp/TitleApp.tsx` | Заголовок приложения |
| `Loader` | `src/components/loader/Loader.tsx` | Индикатор загрузки |

### Вспомогательные утилиты

| Утилита | Путь | Назначение |
|---------|------|------------|
| `showFigure` | `src/helpers/showFigure.ts` | Отображение SVG-фигур на доске |
| `applyTheme` | `src/helpers/theme.ts` | Применение темы (CSS-класс на `<html>`) |
| `loginSchema` / `registerSchema` | `src/helpers/validationForm.ts` | Схемы валидации Yup |
| `reqWsStartApp`, `reqWsGame`, `reqWsStartGame` | `src/services/wsMessages.ts` | Фабрики WebSocket-сообщений |

## Принципы именования

- **PascalCase** для имён компонентов (например, `GameBoard`, `LoginForm`)
- **camelCase** для хелперов и утилит (например, `showFigure`, `validationForm`)
- **kebab-case** для CSS-классов и имён файлов в `src/styles/`
- Пути импорта используют алиасы: `@components/`, `@features/`, `@layouts/`, `@pages/`, `@redux/`, `@helpers/`, `@services/`, `@config/`

## Lazy Loading

Страницы загружаются лениво через `React.lazy()` для уменьшения начального бандла:

```tsx
const LoginPage = React.lazy(() => import("@pages/loginPage/LoginPage"));
const RegisterPage = React.lazy(() => import("@pages/registerPage/RegisterPage"));
const DashboardPage = React.lazy(() => import("@pages/dashboardPage/DashboardPage"));
```

`<Suspense fallback={<Loader />}` оборачивает `Layout` для показа индикатора загрузки.
