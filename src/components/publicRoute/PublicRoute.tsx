import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function PublicRoute({ children }: any) {
    const curentName = useSelector((state: any) => state.user.userName);

    return curentName.length === 0 ? children : <Navigate to="/" />;
}

export default PublicRoute;
