import { configureStore, combineReducers, useDispatch } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { authApi } from "./authAPI";
import { curentToken } from "./sliceToken";
import { curentWsID } from "./sliceWsID";
import { colorGame } from "./sliceColor";
import { curentUser } from "./sliceUserName";
import { themeSlice } from "./sliceTheme";
import { roomReducer } from "./sliceRoom";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";

const tokenPersistConfig = {
    key: "chessWorld",
    storage,
    whitelist: ["token", "colorGame", "theme"],
};

const rootReduser = combineReducers({
    [authApi.reducerPath]: authApi.reducer,
    token: curentToken.reducer,
    userName: curentUser.reducer,
    colorGame: colorGame.reducer,
    WsID: curentWsID.reducer,
    theme: themeSlice.reducer,
    room: roomReducer,
});

const persistedReducer = persistReducer(tokenPersistConfig, rootReduser);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                ignoredPaths: ["room.room"],
            },
        }).concat(authApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
