import React from "react";

interface GeneralButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  bts: "submit" | "link" | "ghost" | "danger";
  fullWidth?: boolean;
  loading?: boolean;
};

const GeneralButton = ({ bts, fullWidth, children, disabled, loading, ...props }: GeneralButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 w-full h-[50px] rounded-xl font-semibold text-sm leading-6 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const variantClasses =
    bts === "submit"
      ? "bg-accent text-text-on-accent border border-accent hover:bg-hoverAccent hover:shadow-glow active:scale-[0.97] focus-visible:ring-accent"
      : bts === "ghost"
      ? "bg-transparent text-text border border-accent/30 hover:bg-accent/10 hover:border-accent/50 active:scale-[0.97] focus-visible:ring-accent"
      : bts === "link"
      ? "bg-accent/5 text-accent border border-accent/20 hover:bg-accent/10 active:scale-[0.97] focus-visible:ring-accent"
      : "bg-error/10 text-error border border-error/20 hover:bg-error/20 active:scale-[0.97] focus-visible:ring-error";

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button className={`${baseClasses} ${variantClasses} ${widthClass}`} disabled={disabled || loading} {...props}>
      {loading && (
        <svg className="animate-spin -ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default GeneralButton;
