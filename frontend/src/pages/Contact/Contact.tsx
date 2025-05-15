import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Contact.module.css";
import Layout from "../../components/Layout/Layout";

const Contact = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !email || !subject || !message) {
            setError("Пожалуйста, заполните все поля");
            return;
        }
        
        // Here you would normally send the form data to your backend API
        // For now, we'll just simulate a successful submission
        
        setSubmitted(true);
        setError("");
    };
    
    return (
        <Layout>
            <motion.div
                className={styles.contactContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.contactContent}>
                    <h1 className={styles.title}>Связаться с нами</h1>
                    
                    {submitted ? (
                        <div className={styles.successMessage}>
                            <h2>Спасибо за ваше сообщение!</h2>
                            <p>Мы свяжемся с вами как можно скорее.</p>
                            <Link to="/" className={styles.backLink}>Вернуться на главную</Link>
                        </div>
                    ) : (
                        <>
                            <p className={styles.intro}>
                                У вас есть вопросы или предложения? Заполните форму ниже, и наша команда 
                                свяжется с вами в ближайшее время.
                            </p>
                            
                            <form className={styles.contactForm} onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name" className={styles.label}>Имя</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        className={styles.input}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ваше имя"
                                    />
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="email" className={styles.label}>Email</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        className={styles.input}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="subject" className={styles.label}>Тема</label>
                                    <input 
                                        type="text" 
                                        id="subject" 
                                        className={styles.input}
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Тема вашего сообщения"
                                    />
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="message" className={styles.label}>Сообщение</label>
                                    <textarea 
                                        id="message" 
                                        className={styles.textarea}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Ваше сообщение..."
                                        rows={6}
                                    />
                                </div>
                                
                                {error && <p className={styles.errorText}>{error}</p>}
                                
                                <button type="submit" className={styles.submitButton}>Отправить сообщение</button>
                            </form>
                            
                            <div className={styles.contactInfo}>
                                <div className={styles.infoItem}>
                                    <h3>Email</h3>
                                    <p>support@furniswap.com</p>
                                </div>
                                
                                <div className={styles.infoItem}>
                                    <h3>Телефон</h3>
                                    <p>+7 (123) 456-7890</p>
                                </div>
                                
                                <div className={styles.infoItem}>
                                    <h3>Адрес</h3>
                                    <p>г. Москва, пр. Вернадского, 86</p>
                                </div>
                            </div>
                            
                            <div className={styles.linkContainer}>
                                <Link to="/" className={styles.backLink}>Вернуться на главную</Link>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </Layout>
    );
};

export default Contact; 