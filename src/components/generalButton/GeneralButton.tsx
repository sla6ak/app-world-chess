import React from "react";
import s from "./GeneralButton.module.css";

interface GeneralButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  bts: "submit" | "link" | "ghost" | "danger";
  fullWidth?: boolean;
  loading?: boolean;
};

const GeneralButton = ({ bts, fullWidth, children, disabled, loading, ...props }: GeneralButtonProps) => {
  const variantClass =
    bts === "submit"
      ? s.btnPrimary
      : bts === "ghost"
      ? s.btnGhost
      : bts === "link"
      ? s.btnLink
      : s.btnDanger;

  return (
    <button className={`${s.btn} ${variantClass} ${fullWidth ? s.fullWidth : ""}`} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className={s.spin} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className={s.spinCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className={s.spinPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default GeneralButton;
