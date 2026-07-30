import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function PrivateRoute({ children }: any) {
    const curentUser = useSelector((state: any) => state.user.userName);
    return curentUser.length > 0 ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
