import { Button } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./ProductCard.module.css";
import { getFullImageUrl } from "../../services/api";

interface ProductCardProps {
    id: number;
    title?: string;
    description?: string;
    price?: number;
    location?: string;
    imageUrl?: string | { image_path?: string; url?: string; path?: string } | null;
    category?: string;
    userName?: string;
}

const ProductCard = ({ id, title, description, price, location, imageUrl, category, userName }: ProductCardProps) => {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);

    const handleNavigate = () => {
        navigate(`/product/${id}`);
    };

    // Process the image URL
    const getImageUrl = () => {
        if (!imageUrl) return null;
        
        if (typeof imageUrl === 'string') {
            return imageUrl;
        }
        
        if (imageUrl && typeof imageUrl === 'object') {
            if (imageUrl.image_path) return imageUrl.image_path;
            if (imageUrl.url) return imageUrl.url;
            if (imageUrl.path) return getFullImageUrl(imageUrl.path);
        }
        
        return null;
    };
    
    const processedImageUrl = getImageUrl();
    const placeholderImage = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189af1d470e%20text%20%7B%20fill%3A%23888888%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189af1d470e%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23eeeeee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22150%22%20y%3D%22150%22%3EНет фото%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";

    return (
        <motion.div
            className={styles.card}
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div 
                className={styles.imageLink}
                onClick={handleNavigate}
            >
                <img
                    src={imageError || !processedImageUrl ? placeholderImage : processedImageUrl}
                    alt={title || "Товар"}
                    className={styles.image}
                    onError={() => setImageError(true)}
                />
                {category && <span className={styles.categoryBadge}>{category}</span>}
            </div>
            <div className={styles.content}>
                <div>
                    <h3 className={styles.title} onClick={handleNavigate}>
                        {title || "Без названия"}
                    </h3>
                    {description && (
                        <p className={styles.description}>{description}</p>
                    )}
                    {userName && (
                        <p className={styles.author}>
                            <span className={styles.authorLabel}>Автор:</span> {userName}
                        </p>
                    )}
                </div>
                <div className={styles.details}>
                    <div className={styles.priceLocation}>
                        <p className={styles.price}>
                            {price ? `${price.toLocaleString()} ₽` : "Цена не указана"}
                        </p>
                        {location && <p className={styles.location}>{location}</p>}
                    </div>
                    <Button 
                        type="primary" 
                        className={styles.viewButton}
                        onClick={handleNavigate}
                    >
                        Смотреть
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

export default ProductCard;
