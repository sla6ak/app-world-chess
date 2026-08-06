import React from 'react';
import GeneralButton from '@components/generalButton/GeneralButton';
import { SpinnerDotted } from 'spinners-react';
import type { SearchGameData } from '@redux/slices/gameEvents';
import s from './ModalFindGame.module.css';

type PropTypes = {
  onCancel: () => void;
  searchData: SearchGameData | null;
};

/**
 * Режим поиска, например "5+3" (5 мин + 3 с на ход) или "30" (без инкремента).
 * timeControl хранится в секундах (REST/BACKEND контракт), поэтому делим на 60.
 */
function formatTimeControl(searchData: SearchGameData | null): string | null {
  if (!searchData) return null;
  const minutes = Math.round(searchData.timeControl / 60);
  const increment = searchData.timePluse;
  return increment > 0 ? `${minutes}+${increment}` : `${minutes}`;
}

const ModalFindGame = ({ onCancel, searchData }: PropTypes) => {
  const timeLabel = formatTimeControl(searchData);

  return (
    <div className={s.root}>
      <h3 className={s.title} style={{ color: 'var(--color-text-primary)' }}>
        Searching for opponent
      </h3>

      {timeLabel && (
        <div className={s.timeBadge} aria-label={`Time control ${timeLabel} minutes`}>
          <span className={s.timeBadgeValue}>{timeLabel}</span>
          <span className={s.timeBadgeUnit}>min</span>
        </div>
      )}

      <div className={s.spinner}>
        <SpinnerDotted size={48} thickness={100} speed={100} color="var(--color-green)" />
      </div>

      <p className={s.desc} style={{ color: 'var(--color-text-secondary)' }}>
        Looking for a player with similar rating...
      </p>

      <div className={s.btnRow}>
        <div className={s.btnWrap} style={{ width: 200 }}>
          <GeneralButton bts={'ghost'} onClick={onCancel} type="button">
            Cancel
          </GeneralButton>
        </div>
      </div>
    </div>
  );
};

export default ModalFindGame;
