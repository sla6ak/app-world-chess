import React from "react";
import LoginForm from "@features/auth/LoginForm";
import BackgroundPage from "@features/home/BackgroundPage";

const LoginPage = () => {
    return (
        <BackgroundPage>
            <LoginForm />
        </BackgroundPage>
    );
};

export default LoginPage;
