import chess from "../../images/chess.jpg";
import s from "./BackgroundPage.module.css";

const BackgroundPage = ({ children }: any) => {
    return (
        <div className={s.root}>
            {/* Chess background image — optimized with subtle overlay */}
            <div
                className={s.bg}
                style={{
                    backgroundImage: `url(${chess})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Dark vignette overlay */}
            <div className={s.vignette} style={{ background: 'linear-gradient(to bottom right, rgba(0,0,0,0.6), rgba(0,0,0,0.4), rgba(0,0,0,0.5))' }} />

            {/* Subtle frosted glass */}
            <div className={s.glass} />

            {/* Grid pattern for texture */}
            <div className={s.grid} style={{ backgroundImage: 'linear-gradient(var(--color-text-on-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-on-accent) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Content above overlay */}
            <div className={s.content}>{children}</div>
        </div>
    );
};

export default BackgroundPage;
