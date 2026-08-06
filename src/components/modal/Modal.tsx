import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import s from "./Modal.module.css";

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" x2="6" y1="6" y2="18" />
        <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
);

const element: HTMLElement = document.getElementById("modal")!;

interface ModalProps {
    onModalClose: () => void;
    children: React.ReactNode;
}

const Modal = ({ onModalClose, children }: ModalProps) => {
    const mouseDownClose = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onModalClose();
        }
    };

    useEffect(() => {
        const keyDownClose = (e: KeyboardEvent) => {
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
        <div className={s.overlay} onClick={mouseDownClose}>
            <div
                className={s.content}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    aria-label="Close modal"
                    className={s.close}
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
