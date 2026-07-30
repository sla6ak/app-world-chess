import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "@components/sidebar/Sidebar";
import MobileHeader from "@components/sidebar/MobileHeader";
import Loader from "../components/loader/Loader";

const Layout = () => {
    const userName = useSelector((state: any) => state.userName);
    const isAuthenticated = userName.length > 0;

    return (
        <Suspense fallback={<Loader />}>
            <div className="flex h-screen flex-col md:flex-row">
                {isAuthenticated && <Sidebar />}
                {isAuthenticated && <MobileHeader />}
                <main className={`flex-1 h-full overflow-auto ${isAuthenticated ? '' : 'w-full'}`}>
                    <Outlet />
                </main>
            </div>
        </Suspense>
    );
};

export default Layout;
