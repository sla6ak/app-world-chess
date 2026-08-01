import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import UserMenu from '@components/userMenu/UserMenu';
import ThemeSwitcher from '@components/themeSwitcher/ThemeSwitcher';
import Modal from '@components/modal/Modal';
import ModalLogOut from '@features/auth/ModalLogOut';
import s from './Sidebar.module.css';

const Sidebar = () => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

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
                    style={({ isActive }) => isActive ? {} : { color: 'var(--color-text-secondary)' }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Home
                </NavLink>
                <NavLink
                    to="/statistic"
                    className={({ isActive }) => `${s.link} ${isActive ? s.linkActive : ''}`}
                    style={({ isActive }) => isActive ? {} : { color: 'var(--color-text-secondary)' }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    Statistics
                </NavLink>

                {/* Exit */}
                <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className={`${s.link} ${s.linkDanger}`}
                    style={{ color: '#ef4444' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" x2="9" y1="12" y2="12" />
                    </svg>
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
