import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Auth.module.css";
import authService from "../services/auth.service";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Введите email и пароль");
            return;
        }
        try {
            await authService.login({ email, password });
            navigate("/verify2fa", { state: { email } });
        } catch (err) {
            console.error("Ошибка входа:", err);
            setError("Ошибка входа. Пожалуйста, проверьте email и пароль.");
        }
    };

    return (
        <motion.div
            className={styles.authContainer}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className={styles.authTitle}>Вход</h2>
            <form className={`${styles.authBox} ${styles.authForm}`} onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    className={styles.authInput}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    className={styles.authInput}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className={styles.errorText}>{error}</p>}
                <button type="submit" className={styles.authButton}>Войти</button>
                
                <div className={styles.authToggle}>
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </div>
                <div className={styles.authToggle}>
                    <Link to="/">Вернуться на главную</Link>
                </div>
            </form>
        </motion.div>
    );
};

export default Login;
