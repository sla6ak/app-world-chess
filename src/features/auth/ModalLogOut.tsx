import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { newToken } from "@redux/slices/token";
import { resetUser } from "@redux/slices/user";
import { toast } from "react-toastify";
import GeneralButton from "@components/generalButton/GeneralButton";

const ModalLogOut = ({ onModalClose, onAfterLogout }: any) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userName = useSelector((state: any) => state.user.userName);

    const logOut = () => {
        toast.info(`${userName} is successful log out`);
        dispatch(newToken(""));
        dispatch(resetUser());
        if (onAfterLogout) onAfterLogout();
        navigate("/login");
    };

    return (
        <div className="text-center">
            <h3 className="text-xl font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>
                Log Out
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                Are you sure you want to log out?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <div className="w-full sm:w-[160px]">
                    <GeneralButton bts={"submit"} onClick={logOut} type="submit">
                        Yes
                    </GeneralButton>
                </div>
                <div className="w-full sm:w-[160px]">
                    <GeneralButton bts={"ghost"} onClick={onModalClose} type="button">
                        No
                    </GeneralButton>
                </div>
            </div>
        </div>
    );
};

export default ModalLogOut;
