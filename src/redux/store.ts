import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import colorGame from "./slices/color";
import curentToken from "./slices/token";
import curentWsID from "./slices/wsID";
import { userSlice } from "./slices/user";
import { roomSlice } from "./slices/room";
import { themeSlice } from "./slices/theme";
import { gameEventsReducer } from "./slices/gameEvents";
import { authApi } from "./api/authApi";

const persistConfig = {
	key: "root",
	version: 1,
	storage,
	whitelist: ["token", "wsId"],
};

const rootReducer = combineReducers({
	colorGame: colorGame.reducer,
	token: curentToken.reducer,
	wsId: curentWsID.reducer,
	user: userSlice.reducer,
	room: roomSlice.reducer,
	theme: themeSlice.reducer,
	gameEvents: gameEventsReducer,
	[authApi.reducerPath]: authApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}).concat(authApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
