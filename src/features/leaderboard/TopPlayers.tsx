import React from 'react';
import { useGetTopPlayersQuery } from '@redux/api/authApi';
import s from './TopPlayers.module.css';

interface Player {
  _id: string;
  name: string;
  currentReiting: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

/**
 * Лидерборд: топ-30 игроков по рейтингу.
 * Бэкенд GET /auth/top (controllers/user.ts getTopPlayers) отдаёт
 * только name/reiting/статистику, без паролей и email.
 */
const TopPlayers: React.FC = () => {
  const { data, isLoading, isError, refetch, isFetching } = useGetTopPlayersQuery(30);

  const players: Player[] = data?.players ?? [];

  return (
    <div className={s.root}>
      <header className={s.header}>
        <h1 className={s.title}>Leaderboard</h1>
        <p className={s.sub}>Top players by rating (maximum 30)</p>
        <button
          type="button"
          className={s.refreshBtn}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'Updating…' : 'Update'}
        </button>
      </header>

      <div className={s.body}>
        {isLoading && <div className={s.status}>Loading…</div>}
        {isError && (
          <div className={s.status} style={{ color: 'var(--color-error)' }}>
            Error loading leaderboard
          </div>
        )}

        {!isLoading && !isError && players.length === 0 && (
          <div className={s.status}>No players found — be the first!</div>
        )}

        {players.length > 0 && (
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.th}>#</th>
                <th className={s.th}>Player</th>
                <th className={s.th}>Rating</th>
                <th className={s.th}>Games</th>
                <th className={s.th}>W / L / D</th>
                <th className={s.th}>Win%</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, idx) => {
                const winRate = p.gamesPlayed > 0 ? Math.round((p.wins / p.gamesPlayed) * 100) : 0;
                const isTop3 = idx < 3;
                return (
                  <tr key={p._id} className={`${s.tr} ${isTop3 ? s.top3 : ''}`}>
                    <td className={s.td}>{idx + 1}</td>
                    <td className={s.td}>{p.name}</td>
                    <td className={s.td}>
                      <span className={s.rating}>{p.currentReiting}</span>
                    </td>
                    <td className={s.td}>{p.gamesPlayed}</td>
                    <td className={s.td}>
                      {p.wins} / {p.losses} / {p.draws}
                    </td>
                    <td className={s.td}>{winRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TopPlayers;
