import React from "react";
import GeneralButton from "@components/generalButton/GeneralButton";
import { SpinnerDotted } from "spinners-react";

const ModalFindGame = ({
    onCancel,
}: {
    onCancel: () => void;
}) => {
    return (
        <div className="text-center">
            <h3 className="text-xl font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>
                Searching for opponent
            </h3>
            <div className="flex justify-center my-4">
                <SpinnerDotted size={48} thickness={100} speed={100} color="var(--color-green)" />
            </div>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                Looking for a player with similar rating...
            </p>
            <div className="flex justify-center">
                <div className="w-full sm:w-[200px]">
                    <GeneralButton bts={"ghost"} onClick={onCancel} type="button">
                        Cancel
                    </GeneralButton>
                </div>
            </div>
        </div>
    );
};

export default ModalFindGame;
