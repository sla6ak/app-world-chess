import chess from "../../images/chess.jpg";

const BackgroundPage = ({ children }: any) => {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-theme-primary relative overflow-hidden">
            {/* Chess background image — optimized with subtle overlay */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: `url(${chess})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Dark vignette overlay */}
            <div className="fixed inset-0 z-[1] bg-gradient-to-br from-black/60 via-black/40 to-black/50" />

            {/* Subtle frosted glass — lightweight, no backdrop-filter */}
            <div className="fixed inset-0 z-[2] bg-white/5" />

            {/* Grid pattern for texture */}
            <div className="fixed inset-0 z-[3] opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(var(--color-text-on-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-on-accent) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Content above overlay */}
            <div className="relative z-30 w-full">{children}</div>
        </div>
    );
};

export default BackgroundPage;
