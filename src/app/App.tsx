import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useIsActivTokenQuery } from '@redux/api/authApi';
import { setUserName, setUserStats, setUserId } from '@redux/slices/user';
import { connectToRoom, reconnectToActiveGame } from '@redux/thunks/roomThunks';
import { roomSlice } from '@redux/slices/room';
import { newColorGame } from '@redux/slices/color';
import { resolvePlayerColor } from '@helpers/theme';
import {
  setSearchMode,
  setGameStart,
  setGameOver,
  resetGameEvents,
  GameResult,
  setDrawOffer,
  clearDrawOffer,
} from '@redux/slices/gameEvents';
import { getRoom } from '@services/roomManager';
import { toGameData } from '@helpers/roomSerializer';
import { store } from '@redux/store';
import Layout from '@components/layout/Layout';
import { applyTheme } from '@helpers/theme';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from '@components/privateRoute/PrivateRoute';
import PublicRoute from '@components/publicRoute/PublicRoute';
import Statistics from '@features/home/Statistics';
import TopPlayers from '@features/leaderboard/TopPlayers';
import HomeTab from '@features/home/HomeTab';
import GameArea from '@features/game/GameArea';
import type { RootState, AppDispatch } from '@redux/store';

const LoginPage = React.lazy(() => import('@pages/loginPage/LoginPage'));
const RegisterPage = React.lazy(() => import('@pages/registerPage/RegisterPage'));
const DashboardPage = React.lazy(() => import('@pages/dashboardPage/DashboardPage'));

function AppContent() {
  const [curentG, setCurentG] = useState(false);
  const color = useSelector((state: RootState) => (state as any).colorGame);
  const token = useSelector((state: RootState) => (state as any).token);
  const userName: string = useSelector((state: RootState) => (state as any).user.userName);
  const currentTheme: string = useSelector((state: RootState) => (state as any).theme);
  const roomId = useSelector((state: RootState) => (state as any).room.roomId);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: auth } = useIsActivTokenQuery('', { skip: !token });
  const roomRef = useRef<any>(null);
  const reconnectingRef = useRef(false);

  useEffect(() => {
    if (auth === undefined || !auth.user) {
      return;
    }
    dispatch(setUserName(auth.user.name));
    dispatch(setUserId(auth.user._id ?? ''));
    dispatch(
      setUserStats({
        rating: auth.user.currentReiting ?? 800,
        gamesPlayed: auth.user.gamesPlayed ?? 0,
        wins: auth.user.wins ?? 0,
        losses: auth.user.losses ?? 0,
        draws: auth.user.draws ?? 0,
        maxRating: auth.user.maxRating ?? 800,
      })
    );
  }, [auth, dispatch]);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Перевірка активної гри при вході на сайт або перезавантаженні сторінки
  useEffect(() => {
    // Не перевіряємо, якщо вже йде перепідключення, користувач не авторизований,
    // або вже є активна гра (curentG === true)
    if (reconnectingRef.current || !auth?.user || curentG) {
      return;
    }

    // Якщо roomId вже є в Redux, гра вже підключена
    if (roomId) {
      return;
    }

    reconnectingRef.current = true;
    console.log('[Reconnect] Checking for active game | pathname:', location.pathname);

    dispatch(reconnectToActiveGame({ token, color }))
      .unwrap()
      .then((result) => {
        reconnectingRef.current = false;

        if (result.status === 'matched' && result.game && result.gameId) {
          const gameId = result.gameId!;
          const gameData = result.game;

          // Ключевая диагностика бага «часы после F5»: что вернула Mongo
          // ДО того, как WS gameStart/gameResumed перезапишет актуальными значениями.
          console.log(
            '[Reconnect] ✅ Active game found, reconnecting | gameId:',
            result.gameId,
            '| db timeWite/timeBlack:',
            `${gameData.timeWite}/${gameData.timeBlack}`,
            '| timeControl:',
            gameData.timeControl,
            '| moveHistory:',
            gameData.moveHistory?.length ?? 0,
            '| paused(db):',
            (gameData as any)?.paused
          );

          // WS кімната вже підключена всередині reconnectToActiveGame
          dispatch(roomSlice.actions.connectRoomSuccess({ roomId: gameId }));

          // Відновлюємо дані партії з документа MongoDB
          // (getActiveGame повертає nameWite/nameBlack/...)
          const restored = {
            idGame: String(gameData._id ?? gameId),
            position: gameData.position ?? [],
            playerWite: gameData.nameWite ?? gameData.playerWite ?? '',
            playerBlack: gameData.nameBlack ?? gameData.playerBlack ?? '',
            reitingWite: gameData.reitingWite ?? 800,
            reitingBlack: gameData.reitingBlack ?? 800,
            timeWite: Number(gameData.timeWite) || gameData.timeControl || 180,
            timeBlack: Number(gameData.timeBlack) || gameData.timeControl || 180,
            move: gameData.move ?? true,
            message: gameData.message ?? '',
            typeGame: gameData.typeGame || 'standart',
            timeControl: gameData.timeControl || 180,
            timePluse: gameData.timePluse || 0,
            fen: (gameData as any).pgn || undefined, // using pgn field for now
            // Сервер заморозил часы на disconnect — до gameResumed клиент не должен
            // вести локальный отсчёт от этих устаревших значений.
            pausedSince: (gameData as any).paused ? Date.now() : null,
          };
          dispatch(roomSlice.actions.gameStartSuccess(restored));
          const resolvedColor = resolvePlayerColor(userName, restored);
          if (resolvedColor) dispatch(newColorGame(resolvedColor));
          dispatch(
            setSearchMode({
              typeGame: gameData.typeGame || 'standart',
              timeControl: gameData.timeControl || 180,
              timePluse: gameData.timePluse || 0,
            })
          );
          setCurentG(true);
          toast.info('Reconnected to your active game!');
        } else {
          // Немає активної гри.
          // Перенаправляемо на /home ТІЛЬКИ якщо поточний шлях вимагає гри.
          // На /home, /statistic та інших статичних сторінках це не потрібно —
          // інакше при кожному переході користувач отримує toast і його «збриць" на /home.
          const path = window.location.pathname;
          console.log('[Reconnect] No active game found | pathname:', path);
          if (path === '/game' || path.startsWith('/game/')) {
            toast.info('No active game found');
            navigate('/home');
          }
        }
      })
      .catch((err) => {
        reconnectingRef.current = false;
        console.error('[Reconnect] Failed to check for active game:', err);
      });
    // ВАЖЛИВО: НЕ включаємо location.pathname — цей useEffect повинен спрацювати
    // один раз на mount/перезавантаження, а не на кожен route-change. Інакше при
    // переході на /statistic викликається reconnect-check, і якщо гра не знайдена —
    // користувача перекидає назад на /home з тостом.
  }, [auth, dispatch, navigate, token, color, curentG, roomId]);

  // Підписка на повідомлення комнаты (тільки для ігрового процесу — ходи, завершення)
  // WS підключення до конкретної кімнати відбувається при пошуку гри або перепідключенні
  useEffect(() => {
    const room = roomRef.current || getRoom();
    if (!room) return;

    console.log('[WS] Subscribing to room messages, roomId:', room.id);

    // Диагностика жизненного цикла WS — ключ к багу «часы пошли заново после F5»:
    // по этим логам видно, когда умирает старый коннект и когда клиент устанавливает
    // НОВОЕ подключение вместо переиспользования существующей комнаты.
    room.onLeave((code: number) => {
      console.warn('[WS] room.onLeave — socket closed | code:', code, '| roomId:', room.id);
    });
    room.onError((code: number, message?: string) => {
      console.warn('[WS] room.onError | code:', code, '| message:', message);
    });

    const handleGameMessage = (message: unknown) => {
      const parsed = toGameData(message);
      if (!parsed) return;
      console.debug(
        "[WS] 'game' | idGame:",
        parsed.idGame,
        '| move:',
        parsed.move,
        '| timeWite/timeBlack:',
        `${parsed.timeWite}/${parsed.timeBlack}`,
        '| pausedSince:',
        parsed.pausedSince ?? null
      );
      if (parsed.position && parsed.position.length > 0) {
        dispatch(clearDrawOffer());
      }
      const current = (store.getState() as RootState).room.gameData;
      if (current?.idGame) {
        dispatch(
          roomSlice.actions.gameStartSuccess({
            ...current,
            position: parsed.position.length > 0 ? parsed.position : current.position,
            move: parsed.move,
            timeWite: parsed.timeWite,
            timeBlack: parsed.timeBlack,
            ...(parsed.fen ? { fen: parsed.fen } : {}),
            ...(parsed.lastMoveTimestamp ? { lastMoveTimestamp: parsed.lastMoveTimestamp } : {}),
            pausedSince: parsed.pausedSince ?? null,
          })
        );
      }
      setCurentG(true);
    };

    const handleGameStart = (message: unknown) => {
      console.log("[WS] Received 'gameStart' event:", JSON.stringify(message));
      const msg = message as {
        idGame?: string;
        position?: string[];
        playerWite?: string;
        playerBlack?: string;
        reitingWite?: number;
        reitingBlack?: number;
        timeWite?: number;
        timeBlack?: number;
        move?: boolean;
        message?: string;
        typeGame?: string;
        timeControl?: number;
        timePluse?: number;
        fen?: string;
        lastMoveTimestamp?: number;
        pausedSince?: number | null;
      };
      if (!msg.idGame || msg.idGame === 'undefined') {
        console.error('[WS] gameStart missing idGame — ignoring');
        return;
      }
      console.log(
        '[WS] gameStart — idGame:',
        msg.idGame,
        '| white:',
        msg.playerWite,
        '| black:',
        msg.playerBlack
      );
      const payload = {
        idGame: msg.idGame,
        position: msg.position ?? [],
        playerWite: msg.playerWite ?? '',
        playerBlack: msg.playerBlack ?? '',
        reitingWite: msg.reitingWite ?? 800,
        reitingBlack: msg.reitingBlack ?? 800,
        timeWite: msg.timeWite ?? 180,
        timeBlack: msg.timeBlack ?? 180,
        move: msg.move ?? true,
        message: msg.message ?? '',
        typeGame: msg.typeGame ?? 'standart',
        timeControl: msg.timeControl ?? 180,
        timePluse: msg.timePluse ?? 0,
        fen: msg.fen,
        lastMoveTimestamp: msg.lastMoveTimestamp,
        pausedSince: msg.pausedSince ?? null,
      };
      console.debug(
        "[WS] 'gameStart' payload | idGame:",
        payload.idGame,
        '| timeWite/timeBlack:',
        `${payload.timeWite}/${payload.timeBlack}`,
        '| pausedSince:',
        payload.pausedSince ?? null
      );
      const resolvedColor = resolvePlayerColor(userName, payload);
      if (resolvedColor) dispatch(newColorGame(resolvedColor));
      dispatch(roomSlice.actions.gameStartSuccess(payload));
      dispatch(setGameStart());
      setCurentG(true);
      console.log('[WS] Navigating to /game');
      navigate('/game');
      toast.success('Game found! Starting...');
    };

    const handleGameOver = (message: unknown) => {
      const m = message as { gameOverData?: { result: string; endReason?: string } };
      console.warn(
        "[WS] 'gameOver' | result:",
        m.gameOverData?.result,
        '| endReason:',
        m.gameOverData?.endReason,
        '| raw:',
        JSON.stringify(message)
      );
      const msg = message as {
        gameOverData?: {
          result: string;
          winnerRole?: string | null;
          endReason?: string;
          ratingChange: number;
        };
      };
      if (msg.gameOverData) {
        const god = msg.gameOverData;
        console.log(
          '[WS] gameOver — result:',
          god.result,
          '| winnerRole:',
          god.winnerRole,
          '| endReason:',
          god.endReason
        );
        const gameData = (store.getState() as RootState).room.gameData;
        const myRole = gameData
          ? resolvePlayerColor(userName, {
              playerWite: gameData.playerWite,
              playerBlack: gameData.playerBlack,
            })
          : null;
        let personal: GameResult;
        if (god.result === '0.5-0.5') personal = 'draw';
        else if (
          (god.result === '1-0' && myRole === 'wite') ||
          (god.result === '0-1' && myRole === 'black')
        )
          personal = 'win';
        else personal = 'loss';
        dispatch(
          setGameOver({
            result: personal,
            ratingChange: god.ratingChange,
          })
        );
      }
      setCurentG(false);
      console.log('[WS] Navigating to /home (game over)');
      navigate('/home');
    };

    const handleDrawOffered = (message: unknown) => {
      console.log("[WS] Received 'draw_offered' event:", JSON.stringify(message));
      const msg = message as { byRole?: 'wite' | 'black' };
      if (!msg.byRole) return;
      // Сверяем роль отправителя предложения с нашей ролью в текущей партии
      // (playerWite/playerBlack хранят никнеймы — сравниваем по ним).
      const gameData = (store.getState() as RootState).room.gameData;
      const myRole = gameData ? resolvePlayerColor(userName, gameData) : null;
      if (myRole && msg.byRole === myRole) {
        // Мы предложили ничью — ждём ответа соперника
        dispatch(setDrawOffer('me'));
      } else if (myRole) {
        // Соперник предложил ничью — пульсирующая кнопка «Ничья» у нас
        dispatch(setDrawOffer('opponent'));
      }
    };

    const handleGameDeclinedDraw = (message: unknown) => {
      console.log("[WS] Received 'draw_cleared' event:", JSON.stringify(message));
      dispatch(clearDrawOffer());
    };

    const handleMoveMade = (message: unknown) => {
      console.log("[WS] Received 'move_made':", JSON.stringify(message));
      const msg = message as {
        move?: { from: string; to: string; promotion?: string };
        fen?: string;
        position?: string[];
        timers?: { white: number; black: number };
        nextTurn?: string;
      };
      dispatch(clearDrawOffer());

      // Синхронизируем Redux — иначе gameData.move тикает не того игрока,
      // и доска визуально замирает до прихода следующего 'game' бродкаста.
      const current = (store.getState() as RootState).room.gameData;
      if (current?.idGame && msg.fen) {
        dispatch(
          roomSlice.actions.gameStartSuccess({
            ...current,
            ...(msg.fen ? { fen: msg.fen } : {}),
            move: msg.nextTurn ? msg.nextTurn === 'w' : current.move,
            timeWite: msg.timers ? msg.timers.white : current.timeWite,
            timeBlack: msg.timers ? msg.timers.black : current.timeBlack,
          })
        );
      }
    };

    const handleMoveError = (message: unknown) => {
      console.log("[WS] Received 'move_error':", JSON.stringify(message));
      const msg = message as {
        code: string;
        message: string;
        fen?: string;
        position?: string;
      };
      toast.error(msg.message || 'Invalid move');
    };

    const handleTimers = (_message: unknown) => {
      // Намеренно НЕ пишем ежесекундные тики в Redux — это была главная причина
      // дёрганных часов (каждую секунду Redux-эффект приравнивал якорь к «округлённому»
      // серверному значению и перетирал плавный локальный тик в GameArea).
      // Авторитетный ресинх часов происходит по событиям: gameStart / move_made / gameResumed.
      // Здесь только доказываем, что сервер жив и партия активна:
      const current = (store.getState() as RootState).room.gameData;
      if (current && current.pausedSince != null) {
        dispatch(
          roomSlice.actions.gameStartSuccess({
            ...current,
            pausedSince: null,
          })
        );
      }
    };

    const handleGameResumed = (message: unknown) => {
      console.debug("[WS] Received 'gameResumed':", JSON.stringify(message));
      const msg = message as {
        timers?: { white: number; black: number };
        fen?: string;
      };
      const current = (store.getState() as RootState).room.gameData;
      if (current && msg.timers) {
        dispatch(
          roomSlice.actions.gameStartSuccess({
            ...current,
            timeWite: msg.timers.white,
            timeBlack: msg.timers.black,
            ...(msg.fen ? { fen: msg.fen } : {}),
            pausedSince: null,
          })
        );
      }
      toast.info('Игра восстановлена');
    };

    const handleOpponentDisconnected = (message: unknown) => {
      console.log("[WS] Received 'opponent_disconnected':", JSON.stringify(message));
      // Сервер заморозил часы — останавливаем локальный отсчёт немедленно,
      // иначе UI «дотикает» время оффлайн-соперника и покажет ему флаг,
      // настоящее значение придёт только на следующем tick/gameStart.
      const current = (store.getState() as RootState).room.gameData;
      if (current) {
        dispatch(
          roomSlice.actions.gameStartSuccess({
            ...current,
            pausedSince: Date.now(),
          })
        );
      }
      toast.info('Соперник отключился — ждём его возвращения (60 сек)', {
        autoClose: 5000,
      });
    };

    const unsubscribeGame = room.onMessage('game', handleGameMessage);
    const unsubscribeGameStart = room.onMessage('gameStart', handleGameStart);
    const unsubscribeGameOver = room.onMessage('gameOver', handleGameOver);
    const unsubscribeDrawOffered = room.onMessage('draw_offered', handleDrawOffered);
    const unsubscribeGameDeclinedDraw = room.onMessage('draw_cleared', handleGameDeclinedDraw);
    const unsubscribeMoveMade = room.onMessage('move_made', handleMoveMade);
    const unsubscribeMoveError = room.onMessage('move_error', handleMoveError);
    const unsubscribeTimers = room.onMessage('timers', handleTimers);
    const unsubscribeGameResumed = room.onMessage('gameResumed', handleGameResumed);
    const unsubscribeOpponentDisconnected = room.onMessage(
      'opponent_disconnected',
      handleOpponentDisconnected
    );

    return () => {
      unsubscribeGame();
      unsubscribeGameStart();
      unsubscribeGameOver();
      unsubscribeDrawOffered();
      unsubscribeGameDeclinedDraw();
      unsubscribeMoveMade();
      unsubscribeMoveError();
      unsubscribeTimers();
      unsubscribeGameResumed();
      unsubscribeOpponentDisconnected();
    };
  }, [roomId, dispatch, navigate, token, color, userName]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage curentG={curentG} />} />
        <Route path="/home" element={<HomeTab />} />
        <Route path="/statistic" element={<Statistics />} />
        <Route path="/leaderboard" element={<TopPlayers />} />
        <Route path="/game" element={<GameArea />} />
      </Route>
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL + '/'}>
      <React.Suspense fallback={<div>Loading...</div>}>
        <AppContent />
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
