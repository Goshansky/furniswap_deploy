import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Sales.module.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import authService from "../../services/auth.service";
import saleService, { Sale } from "../../services/sale.service";

const Sales = () => {
    const navigate = useNavigate();
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isAuthenticated = authService.isAuthenticated();

    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/sales' } });
            return;
        }

        const fetchSales = async () => {
            try {
                setIsLoading(true);
                const salesData = await saleService.getSales();
                setSales(salesData || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching sales:", err);
                setError("Не удалось загрузить историю продаж. Пожалуйста, попробуйте позже.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSales();
    }, [isAuthenticated, navigate]);

    // Format date for display
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Не указана';
        
        try {
            return new Date(dateString).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error("Invalid date format:", error);
            return 'Неверный формат даты';
        }
    };

    // Get image URL for a sale
    const getImageUrl = (sale: Sale): string => {
        // If we have an image URL directly
        if (sale.image) {
            return sale.image;
        }
        
        // If we have an images array
        if (sale.images && sale.images.length > 0) {
            const firstImage = sale.images[0];
            if (typeof firstImage === 'string') {
                return firstImage;
            } else if (firstImage && firstImage.image_path) {
                return firstImage.image_path;
            }
        }
        
        // Default placeholder
        return '/placeholder.jpg';
    };

    // Function to get status badge class
    const getStatusBadgeClass = (status: string | undefined) => {
        if (!status) return '';
        
        switch (status.toLowerCase()) {
            case 'completed':
                return styles.statusCompleted;
            case 'processing':
                return styles.statusProcessing;
            case 'cancelled':
                return styles.statusCancelled;
            default:
                return '';
        }
    };

    // Function to get status in Russian
    const getStatusText = (status: string | undefined) => {
        if (!status) return 'Завершен';
        
        switch (status.toLowerCase()) {
            case 'completed':
                return 'Завершен';
            case 'processing':
                return 'В обработке';
            case 'cancelled':
                return 'Отменен';
            default:
                return status;
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.contentWrapper}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Загрузка истории продаж...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.contentWrapper}>
                <div className={styles.salesHeader}>
                    <h1>История продаж</h1>
                    <Link to="/profile" className={styles.backButton}>
                        Вернуться в профиль
                    </Link>
                </div>

                {error ? (
                    <div className={styles.errorContainer}>
                        <p>{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className={styles.retryButton}
                        >
                            Попробовать снова
                        </button>
                    </div>
                ) : sales.length === 0 ? (
                    <div className={styles.emptyState}>
                        <h2>У вас еще нет продаж</h2>
                        <p>После продажи товаров здесь появится история ваших продаж</p>
                        <Link to="/create-listing" className={styles.linkButton}>
                            Создать объявление
                        </Link>
                    </div>
                ) : (
                    <div className={styles.salesList}>
                        {sales.map((sale) => (
                            <div key={sale.id} className={styles.saleCard}>
                                <div className={styles.saleImage}>
                                    <img src={getImageUrl(sale)} alt={sale.title || 'Продажа'} />
                                </div>
                                <div className={styles.saleInfo}>
                                    {sale.listing_id ? (
                                        <Link to={`/product/${sale.listing_id}`} className={styles.saleTitle}>
                                            {sale.title || `Продажа #${sale.id}`}
                                        </Link>
                                    ) : (
                                        <span className={styles.saleTitle}>
                                            {sale.title || `Продажа #${sale.id}`}
                                        </span>
                                    )}
                                    <p className={styles.salePrice}>{sale.price?.toLocaleString() || '0'} ₽</p>
                                    {sale.category && (
                                        <p className={styles.saleCategory}>
                                            {sale.category}
                                        </p>
                                    )}
                                    <p className={styles.saleBuyer}>
                                        Покупатель: {sale.buyer_name || 'Не указан'}
                                    </p>
                                </div>
                                <div className={styles.saleMeta}>
                                    <p className={styles.saleDate}>
                                        Дата продажи: {formatDate(sale.created_at || sale.sale_date)}
                                    </p>
                                    <div className={styles.saleStatus}>
                                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(sale.status)}`}>
                                            {getStatusText(sale.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Sales; 