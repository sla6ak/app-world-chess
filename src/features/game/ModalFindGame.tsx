import React from "react";
import GeneralButton from "@components/generalButton/GeneralButton";
import { SpinnerDotted } from "spinners-react";
import s from "./ModalFindGame.module.css";

const ModalFindGame = ({
    onCancel,
}: {
    onCancel: () => void;
}) => {
    return (
        <div className={s.root}>
            <h3 className={s.title} style={{ color: "var(--color-text-primary)" }}>
                Searching for opponent
            </h3>
            <div className={s.spinner}>
                <SpinnerDotted size={48} thickness={100} speed={100} color="var(--color-green)" />
            </div>
            <p className={s.desc} style={{ color: "var(--color-text-secondary)" }}>
                Looking for a player with similar rating...
            </p>
            <div className={s.btnRow}>
                <div className={s.btnWrap} style={{ width: 200 }}>
                    <GeneralButton bts={"ghost"} onClick={onCancel} type="button">
                        Cancel
                    </GeneralButton>
                </div>
            </div>
        </div>
    );
};

export default ModalFindGame;
