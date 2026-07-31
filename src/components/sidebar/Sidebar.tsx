import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import UserMenu from '@components/userMenu/UserMenu';
import ThemeSwitcher from '@components/themeSwitcher/ThemeSwitcher';
import Modal from '@components/modal/Modal';
import ModalLogOut from '@features/auth/ModalLogOut';

const Sidebar = () => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <aside className="hidden md:flex flex-col w-64 bg-theme-secondary shadow-xl md:w-72 border-r border-theme-border/60" aria-label="Sidebar navigation">
            {/* Brand */}
            <NavLink
                to="/home"
                className="flex items-center gap-3 px-5 py-5 no-underline transition-all duration-200 hover:bg-theme-hover"
                style={{ color: "var(--color-text-primary)" }}
            >
                {/* Chess knight icon */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-green flex items-center justify-center shadow-md">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>
                <span className="text-xl font-bold font-poppins tracking-tight">Chess-World</span>
            </NavLink>

            {/* User & Theme */}
            <div className="flex flex-col items-center gap-3 px-4 py-4 border-b border-theme-border/40">
                <UserMenu />
                <ThemeSwitcher />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                <NavLink
                    to="/home"
                    end
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive
                                ? 'bg-accent/10 text-accent border border-accent/20'
                                : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
                        }`
                    }
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
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive
                                ? 'bg-accent/10 text-accent border border-accent/20'
                                : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
                        }`
                    }
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
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300"
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
