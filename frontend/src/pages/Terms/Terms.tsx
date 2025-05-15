import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Terms.module.css";
import Layout from "../../components/Layout/Layout";

const Terms = () => {
    return (
        <Layout>
            <motion.div
                className={styles.termsContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.termsContent}>
                    <h1 className={styles.title}>Условия использования</h1>
                    
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Принятие условий</h2>
                        <p>
                            Добро пожаловать на Furni-swap. Используя наш сервис, вы соглашаетесь с настоящими 
                            Условиями использования. Пожалуйста, внимательно прочитайте их.
                        </p>
                    </section>
                    
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Регистрация и аккаунт</h2>
                        <p>
                            Для использования некоторых функций сервиса требуется регистрация. 
                            Вы несете ответственность за сохранность вашего пароля и за все действия, 
                            которые происходят под вашей учетной записью.
                        </p>
                    </section>
                    
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. Правила размещения объявлений</h2>
                        <p>
                            При размещении объявлений вы должны предоставлять точную и правдивую информацию о товаре.
                            Запрещено размещать объявления о продаже незаконных товаров или услуг.
                        </p>
                    </section>
                    
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>4. Интеллектуальная собственность</h2>
                        <p>
                            Весь контент, размещенный на платформе Furni-swap, включая тексты, графику, логотипы, 
                            изображения, является собственностью Furni-swap или наших партнеров и защищен 
                            законами об интеллектуальной собственности.
                        </p>
                    </section>
                    
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>5. Ограничение ответственности</h2>
                        <p>
                            Furni-swap не несет ответственности за содержание объявлений, размещенных пользователями, 
                            а также за любые сделки, заключенные между пользователями платформы.
                        </p>
                    </section>
                    
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>6. Изменение условий</h2>
                        <p>
                            Мы оставляем за собой право изменять эти условия в любое время. 
                            Продолжая использовать сервис после внесения изменений, 
                            вы принимаете обновленные условия.
                        </p>
                    </section>
                    
                    <div className={styles.linkContainer}>
                        <Link to="/" className={styles.backLink}>Вернуться на главную</Link>
                    </div>
                </div>
            </motion.div>
        </Layout>
    );
};

export default Terms; 