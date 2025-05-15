import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import purchaseService, { Purchase } from '../../services/purchase.service';
import authService from '../../services/auth.service';
import styles from './Purchases.module.css';

const Purchases = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/purchases' } });
      return;
    }

    const fetchPurchases = async () => {
      try {
        setIsLoading(true);
        const data = await purchaseService.getPurchases();
        setPurchases(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching purchases:", err);
        setError("Не удалось загрузить историю покупок. Пожалуйста, попробуйте позже.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [isAuthenticated, navigate]);

  // Helper function to format the date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Дата не указана';
    
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

  // Function to get image URL for a purchase
  const getImageUrl = (purchase: Purchase): string => {
    // If we have an image URL directly
    if (purchase.image) {
      return purchase.image;
    }
    
    // If we have an images array
    if (purchase.images && purchase.images.length > 0) {
      const firstImage = purchase.images[0];
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
            <p>Загрузка истории покупок...</p>
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
        <div className={styles.purchasesHeader}>
          <h1>История покупок</h1>
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
        ) : purchases.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>У вас пока нет покупок</h2>
            <p>После покупки товаров здесь появится история ваших заказов</p>
            <Link to="/catalog" className={styles.linkButton}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className={styles.purchasesList}>
            {purchases.map((purchase) => (
              <div key={purchase.id} className={styles.purchaseCard}>
                <div className={styles.purchaseImage}>
                  <img src={getImageUrl(purchase)} alt={purchase.title} />
                </div>
                <div className={styles.purchaseInfo}>
                  {purchase.listing_id ? (
                    <Link to={`/product/${purchase.listing_id}`} className={styles.purchaseTitle}>
                      {purchase.title || `Покупка #${purchase.id}`}
                    </Link>
                  ) : (
                    <span className={styles.purchaseTitle}>
                      {purchase.title || `Покупка #${purchase.id}`}
                    </span>
                  )}
                  <p className={styles.purchasePrice}>{purchase.price?.toLocaleString() || '0'} ₽</p>
                  {purchase.category && (
                    <p className={styles.purchaseCategory}>{purchase.category}</p>
                  )}
                  <p className={styles.purchaseSeller}>Продавец: {purchase.seller_name || 'Не указан'}</p>
                </div>
                <div className={styles.purchaseMeta}>
                  <p className={styles.purchaseDate}>
                    Дата покупки: {formatDate(purchase.created_at || purchase.purchase_date)}
                  </p>
                  <div className={styles.purchaseStatus}>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(purchase.status)}`}>
                      {getStatusText(purchase.status)}
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

export default Purchases; 