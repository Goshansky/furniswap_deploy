import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Auth.module.css";
import authService from "../services/auth.service";

const Register = () => {
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !lastName || !email || !password) {
            setError("Пожалуйста, заполните все поля");
            return;
        }
        
        try {
            await authService.register({
                name,
                last_name: lastName,
                email,
                password
            });
            navigate("/verify", { state: { email } });
        } catch (err) {
            console.error("Ошибка регистрации:", err);
            setError("Ошибка регистрации. Пожалуйста, попробуйте еще раз.");
        }
    };

    return (
        <motion.div
            className={styles.authContainer}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className={styles.authTitle}>Регистрация</h2>
            <form className={`${styles.authBox} ${styles.authForm}`} onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Имя"
                    className={styles.authInput}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Фамилия"
                    className={styles.authInput}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
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
                <button type="submit" className={styles.authButton}>Зарегистрироваться</button>
                
                <div className={styles.authToggle}>
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </div>
                <div className={styles.authToggle}>
                    <Link to="/">Вернуться на главную</Link>
                </div>
            </form>
        </motion.div>
    );
};

export default Register;
