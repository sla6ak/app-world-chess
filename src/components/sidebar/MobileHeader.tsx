import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import UserMenu from "@components/userMenu/UserMenu";
import ThemeSwitcher from "@components/themeSwitcher/ThemeSwitcher";
import Modal from "@components/modal/Modal";
import ModalLogOut from "@components/modalLogOut/modalLogOut";

const MobileHeader = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <>
            {/* Top header bar */}
            <header className="flex items-center justify-between px-4 py-2 bg-theme-secondary border-b border-theme-border/60 md:hidden shadow-md">
                {/* Brand */}
                <NavLink
                    to="/home"
                    className="flex items-center gap-2 no-underline"
                    style={{ color: "var(--color-text-primary)" }}
                    onClick={() => setMenuOpen(false)}
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-green flex items-center justify-center shadow-md">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold font-poppins tracking-tight">Chess-World</span>
                </NavLink>

                {/* Burger menu button */}
                <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-theme-hover transition-colors"
                    aria-label="Open menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-primary)" }}>
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
            </header>

            {/* Slide-out panel from right */}
            {showLogoutModal && (
                <Modal onModalClose={() => setShowLogoutModal(false)}>
                    <ModalLogOut
                        onModalClose={() => setShowLogoutModal(false)}
                        onAfterLogout={() => setShowLogoutModal(false)}
                    />
                </Modal>
            )}

            {menuOpen && (
                <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMenuOpen(false)}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

                    {/* Slide-out panel */}
                    <aside
                        className="absolute right-0 top-0 h-full w-72 bg-theme-secondary shadow-2xl flex flex-col border-l border-theme-border/60 transform transition-transform duration-300 ease-out"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Mobile navigation"
                    >
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-theme-border/40">
                            <span className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                                Menu
                            </span>
                            <button
                                type="button"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-theme-hover transition-colors"
                                aria-label="Close menu"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-secondary)" }}>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* User & Theme */}
                        <div className="flex flex-col items-center gap-3 px-4 py-4 border-b border-theme-border/40">
                            <UserMenu />
                            <ThemeSwitcher />
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-3 py-4 space-y-1 overflow-auto">
                            <NavLink
                                to="/home"
                                end
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-accent/10 text-accent border border-accent/20"
                                            : "text-theme-secondary hover:bg-theme-hover hover:text-theme-primary"
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
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-accent/10 text-accent border border-accent/20"
                                            : "text-theme-secondary hover:bg-theme-hover hover:text-theme-primary"
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
                                onClick={() => {
                                    setMenuOpen(false);
                                    setShowLogoutModal(true);
                                }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" x2="9" y1="12" y2="12" />
                                </svg>
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
