import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useRegistrationUserMutation } from "@redux/authAPI";
import { registerSchema } from "@helpers/validationForm";
import GeneralButton from "@components/generalButton/GeneralButton";
import TitleApp from "@components/titleApp/TitleApp";

const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const AccountIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M21 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    </svg>
);

const VisibilityIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const VisibilityOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
);

const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [createUser] = useRegistrationUserMutation();
    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const formik = useFormik({
        initialValues: { firstName: "", password: "", email: "", dublePassword: "" },
        validationSchema: registerSchema,
        onSubmit: async (values) => {
            setDisabled(true);
            if (values.password !== values.dublePassword) {
                toast.error("Passwords do not match");
                setDisabled(false);
                return;
            }
            try {
                const respons: any = await createUser({
                    name: values.firstName,
                    password: values.password,
                    email: values.email,
                });
                if (respons.error) {
                    toast.error("User not created");
                    setDisabled(false);
                    return;
                }
                if (respons.data.name) {
                    toast.success("User created! Login please...");
                    navigate("/login", { replace: true });
                }
            } catch (error) {
                console.log(error);
            }
            setDisabled(false);
        },
    });

    return (
        <div className="relative z-30 flex flex-col justify-center items-center w-full max-w-md mx-auto px-4 py-10 md:px-8 md:py-12 md:mx-auto md:rounded-2xl md:shadow-2xl bg-theme-secondary border border-theme-border/50">
            {/* Decorative top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-accent via-green to-purpure opacity-60" />

            <TitleApp />

            <p className="text-sm mt-3 mb-8 text-theme-secondary text-center max-w-[320px]">
                Create your account and start playing
            </p>

            <form onSubmit={formik.handleSubmit} className="w-full max-w-[410px]">
                {/* First Name */}
                <div className="mb-5">
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-theme-secondary">
                        {formik.touched.firstName && formik.errors.firstName ? formik.errors.firstName : "First Name"}
                    </label>
                    <div className="relative flex items-center group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 text-theme-muted group-focus-within:text-accent">
                            <AccountIcon />
                        </span>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.firstName}
                            placeholder="Your name"
                            className="input pl-10 hover:border-accent/50"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="mb-5">
                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-theme-secondary">
                        {formik.touched.email && formik.errors.email ? formik.errors.email : "Email Address"}
                    </label>
                    <div className="relative flex items-center group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 text-theme-muted group-focus-within:text-accent">
                            <MailIcon />
                        </span>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            onChange={formik.handleChange}
                            value={formik.values.email}
                            placeholder="you@example.com"
                            required
                            className="input pl-10 hover:border-accent/50"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="mb-5">
                    <label htmlFor="password" className="block text-sm font-medium mb-2 text-theme-secondary">
                        {formik.touched.password && formik.errors.password ? formik.errors.password : "Password"}
                    </label>
                    <div className="relative flex items-center group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 text-theme-muted group-focus-within:text-accent">
                            <LockIcon />
                        </span>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            onChange={formik.handleChange}
                            value={formik.values.password}
                            placeholder="••••••••"
                            required
                            className="input pl-10 pr-12 hover:border-accent/50"
                        />
                        <button
                            type="button"
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200 text-theme-muted hover:text-theme-primary"
                        >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-6">
                    <label htmlFor="dublePassword" className="block text-sm font-medium mb-2 text-theme-secondary">
                        {formik.touched.dublePassword && formik.errors.dublePassword ? formik.errors.dublePassword : "Confirm password"}
                    </label>
                    <div className="relative flex items-center group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 text-theme-muted group-focus-within:text-accent">
                            <LockIcon />
                        </span>
                        <input
                            id="dublePassword"
                            name="dublePassword"
                            type={showPassword ? "text" : "password"}
                            onChange={formik.handleChange}
                            value={formik.values.dublePassword}
                            placeholder="••••••••"
                            required
                            className="input pl-10 pr-12 hover:border-accent/50"
                        />
                        <button
                            type="button"
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200 text-theme-muted hover:text-theme-primary"
                        >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </button>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 mt-4">
                    <GeneralButton bts={"submit"} disabled={disabled} type="submit">
                        Register
                    </GeneralButton>
                    <GeneralButton bts={"ghost"} onClick={() => navigate("/login", { replace: true })}>
                        Already have an account? Log in
                    </GeneralButton>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-theme-border" />
                    <span className="text-xs text-theme-muted">or</span>
                    <div className="flex-1 h-px bg-theme-border" />
                </div>

                {/* Quick links */}
                <div className="flex justify-center gap-4 text-sm">
                    <a href="/" className="text-theme-secondary hover:text-accent transition-colors duration-200">
                        Home
                    </a>
                    <span className="text-theme-border">|</span>
                    <a href="/" className="text-theme-secondary hover:text-accent transition-colors duration-200">
                        About
                    </a>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;
