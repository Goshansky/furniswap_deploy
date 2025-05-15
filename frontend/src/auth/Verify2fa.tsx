import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Auth.module.css";
import authService from "../services/auth.service";

interface LocationState {
    email: string;
}

const Verify2fa = () => {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const { email } = (location.state as LocationState) || { email: "" };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) {
            setError("Введите код двухфакторной аутентификации");
            return;
        }
        if (!email) {
            setError("Email не указан. Пожалуйста, вернитесь к странице входа.");
            return;
        }
        try {
            await authService.verify2fa({ email, code });
            navigate("/"); // Перенаправление на главную страницу после авторизации
        } catch (err) {
            console.error("Ошибка двухфакторной аутентификации:", err);
            setError("Неверный код. Пожалуйста, попробуйте снова.");
        }
    };

    if (!email) {
        return (
            <div className={styles.authContainer}>
                <h2 className={styles.authTitle}>Ошибка</h2>
                <p className={styles.errorText}>Email не указан. Пожалуйста, вернитесь к странице входа.</p>
                <button 
                    onClick={() => navigate("/login")} 
                    className={styles.authButton}
                >
                    Вернуться ко входу
                </button>
            </div>
        );
    }

    return (
        <motion.div
            className={styles.authContainer}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className={styles.authTitle}>Двухфакторная аутентификация</h2>
            <p>Мы отправили код подтверждения на адрес: {email}</p>
            <form className={`${styles.authBox} ${styles.authForm}`} onSubmit={handleVerify}>
                <input
                    type="text"
                    placeholder="Код 2FA"
                    className={styles.authInput}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                />
                {error && <p className={styles.errorText}>{error}</p>}
                <button type="submit" className={styles.authButton}>Подтвердить</button>
            </form>
        </motion.div>
    );
};

export default Verify2fa;