import { SpinnerDotted } from "spinners-react";
import s from "./Loader.module.css";

function Loader() {
    return (
        <div className={s.root}>
            <SpinnerDotted size={48} thickness={100} speed={100} color="var(--color-accent)" />
            <span className={s.text}>Loading...</span>
        </div>
    );
}

export default Loader;
