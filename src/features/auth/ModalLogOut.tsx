import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { newToken } from "@redux/slices/token";
import { resetUser } from "@redux/slices/user";
import { toast } from "react-toastify";
import GeneralButton from "@components/generalButton/GeneralButton";
import s from "./ModalLogOut.module.css";

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
        <div className={s.root}>
            <h3 className={s.title} style={{ color: "var(--color-text-primary)" }}>
                Log Out
            </h3>
            <p className={s.desc} style={{ color: "var(--color-text-secondary)" }}>
                Are you sure you want to log out?
            </p>
            <div className={s.btns}>
                <div className={s.btnWrap} style={{ width: 160 }}>
                    <GeneralButton bts={"submit"} onClick={logOut} type="submit">
                        Yes
                    </GeneralButton>
                </div>
                <div className={s.btnWrap} style={{ width: 160 }}>
                    <GeneralButton bts={"ghost"} onClick={onModalClose} type="button">
                        No
                    </GeneralButton>
                </div>
            </div>
        </div>
    );
};

export default ModalLogOut;
