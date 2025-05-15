import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Privacy.module.css";
import Layout from "../../components/Layout/Layout";

const Privacy = () => {
    return (
        <Layout>
            <motion.div
                className={styles.privacyContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.privacyContent}>
                    <h1 className={styles.title}>Политика конфиденциальности</h1>
                    
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Введение</h2>
                        <p>
                            Furni-swap уважает вашу конфиденциальность и стремится защищать ваши личные данные. 
                            Эта политика объясняет, как мы собираем, используем и защищаем вашу информацию.
                        </p>
                    </section>
                    
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Какие данные мы собираем</h2>
                        <p>
                            Мы собираем личную информацию, которую вы предоставляете при регистрации: имя, 
                            фамилию, электронную почту и пароль. Также мы собираем информацию о вашей активности 
                            на платформе и данные, связанные с вашими объявлениями.
                        </p>
                    </section>
                    
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. Как мы используем ваши данные</h2>
                        <p>
                            Мы используем ваши данные для предоставления и улучшения наших услуг, 
                            для связи с вами, для обработки ваших транзакций, а также для обеспечения 
                            безопасности нашей платформы.
                        </p>
                    </section>
                    
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>4. Как мы храним ваши данные</h2>
                        <p>
                            Мы используем технические и организационные меры для защиты ваших данных 
                            от несанкционированного доступа, потери или повреждения. Мы храним ваши данные 
                            только до тех пор, пока это необходимо для целей, для которых они были собраны.
                        </p>
                    </section>
                    
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>5. Раскрытие вашей информации</h2>
                        <p>
                            Мы не продаем и не передаем ваши личные данные третьим лицам без вашего согласия, 
                            за исключением случаев, когда это требуется по закону или для защиты наших прав.
                        </p>
                    </section>
                    
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>6. Ваши права</h2>
                        <p>
                            Вы имеете право на доступ, исправление и удаление ваших личных данных. 
                            Вы также можете отозвать свое согласие на обработку данных в любое время.
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

export default Privacy; 