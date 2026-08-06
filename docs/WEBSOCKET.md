# WebSocket (клиентская сторона)

## Обзор

Фронтенд подключается к Colyseus серверу через `colyseus.js` SDK. Все real-time коммуникации (поиск оппонента, ходы, синхронизация состояния) осуществляются через WebSocket.

## Подключение

### URL

| Среда | URL |
|-------|-----|
| Development | `ws://localhost:5000/` |
| Production | `wss://app-world-chess.vercel.app/` |

### Инициализация

```ts
// src/services/client.ts
import { Client } from "colyseus.js";

const COLYSEUS_URL = "ws://localhost:5000";
const client = new Client(COLYSEUS_URL);

export default client;
```

### Менеджер комнаты

Текущая комната хранится в маппинге (не в Redux) через `roomManager.ts`:

```ts
// src/services/roomManager.ts
import type { Room } from "colyseus.js";

let currentRoom: Room | null = null;

export function setRoom(room: Room | null): void {
    currentRoom = room;
}

export function getRoom(): Room | null {
    return currentRoom;
}
```

Это позволяет получать доступ к комнате из любого места приложения без лишних подключений.

## Подключение к комнате

Подключение инициируется при логине пользователя через Redux thunk `connectToRoom`:

```ts
// src/redux/thunks/roomThunks.ts
export const connectToRoom = createAsyncThunk<
    { roomId: string },
    { token: string; color: string },
    { state: RootState }
>(
    "room/connect",
    async ({ token, color }, { rejectWithValue }) => {
        const room = await client.joinOrCreate("chess_room", { token, color });
        setRoom(room);
        return { roomId: room.roomId };
    }
);
```

Комната называется `chess_room`. Colyseus автоматически создаёт комнату при `joinOrCreate`, если она ещё не существует.

## Подписка на события комнаты

В `App.tsx` подписываемся на сообщения комнаты после подключения:

```tsx
// src/app/App.tsx — useEffect для WS-подписок

// Событие "game" — обновление состояния игры
room.onMessage("game", handleGameMessage);

// Событие "gameStart" — оппонент найден, игра начинается
room.onMessage("gameStart", handleGameStart);

// Событие "searching" — обновление статуса поиска
room.onMessage("searching", handleSearching);

// Событие "search_cancelled" — поиск отменён текущим игроком
room.onMessage("search_cancelled", handleSearchCancelled);

// Событие "search_cancelled_by_opponent" — оппонент отменил поиск
room.onMessage("search_cancelled_by_opponent", handleSearchCancelledByOpponent);

// Событие "gameOver" — игра завершена
room.onMessage("gameOver", handleGameOver);
```

Каждый обработчик обновляет Redux-состояние через соответствующие action creators и при необходимости выполняет навигацию.

## Протокол сообщений (клиент → сервер)

Все сообщения отправляются через `room.send(event, data)`. Формат — JSON-объект.

### `startApp` — Подключение / переподключение

Отправляется при подключении к Colyseus комнате. Сервер возвращает текущую активную игру, если она есть.

```ts
// src/services/wsMessages.ts
export const reqWsStartApp = (idWs: string, token: string, color: string) => {
    return { idWs, token, event: "startApp", color };
};
```

### `findGame` — Найти оппонента

Отправляется из `GameMenu` при выборе тайм-контроля.

```ts
// src/services/wsMessages.ts
export const reqWsStartGame = (
    timeControl: number,
    timePluse: number,
    typeGame: string,
    token: string,
    idWs: string,
    color: string
) => {
    return { idWs, typeGame, token, color, timeControl, timePluse, event: "findGame" };
};
```

> **Примечание:** Событие называется `"findGame"`, а не `"startGame"`, так как сервер автоматически рассылает `gameStart` при подключении второго игрока. Сообщение `findGame` используется для передачи параметров поиска и подтверждения готовности.

### `game` — Отправить ход

Отправляется при совершении хода на доске.

```ts
export const reqWsGame = (data: any) => {
    return { idWs: data.idWs, event: "game" };
};
```

### `cancelSearch` — Отмена поиска

Отправляется, когда игрок закрывает модалку поиска оппонента.

```ts
room.send("cancelSearch", { gameId });
```

## События сервера → клиент

### `game` — Обновление состояния игры

Обновление позиции, хода, рейтингов.

### `gameStart` — Начало игры

Содержит данные о начальной позиции, игроках, рейтингах и таймерах.

Событие рассылается сервером автоматически при подключении второго игрока к комнате (в Colyseus `onJoin`), либо при получении `findGame` от обоих игроков.

```ts
{
    idGame: string;
    position: string[];
    playerWite: string;
    playerBlack: string;
    reitingWite: number;
    reitingBlack: number;
    timeWite: number;
    timeBlack: number;
    move: boolean;           // чей ход
    message: string;
    typeGame: string;
    timeControl: number;
    timePluse: number;
}
```

При получении `gameStart`:
1. `dispatch(roomSlice.actions.gameStartSuccess(data))` — сохраняет данные игры в Redux
2. `dispatch(setGameStart())` — устанавливает статус `"playing"`
3. `navigate("/game")` — переход на доску

### `searching` — Обновление статуса поиска

```ts
{
    searchData: { typeGame: GameType; timeControl: number; timePluse: number }
}
```

### `search_cancelled` — Поиск отменён

Сбрасывает `gameEvents` в начальное состояние.

### `search_cancelled_by_opponent` — Оппонент отменил поиск

Аналогично `search_cancelled` с соответствующим toast-уведомлением.

### `gameOver` — Завершение игры

```ts
{
    gameOverData: { result: GameResult; ratingChange: number }
}
```

При получении `gameOver`:
1. `dispatch(setGameOver({ result, ratingChange }))` — сохраняет результат
2. `navigate("/home")` — возврат на главную

## Async Thunks (roomThunks)

| Thunk | Назначение |
|-------|------------|
| `connectToRoom` | Подключение к Colyseus комнате `chess_room` |
| `sendRoomMessage` | Отправка произвольного сообщения в комнату |
| `findGame` | Отправка `findGame` события для поиска оппонента |
| `cancelSearch` | Отмена поиска (REST + WS) |
| `leaveRoom` | Покинуть комнату и очистить состояние |

## Обработка ошибок

- Ошибки подключения — обрабатываются в `connectToRoom` через `rejectWithValue`
- Ошибки отправки сообщений — обрабатываются в `sendRoomMessage` и `findGame` через `rejectWithValue`
- Потеря соединения — Colyseus автоматически пытается переподключиться
- При переподключении клиент отправляет `startApp` и получает текущее состояние игры

## Важные замечания

- Версия `colyseus.js` на клиенте **должна совпадать** с версией `colyseus` на сервере (обе `0.16.x`)
- Версия `@colyseus/schema` должна быть одинаковой на клиенте и сервере (`3.0.76`)
- Несовпадение версий приведёт к ошибкам декодирования и потере синхронизации
