# Frontend Documentation — app-world-chess

> Chess World — клиентская часть многопользовательской шахматной платформы.
> React SPA с real-time мультиплеером через WebSocket (Colyseus).

## Содержание

| Документ | Описание |
|----------|----------|
| [README.md](./README.md) | Этот файл — оглавление и быстрый старт |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Архитектура приложения, слои, принципы |
| [ROUTING.md](./ROUTING.md) | Маршруты, защита маршрутов, навигация |
| [STATE.md](./STATE.md) | Redux Toolkit: слайсы, store, persist, RTK Query |
| [COMPONENTS.md](./COMPONENTS.md) | Компоненты: структура, назначение, принципы |
| [FEATURES.md](./FEATURES.md) | Функциональные области: auth, game, home |
| [THEMING.md](./THEMING.md) | Система тем, CSS-переменные, Tailwind |
| [WEBSOCKET.md](./WEBSOCKET.md) | WebSocket-протокол, Colyseus, события |
| [API.md](./API.md) | REST API (RTK Query), эндпоинты |
| [HELPERS.md](./HELPERS.md) | Утилиты и хелперы |

---

## Быстрый старт

```bash
cd app-world-chess

# Установка зависимостей
npm install

# Копирование шаблона окружения
cp .env.template .env
# Отредактировать .env: REACT_APP_BASE_URL, REACT_APP_SOCKET_URL

# Разработка (hot reload + lint watch)
npm run dev

# Сборка для продакшн
npm run build

# Линтинг
npm run lint:js
npm run lint:fix
```

## Технологический стек

| Технология | Версия | Назначение |
|------------|--------|------------|
| React | `^18.3.1` | UI-библиотека |
| TypeScript | `^5.9.3` | Типизация |
| Redux Toolkit | `^2.12.0` | State management + RTK Query |
| React Router v6 | `^6.30.4` | Маршрутизация |
| Colyseus.js | `^0.16.22` | WebSocket-клиент |
| Tailwind CSS v3 | `^3.4.19` | CSS-фреймворк |
| Formik + Yup | `^2.4.9` / `^1.7.1` | Формы и валидация |
| React Toastify | `^11.0.5` | Система уведомлений |
| Redux Persist | `^6.0.0` | Персистенция состояния |
| react-app-rewired | `^2.2.1` | Обёртка над CRA |

## Структура проекта

```
app-world-chess/
├── public/
│   ├── index.html            # HTML-шаблон
│   ├── manifest.json         # PWA манифест
│   └── ...                     # статические ассеты
├── src/
│   ├── app/
│   │   ├── App.tsx           # Корневой компонент: роутинг, WS-подписки, провайдеры
│   │   └── index.ts          # Точка входа приложения
│   ├── components/           # Переиспользуемые UI-компоненты
│   │   ├── generalButton/    # Универсальная кнопка
│   │   ├── loader/           # Индикатор загрузки
│   │   ├── modal/            # Универсальный модальный компонент
│   │   ├── privateRoute/     # Обёртка защищённых маршрутов
│   │   ├── publicRoute/      # Обёртка публичных маршрутов
│   │   ├── sidebar/          # Боковая навигация + мобильный header
│   │   ├── themeSwitcher/    # Переключатель тем
│   │   ├── titleApp/         # Заголовок приложения
│   │   └── userMenu/         # Меню пользователя
│   ├── config/               # Конфигурация (URL, тестовые данные)
│   ├── features/             # Функциональные области (pages + logic)
│   │   ├── auth/             # Формы авторизации (LoginForm, RegisterForm, ModalLogOut)
│   │   ├── game/             # Игровые компоненты (GameBoard, GameMenu, HelperBoard, ModalFindGame)
│   │   └── home/             # Домашняя страница (HomeTab, Statistics, BackgroundPage)
│   ├── helpers/              # Утилиты (showFigure, theme, validationForm)
│   ├── layouts/
│   │   └── Layout.tsx        # Основной layout: sidebar + outlet
│   ├── pages/                # Страницы (lazy-loaded)
│   │   ├── dashboardPage/    # Dashboard (редирект на /home или /game)
│   │   ├── loginPage/        # Страница входа
│   │   └── registerPage/     # Страница регистрации
│   ├── redux/
│   │   ├── api/              # RTK Query API (authApi)
│   │   ├── slices/           # Redux слайсы (token, user, colorGame, theme, room, gameEvents, wsID)
│   │   ├── store.ts          # Конфигурация store + persist
│   │   ├── thunks/           # Async thunks (roomThunks)
│   │   └── index.ts          # Экспорт слайсов
│   ├── services/             # Сервисы (Colyseus client, roomManager, wsMessages)
│   ├── styles/
│   │   └── themes.css        # CSS-переменные всех тем
│   ├── index.tsx             # Точка входа (ReactDOM.render)
│   └── index.css             # Глобальные стили + Tailwind directives
├── docs/                     # Эта документация
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── .env
```

## Архитектурные принципы

- **Авторитарный клиент** — клиент отправляет ходы, сервер валидирует и рассылает обновления
- **Colyseus Rooms** — каждая партия изолирована в отдельной комнате
- **Redux Persist** — token, wsId сохраняются между сессиями
- **CSS-переменные для тем** — все цвета определены через custom properties, переключение — замена класса на `<html>`
- **RTK Query** — все REST-запросы инкапсулированы в `authApi`
- **Feature-based организация** — код группирован по функциональности (`features/auth`, `features/game`, `features/home`)
- **Lazy loading** — страницы загружаются лениво через `React.lazy()`
- **Alias-пути** — импорт через `@components/`, `@features/`, `@layouts/`, `@pages/`, `@redux/`, `@helpers/`, `@services/`, `@config/`
