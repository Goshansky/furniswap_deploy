import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import { Listing } from '../../services/listing.service';
import listingService from '../../services/listing.service';
import authService from '../../services/auth.service';
import styles from './Favorites.module.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) {
        setError('Вы должны войти в систему, чтобы просматривать избранное');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token available');
        }
        
        console.log("Fetching user favorites");
        const response = await listingService.getFavorites();
        console.log("Favorites response:", response);
        
        if (response && response.favorites && Array.isArray(response.favorites)) {
          setFavorites(response.favorites);
          setError(null);
        } else if (response && Array.isArray(response)) {
          setFavorites(response);
          setError(null);
        } else {
          setFavorites([]);
          setError('Не удалось получить данные об избранном');
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Не удалось загрузить избранные объявления');
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated]);

  const handleRemoveFromFavorites = async (id: number) => {
    try {
      console.log(`Removing listing ID ${id} from favorites...`);
      const response = await listingService.removeFromFavorites(id);
      console.log("Remove from favorites response:", response);
      
      // Обновляем список избранных в UI без полной перезагрузки данных
      setFavorites(favorites.filter(item => item.id !== id));
      
      // Можно также показать уведомление об успешном удалении
      // Например: toast.success("Товар удален из избранного");
    } catch (err) {
      console.error('Error removing from favorites:', err);
      alert('Не удалось удалить объявление из избранного');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.title}>Избранное</h1>
            <p className={styles.subtitle}>Сохраненные объявления</p>
          </div>
          <div className={styles.emptyState}>
            <h2>Для просмотра избранного необходимо авторизоваться</h2>
            <p>После авторизации вы сможете добавлять объявления в избранное</p>
            <Link to="/login" className={styles.browseButton}>
              Войти в аккаунт
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Избранное</h1>
          <p className={styles.subtitle}>Ваши сохраненные объявления</p>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <span>Загрузка...</span>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </button>
          </div>
        ) : favorites.length > 0 ? (
          <div className={styles.grid}>
            {favorites.map((item) => (
              <div key={item.id} className={styles.productWrapper}>
                <ProductCard
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  price={item.price}
                  location={item.city || item.location || ''}
                  imageUrl={item.mainImage || (item.images && item.images.length > 0 ? item.images[0] : undefined)}
                  category={item.category}
                  userName={item.user_name || item.userName}
                />
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveFromFavorites(item.id)}
                  aria-label="Удалить из избранного"
                >
                  Удалить из избранного
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>У вас пока нет избранных объявлений</h2>
            <p>Добавляйте понравившиеся товары в избранное, чтобы не потерять их</p>
            <Link to="/catalog" className={styles.browseButton}>
              Перейти в каталог
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Favorites; 