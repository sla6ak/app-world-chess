import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" x2="6" y1="6" y2="18" />
        <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
);

const element: HTMLElement = document.getElementById("modal")!;

const Modal = ({ onModalClose, children }: any) => {
    const mouseDownClose = (e: any) => {
        if (e.target === e.currentTarget) {
            onModalClose();
        }
    };

    useEffect(() => {
        const keyDownClose = (e: any) => {
            if (e.code === "Escape") {
                onModalClose();
            }
        };

        window.addEventListener("keydown", keyDownClose);
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", keyDownClose);
            document.body.style.overflow = "";
        };
    }, [onModalClose]);

    return createPortal(
        <div
            className="fixed inset-0 z-[99] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(4px)" }}
            onClick={mouseDownClose}
        >
            <div
                className="relative w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 animate-scale-in"
                style={{
                    backgroundColor: "var(--color-bg-secondary)",
                    boxShadow: "var(--shadow-modal)",
                    border: "1px solid var(--color-border)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    aria-label="Close modal"
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-theme-hover"
                    style={{ color: "var(--color-text-muted)" }}
                    onClick={onModalClose}
                >
                    <CloseIcon />
                </button>
                {children}
            </div>
        </div>,
        element!
    );
};

export default Modal;
