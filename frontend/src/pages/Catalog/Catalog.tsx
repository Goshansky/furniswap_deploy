import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Catalog.module.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import listingService, { Listing, ListingFilter } from "../../services/listing.service";
import ProductCard from "../../components/ProductCard/ProductCard";

const Catalog = () => {
    useNavigate();
    const location = useLocation();
    
    // Get parameters from URL
    const queryParams = new URLSearchParams(location.search);
    const initialCategory = queryParams.get('category') || '';
    const initialPage = parseInt(queryParams.get('page') || '1', 10);
    const initialSearch = queryParams.get('search') || '';
    const initialMinPrice = queryParams.get('minPrice') ? parseInt(queryParams.get('minPrice') || '', 10) : undefined;
    const initialMaxPrice = queryParams.get('maxPrice') ? parseInt(queryParams.get('maxPrice') || '', 10) : undefined;
    const initialSort = queryParams.get('sort') || '-date';
    const initialCondition = queryParams.get('condition') || '';
    const initialCity = queryParams.get('city') || '';
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
    const [sortOrder, setSortOrder] = useState(initialSort);
    const [condition, setCondition] = useState(initialCondition);
    const [city, setCity] = useState(initialCity);
    
    // Data states
    const [listings, setListings] = useState<Listing[]>([]);
    const [totalListings, setTotalListings] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [itemsPerPage] = useState(12);
    
    // Predefined categories
    const [categories, setCategories] = useState<string[]>([
        'Диваны и кресла', 'Столы и стулья', 'Шкафы и комоды', 'Кровати и матрасы', 'Другое'
    ]);

    // Predefined conditions
    const conditions = ['новое', 'хорошее', 'среднее', 'плохое'];
    
    // Check if selected category is in the list on initialization
    useEffect(() => {
        if (selectedCategory && !categories.includes(selectedCategory)) {
            console.warn("Selected category not found in list:", selectedCategory);
            // Add category to the list if it's not there
            setCategories(prevCategories => [...prevCategories, selectedCategory]);
        }
    }, []);
    
    // UI states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [draftSearch, setDraftSearch] = useState(initialSearch);

    // Update URL with filter parameters
    const updateUrlParams = () => {
        const params = new URLSearchParams();
        
        if (selectedCategory) {
            params.set('category', selectedCategory);
        }
        
        if (currentPage > 1) {
            params.set('page', currentPage.toString());
        }
        
        if (searchTerm) {
            params.set('search', searchTerm);
        }
        
        if (minPrice !== undefined) {
            params.set('minPrice', minPrice.toString());
        }
        
        if (maxPrice !== undefined) {
            params.set('maxPrice', maxPrice.toString());
        }
        
        if (condition) {
            params.set('condition', condition);
        }
        
        if (city) {
            params.set('city', city);
        }
        
        // Only add the sort parameter if it's not the default "-date"
        if (sortOrder !== '-date') {
            params.set('sort', sortOrder);
        }
        
        const newSearch = params.toString() ? `?${params.toString()}` : '';
        const newUrl = `${window.location.pathname}${newSearch}`;
        
        console.log("Updating URL to:", newUrl);
        
        // Update URL without page reload
        window.history.replaceState({}, '', newUrl);
    };

    // Separate effect for updating URL when filters change
    useEffect(() => {
        updateUrlParams();
    }, [selectedCategory, minPrice, maxPrice, searchTerm, currentPage, sortOrder, condition, city]);

    // Load listings when filters change
    useEffect(() => {
        const fetchListings = async () => {
            try {
                setIsLoading(true);
                
                console.log("Applying filters:", {
                    category: selectedCategory,
                    minPrice,
                    maxPrice,
                    search: searchTerm,
                    page: currentPage,
                    limit: itemsPerPage,
                    sort: sortOrder,
                    condition,
                    city
                });
                
                const filterParams: ListingFilter = {
                    page: currentPage,
                    limit: itemsPerPage,
                    sort: sortOrder
                };
                
                if (selectedCategory) {
                    filterParams.category = selectedCategory;
                }
                
                if (minPrice !== undefined) {
                    filterParams.minPrice = minPrice;
                }
                
                if (maxPrice !== undefined) {
                    filterParams.maxPrice = maxPrice;
                }
                
                if (searchTerm) {
                    filterParams.search = searchTerm;
                }
                
                if (condition) {
                    filterParams.condition = condition;
                }
                
                if (city) {
                    filterParams.location = city;
                }
                
                console.log("Calling listingService with params:", filterParams);
                
                try {
                    // Add timeout for request to avoid infinite loading
                    const timeoutPromise = new Promise<any>((_, reject) => 
                        setTimeout(() => reject(new Error("Тайм-аут запроса")), 15000)
                    );
                    
                    const responsePromise = listingService.getListings(filterParams);
                    
                    // Use Promise.race to cancel request on timeout
                    const response = await Promise.race([responsePromise, timeoutPromise]);
                    
                    console.log("API Response:", response);
                    
                    if (response && response.listings) {
                        console.log(`Got ${response.listings.length} listings from API:`, response.listings);
                        
                        // Detailed logging of received data
                        console.log("API returned metadata:", {
                            page: response.page,
                            limit: response.limit,
                            total: response.total,
                            total_count: response.total_count,
                            total_pages: response.total_pages
                        });
                        
                        // Set data immediately, without additional checks
                        setListings(response.listings);
                        
                        // Update pagination information
                        if (response.total_count !== undefined) {
                            setTotalListings(response.total_count);
                            
                            if (response.total_pages !== undefined) {
                                setTotalPages(response.total_pages);
                            } else {
                                setTotalPages(Math.ceil(response.total_count / itemsPerPage));
                            }
                        } else if (response.total !== undefined) {
                            setTotalListings(response.total);
                            setTotalPages(Math.ceil(response.total / itemsPerPage));
                        } else {
                            // If API doesn't return total count, estimate from array length
                            setTotalListings(response.listings.length);
                            // If current page > 1, then there are clearly more pages
                            if (currentPage > 1) {
                                setTotalPages(currentPage + 1); // At least one more page
                            } else {
                                setTotalPages(Math.max(1, Math.ceil(response.listings.length / itemsPerPage)));
                            }
                        }
                        
                        setError(null);
                    } else {
                        console.warn("No listings returned from API");
                        setListings([]);
                        setTotalListings(0);
                        setTotalPages(1);
                        
                        // Use error message from API if available
                        if (response.error) {
                            setError(response.error);
                        } else if (!response) {
                            setError('Не удалось получить ответ от сервера');
                        } else {
                            setError('Список объявлений пуст');
                        }
                    }
                } catch (apiError: any) {
                    console.error('API error fetching listings:', apiError);
                    
                    // More user-friendly error handling
                    if (apiError.message === "Тайм-аут запроса") {
                        setError('Превышено время ожидания ответа от сервера. Пожалуйста, попробуйте позже.');
                    } else if (apiError.response?.status === 404) {
                        setError('Не удалось найти объявления по указанным критериям.');
                    } else if (apiError.response?.status >= 500) {
                        setError('Ошибка сервера. Пожалуйста, попробуйте позже.');
                    } else {
                        setError(apiError.message || 'Ошибка при получении списка объявлений');
                    }
                    
                    setListings([]);
                }
            } catch (err: any) {
                console.error('Error fetching listings:', err);
                setError(err.message || 'Не удалось загрузить объявления');
                setListings([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Small delay for debouncing frequent filter changes
        const debounceTimeout = setTimeout(() => {
            fetchListings();
        }, 300);
        
        return () => clearTimeout(debounceTimeout);
    }, [selectedCategory, minPrice, maxPrice, searchTerm, currentPage, itemsPerPage, sortOrder, condition, city]);

// Clear all filters at once
    const clearFilters = () => {
        console.log("Clearing all filters");
        setDraftSearch("");
        setSearchTerm("");
        setSelectedCategory("");
        setMinPrice(undefined);
        setMaxPrice(undefined);
        setSortOrder("-date");
        setCondition("");
        setCity("");
        setCurrentPage(1);
    };
    
    // Handlers for individual filters
    const handleCategoryChange = (category: string) => {
        console.log("Changing category to:", category);
        // Replace current category selection
        setSelectedCategory(category);
        // Always reset to first page
        setCurrentPage(1);
    };

    const handleMinPriceChange = (value: string) => {
        const parsedValue = value ? Number(value) : undefined;
        if (!value || !isNaN(parsedValue as number)) {
            console.log("Setting min price to:", parsedValue);
            setMinPrice(parsedValue);
            setCurrentPage(1);
        }
    };
    
    const handleMaxPriceChange = (value: string) => {
        const parsedValue = value ? Number(value) : undefined;
        if (!value || !isNaN(parsedValue as number)) {
            console.log("Setting max price to:", parsedValue);
            setMaxPrice(parsedValue);
            setCurrentPage(1);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Search submitted with term:", draftSearch);
        
        const trimmedSearch = draftSearch.trim();
        
        // Set search term immediately
        setSearchTerm(trimmedSearch);
        console.log("Search term set to:", trimmedSearch);
        
        // Reset to first page
        setCurrentPage(1);
        
        // Log debug info
        console.log("Search performed with:", {
            searchTerm: trimmedSearch,
            category: selectedCategory,
            minPrice,
            maxPrice,
            sort: sortOrder,
            page: 1
        });
    };
    
    const handleConditionChange = (selectedCondition: string) => {
        console.log("Changing condition to:", selectedCondition);
        setCondition(selectedCondition);
        setCurrentPage(1);
    };
    
    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        console.log("Setting city to:", value);
        setCity(value);
        setCurrentPage(1);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSortOrder = e.target.value;
        console.log("Changing sort order to:", newSortOrder);
        setSortOrder(newSortOrder);
        // Always reset to first page
        setCurrentPage(1);
    };
    
    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            console.log("Changing page to:", newPage);
            
            // Update current page state
            setCurrentPage(newPage);
            
            // Scroll to top of page
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Refresh data will be triggered by the useEffect watching currentPage
            console.log("Page changed to:", newPage, "with parameters:", {
                category: selectedCategory,
                minPrice,
                maxPrice,
                sort: sortOrder,
                condition,
                city,
                page: newPage,
                limit: itemsPerPage
            });
        }
    };

    // Calculate the range of displayed items
    const startItemIndex = (currentPage - 1) * itemsPerPage + 1;
    const endItemIndex = Math.min(startItemIndex + listings.length - 1, totalListings);

    const filteredListings = () => {
        // If we have a search term, filter client-side by title (server may not support search)
        if (searchTerm && listings.length > 0) {
            return listings.filter(product => 
                product.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return listings;
    };

    return (
        <div>
            <Header />

            <div className={styles.catalogContainer}>
                <h1 className={styles.title}>Каталог товаров</h1>

                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <div className={styles.searchInputContainer}>
                        <input
                            type="text"
                            placeholder="Поиск по названию..."
                            className={styles.searchInput}
                            value={draftSearch}
                            onChange={(e) => setDraftSearch(e.target.value)}
                            aria-label="Поиск объявлений"
                        />
                        {draftSearch && (
                            <button 
                                type="button" 
                                className={styles.clearSearchButton}
                                onClick={() => {
                                    setDraftSearch("");
                                    // Also clear the actual search term to trigger a re-fetch
                                    setSearchTerm("");
                                    setCurrentPage(1);
                                }}
                                aria-label="Очистить поиск"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <button 
                        type="submit" 
                        className={styles.searchButton} 
                        disabled={isLoading}
                    >
                        {isLoading ? "Поиск..." : "Поиск"}
                    </button>
                </form>

                <div className={styles.filtersContainer}>
                    <div className={styles.filters}>
                        <div className={styles.filterGroup}>
                            <span className={styles.filterLabel}>Категория:</span>
                            <select 
                                className={`${styles.filterButton} ${selectedCategory ? styles.activeFilter : ''}`}
                                value={selectedCategory}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                aria-label="Выбрать категорию"
                                disabled={isLoading}
                            >
                                <option value="">Все категории</option>
                                {categories.map(category => (
                                    <option 
                                        key={category} 
                                        value={category}
                                    >
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <span className={styles.filterLabel}>Состояние:</span>
                            <select 
                                className={`${styles.filterButton} ${condition ? styles.activeFilter : ''}`}
                                value={condition}
                                onChange={(e) => handleConditionChange(e.target.value)}
                                aria-label="Выбрать состояние"
                                disabled={isLoading}
                            >
                                <option value="">Любое состояние</option>
                                {conditions.map(c => (
                                    <option 
                                        key={c} 
                                        value={c}
                                    >
                                        {c.charAt(0).toUpperCase() + c.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className={styles.filterGroup}>
                            <span className={styles.filterLabel}>Город:</span>
                            <input
                                type="text"
                                placeholder="Введите город"
                                className={`${styles.cityInput} ${city ? styles.activeFilter : ''}`}
                                value={city}
                                onChange={handleCityChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div className={styles.filterGroup}>
                            <span className={styles.filterLabel}>Цена:</span>
                            <div className={styles.priceFilter}>
                                <input
                                    type="number"
                                    placeholder="Мин. цена"
                                    className={styles.priceInput}
                                    value={minPrice || ''}
                                    onChange={(e) => handleMinPriceChange(e.target.value)}
                                    disabled={isLoading}
                                />
                                <span className={styles.priceSeparator}>-</span>
                                <input
                                    type="number"
                                    placeholder="Макс. цена"
                                    className={styles.priceInput}
                                    value={maxPrice || ''}
                                    onChange={(e) => handleMaxPriceChange(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <span className={styles.filterLabel}>Сортировка:</span>
                            <select 
                                className={styles.filterButton} 
                                value={sortOrder}
                                onChange={handleSortChange}
                                aria-label="Сортировка товаров"
                                disabled={isLoading}
                            >
                                <option value="-date">Сначала новые</option>
                                <option value="date">Сначала старые</option>
                                <option value="price">Сначала дешевые</option>
                                <option value="-price">Сначала дорогие</option>
                            </select>
                        </div>
                        
                        {(selectedCategory || minPrice !== undefined || maxPrice !== undefined || searchTerm || condition || city) && (
                            <button 
                                className={styles.clearFilterButton}
                                onClick={clearFilters}
                                disabled={isLoading}
                            >
                                Сбросить фильтры
                            </button>
                        )}
                    </div>
                    
                    {/* Display applied filters as tags */}
                    {(selectedCategory || minPrice !== undefined || maxPrice !== undefined || searchTerm || condition || city) && (
                        <div className={styles.appliedFilters}>
                            {selectedCategory && (
                                <div className={styles.filterTag}>
                                    Категория: {selectedCategory}
                                    <span 
                                        className={styles.filterTagRemove}
                                        onClick={() => setSelectedCategory("")}
                                    >×</span>
                                </div>
                            )}
                            
                            {condition && (
                                <div className={styles.filterTag}>
                                    Состояние: {condition}
                                    <span 
                                        className={styles.filterTagRemove}
                                        onClick={() => setCondition("")}
                                    >×</span>
                                </div>
                            )}
                            
                            {city && (
                                <div className={styles.filterTag}>
                                    Город: {city}
                                    <span 
                                        className={styles.filterTagRemove}
                                        onClick={() => setCity("")}
                                    >×</span>
                                </div>
                            )}
                            
                            {searchTerm && (
                                <div className={styles.filterTag}>
                                    Поиск: {searchTerm}
                                    <span 
                                        className={styles.filterTagRemove}
                                        onClick={() => {
                                            setSearchTerm("");
                                            setDraftSearch("");
                                        }}
                                    >×</span>
                                </div>
                            )}
                            
                            {minPrice !== undefined && (
                                <div className={styles.filterTag}>
                                    Мин. цена: {minPrice} ₽
                                    <span 
                                        className={styles.filterTagRemove}
                                        onClick={() => setMinPrice(undefined)}
                                    >×</span>
                                </div>
                            )}
                            
                            {maxPrice !== undefined && (
                                <div className={styles.filterTag}>
                                    Макс. цена: {maxPrice} ₽
                                    <span 
                                        className={styles.filterTagRemove}
                                        onClick={() => setMaxPrice(undefined)}
                                    >×</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Загрузка объявлений...</p>
                        <p className={styles.loadingHint}>Это может занять несколько секунд</p>
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
                ) : (
                    <>
                        {listings.length > 0 && (
                            <div className={styles.resultInfo}>
                                {searchTerm && (
                                    <span className={styles.searchResultIndicator}>
                                        Результаты поиска: "{searchTerm}" 
                                    </span>
                                )}
                                {
                                    // Показываем скорректированное количество результатов, если была локальная фильтрация
                                    searchTerm && filteredListings().length !== listings.length ? (
                                        <span>
                                            Найдено <strong>{filteredListings().length}</strong> из <strong>{totalListings}</strong> объявлений
                                        </span>
                                    ) : (
                                        <span>
                                            Показано <strong>{startItemIndex}-{endItemIndex}</strong> из <strong>{totalListings}</strong> объявлений
                                            {totalPages > 1 && (
                                                <span> (страница {currentPage} из {totalPages})</span>
                                            )}
                                        </span>
                                    )
                                }
                            </div>
                        )}
                        
                        <div className={styles.productGrid}>
                            {filteredListings().length > 0 ? (
                                filteredListings().map(product => (
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
                                    <p>Нет объявлений, соответствующих заданным критериям.</p>
                                    <button 
                                        className={styles.resetButton}
                                        onClick={clearFilters}
                                    >
                                        Сбросить фильтры
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Pagination */}
                        {listings.length > 0 && totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button 
                                    className={styles.pageButton}
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    aria-label="Первая страница"
                                >
                                    &laquo;
                                </button>
                                
                                <button 
                                    className={styles.pageButton}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    aria-label="Предыдущая страница"
                                >
                                    &lsaquo;
                                </button>
                                
                                {/* Display pages */}
                                {(() => {
                                    // Create an array of all pages
                                    const pageButtons = [];
                                    
                                    // If there are many pages (more than 10), create smart pagination
                                    if (totalPages > 7) {
                                        // Always show first page
                                        pageButtons.push(
                                            <button
                                                key="page-1"
                                                className={`${styles.pageButton} ${currentPage === 1 ? styles.activePageButton : ''}`}
                                                onClick={() => handlePageChange(1)}
                                                aria-current={currentPage === 1 ? "page" : undefined}
                                                aria-label="Страница 1"
                                            >
                                                1
                                            </button>
                                        );
                                        
                                        // If current page is far from start, add ellipsis
                                        if (currentPage > 4) {
                                            pageButtons.push(
                                                <span key="ellipsis-1" className={styles.pageInfo}>
                                                    ...
                                                </span>
                                            );
                                        }
                                        
                                        // Show pages around current page
                                        const startPage = Math.max(2, currentPage - 1);
                                        const endPage = Math.min(totalPages - 1, currentPage + 1);
                                        
                                        for (let i = startPage; i <= endPage; i++) {
                                            pageButtons.push(
                                                <button
                                                    key={`page-${i}`}
                                                    className={`${styles.pageButton} ${currentPage === i ? styles.activePageButton : ''}`}
                                                    onClick={() => handlePageChange(i)}
                                                    aria-current={currentPage === i ? "page" : undefined}
                                                    aria-label={`Страница ${i}`}
                                                >
                                                    {i}
                                                </button>
                                            );
                                        }
                                        
                                        // If current page is far from end, add ellipsis
                                        if (currentPage < totalPages - 3) {
                                            pageButtons.push(
                                                <span key="ellipsis-2" className={styles.pageInfo}>
                                                    ...
                                                </span>
                                            );
                                        }
                                        
                                        // Always show last page
                                        pageButtons.push(
                                            <button
                                                key={`page-${totalPages}`}
                                                className={`${styles.pageButton} ${currentPage === totalPages ? styles.activePageButton : ''}`}
                                                onClick={() => handlePageChange(totalPages)}
                                                aria-current={currentPage === totalPages ? "page" : undefined}
                                                aria-label={`Страница ${totalPages}`}
                                            >
                                                {totalPages}
                                            </button>
                                        );
                                    } else {
                                        // If few pages, show all
                                        for (let i = 1; i <= totalPages; i++) {
                                            pageButtons.push(
                                                <button
                                                    key={`page-${i}`}
                                                    className={`${styles.pageButton} ${currentPage === i ? styles.activePageButton : ''}`}
                                                    onClick={() => handlePageChange(i)}
                                                    aria-current={currentPage === i ? "page" : undefined}
                                                    aria-label={`Страница ${i}`}
                                                >
                                                    {i}
                                                </button>
                                            );
                                        }
                                    }
                                    
                                    return pageButtons;
                                })()}
                                
                                <button 
                                    className={styles.pageButton}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    aria-label="Следующая страница"
                                >
                                    &rsaquo;
                                </button>
                                
                                <button 
                                    className={styles.pageButton}
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    aria-label="Последняя страница"
                                >
                                    &raquo;
                                </button>
                            </div>
                        )}
                        
                        {/* Pagination information */}
                        {listings.length > 0 && totalPages > 1 && (
                            <div className={styles.paginationInfo}>
                                Страница <strong>{currentPage}</strong> из <strong>{totalPages}</strong>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            <Footer />
        </div>
    );
};

export default Catalog;
