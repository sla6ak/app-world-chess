import React from "react";
import GeneralButton from "@components/generalButton/GeneralButton";
import { SpinnerDotted } from "spinners-react";

const ModalFindGame = ({ onModalClose }: any) => {
    return (
        <div className="text-center">
            <h3 className="text-xl font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>
                Game search
            </h3>
            <div className="flex justify-center my-4">
                <SpinnerDotted size={48} thickness={100} speed={100} color="var(--color-green)" />
            </div>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                Are you sure you want to cancel game search?
            </p>
            <div className="flex justify-center">
                <div className="w-full sm:w-[200px]">
                    <GeneralButton bts={"submit"} onClick={onModalClose} type="submit">
                        Yes
                    </GeneralButton>
                </div>
            </div>
        </div>
    );
};

export default ModalFindGame;
