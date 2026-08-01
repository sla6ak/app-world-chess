import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import s from "./DashboardPage.module.css";

// eslint-disable-next-line @typescript-eslint/no-redeclare
type PropTypes = {
    curentG: any;
};

const DashboardPage: React.FC<PropTypes> = ({ curentG }) => {
    const navigate = useNavigate();
    useEffect(() => {
        if (!curentG) {
            navigate("/home");
        } else {
            navigate("/game");
        }
    }, [curentG, navigate]);

    return (
        <div className={s.root}>
            {/* Content sits above the background */}
            <div className={s.content}>
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardPage;
