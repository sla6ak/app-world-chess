import React from "react";
import RegisterForm from "@features/auth/RegisterForm";
import BackgroundPage from "@features/home/BackgroundPage";

const RegisterPage = () => {
    return (
        <BackgroundPage>
            <RegisterForm />
        </BackgroundPage>
    );
};

export default RegisterPage;
