import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { newToken } from "@redux/sliceToken";
import { setUserName, setUserStats } from "@redux/userSlice";
import { useLoginUserMutation } from "@redux/authAPI";
import { loginSchema } from "@helpers/validationForm";
import TitleApp from "@components/titleApp/TitleApp";
import GeneralButton from "@components/generalButton/GeneralButton";

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

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [loginUser] = useLoginUserMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const formik = useFormik({
        initialValues: {
            password: "",
            email: "",
        },
        validationSchema: loginSchema,
        onSubmit: async (values) => {
            setDisabled(true);
            try {
                const respons: any = await loginUser(values);

                if (respons.error) {
                    toast.error("Email or password is wrong");
                    setDisabled(false);
                    return;
                }
                if (respons.data.user.name) {
                    dispatch(newToken(respons.data.user.token));
                    dispatch(setUserName(respons.data.user.name));
                    dispatch(
                        setUserStats({
                            rating: respons.data.user.currentReiting ?? 800,
                            gamesPlayed: respons.data.user.gamesPlayed ?? 0,
                            wins: respons.data.user.wins ?? 0,
                            losses: respons.data.user.losses ?? 0,
                            draws: respons.data.user.draws ?? 0,
                            maxRating: respons.data.user.maxRating ?? 800,
                        })
                    );
                    toast.success(`Welcome ${respons.data.user.name}!`);
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
                Sign in to continue your chess journey
            </p>

            <form onSubmit={formik.handleSubmit} className="w-full max-w-[410px]">
                {/* Email Field */}
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

                {/* Password Field */}
                <div className="mb-6">
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

                {/* Buttons */}
                <div className="flex flex-col gap-3 mt-8">
                    <GeneralButton bts={"submit"} disabled={disabled} type="submit">
                        Log in
                    </GeneralButton>
                    <GeneralButton bts={"ghost"} onClick={() => navigate("/register", { replace: true })}>
                        Create an account
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

export default LoginForm;
