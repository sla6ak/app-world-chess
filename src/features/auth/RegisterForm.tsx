import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useRegistrationUserMutation } from "@redux/api/authApi";
import { registerSchema } from "@helpers/validationForm";
import GeneralButton from "@components/generalButton/GeneralButton";
import TitleApp from "@components/titleApp/TitleApp";
import s from "./RegisterForm.module.css";

const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createUser] = useRegistrationUserMutation();
    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword((prev) => !prev);

    const formik = useFormik({
        initialValues: { firstName: "", password: "", email: "", dublePassword: "" },
        validationSchema: registerSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                const respons: any = await createUser({
                    name: values.firstName,
                    password: values.password,
                    email: values.email,
                });
                if (respons.error) {
                    toast.error("User not created");
                    return;
                }
                if (respons.data.name) {
                    toast.success("User created! Login please...");
                    navigate("/login", { replace: true });
                }
            } catch (error) {
                console.log(error);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return (
        <div className={s.card}>
            {/* Decorative top accent bar */}
            <div className={s.gradient} />

            <TitleApp />

            <p className={s.desc}>Create your account and start playing</p>

            <form onSubmit={formik.handleSubmit} className={s.form} noValidate>
                {/* First Name */}
                <div className={s.field}>
                    <label
                        htmlFor="firstName"
                        className={`${s.label}${formik.touched.firstName && formik.errors.firstName ? ` ${s.labelError}` : ''}`}
                    >
                        First Name
                    </label>
                    <div className={s.inputWrap}>
                        <span className={s.inputIcon}>
                            <PersonIcon />
                        </span>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            autoComplete="given-name"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.firstName}
                            placeholder="Your name"
                            className={`${s.input} ${s.inputPl}${formik.touched.firstName && formik.errors.firstName ? ` ${s.inputError}` : ''}`}
                        />
                    </div>
                    <span className={s.errorMsg}>
                        {formik.touched.firstName && formik.errors.firstName ? formik.errors.firstName : ""}
                    </span>
                </div>

                {/* Email */}
                <div className={s.field}>
                    <label
                        htmlFor="email"
                        className={`${s.label}${formik.touched.email && formik.errors.email ? ` ${s.labelError}` : ''}`}
                    >
                        Email Address
                    </label>
                    <div className={s.inputWrap}>
                        <span className={s.inputIcon}>
                            <EmailIcon />
                        </span>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            placeholder="you@example.com"
                            required
                            className={`${s.input} ${s.inputPl}${formik.touched.email && formik.errors.email ? ` ${s.inputError}` : ''}`}
                        />
                    </div>
                    <span className={s.errorMsg}>
                        {formik.touched.email && formik.errors.email ? formik.errors.email : ""}
                    </span>
                </div>

                {/* Password */}
                <div className={s.field}>
                    <label
                        htmlFor="password"
                        className={`${s.label}${formik.touched.password && formik.errors.password ? ` ${s.labelError}` : ''}`}
                    >
                        Password
                    </label>
                    <div className={s.inputWrap}>
                        <span className={s.inputIcon}>
                            <LockIcon />
                        </span>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            placeholder="••••••••"
                            required
                            className={`${s.input} ${s.inputPr}${formik.touched.password && formik.errors.password ? ` ${s.inputError}` : ''}`}
                        />
                        <button
                            type="button"
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            className={s.toggle}
                            tabIndex={-1}
                        >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </button>
                    </div>
                    <span className={s.errorMsg}>
                        {formik.touched.password && formik.errors.password ? formik.errors.password : ""}
                    </span>
                </div>

                {/* Confirm Password */}
                <div className={s.field}>
                    <label
                        htmlFor="dublePassword"
                        className={`${s.label}${formik.touched.dublePassword && formik.errors.dublePassword ? ` ${s.labelError}` : ''}`}
                    >
                        Confirm password
                    </label>
                    <div className={s.inputWrap}>
                        <span className={s.inputIcon}>
                            <LockIcon />
                        </span>
                        <input
                            id="dublePassword"
                            name="dublePassword"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.dublePassword}
                            placeholder="••••••••"
                            required
                            className={`${s.input} ${s.inputPr}${formik.touched.dublePassword && formik.errors.dublePassword ? ` ${s.inputError}` : ''}`}
                        />
                        <button
                            type="button"
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            className={s.toggle}
                            tabIndex={-1}
                        >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </button>
                    </div>
                    <span className={s.errorMsg}>
                        {formik.touched.dublePassword && formik.errors.dublePassword ? formik.errors.dublePassword : ""}
                    </span>
                </div>

                {/* Buttons */}
                <div className={s.btns}>
                    <GeneralButton bts="submit" type="submit" loading={isSubmitting}>
                        Register
                    </GeneralButton>
                    <GeneralButton bts="ghost" onClick={() => navigate("/login", { replace: true })}>
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
                    <Link to="/" className={s.link}>
                        Home
                    </Link>
                    <span className={s.sep} />
                    <Link to="/" className={s.link}>
                        About
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;
