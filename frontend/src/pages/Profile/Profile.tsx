import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import authService from "../../services/auth.service";
import userService, { User } from "../../services/user.service";
import listingService, { Listing } from "../../services/listing.service";
import purchaseService from "../../services/purchase.service";
import saleService from "../../services/sale.service";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [userListings, setUserListings] = useState<Listing[]>([]);
    const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isAuthenticated = authService.isAuthenticated();

    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/profile' } });
            return;
        }

        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch user profile
                const userData = await userService.getProfile();
                setUser(userData);
                
                // Fetch user's listings from real API
                try {
                    const myListingsData = await listingService.getUserListings();
                    setUserListings(myListingsData.listings || []);
                } catch (listingError) {
                    console.error("Error fetching user listings:", listingError);
                    setUserListings([]);
                }
                
                // Fetch recent purchases
                try {
                    const purchasesData = await purchaseService.getPurchases();
                    setRecentPurchases(purchasesData || []);
                } catch (purchaseError) {
                    console.error("Error fetching purchases:", purchaseError);
                    setRecentPurchases([]);
                }
                
                // Fetch sales
                try {
                    const salesData = await saleService.getSales();
                    setRecentSales(salesData || []);
                } catch (salesError) {
                    console.error("Error fetching sales:", salesError);
                    setRecentSales([]);
                }
                
                setError(null);
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Не удалось загрузить данные профиля. Пожалуйста, попробуйте позже.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [isAuthenticated, navigate]);

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Не указана';
        
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    
    // Handle listing deletion
    const handleDeleteListing = async (listingId: number) => {
        if (window.confirm('Вы уверены, что хотите удалить это объявление?')) {
            try {
                await listingService.deleteListing(listingId);
                // Update listings after deletion
                const myListingsData = await listingService.getUserListings();
                setUserListings(myListingsData.listings || []);
            } catch (error) {
                console.error("Error deleting listing:", error);
                alert("Не удалось удалить объявление. Пожалуйста, попробуйте позже.");
            }
        }
    };
    
    // Handle edit listing
    const handleEditListing = (listingId: number) => {
        navigate(`/edit-listing/${listingId}`);
    };

    // Get image URL for a purchase or sale
    const getImageUrl = (item: any) => {
        // Check if the item has images array
        if (item.images && item.images.length > 0) {
            const image = item.images[0];
            // Check if it's an object with image_path or a string URL
            return typeof image === 'string' ? image : image?.image_path || '/placeholder.jpg';
        }
        // Fallback to the image property if it exists
        if (item.image) {
            return item.image;
        }
        // Default placeholder
        return '/placeholder.jpg';
    };

    if (isLoading) {
        return (
            <div>
                <Header />
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Загрузка профиля...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className={styles.profileContainer}>
                <div className={styles.sidebar}>
                    <div className={styles.userCard}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Аватар" className={styles.userAvatar} />
                        ) : (
                            <div className={styles.userAvatarPlaceholder}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                        <div className={styles.userInfo}>
                            <h2 className={styles.userName}>{user?.name || 'Пользователь'}</h2>
                            <p className={styles.userDetail}>
                                <span className={styles.detailLabel}>Email:</span>
                                <span>{user?.email || 'Нет данных'}</span>
                            </p>
                            <p className={styles.userDetail}>
                                <span className={styles.detailLabel}>Город:</span>
                                <span>{user?.city || 'Не указан'}</span>
                            </p>
                            <p className={styles.userDetail}>
                                <span className={styles.detailLabel}>Дата регистрации:</span>
                                <span>{user?.created_at ? formatDate(user.created_at) : 'Не указана'}</span>
                            </p>
                        </div>
                    </div>
                    <div className={styles.sidebarLinks}>
                        <Link to="/favorites" className={styles.sidebarLink}>
                            <span className={styles.linkIcon}>♥</span>
                            Избранное
                        </Link>
                        <Link to="/purchases" className={styles.sidebarLink}>
                            <span className={styles.linkIcon}>🛒</span>
                            История покупок
                        </Link>
                        <Link to="/chats" className={styles.sidebarLink}>
                            <span className={styles.linkIcon}>💬</span>
                            Сообщения
                        </Link>
                        <button 
                            className={styles.logoutButton}
                            onClick={() => {
                                authService.logout();
                                navigate('/login');
                            }}
                        >
                            Выйти
                        </button>
                    </div>
                </div>
                
                <div className={styles.content}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}
                    
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Мои объявления</h2>
                            <Link to="/create-listing" className={styles.actionButton}>
                                Создать объявление
                            </Link>
                        </div>
                        
                        {userListings.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>У вас пока нет объявлений</p>
                                <Link to="/create-listing" className={styles.linkButton}>
                                    Создать первое объявление
                                </Link>
                            </div>
                        ) : (
                            <div className={styles.listingsGrid}>
                                {userListings.map((listing) => (
                                    <div key={listing.id} className={styles.listingCard}>
                                        <div className={styles.listingImage}>
                                            {listing.images && listing.images.length > 0 ? (
                                                <img 
                                                    src={typeof listing.images[0] === 'string' 
                                                        ? listing.images[0] 
                                                        : listing.images[0]?.image_path || '/placeholder.jpg'} 
                                                    alt={listing.title} 
                                                />
                                            ) : (
                                                <img src="/placeholder.jpg" alt="Нет изображения" />
                                            )}
                                        </div>
                                        <div className={styles.listingInfo}>
                                            <Link to={`/product/${listing.id}`} className={styles.listingTitle}>
                                                {listing.title}
                                            </Link>
                                            <p className={styles.listingPrice}>{listing.price.toLocaleString()} ₽</p>
                                            <p className={styles.listingDate}>
                                                Опубликовано: {formatDate(listing.created_at || listing.createdAt || '')}
                                            </p>
                                        </div>
                                        <div className={styles.listingActions}>
                                            <button 
                                                className={styles.editButton}
                                                onClick={() => handleEditListing(listing.id)}
                                            >
                                                Редактировать
                                            </button>
                                            <button 
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteListing(listing.id)}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                    
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Недавние покупки</h2>
                            <Link to="/purchases" className={styles.viewAllLink}>
                                Смотреть все
                            </Link>
                        </div>
                        
                        {recentPurchases.length === 0 ? (
                            <div className={styles.purchasesPreview}>
                                <div className={styles.emptyState}>
                                    <p>История покупок пуста</p>
                                    <Link to="/catalog" className={styles.linkButton}>
                                        Перейти в каталог
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.listingsGrid}>
                                {recentPurchases.slice(0, 3).map((purchase) => (
                                    <div key={purchase.id} className={styles.listingCard}>
                                        <div className={styles.listingImage}>
                                            <img src={getImageUrl(purchase)} alt={purchase.title || 'Покупка'} />
                                        </div>
                                        <div className={styles.listingInfo}>
                                            <Link 
                                                to={purchase.listing_id ? `/product/${purchase.listing_id}` : '#'} 
                                                className={styles.listingTitle}
                                            >
                                                {purchase.title || `Покупка #${purchase.id}`}
                                            </Link>
                                            <p className={styles.listingPrice}>{purchase.price?.toLocaleString() || '0'} ₽</p>
                                            <p className={styles.sellerInfo}>
                                                Продавец: {purchase.seller_name || 'Не указан'}
                                            </p>
                                            <p className={styles.listingDate}>
                                                Дата: {formatDate(purchase.created_at || purchase.purchase_date || '')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                    
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Мои продажи</h2>
                            <Link to="/sales" className={styles.viewAllLink}>
                                Смотреть все
                            </Link>
                        </div>
                        
                        {recentSales.length === 0 ? (
                            <div className={styles.salesPreview}>
                                <div className={styles.emptyState}>
                                    <p>История продаж пуста</p>
                                    <Link to="/create-listing" className={styles.linkButton}>
                                        Создать объявление
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.listingsGrid}>
                                {recentSales.slice(0, 3).map((sale) => (
                                    <div key={sale.id} className={styles.listingCard}>
                                        <div className={styles.listingImage}>
                                            <img src={getImageUrl(sale)} alt={sale.title || 'Продажа'} />
                                        </div>
                                        <div className={styles.listingInfo}>
                                            <Link 
                                                to={sale.listing_id ? `/product/${sale.listing_id}` : '#'} 
                                                className={styles.listingTitle}
                                            >
                                                {sale.title || `Продажа #${sale.id}`}
                                            </Link>
                                            <p className={styles.listingPrice}>{sale.price?.toLocaleString() || '0'} ₽</p>
                                            <p className={styles.buyerInfo}>
                                                Покупатель: {sale.buyer_name || 'Не указан'}
                                            </p>
                                            <p className={styles.listingDate}>
                                                Дата: {formatDate(sale.created_at || sale.sale_date || '')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Profile;
