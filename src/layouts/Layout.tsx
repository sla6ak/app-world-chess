import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "@components/sidebar/Sidebar";
import MobileHeader from "@components/sidebar/MobileHeader";
import Loader from "@components/loader/Loader";
import s from "./Layout.module.css";

const Layout = () => {
    const userName = useSelector((state: any) => state.user.userName);
    const isAuthenticated = userName.length > 0;

    return (
        <Suspense fallback={<Loader />}>
            <div className={s.layout}>
                {isAuthenticated && <Sidebar />}
                {isAuthenticated && <MobileHeader />}
                <main className={s.main}>
                    <Outlet />
                </main>
            </div>
        </Suspense>
    );
};

export default Layout;
