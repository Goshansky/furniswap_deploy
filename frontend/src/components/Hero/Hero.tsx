import { Button } from "antd";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './Hero.module.css';

const Hero = () => {
    const navigate = useNavigate();

    const handleViewCatalog = () => {
        navigate('/catalog');
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.hero}
        >
            <h2 className={styles.title}>Поддержанная мебель с выгодой!</h2>
            <p className={styles.subtitle}>Покупайте и продавайте с комфортом</p>
            <Button 
                type="primary" 
                size="large" 
                className={styles.button}
                onClick={handleViewCatalog}
            >
                Посмотреть каталог
            </Button>
        </motion.section>
    );
};

export default Hero;
