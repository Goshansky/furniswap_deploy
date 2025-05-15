import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Hero from "../../components/Hero/Hero";
import Categories from "../../components/Categories/Categories";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/ProductCard/ProductCard";
import listingService, { Listing } from "../../services/listing.service";
import styles from "./Home.module.css";

const Home = () => {
    const [latestProducts, setLatestProducts] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLatestProducts = async () => {
            try {
                setIsLoading(true);
                // Fetch newest listings with sort=-date (newest first)
                const response = await listingService.getListings({
                    limit: 4,
                    page: 1,
                    sort: "-date"
                });
                
                console.log("API response for latest products:", response);
                
                if (response && response.listings && response.listings.length > 0) {
                    setLatestProducts(response.listings);
                    setError(null);
                } else {
                    // Проверяем есть ли поле ошибки в ответе
                    const errorResponse = response as { error?: string };
                    const errorMessage = errorResponse.error || 'Не удалось загрузить товары. Пустой ответ от сервера.';
                    console.error("Error loading latest products:", errorMessage);
                    setError(errorMessage);
                    setLatestProducts([]);
                }
            } catch (err) {
                console.error('Error fetching latest products:', err);
                setError('Не удалось загрузить новые товары');
                setLatestProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLatestProducts();
    }, []);

    return (
        <div className={styles.container}>
            <Header />
            <Hero />
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.title}>Категории</h2>
                    <Link to="/catalog" className={styles.viewAll}>
                        Смотреть все
                    </Link>
                </div>
                <Categories />
            </section>
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.title}>Новые поступления</h2>
                    <Link to="/catalog" className={styles.viewAll}>
                        Смотреть все
                    </Link>
                </div>
                
                {isLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Загрузка товаров...</p>
                        <p className={styles.loadingHint}>Это может занять несколько секунд</p>
                    </div>
                ) : error ? (
                    <div className={styles.error}>
                        <p>{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className={styles.retryButton}
                        >
                            Попробовать снова
                        </button>
                    </div>
                ) : (
                    <div className={styles.products}>
                        {latestProducts.length > 0 ? (
                            latestProducts.map((product) => (
                                <div key={product.id} className={styles.productItem}>
                                    <ProductCard 
                                        id={product.id} 
                                        title={product.title}
                                        description={product.description}
                                        price={product.price}
                                        location={product.city || product.location || ''}
                                        imageUrl={product.mainImage}
                                        category={product.category}
                                        userName={product.user_name || product.userName}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className={styles.noProducts}>
                                Нет доступных товаров. <Link to="/create-listing">Создайте первое объявление</Link>
                            </div>
                        )}
                    </div>
                )}
            </section>
            <Footer />
        </div>
    );
};

export default Home;


