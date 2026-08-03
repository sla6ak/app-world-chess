import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import useCurrentGameNavigation from '@hooks/useCurrentGameNavigation';
import GridViewIcon from '@mui/icons-material/GridView';
import BarChartIcon from '@mui/icons-material/BarChart';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import UserMenu from '@components/userMenu/UserMenu';
import ThemeSwitcher from '@components/themeSwitcher/ThemeSwitcher';
import Modal from '@components/modal/Modal';
import ModalLogOut from '@features/auth/ModalLogOut';
import s from './Sidebar.module.css';

const Sidebar = () => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { handleCurrentGame, checkingGame } = useCurrentGameNavigation();

    return (
        <aside className={s.sidebar} aria-label="Sidebar navigation">
            {/* Brand */}
            <NavLink
                to="/home"
                className={s.logo}
                style={{ color: "var(--color-text-primary)" }}
            >
                {/* Chess knight icon */}
                <div className={s.logoIcon} style={{ backgroundImage: 'linear-gradient(to bottom right, var(--color-accent), var(--color-green))' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>
                <span className={s.brand}>Chess-World</span>
            </NavLink>

            {/* User & Theme */}
            <div className={s.userSection}>
                <UserMenu />
                <ThemeSwitcher />
            </div>

            {/* Navigation */}
            <nav className={s.links}>
                <NavLink
                    to="/home"
                    end
                    className={({ isActive }) => `${s.link} ${isActive ? s.linkActive : ''}`}
                >
                    <GridViewIcon className={s.icon} />
                    Home
                </NavLink>
                <NavLink
                    to="/statistic"
                    className={({ isActive }) => `${s.link} ${isActive ? s.linkActive : ''}`}
                >
                    <BarChartIcon className={s.icon} />
                    Statistics
                </NavLink>

                {/* Current game — показать только если на сервере есть неоконченная партия */}
                <button
                    type="button"
                    onClick={handleCurrentGame}
                    disabled={checkingGame}
                    className={s.link}
                >
                    <PlayCircleOutlineIcon className={s.icon} />
                    Current game
                </button>

                {/* Exit */}
                <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className={`${s.link} ${s.linkDanger}`}
                >
                    <LogoutIcon className={s.icon} />
                    Exit
                </button>
                {showLogoutModal && (
                    <Modal onModalClose={() => setShowLogoutModal(false)}>
                        <ModalLogOut onModalClose={() => setShowLogoutModal(false)} onAfterLogout={() => setShowLogoutModal(false)} />
                    </Modal>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
