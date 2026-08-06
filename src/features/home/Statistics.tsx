import React from 'react';
import { useSelector } from 'react-redux';
import { useGetGameHistoryQuery } from '@redux/api/authApi';
import BoltIcon from '@mui/icons-material/Bolt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AssessmentIcon from '@mui/icons-material/Assessment';
import type { RootState } from '@redux/store';
import s from './Statistics.module.css';

const Statistics = () => {
  const stats = useSelector((state: RootState) => (state as any).user.stats);
  const userId = useSelector((state: RootState) => (state as any).user.userId);
  const userName = useSelector((state: RootState) => (state as any).user.userName);
  const { data, isLoading, isError, refetch, isFetching } = useGetGameHistoryQuery(100);
  const games = data?.games ?? [];

  // Форматирование режима по времени: { timeControl: 180, timePluse: 2 } → "3+2" или "30" без инкремента.
  const formatTimeControl = (g: any): string => {
    if (!g) return '—';
    const minutes = Math.round(g.timeControl / 60);
    const inc = g.timePluse;
    return inc > 0 ? `${minutes}+${inc}` : `${minutes}`;
  };

  // Текст результата партии с ПОДСВЕТКОЙ текущего юзера.
  // Логика: если игрок — белый → победа 1-0 = его победа, и т.д. Для ничьей равностильно.
  const outcomeForUser = (g: any): 'win' | 'loss' | 'draw' => {
    if (String(g.ownerWite) === String(userId)) {
      return g.result === '1-0' ? 'win' : g.result === '0-1' ? 'loss' : 'draw';
    }
    if (String(g.ownerBlack) === String(userId)) {
      return g.result === '0-1' ? 'win' : g.result === '1-0' ? 'loss' : 'draw';
    }
    return 'draw';
  };

  // Рейтинг-изменение ТЕКУЩЕГО игрока за партию. Если игрок белый
  // — разница («сейчас» — «было») его рейтинга. Если чёрный — аналогично.
  // Отображаем со знаком (+N / -N / ±0) и цветом для UX.
  const getRatingChangeClass = (change: number): string => {
    if (change > 0) return s.gainPositive;
    if (change < 0) return s.gainNegative;
    return s.gainZero;
  };
  const ratingChangeOfUser = (g: any): number => {
    const currentRating = stats.rating;
    if (String(g.ownerWite) === String(userId)) {
      return Number(currentRating) - Number(g.reitingWite ?? 0);
    }
    if (String(g.ownerBlack) === String(userId)) {
      return Number(currentRating) - Number(g.reitingBlack ?? 0);
    }
    return 0;
  };

  // Яркая раскраска ников. Ники в базе могут отсутствовать — fallback на userName.
  const resolveName = (ownerId: string | undefined, fallbackName: string | undefined): string => {
    if (String(ownerId) === String(userId)) {
      return userName || fallbackName || 'You';
    }
    return fallbackName || '—';
  };
  const formatDate = (iso: string | undefined): string => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;

  const statCards = [
    { label: 'Rating', value: stats.rating, Icon: BoltIcon, color: '--color-accent' },
    { label: 'Max Rating', value: stats.maxRating, Icon: EmojiEventsIcon, color: '--color-purple' },
    { label: 'Games', value: stats.gamesPlayed, Icon: SportsEsportsIcon, color: '--color-green' },
    { label: 'Wins', value: stats.wins, Icon: MilitaryTechIcon, color: '--color-success' },
    { label: 'Losses', value: stats.losses, Icon: TrendingDownIcon, color: '--color-error' },
    { label: 'Draws', value: stats.draws, Icon: HandshakeIcon, color: '--color-text-muted' },
    { label: 'Win Rate', value: `${winRate}%`, Icon: AssessmentIcon, color: '--color-accent' },
  ];

  return (
    <div className={s.root}>
      <div className={s.container}>
        <header className={s.header}>
          <h2 className={s.title}>Statistics</h2>
          <p className={s.sub}>Your chess performance overview</p>
          <button
            type="button"
            className={s.refreshBtn}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? 'Updating…' : 'Update'}
          </button>
        </header>

        {/* Win rate highlight */}
        {stats.gamesPlayed > 0 && (
          <div className={s.winRateBanner}>
            <AssessmentIcon className={s.winRateIcon} />
            <span className={s.winRateLabel}>Win Rate</span>
            <span className={s.winRateValue}>{winRate}%</span>
            <div className={s.winRateBar}>
              <div className={s.winRateFill} style={{ width: `${winRate}%` }} />
            </div>
          </div>
        )}

        <div className={s.grid}>
          {statCards.map(({ label, value, Icon, color }) => (
            <div key={label} className={s.card}>
              <span className={s.cardIcon} style={{ color: `var(${color})` }}>
                <Icon fontSize="inherit" />
              </span>
              <span className={s.cardLabel}>{label}</span>
              <span className={s.cardValue}>{value}</span>
            </div>
          ))}
        </div>

        {/* Game history table — последние 100 завершённых партий, без текущей */}
        <div className={s.tableSection}>
          <h3 className={s.sectionTitle}>Recent Games</h3>

          {isLoading && <div className={s.status}>Loading game history…</div>}
          {isError && (
            <div className={s.status} style={{ color: 'var(--color-error)' }}>
              Error loading game history
            </div>
          )}

          {!isLoading && !isError && games.length === 0 && (
            <div className={s.status}>No completed games yet</div>
          )}

          {games.length > 0 && (
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.th}>Date</th>
                    <th className={s.th}>White (Rating)</th>
                    <th className={s.th}>Black (Rating)</th>
                    <th className={s.th}>Result</th>
                    <th className={s.th}>Time</th>
                    <th className={s.th}>Rating Change</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((g: any) => {
                    const isMeWhite = String(g.ownerWite) === String(userId);
                    const isMeBlack = String(g.ownerBlack) === String(userId);
                    const outcome = outcomeForUser(g);
                    const rChange = ratingChangeOfUser(g);
                    const ratingChangeLabel =
                      rChange > 0 ? `+${rChange}` : rChange < 0 ? `${rChange}` : '±0';

                    return (
                      <tr key={g._id} className={s.tr}>
                        <td className={s.td}>{formatDate(g.createdAt)}</td>
                        <td className={`${s.td} ${isMeWhite ? s.me : ''}`}>
                          {resolveName(g.ownerWite, g.nameWite)} ({g.reitingWite ?? 0})
                        </td>
                        <td className={`${s.td} ${isMeBlack ? s.me : ''}`}>
                          {resolveName(g.ownerBlack, g.nameBlack)} ({g.reitingBlack ?? 0})
                        </td>
                        <td className={`${s.td} ${s[`outcome_${outcome}`]}`}>
                          {outcome === 'win'
                            ? '1–0 Win'
                            : outcome === 'loss'
                              ? '0–1 Loss'
                              : '½–½ Draw'}
                        </td>
                        <td className={s.td}>{formatTimeControl(g)}</td>
                        <td className={`${s.td} ${getRatingChangeClass(rChange)}`}>
                          {ratingChangeLabel}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
