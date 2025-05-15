import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import listingService, { Listing } from "../../services/listing.service";
import chatService from "../../services/chat.service";
import authService from "../../services/auth.service";
import api, { getFullImageUrl } from "../../services/api";
import styles from "./Product.module.css";

const Product = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Listing | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const isAuthenticated = authService.isAuthenticated();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isBuying, setIsBuying] = useState(false);
    const [buySuccess, setBuySuccess] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            
            try {
                setIsLoading(true);
                const data = await listingService.getListing(Number(id));
                
                if (data && data.listing) {
                    // Ensure we have full data from the API
                    console.log("Product data received:", data.listing);
                    console.log("Images from API:", data.listing.images);
                    
                    if (data.listing.images && Array.isArray(data.listing.images)) {
                        console.log("First image object:", data.listing.images[0]);
                    }
                    
                    setProduct(data.listing);
                    
                    // Check if the listing is in favorites if user is authenticated
                    if (isAuthenticated) {
                        try {
                            console.log(`Checking if listing ID ${id} is in favorites...`);
                            const favoriteData = await listingService.checkFavorite(Number(id));
                            console.log("Favorite status check result:", favoriteData);
                            
                            // Check favoriteData for isFavorite property
                            if (favoriteData && typeof favoriteData.isFavorite === 'boolean') {
                                setIsFavorite(favoriteData.isFavorite);
                                console.log(`Listing ID ${id} favorite status:`, favoriteData.isFavorite);
                            }
                        } catch (err) {
                            console.error("Error checking favorite status:", err);
                        }
                    }
                    
                    setError(null);
                } else {
                    setError("Не удалось получить данные о товаре");
                }
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError("Не удалось загрузить информацию о товаре");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id, isAuthenticated]);

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: `/product/${id}` } });
            return;
        }

        if (!product) return;

        try {
            if (isFavorite) {
                console.log(`Removing listing ID ${product.id} from favorites`);
                const response = await listingService.removeFromFavorites(product.id);
                console.log("Remove from favorites response:", response);
            } else {
                console.log(`Adding listing ID ${product.id} to favorites`);
                const response = await listingService.addToFavorites(product.id);
                console.log("Add to favorites response:", response);
            }
            setIsFavorite(!isFavorite);
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    const handleContact = async () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: `/product/${id}` } });
            return;
        }

        if (!product) return;

        try {
            // Show loading indicator or disable button during chat creation
            setIsLoading(true);
            
            const sellerId = product.user_id || product.userId;
            if (!sellerId) {
                console.error("Cannot find seller ID in product data:", product);
                setError("Не удалось найти информацию о продавце. Пожалуйста, попробуйте позже.");
                setIsLoading(false);
                return;
            }
            
            console.log("Creating chat for listing:", product.id, "Seller ID:", sellerId);
            const chatData = await chatService.createChat({
                listing_id: product.id,
                message: "Здравствуйте!",
                recipient_id: sellerId
            });
            
            console.log("Chat creation response:", chatData);
            
            if (chatData && chatData.chat && chatData.chat.id) {
                console.log("Navigating to chat:", chatData.chat.id);
                
                // Navigate directly to the new chat
                navigate(`/chats/${chatData.chat.id}`);
            } else if (chatData && chatData.success === false) {
                console.error("Chat creation failed:", chatData);
                setError("Не удалось создать чат. Попробуйте позже.");
            } else {
                // If we got here, the chat may have been created but without a proper ID
                // Navigate to the chats page instead
                navigate('/chats');
            }
        } catch (err) {
            console.error("Error creating chat:", err);
            // Show error message to user
            setError("Не удалось создать чат с продавцом. Пожалуйста, попробуйте позже.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBuy = async () => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: `/product/${id}` } });
            return;
        }

        if (!product) return;

        try {
            setIsBuying(true);
            
            // Call API to buy the product using the api service
            const response = await api.post(`/api/listings/${product.id}/buy`);
            
            if (response.status === 200 || response.status === 201) {
                setBuySuccess(true);
                
                // Reset success message after 3 seconds
                setTimeout(() => {
                    setBuySuccess(false);
                    // Redirect to purchases history
                    navigate('/purchases');
                }, 3000);
            } else {
                setError(response.data?.message || "Не удалось приобрести товар");
            }
        } catch (err) {
            console.error("Error buying product:", err);
            setError("Произошла ошибка при покупке. Пожалуйста, попробуйте позже.");
        } finally {
            setIsBuying(false);
        }
    };

    const handleImageClick = (index: number) => {
        setActiveImageIndex(index);
    };

    // Ensure product.images is an array and properly handle all image formats
    const processImages = (productData: Listing) => {
        console.log("Processing images for product:", productData.id);
        console.log("Raw images data:", productData.images);
        
        let processedImages: string[] = [];
        
        // Handle if images is an array of objects or strings
        if (Array.isArray(productData.images) && productData.images.length > 0) {
            processedImages = productData.images.map((img, index) => {
                console.log(`Processing image ${index}:`, img);
                
                if (typeof img === 'string') {
                    const url = getFullImageUrl(img);
                    console.log(`String image path: ${img} -> ${url}`);
                    return url;
                }
                
                if (typeof img === 'object' && img !== null) {
                    // Новый формат изображений от API
                    if ('image_path' in img && img.image_path) {
                        console.log(`Object image with image_path: ${img.image_path}`);
                        return img.image_path; // Используем полный URL, который уже есть в ответе
                    }
                    
                    // Запасные варианты для обратной совместимости
                    const imgObj = img as { image_path?: string; url?: string; path?: string };
                    const imgPath = imgObj.image_path || imgObj.url || imgObj.path || '';
                    const url = getFullImageUrl(imgPath);
                    console.log(`Legacy object image path: ${imgPath} -> ${url}`);
                    return url;
                }
                
                console.log("Invalid image format:", img);
                return '';
            }).filter(url => url !== '');
        } else {
            console.warn("No images array or empty images array");
        }
        
        // Handle mainImage if it exists and wasn't already included
        if (productData.mainImage) {
            console.log("Processing mainImage:", productData.mainImage);
            let mainImageUrl = '';
            
            if (typeof productData.mainImage === 'string') {
                mainImageUrl = getFullImageUrl(productData.mainImage);
                console.log(`Main image as string: ${productData.mainImage} -> ${mainImageUrl}`);
            } else if (typeof productData.mainImage === 'object' && productData.mainImage !== null) {
                // Новый формат для главного изображения
                if ('image_path' in productData.mainImage && productData.mainImage.image_path) {
                    mainImageUrl = productData.mainImage.image_path;
                    console.log(`Main image as object with image_path: ${mainImageUrl}`);
                } else {
                    // Запасные варианты для обратной совместимости
                    const mainImg = productData.mainImage as { image_path?: string; url?: string; path?: string };
                    const imgPath = mainImg.image_path || mainImg.url || mainImg.path || '';
                    mainImageUrl = getFullImageUrl(imgPath);
                    console.log(`Legacy main image path: ${imgPath} -> ${mainImageUrl}`);
                }
            }
            
            // Only add the main image if it's not already included
            if (mainImageUrl && !processedImages.includes(mainImageUrl)) {
                processedImages.unshift(mainImageUrl); // Add at the beginning
                console.log(`Added main image at the beginning: ${mainImageUrl}`);
            }
        } else {
            console.warn("No mainImage specified");
        }
        
        // Добавляем проверку на пустой массив и логирование для отладки
        if (processedImages.length === 0) {
            console.warn("No images processed for product", productData.id);
        } else {
            console.log(`Processed ${processedImages.length} images:`, processedImages);
        }
        
        return processedImages;
    };

    const productImages = product ? processImages(product) : [];

    // Placeholder for when no image is available
    const placeholderImage = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_189af1d470e%20text%20%7B%20fill%3A%23888888%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A20pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_189af1d470e%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23eeeeee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22150%22%20y%3D%22150%22%3EНет фото%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";
    
    const activeImage = productImages.length > 0 
        ? productImages[activeImageIndex] 
        : placeholderImage;

    if (isLoading) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.loadingContainer}>
                    <span className={styles.loadingText}>Загрузка товара...</span>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className={styles.container}>
                <Header />
                <div className={styles.errorContainer}>
                    <h2 className={styles.notFound}>
                        {error || "Товар не найден"}
                    </h2>
                    <button 
                        onClick={() => navigate("/catalog")}
                        className={styles.backButton}
                    >
                        Вернуться в каталог
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.breadcrumbs}>
                <span onClick={() => navigate("/")} className={styles.breadcrumbItem}>Главная</span>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span onClick={() => navigate("/catalog")} className={styles.breadcrumbItem}>Каталог</span>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbActive}>{product.title}</span>
            </div>
            <div className={styles.productContainer}>
                <div className={styles.productImagesSection}>
                    <div className={styles.mainImageContainer}>
                        <img 
                            src={activeImage} 
                            alt={product.title} 
                            className={styles.mainProductImage} 
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = placeholderImage;
                            }}
                        />
                    </div>
                    {productImages.length > 1 && (
                        <div className={styles.thumbnailsContainer}>
                            {productImages.map((imageUrl, index) => (
                                <div 
                                    key={index} 
                                    className={`${styles.thumbnail} ${index === activeImageIndex ? styles.thumbnailActive : ''}`}
                                    onClick={() => handleImageClick(index)}
                                >
                                    <img 
                                        src={imageUrl} 
                                        alt={`${product.title} - изображение ${index + 1}`} 
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = placeholderImage;
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className={styles.productInfo}>
                    <h1 className={styles.productTitle}>{product.title}</h1>
                    <p className={styles.productPrice}>{product.price.toLocaleString()} ₽</p>
                    <p className={styles.productLocation}>{product.city || product.location || 'Местоположение не указано'}</p>
                    <div className={styles.productDetails}>
                        <p className={styles.productCondition}>
                            <strong>Состояние:</strong> {product.condition || 'Не указано'}
                        </p>
                        <p className={styles.productCategory}>
                            <strong>Категория:</strong> {product.category || 'Не указана'}
                        </p>
                        {(product.user_name || product.userName) && (
                            <p className={styles.productAuthor}>
                                <strong>Автор объявления:</strong> {product.user_name || product.userName}
                            </p>
                        )}
                    </div>
                    <div className={styles.productDescription}>
                        <h3>Описание</h3>
                        <p>{product.description || 'Описание отсутствует'}</p>
                    </div>
                    <div className={styles.productMeta}>
                        <p className={styles.productDate}>
                            Дата публикации: {new Date(product.createdAt || product.created_at || new Date()).toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })}
                        </p>
                        <p className={styles.productId}>
                            ID объявления: {product.id}
                        </p>
                    </div>
                </div>
                <div className={styles.productActions}>
                    <div className={styles.actionButtons}>
                        <button 
                            className={`${styles.buyButton} ${isBuying ? styles.buttonLoading : ''}`} 
                            onClick={handleBuy}
                            disabled={isBuying}
                        >
                            {isBuying ? 'Обработка...' : 'Купить сейчас'}
                        </button>
                        <button 
                            className={styles.contactButton} 
                            onClick={handleContact}
                        >
                            Связаться с продавцом
                        </button>
                        <button 
                            className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ''}`}
                            onClick={handleToggleFavorite}
                        >
                            {isFavorite ? 'В избранном ★' : 'Добавить в избранное ☆'}
                        </button>
                    </div>
                    {buySuccess && (
                        <div className={styles.successMessage}>
                            Поздравляем! Товар успешно приобретен. Детали покупки можно найти в истории заказов.
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Product;