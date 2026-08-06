# Chess-World — React Chess Application

Клиентская часть шахматной платформы **Chess World** — React SPA с real-time мультиплеером через WebSocket (Colyseus).

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
| React Toastify | `^11.0.5` | Уведомления |
| Redux Persist | `^6.0.0` | Персистенция состояния |

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
```

## Документация

Документация фронтенда находится в каталоге `docs/`:

| Документ | Описание |
|----------|----------|
| [README.md](./docs/README.md) | Оглавление, быстрый старт, стек, структура проекта |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Архитектура, слои, потоки данных, маршрутизация |
| [ROUTING.md](./docs/ROUTING.md) | Маршруты, защита маршрутов, навигация |
| [STATE.md](./docs/STATE.md) | Redux Toolkit: слайсы, store, persist, RTK Query |
| [COMPONENTS.md](./docs/COMPONENTS.md) | Компоненты: структура, назначение, принципы |
| [FEATURES.md](./docs/FEATURES.md) | Функциональные области: auth, game, home |
| [THEMING.md](./docs/THEMING.md) | Система тем, CSS-переменные, Tailwind |
| [WEBSOCKET.md](./docs/WEBSOCKET.md) | WebSocket-протокол, Colyseus, события |
| [API.md](./docs/API.md) | REST API (RTK Query), эндпоинты |
| [HELPERS.md](./docs/HELPERS.md) | Утилиты и хелперы |

## Структура проекта

```
app-world-chess/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── ...
├── src/
│   ├── app/
│   │   ├── App.tsx           # Корневой компонент: роутинг, WS-подписки
│   │   └── index.ts
│   ├── components/           # Переиспользуемые UI-компоненты
│   │   ├── generalButton/
│   │   ├── loader/
│   │   ├── modal/
│   │   ├── privateRoute/
│   │   ├── publicRoute/
│   │   ├── sidebar/
│   │   ├── themeSwitcher/
│   │   ├── titleApp/
│   │   └── userMenu/
│   ├── config/
│   ├── features/             # Функциональные области
│   │   ├── auth/
│   │   ├── game/
│   │   └── home/
│   ├── helpers/
│   ├── layouts/
│   │   └── Layout.tsx
│   ├── pages/                # Страницы (lazy-loaded)
│   │   ├── dashboardPage/
│   │   ├── loginPage/
│   │   └── registerPage/
│   ├── redux/
│   │   ├── api/
│   │   ├── slices/
│   │   ├── store.ts
│   │   └── thunks/
│   ├── services/
│   ├── styles/
│   │   └── themes.css
│   ├── index.tsx
│   └── index.css
├── docs/
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Архитектурные принципы

- **Авторитарный клиент** — клиент отправляет ходы, сервер валидирует и рассылает обновления
- **Colyseus Rooms** — каждая партия изолирована в отдельной комнате
- **Redux Persist** — token и wsId сохраняются между сессиями
- **CSS-переменные для тем** — все цвета определены через custom properties
- **RTK Query** — все REST-запросы инкапсулированы в `authApi`
- **Feature-based организация** — код группирован по функциональности
- **Lazy loading** — страницы загружаются лениво через `React.lazy()`
- **Alias-пути** — импорт через `@components/`, `@features/`, `@layouts/`, `@pages/`, `@redux/`, `@helpers/`, `@services/`, `@config/`
