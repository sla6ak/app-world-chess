# REST API (RTK Query)

## Обзор

Все REST-запросы к бэкенду инкапсулированы в `authApi` через RTK Query. Эндпоинты определены в `src/redux/api/authApi.ts`.

## Конфигурация

```ts
// src/redux/api/authApi.ts
export const authApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,  // из src/config/testURL.ts
        prepareHeaders: (headers, { getState }: any) => {
            const token = getState().token;
            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["user"],
    endpoints: (builder) => ({ ... }),
});
```

## Endpoints

### `isActivToken` — query

Проверяет актуальность JWT-токена и возвращает данные текущего пользователя.

| Параметр | Значение |
|----------|----------|
| Метод | `GET` |
| URL | `/auth/current` |
| Аутентификация | `Authorization: Bearer <token>` |
| Кештеги | `["user"]` |

**Использование:**
```ts
const { data: auth } = useIsActivTokenQuery("", { skip: !token });
```

**Ответ:**
```json
{
    "user": {
        "name": "PlayerName",
        "currentReiting": 1850,
        "maxRating": 1900,
        "gamesPlayed": 142,
        "wins": 89,
        "losses": 41,
        "draws": 12
    }
}
```

---

### `registrationUser` — mutation

Регистрация нового пользователя.

| Параметр | Значение |
|----------|----------|
| Метод | `POST` |
| URL | `/auth/signup` |
| Тело | `{ name, email, password }` |
| Кештеги | `["user"]` |

**Использование:**
```ts
const [registrationUser, { isLoading }] = useRegistrationUserMutation();
```

---

### `loginUser` — mutation

Авторизация пользователя.

| Параметр | Значение |
|----------|----------|
| Метод | `POST` |
| URL | `/auth/login` |
| Тело | `{ email, password }` |
| Кештеги | `["user"]` |

**Использование:**
```ts
const [loginUser, { isLoading }] = useLoginUserMutation();
```

**Ответ:**
```json
{
    "user": {
        "token": "<jwt>",
        "name": "PlayerName",
        "currentReiting": 1850,
        "maxRating": 1900,
        "gamesPlayed": 142,
        "wins": 89,
        "losses": 41,
        "draws": 12
    }
}
```

---

### `emailVerify` — mutation

Подтверждение email по токену из письма.

| Параметр | Значение |
|----------|----------|
| Метод | `PATCH` |
| URL | `/auth/login/:token` |
| Тело | (токен в URL) |
| Кештеги | `["user"]` |

**Использование:**
```ts
const [emailVerify] = useEmailVerifyMutation();
```

---

### `unLoginUser` — mutation

Выход из аккаунта.

| Параметр | Значение |
|----------|----------|
| Метод | `POST` |
| URL | `/auth/logout` |
| Аутентификация | `Authorization: Bearer <token>` |
| Кештеги | `["user"]` |

**Использование:**
```ts
const [unLoginUser] = useUnLoginUserMutation();
```

---

### `createSearchRoom` — mutation

Создание записи о поиске игры (REST). Создаёт игру в БД со статусом `"open"`.

| Параметр | Значение |
|----------|----------|
| Метод | `POST` |
| URL | `/game/find` |
| Тело | `{ typeGame, timeControl, timePluse }` |
| Кештеги | `["user"]` |

**Использование:**
```ts
const [createSearchRoom] = useCreateSearchRoomMutation();

const result = await createSearchRoom({
    typeGame: "standart",
    timeControl: 300,
    timePluse: 10,
}).unwrap();
// result.game._id — ID созданной игры
```

---

### `cancelSearchRoom` — mutation

Удаление созданной, но не начатой игры по ID.

| Параметр | Значение |
|----------|----------|
| Метод | `POST` |
| URL | `/game/cancel` |
| Тело | `{ gameId }` |
| Кештеги | `["user"]` |

**Использование:**
```ts
const [cancelSearchRoom] = useCancelSearchRoomMutation();
```

## Хуки (сгенерированные RTK Query)

```ts
// Query hooks
useIsActivTokenQuery

// Mutation hooks
useRegistrationUserMutation
useLoginUserMutation
useEmailVerifyMutation
useUnLoginUserMutation
useCreateSearchRoomMutation
useCancelSearchRoomMutation
```

## Теги кеширования

Все endpoints используют тег `"user"`. Мутации инвалидируют этот тег, что вызывает автоматическое обновление всех query-хуков, подписанных на `"user"`.
