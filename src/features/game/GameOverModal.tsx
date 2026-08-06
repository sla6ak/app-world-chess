import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import GeneralButton from '@components/generalButton/GeneralButton';
import type { RootState } from '@redux/store';
import s from './GameOverModal.module.css';

type PropTypes = {
  onClose: () => void;
};

/**
 * GameOverModal — показывает результат завершённой партии.
 * Появляется когда status === 'gameover' в gameEvents slice (App.tsx обрабатывает
 * 'game_over' WS event и диспатчит setGameOver). Закрытие — редирект на /home
 * (App.tsx callback — сброс state и navigate('/home')).
 */
const GameOverModal: React.FC<PropTypes> = ({ onClose }) => {
  const gameOverData = useSelector((state: RootState) => (state as any).gameEvents.gameOverData);
  const playerWite = useSelector((state: RootState) => (state as any).room.gameData?.playerWite);
  const playerBlack = useSelector((state: RootState) => (state as any).room.gameData?.playerBlack);
  const userName = useSelector((state: RootState) => (state as any).user.userName);

  // Имена (нужны для достижения victorий/поражения врага).
  // Если colors задаётся на сервере — комната содержит playerWite/playerBlack (ими === ники).
  const playerNames = useMemo(() => {
    const white = playerWite || 'Opponent';
    const black = playerBlack || 'Opponent';
    return { white, black };
  }, [playerWite, playerBlack]);

  const isThereResult = Boolean(gameOverData?.result);
  const outcome = gameOverData?.result as 'win' | 'loss' | 'draw' | undefined;
  const ratingChange = Number(gameOverData?.ratingChange) || 0;

  const title = useMemo(() => {
    switch (outcome) {
      case 'win':
        return 'You Won!';
      case 'loss':
        return 'You Lost';
      case 'draw':
        return 'Draw Agreed';
      default:
        return 'Game Over';
    }
  }, [outcome]);

  const subtitle = useMemo(() => {
    switch (outcome) {
      case 'win':
        return `Congratulations, ${userName}!`;
      case 'loss':
        return 'Better luck next time, ' + (userName || 'friend');
      case 'draw':
        return 'Good fight — no winner, no loser';
      default:
        return '';
    }
  }, [outcome, userName]);

  const resultSymbol = useMemo(() => {
    switch (outcome) {
      case 'win':
        return '1 – 0';
      case 'loss':
        return '0 – 1';
      case 'draw':
        return '½ – ½';
      default:
        return '';
    }
  }, [outcome]);

  const signedRating = useMemo(() => {
    if (ratingChange > 0) return `+${ratingChange}`;
    if (ratingChange < 0) return `${ratingChange}`;
    return '±0';
  }, [ratingChange]);

  const ratingClass = useMemo(() => {
    if (ratingChange > 0) return s.ratingPositive;
    if (ratingChange < 0) return s.ratingNegative;
    return s.ratingNeutral;
  }, [ratingChange]);

  if (!isThereResult) {
    return null;
  }

  return (
    <div className={s.root}>
      <div className={`${s.badge} ${s[`badge_${outcome}`]}`}>
        <span className={s.badgeSymbol}>{resultSymbol}</span>
      </div>

      <h3 className={s.title}>{title}</h3>
      <p className={s.subtitle}>{subtitle}</p>

      <div className={s.players}>
        <div
          className={`${s.player} ${outcome === 'win' ? s.playerWin : outcome === 'loss' ? s.playerLoss : s.playerDraw}`}
        >
          <span className={s.playerColor}>White</span>
          <span className={s.playerName}>{playerNames.white}</span>
          {String(gameOverData?.winnerRole) === 'wite' && <span className={s.playerCrown}>👑</span>}
        </div>
        <div
          className={`${s.player} ${outcome === 'loss' ? s.playerWin : outcome === 'win' ? s.playerLoss : s.playerDraw}`}
        >
          <span className={s.playerColor}>Black</span>
          <span className={s.playerName}>{playerNames.black}</span>
          {String(gameOverData?.winnerRole) === 'black' && (
            <span className={s.playerCrown}>👑</span>
          )}
        </div>
      </div>

      <div className={`${s.ratingChange} ${ratingClass}`}>
        <span className={s.ratingLabel}>Rating Change</span>
        <span className={s.ratingValue}>{signedRating}</span>
      </div>

      <div className={s.btnWrap}>
        <GeneralButton bts="submit" onClick={onClose} type="button">
          Back to Home
        </GeneralButton>
      </div>
    </div>
  );
};

export default GameOverModal;
