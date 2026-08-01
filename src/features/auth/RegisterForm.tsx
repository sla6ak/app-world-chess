import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { useRegistrationUserMutation } from "@redux/api/authApi";
import { registerSchema } from "@helpers/validationForm";
import GeneralButton from "@components/generalButton/GeneralButton";
import TitleApp from "@components/titleApp/TitleApp";
import s from "./RegisterForm.module.css";

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
        <div className={s.card} style={{ borderColor: 'rgba(102,53,23,0.5)' }}>
            {/* Decorative top accent bar */}
            <div className={s.gradient} style={{ backgroundImage: 'linear-gradient(to right, var(--color-accent), var(--color-green), var(--color-purple))' }} />

            <TitleApp />

            <p className={s.desc} style={{ maxWidth: 320 }}>
                Create your account and start playing
            </p>

            <form onSubmit={formik.handleSubmit} className={s.form}>
                {/* First Name */}
                <div className={s.field}>
                    <label htmlFor="firstName" className={s.label}>
                        {formik.touched.firstName && formik.errors.firstName ? formik.errors.firstName : "First Name"}
                    </label>
                    <div className={s.inputWrap}>
                        <span className={s.inputIcon}>
                            <AccountIcon />
                        </span>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.firstName}
                            placeholder="Your name"
                            className={`${s.input} ${s.inputPl}`}
                            style={{ borderColor: 'rgba(102,53,23,0.3)' }}
                        />
                    </div>
                </div>

                {/* Email */}
                <div className={s.field}>
                    <label htmlFor="email" className={s.label}>
                        {formik.touched.email && formik.errors.email ? formik.errors.email : "Email Address"}
                    </label>
                    <div className={s.inputWrap}>
                        <span className={s.inputIcon}>
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
                            className={`${s.input} ${s.inputPl}`}
                            style={{ borderColor: 'rgba(102,53,23,0.3)' }}
                        />
                    </div>
                </div>

                {/* Password */}
                <div className={s.field}>
                    <label htmlFor="password" className={s.label}>
                        {formik.touched.password && formik.errors.password ? formik.errors.password : "Password"}
                    </label>
                    <div className={s.inputWrap}>
                        <span className={s.inputIcon}>
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
                            className={`${s.input} ${s.inputPr}`}
                            style={{ borderColor: 'rgba(102,53,23,0.3)' }}
                        />
                        <button
                            type="button"
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            className="abs r3 t50 tyn5 tr d2 tm ht1"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div className={s.field}>
                    <label htmlFor="dublePassword" className={s.label}>
                        {formik.touched.dublePassword && formik.errors.dublePassword ? formik.errors.dublePassword : "Confirm password"}
                    </label>
                    <div className={s.inputWrap}>
                        <span className={s.inputIcon}>
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
                            className={`${s.input} ${s.inputPr}`}
                            style={{ borderColor: 'rgba(102,53,23,0.3)' }}
                        />
                        <button
                            type="button"
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            className="abs r3 t50 tyn5 tr d2 tm ht1"
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </button>
                    </div>
                </div>

                {/* Buttons */}
                <div className={s.btns}>
                    <GeneralButton bts={"submit"} disabled={disabled} type="submit">
                        Register
                    </GeneralButton>
                    <GeneralButton bts={"ghost"} onClick={() => navigate("/login", { replace: true })}>
                        Already have an account? Log in
                    </GeneralButton>
                </div>

                {/* Divider */}
                <div className={s.divider}>
                    <div className={s.dividerLine} />
                    <span className={s.dividerText}>or</span>
                    <div className={s.dividerLine} />
                </div>

                {/* Quick links */}
                <div className={s.links}>
                    <a href="/" className={s.link} style={{ textDecoration: 'none' }}>
                        Home
                    </a>
                    <span className={s.sep}>|</span>
                    <a href="/" className={s.link} style={{ textDecoration: 'none' }}>
                        About
                    </a>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;
