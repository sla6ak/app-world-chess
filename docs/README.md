# app-world-chess

Клиентская часть шахматной платформы **Chess World** — React-приложение с real-time мультиплеером через WebSocket (Colyseus).

## Технологический стек

- **React 18** — UI-библиотека
- **TypeScript** — типизация
- **Redux Toolkit + RTK Query** — управление состоянием и API-запросы
- **React Router v6** — маршрутизация
- **Colyseus.js `0.16.x`** — WebSocket-клиент для мультиплеерных игр
- **Tailwind CSS v3** — утилитарный CSS-фреймворк
- **Formik + Yup** — формы и валидация
- **React Toastify** — уведомления
- **Redux Persist** — персистенция состояния (token, theme, color)
- **react-app-rewired** — обёртка над Create React App с кастомной конфигурацией

### Ключевые зависимости

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `react` | `^18.3.1` | UI-библиотека |
| `@reduxjs/toolkit` | `^2.12.0` | State management + RTK Query |
| `colyseus.js` | `^0.16.22` | WebSocket-клиент Colyseus |
| `tailwindcss` | `^3.4.19` | CSS-фреймворк |
| `formik` | `^2.4.9` | Управление формами |
| `yup` | `^1.7.1` | Схемы валидации |
| `react-router-dom` | `^6.30.4` | Маршрутизация |
| `react-toastify` | `^11.0.5` | Систем уведомлений |
| `redux-persist` | `^6.0.0` | Персистенция Redux-состояния |

## Структура проекта

```
app-world-chess/
├── public/
│   ├── index.html            # HTML-шаблон
│   ├── manifest.json         # PWA манифест
│   └── ...                   # статические ассеты
├── src/
│   ├── components/           # Переиспользуемые компоненты
│   │   ├── app/App.tsx       # Корневой компонент с роутингом
│   │   ├── layout/Layout.tsx # Основной layout с sidebar
│   │   ├── gameBoard/        # Игровая доска
│   │   ├── gameMenu/         # Меню новой игры
│   │   ├── homeTab/          # Вкладка домашней страницы
│   │   ├── loginForm/        # Форма входа
│   │   ├── registerForm/     # Форма регистрации
│   │   ├── sidebar/Sidebar.tsx # Боковая навигация
│   │   ├── statistics/       # Страница статистики
│   │   ├── themeSwitcher/    # Переключатель тем
│   │   ├── userMenu/         # Меню пользователя
│   │   ├── modal/            # Общий модальный компонент
│   │   ├── modalFindGame/    # Модальное окно поиска игры
│   │   ├── modalLogOut/      # Модальное окно выхода
│   │   ├── privateRoute/     # Защищённый маршрут
│   │   ├── publicRoute/      # Публичный маршрут
│   │   ├── loader/           # Компонент загрузки
│   │   └── ...
│   ├── helpers/
│   │   ├── theme.ts          # Утилиты тем (applyTheme, THEMES)
│   │   ├── validationForm.ts # Схемы валидации Yup
│   │   ├── requestWs.ts      # Фабрики WebSocket-сообщений
│   │   ├── showFigure.ts     # Отображение шахматных фигур
│   │   └── ...
│   ├── layouts/
│   │   └── Layout.tsx        # Layout с Sidebar + Outlet
│   ├── redux/
│   │   ├── store.ts          # Конфигурация Redux store
│   │   ├── authAPI.ts        # RTK Query API для авторизации
│   │   ├── roomThunks.ts     # Async thunks для Colyseus комнат
│   │   ├── sliceToken.ts     # Слайс JWT-токена
│   │   ├── sliceUserName.ts  # Слайс имени пользователя
│   │   ├── sliceColor.ts     # Слайс выбранной стороны
│   │   ├── sliceTheme.ts     # Слайс текущей темы
│   │   ├── sliceRoom.ts      # Слайс состояния комнаты
│   │   ├── sliceWsID.ts      # Слайс WebSocket ID
│   │   └── testURL.ts        # Базовые URL (dev/prod)
│   ├── colyseus/
│   │   ├── client.ts         # Colyseus клиент (подключение)
│   │   └── roomManager.ts    # Менеджер текущей комнаты
│   ├── styles/
│   │   └── themes.css        # CSS-переменные тем
│   ├── index.tsx             # Точка входа
│   └── index.css             # Глобальные стили + Tailwind
├── docs/
│   ├── README.md             # Этот файл
│   ├── ARCHITECTURE.md       # Архитектура фронтенда
│   ├── COMPONENTS.md         # Компоненты
│   ├── PAGES.md              # Страницы и маршруты
│   ├── THEMING.md            # Система тем
│   ├── WEBSOCKET.md          # WebSocket-протокол (клиент)
│   └── STATE.md              # Redux-состояние
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── .env
```

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Копирование шаблона окружения
cp .env.template .env
# Отредактировать .env: BASE_URL, socketUrl

# Разработка (с hot reload + lint)
npm run dev

# Сборка для продакшн
npm run build

# Линтинг
npm run lint:js
npm run lint:fix
```

## Архитектурные принципы

- **Авторитарный клиент** — клиент отправляет ходы, сервер валидирует и рассылает обновления всем участникам
- **Colyseus Rooms** — каждая партия изолирована в отдельной комнате
- **Redux Persist** — токен, тема и цвет игрока сохраняются между сессиями
- **CSS-переменные для тем** — все цвета определены через CSS custom properties, переключение тем — замена класса на `<html>`
- **RTK Query** — все REST-запросы инкапсулированы в `authApi`, с автоматическим управлением кешем и тегами
