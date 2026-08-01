import React from "react";
import s from "./TitleApp.module.css";

const TitleApp = () => {
    return (
        <div className={s.root}>
            <h1 className={s.title} style={{ fontSize: 'clamp(1.25rem, 3vw, 1.875rem)', lineHeight: 1.5 }}>
                Chess-World
            </h1>
        </div>
    );
};

export default TitleApp;
