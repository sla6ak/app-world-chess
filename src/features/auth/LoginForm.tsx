import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { newToken } from "@redux/slices/token";
import { setUserName, setUserStats } from "@redux/slices/user";
import { useLoginUserMutation } from "@redux/api/authApi";
import { loginSchema } from "@helpers/validationForm";
import TitleApp from "@components/titleApp/TitleApp";
import GeneralButton from "@components/generalButton/GeneralButton";
import s from "./LoginForm.module.css";

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginUser] = useLoginUserMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleClickShowPassword = () => setShowPassword((prev) => !prev);

    const formik = useFormik({
        initialValues: {
            password: "",
            email: "",
        },
        validationSchema: loginSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                const respons: any = await loginUser(values);

                if (respons.error) {
                    toast.error("Email or password is wrong");
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

            <p className={s.desc}>Sign in to continue your chess journey</p>

            <form onSubmit={formik.handleSubmit} className={s.form} noValidate>
                {/* Email Field */}
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

                {/* Password Field */}
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
                            autoComplete="current-password"
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

                {/* Buttons */}
                <div className={s.btns}>
                    <GeneralButton bts="submit" type="submit" loading={isSubmitting}>
                        Log in
                    </GeneralButton>
                    <GeneralButton bts="ghost" onClick={() => navigate("/register", { replace: true })}>
                        Create an account
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

export default LoginForm;
