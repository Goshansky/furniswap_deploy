import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./Categories.module.css";

interface Category {
  id: number;
  name: string;
}

const Categories = () => {
    const navigate = useNavigate();
    const [categories] = useState<Category[]>([
        { id: 1, name: 'Диваны и кресла' },
        { id: 2, name: 'Столы и стулья' },
        { id: 3, name: 'Шкафы и комоды' },
        { id: 4, name: 'Кровати и матрасы' },
        { id: 5, name: 'Другое' }
    ]);

    const handleCategoryClick = (category: Category) => {
        navigate(`/catalog?category=${category.name}`);
    };

    return (
        <div className={styles.gridContainer}>
            {categories.map((category, index) => (
                <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className={styles.categoryCard}
                    onClick={() => handleCategoryClick(category)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleCategoryClick(category);
                        }
                    }}
                    aria-label={`Категория ${category.name}`}
                >
                    {category.name}
                </motion.div>
            ))}
        </div>
    );
};

export default Categories;
