import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import UserMenu from "@components/userMenu/UserMenu";
import ThemeSwitcher from "@components/themeSwitcher/ThemeSwitcher";
import Modal from "@components/modal/Modal";
import ModalLogOut from "@features/auth/ModalLogOut";
import s from "./GameHeader.module.css";

const renderIcon = (icon: React.ReactNode, size = 18) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {icon}
    </svg>
);

const GameHeader: React.FC = () => {
    const [peekOpen, setPeekOpen] = useState(false); // desktop dropdown
    const [menuOpen, setMenuOpen] = useState(false); // mobile burger panel
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const desktopWrapRef = React.useRef<HTMLDivElement>(null);

    // Close the dropdown on click-outside / Esc (pinned / touch mode)
    useEffect(() => {
        if (!peekOpen) return;
        const onDocClick = (e: MouseEvent) => {
            if (desktopWrapRef.current && !desktopWrapRef.current.contains(e.target as Node)) {
                setPeekOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setPeekOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [peekOpen]);

    // Lock page scroll while mobile menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    const openLogout = () => {
        setMenuOpen(false);
        setShowLogoutModal(true);
    };

    // During an active game the Home / Statistics links are hidden so they
    // don't distract the player. Only the Exit action remains available.

    const exitButton = (
        <button
            type="button"
            onClick={openLogout}
            className={`${s.link} ${s.linkDanger}`}
        >
            {renderIcon(
                <>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                </>
            )}
            Exit
        </button>
    );

    const logo = (
        <NavLink to="/home" className={s.logo} onClick={() => setMenuOpen(false)}>
            <div className={s.logoIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
            </div>
            <span className={s.brand}>Chess-World</span>
        </NavLink>
    );

    return (
        <>
            {/* ═══ Desktop: hover / tap to drop down ═══ */}
            <div
                ref={desktopWrapRef}
                className={`${s.desktopWrap} ${peekOpen ? s.desktopWrapOpen : ""}`}
                onMouseEnter={() => setPeekOpen(true)}
                onMouseLeave={() => setPeekOpen(false)}
                onTouchStart={() => setPeekOpen((v) => !v)}
            >
                <header className={s.desktopBar}>
                    <div className={s.barInner}>
                        {logo}
                        <div className={s.desktopUser}>
                            <ThemeSwitcher />
                            <UserMenu />
                            {exitButton}
                        </div>
                    </div>
                </header>
                {/* Full-width hover zone at the screen edge + visual grab handle */}
                <div className={s.peekZone} aria-hidden="true" />
                <button
                    type="button"
                    className={s.peekHandle}
                    onClick={(e) => {
                        e.stopPropagation();
                        setPeekOpen((v) => !v);
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    aria-label={peekOpen ? "Скрыть меню" : "Показать меню"}
                    aria-expanded={peekOpen}
                >
                    <span className={s.peekGrip}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </span>
                </button>
            </div>

            {/* ═══ Mobile: permanent compact header ═══ */}
            <header className={s.mobileBar}>
                <div className={s.barInner}>
                    {logo}
                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        className={s.menuBtn}
                        aria-label="Открыть меню"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* ═══ Mobile slide-out panel ═══ */}
            {menuOpen && (
                <div className={s.overlay} onClick={() => setMenuOpen(false)}>
                    <div className={s.overlayBg} />
                    <aside
                        className={s.panel}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Мобильная навигация"
                    >
                        <div className={s.panelHead}>
                            <span className={s.menuLabel}>Menu</span>
                            <button
                                type="button"
                                onClick={() => setMenuOpen(false)}
                                className={s.menuBtn}
                                aria-label="Закрыть меню"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className={s.userSection}>
                            <UserMenu />
                            <ThemeSwitcher />
                        </div>

                        <nav className={s.panelNav}>{exitButton}</nav>
                    </aside>
                </div>
            )}

            {/* Logout modal */}
            {showLogoutModal && (
                <Modal onModalClose={() => setShowLogoutModal(false)}>
                    <ModalLogOut
                        onModalClose={() => setShowLogoutModal(false)}
                        onAfterLogout={() => setShowLogoutModal(false)}
                    />
                </Modal>
            )}
        </>
    );
};

export default GameHeader;
