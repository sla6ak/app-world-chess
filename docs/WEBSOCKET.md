# WebSocket (клиентская сторона)

## Обзор

Фронтенд подключается к Colyseus серверу через `colyseus.js` SDK. Все real-time коммуникации (поиск оппонента, ходы, синхронизация состояния) осуществляются через WebSocket.

## Подключение

### URL

| Среда | URL |
|-------|-----|
| Development | `ws://localhost:5000/` |
| Production | `wss://app-world-chess.vercel.app/` (при деплое) |

### Инициализация

```ts
// src/colyseus/client.ts
import { Client } from "colyseus.js";

const COLYSEUS_URL = "ws://localhost:5000";
const client = new Client(COLYSEUS_URL);

export default client;
```

### Подключение к комнате

Подключение инициируется при логине пользователя через Redux thunk `connectToRoom`:

```ts
// src/redux/roomThunks.ts
export const connectToRoom = createAsyncThunk(
    "room/connect",
    async ({ token, color }, { rejectWithValue }) => {
        const room = await client.joinOrCreate("chess_room", { token, color });
        setRoom(room);
        return { roomId: room.roomId };
    }
);
```

Комната называется `chess_room`. Colyseus автоматически создаёт комнату при `joinOrCreate`, если она ещё не существует.

## Менеджер комнаты

Текущая комната хранится в маппинге (не в Redux) через `roomManager.ts`:

```ts
// src/colyseus/roomManager.ts
let currentRoom: Room | null = null;

export function setRoom(room: Room | null): void {
    currentRoom = room;
}

export function getRoom(): Room | null {
    return currentRoom;
}
```

Это позволяет получать доступ к комнате из любого места приложения без лишних подключений.

## Протокол сообщений (клиент → сервер)

Все сообщения отправляются через `room.send(message)`. Формат — JSON-объект с полем `event`.

### `startApp` — Подключение / переподключение

Отправляется при подключении к Colyseus комнате. Сервер возвращает текущую активную игру, если она есть.

```ts
const msg = {
    idWs: "<ws_id>",
    token: "<jwt_token>",
    event: "startApp",
    color: "wite", // или "black"
};
room.send(msg);
```

### `startGame` — Начать игру / Найти оппонента

Отправляется из `GameMenu` при выборе тайм-контроля.

```ts
const msg = {
    idWs: "<ws_id>",
    token: "<jwt_token>",
    event: "startGame",
    color: "wite",
    typeGame: "standart", // или "fisher"
    timeControl: 300,     // секунды
    timePluse: 10,        // секунды за ход
};
room.send(msg);
```

### `game` — Отправить ход

Отправляется при совершении хода на доске.

```ts
const msg = {
    idWs: "<ws_id>",
    event: "game",
    position: ["rnbqkbnrpppppppp88888888888888888888888888888888PPPPPPPPRNBQKBNR"],
    move: "e2e4",
};
room.send(msg);
```

## События сервера → клиент

### `mesRes` — Ответ сервера

Все ответы сервера приходят в событии `mesRes` с полем `message`, определяющим тип ответа.

| `message` | Описание |
|-----------|----------|
| `"ws connect"` | Подтверждение подключения WebSocket |
| `"game"` | Обновление состояния игры (позиция, ход, рейтинги) |
| `"startGame"` | Результат поиска оппонента |

### Подписка на события

В `App.tsx` подписываемся на сообщения комнаты:

```tsx
useEffect(() => {
    const room = getRoom();
    if (!room) return;

    const handleGameMessage = (message: any) => {
        console.log("game message:", message);
        setCurentG(true);
    };

    room.onMessage("game", handleGameMessage);

    return () => {
        room.offMessage("game", handleGameMessage);
    };
}, [roomId]);
```

## Обработка ошибок

- Ошибки подключения (неверный origin) — логируются на сервере в `logs/ws-errors.log`
- Ошибки отправки сообщений — обрабатываются в `sendRoomMessage` thunk через `rejectWithValue`
- Потеря соединения — Colyseus автоматически пытается переподключиться
- При переподключении клиент отправляет `startApp` и получает текущее состояние игры

## Reconnection

Colyseus предоставляет встроенную поддержку переподключения:
- При автоматическом переподключении клиент получает текущее состояние без повторной синхронизации
- Сервер ищет активную игру по `userId` и возвращает текущую позицию
- Клиент продолжает игру с того же места

## Важные замечания

- Версия `colyseus.js` на клиенте **должна совпадать** с версией `colyseus` на сервере (обе `0.16.x`)
- Версия `@colyseus/schema` должна быть одинаковой на клиенте и сервере (`3.0.76`)
- Несовпадение версий приведёт к ошибкам декодирования и потере синхронизации
