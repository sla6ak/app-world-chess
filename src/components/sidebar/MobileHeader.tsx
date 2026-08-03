import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import GridViewIcon from "@mui/icons-material/GridView";
import BarChartIcon from "@mui/icons-material/BarChart";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import UserMenu from "@components/userMenu/UserMenu";
import ThemeSwitcher from "@components/themeSwitcher/ThemeSwitcher";
import Modal from "@components/modal/Modal";
import ModalLogOut from "@features/auth/ModalLogOut";
import useCurrentGameNavigation from "@hooks/useCurrentGameNavigation";
import s from "./MobileHeader.module.css";

const MobileHeader = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { handleCurrentGame, checkingGame } = useCurrentGameNavigation();

    const handleCurrentGameClick = () => {
        setMenuOpen(false);
        handleCurrentGame();
    };

    return (
        <>
            {/* Top header bar */}
            <header className={s.header}>
                {/* Brand */}
                <NavLink
                    to="/home"
                    className={s.logo}
                    style={{ color: "var(--color-text-primary)" }}
                    onClick={() => setMenuOpen(false)}
                >
                    <div className={s.logoIcon} style={{ backgroundImage: 'linear-gradient(to bottom right, var(--color-accent), var(--color-green))' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className={s.brand}>Chess-World</span>
                </NavLink>

                {/* Burger menu button */}
                <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    className={s.menuBtn}
                    aria-label="Open menu"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    <MenuIcon />
                </button>
            </header>

            {/* Logout modal */}
            {showLogoutModal && (
                <Modal onModalClose={() => setShowLogoutModal(false)}>
                    <ModalLogOut
                        onModalClose={() => setShowLogoutModal(false)}
                        onAfterLogout={() => setShowLogoutModal(false)}
                    />
                </Modal>
            )}

            {/* Slide-out panel */}
            {menuOpen && (
                <div className={s.overlay} onClick={() => setMenuOpen(false)}>
                    {/* Backdrop */}
                    <div className={s.overlayBg} />

                    {/* Panel */}
                    <aside
                        className={s.panel}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Mobile navigation"
                    >
                        {/* Panel header */}
                        <div className={s.panelHead}>
                            <span className={s.menuLabel} style={{ color: "var(--color-text-secondary)" }}>
                                Menu
                            </span>
                            <button
                                type="button"
                                onClick={() => setMenuOpen(false)}
                                className={s.menuBtn}
                                aria-label="Close menu"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        {/* User & Theme */}
                        <div className={s.userSection}>
                            <UserMenu />
                            <ThemeSwitcher />
                        </div>

                        {/* Navigation */}
                        <nav className={s.panelNav}>
                            <NavLink
                                to="/home"
                                end
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) => `${s.panelLink} ${isActive ? s.panelLinkActive : ''}`}
                                style={({ isActive }) => isActive ? {} : { color: 'var(--color-text-secondary)' }}
                            >
                                <GridViewIcon className={s.icon} />
                                Home
                            </NavLink>
                            <NavLink
                                to="/statistic"
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) => `${s.panelLink} ${isActive ? s.panelLinkActive : ''}`}
                                style={({ isActive }) => isActive ? {} : { color: 'var(--color-text-secondary)' }}
                            >
                                <BarChartIcon className={s.icon} />
                                Statistics
                            </NavLink>

                            {/* Current game */}
                            <button
                                type="button"
                                onClick={handleCurrentGameClick}
                                disabled={checkingGame}
                                className={s.panelLink}
                            >
                                <PlayCircleOutlineIcon className={s.icon} />
                                Current game
                            </button>

                            {/* Exit */}
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    setShowLogoutModal(true);
                                }}
                                className={`${s.panelLink} ${s.panelLinkDanger}`}
                            >
                                <LogoutIcon className={s.icon} />
                                Exit
                            </button>
                        </nav>
                    </aside>
                </div>
            )}
        </>
    );
};

export default MobileHeader;
