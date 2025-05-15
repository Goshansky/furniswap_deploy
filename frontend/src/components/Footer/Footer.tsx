import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <p>&copy; 2025 Furni-swap. Все права защищены.</p>
                <nav className={styles.nav}>
                    <Link to="/terms">Условия использования</Link>
                    <Link to="/privacy">Политика конфиденциальности</Link>
                    <Link to="/contact">Связаться с нами</Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;

