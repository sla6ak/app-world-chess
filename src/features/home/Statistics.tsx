import React from 'react';
import { useSelector } from 'react-redux';
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

        {/* Game history table */}
        <div className={s.tableSection}>
          <h3 className={s.sectionTitle}>Recent Games</h3>
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th className={s.th}>Date</th>
                  <th className={s.th}>Opponent</th>
                  <th className={s.th}>Result</th>
                  <th className={s.th}>Rating Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className={s.emptyRow}>
                  <td colSpan={4} className={s.emptyCell}>
                    No completed games yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
