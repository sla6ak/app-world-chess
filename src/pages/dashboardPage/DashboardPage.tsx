import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col h-full bg-theme-primary md:flex-row md:max-h-screen">
            {/* Content sits above the background */}
            <div className="relative z-20 min-h-full w-full">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardPage;
