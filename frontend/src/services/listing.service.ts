import api from './api';

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  category_id?: number;
  location?: string;
  city?: string;
  condition: string;
  userId?: number;
  user_id?: number;
  user_name?: string;
  userName?: string;
  images: Array<string | { id?: number; listing_id?: number; image_path?: string; is_main?: boolean; created_at?: string; url?: string; path?: string }>;
  mainImage?: string | { image_path?: string; url?: string; path?: string } | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  status?: string;
}

export interface ListingFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  condition?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  category_id: number;
  city: string;
  condition: string;
}

class ListingService {
  async getListings(filters: ListingFilter = {}) {
    console.log("Fetching listings with filters:", filters);
    
    // Convert filter parameters to match backend API expectations
    const apiParams: any = {
      page: filters.page || 1,
      limit: filters.limit || 12
    };
    
    if (filters.category) {
      // Map category name to category_id
      const categoryId = this.mapCategoryNameToId(filters.category);
      if (categoryId) {
        apiParams.category_id = categoryId;
        console.log(`Category mapped: ${filters.category} -> ID ${categoryId}`);
      } else {
        // If no mapping found, use name directly as fallback
        apiParams.category_name = filters.category;
        console.log(`Category parameter set: ${filters.category}`);
      }
    }
    
    if (filters.minPrice !== undefined) {
      apiParams.min_price = filters.minPrice;
    }
    
    if (filters.maxPrice !== undefined) {
      apiParams.max_price = filters.maxPrice;
    }
    
    if (filters.location) {
      apiParams.city = filters.location;
    }
    
    if (filters.condition) {
      apiParams.condition = filters.condition;
    }
    
    if (filters.search) {
      // Convert to snake_case format like the price filter
      apiParams.search_term = filters.search;
      console.log("Search term set:", filters.search);
    }
    
    // Add sort parameter for proper server-side sorting
    if (filters.sort) {
      // Map frontend sort values to API parameters
      if (filters.sort === 'price') {
        apiParams.sort_by = 'price'; // Sort by price ascending
      } else if (filters.sort === '-price') {
        apiParams.sort_by = '-price'; // Sort by price descending
      } else if (filters.sort === 'date') {
        apiParams.sort_by = 'date'; // Sort by date ascending
      } else if (filters.sort === '-date') {
        apiParams.sort_by = '-date'; // Sort by date descending (newest first)
      } else {
        // Fallback - pass the sort parameter as-is
        apiParams.sort_by = filters.sort;
      }
      
      console.log("Sort parameter set:", apiParams.sort_by);
    } else {
      // Default sorting - newest first
      apiParams.sort_by = '-date';
    }
    
    try {
      // Log the complete API request URL for debugging
      console.log("API request params:", apiParams);
      
      // Use the API to get real data
      const response = await api.get('/listings', { params: apiParams });
      console.log("Listings response status:", response.status);
      console.log("Listings response data:", response.data);
      
      // Check if response data is valid
      if (!response.data) {
        console.error("Invalid response data:", response);
        return { listings: [], total: 0, error: "Некорректный ответ сервера" };
      }
      
      // Ensure the returned listings have all required fields
      if (response.data.listings && Array.isArray(response.data.listings)) {
        const processedListings = response.data.listings.map((listing: any) => {
          // Определяем название категории
          const categoryName = listing.category || this.mapCategoryIdToName(listing.category_id) || 'Не указана';
          
          return {
            ...listing,
            // Add fallbacks for missing fields with proper priority
            location: listing.location || listing.city || 'Не указано',
            // Всегда устанавливаем категорию
            category: categoryName,
            // Не перезаписываем category_id, оставляем его как есть
            mainImage: listing.mainImage || listing.images?.[0] || ''
          };
        });
        
        console.log(`Processed ${processedListings.length} listings`);
        response.data.listings = processedListings;
        
        // Save original pagination metadata
        const result = {
          listings: response.data.listings || response.data.items || response.data.results || [],
          total: response.data.total,
          total_count: response.data.total_count || response.data.totalCount || response.data.count,
          total_pages: response.data.total_pages || response.data.totalPages || response.data.pages,
          page: response.data.page || response.data.current_page || apiParams.page,
          limit: response.data.limit || response.data.page_size || apiParams.limit
        };
        
        // If API doesn't return total count, add an approximate estimation
        if (!result.total && !result.total_count && response.data.listings?.length > 0) {
          // If receiving the maximum number of items per page, there are likely more
          if (response.data.listings.length >= apiParams.limit) {
            result.total_count = apiParams.page * apiParams.limit + apiParams.limit;
          } else {
            result.total_count = (apiParams.page - 1) * apiParams.limit + response.data.listings.length;
          }
          
          // Calculate total_pages based on total_count
          result.total_pages = Math.ceil(result.total_count / apiParams.limit);
          
          console.log("Estimated total count:", result.total_count);
          console.log("Estimated total pages:", result.total_pages);
        }
        
        return result;
      } else {
        console.warn("No listings or invalid listings format in response:", response.data);
        return { 
          listings: [], 
          total: 0,
          total_count: 0,
          total_pages: 0,
          page: apiParams.page,
          limit: apiParams.limit,
          error: response.data.error || "Ошибка при получении списка объявлений" 
        };
      }
    } catch (error: any) {
      console.error("Error fetching listings:", error);
      // Return empty array with appropriate structure when API fails
      return { 
        listings: [], 
        total: 0,
        total_count: 0,
        total_pages: 0,
        page: apiParams.page,
        limit: apiParams.limit,
        error: error.response?.data?.message || error.message || "Ошибка сервера при получении объявлений" 
      };
    }
  }

  async getListing(id: number) {
    console.log("Fetching listing details, ID:", id);
    try {
      const response = await api.get(`/listings/${id}`);
      
      // Проверяем, есть ли данные в ответе вообще
      console.log("Received listing data:", response.data);
      
      // Если данные в response.data.listing
      if (response.data && response.data.listing) {
        const listing = response.data.listing;
        // Обрабатываем изображения из ответа API
        let mainImage = null;
        if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
          // Ищем главное изображение
          const mainImageObj = listing.images.find((img: any) => img && img.is_main);
          if (mainImageObj) {
            mainImage = mainImageObj;
          } else {
            // Если нет главного изображения, используем первое
            mainImage = listing.images[0];
          }
        }
        
        // Определяем название категории
        const categoryName = listing.category || this.mapCategoryIdToName(listing.category_id) || 'Не указана';
        
        // Преобразуем данные в нужный формат
        const processedListing: Listing = {
          ...listing,
          userId: listing.user_id,
          category: categoryName,
          location: listing.city || '', // Используем city как location
          createdAt: listing.created_at,
          updatedAt: listing.updated_at,
          userName: listing.user_name || listing.userName || '',
          mainImage: mainImage
        };
        
        return { listing: processedListing };
      }
      
      // Если данные напрямую в response.data (без вложенного listing)
      if (response.data && response.data.id) {
        // Обработка изображений
        let images = response.data.images || [];
        
        // Определяем название категории
        const categoryName = response.data.category || 
                            this.mapCategoryIdToName(response.data.category_id) || 
                            'Не указана';
        
        // Создаем объект товара
        const processedListing: Listing = {
          id: response.data.id,
          title: response.data.title || '',
          description: response.data.description || '',
          price: response.data.price || 0,
          condition: response.data.condition || 'не указано',
          category: categoryName,
          category_id: response.data.category_id,
          location: response.data.city || '',
          city: response.data.city || '',
          user_id: response.data.user_id,
          user_name: response.data.user_name || '',
          userName: response.data.user_name || response.data.userName || '',
          images: images,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
          status: response.data.status || 'active'
        };
        
        return { listing: processedListing };
      }
      
      // Если не удалось найти данные о товаре
      console.error("Invalid listing data structure:", response.data);
      return { error: "Не удалось получить данные о товаре" };
    } catch (error) {
      console.error("Error fetching listing details:", error);
      throw error;
    }
  }

  // Helper function to map category_id to category name
  mapCategoryIdToName(categoryId?: number): string {
    if (!categoryId) return '';
    
    const categoryMap: {[key: number]: string} = {
      1: 'Диваны и кресла',
      2: 'Столы и стулья',
      3: 'Шкафы и комоды',
      4: 'Кровати и матрасы',
      5: 'Другое'
    };
    
    return categoryMap[categoryId] || '';
  }

  // Helper function to map category name to category_id
  mapCategoryNameToId(categoryName?: string): number | null {
    if (!categoryName) return null;
    
    const categoryMap: {[key: string]: number} = {
        'Диваны и кресла': 1,
        'Столы и стулья': 2,
        'Шкафы и комоды': 3,
        'Кровати и матрасы': 4,
        'Другое': 5
    };
    
    return categoryMap[categoryName] || null;
  }

  async createListing(data: CreateListingData) {
    console.log("Creating listing with data:", data);
    try {
      // Ensure we're using the correct API endpoint
      const response = await api.post('/api/listings', data);
      console.log("Create listing response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating listing:", error);
      throw error;
    }
  }

  async updateListing(id: number, data: Partial<CreateListingData>) {
    const response = await api.put(`/api/listings/${id}`, data);
    return response.data;
  }

  async deleteListing(id: number) {
    const response = await api.delete(`/api/listings/${id}`);
    return response.data;
  }

  // Image handling
  async uploadImage(listingId: number, image: File) {
    console.log("Uploading image for listing ID:", listingId);
    if (!listingId) {
      console.error("Invalid listing ID for image upload");
      throw new Error("Недопустимый ID объявления для загрузки изображения");
    }
    
    const formData = new FormData();
    formData.append('image', image);
    
    try {
      const response = await api.post(`/api/listings/${listingId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("Upload image response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }
  
  // Image URL handling
  async uploadImageUrl(listingId: number, imageUrl: string) {
    console.log("Uploading image URL for listing ID:", listingId);
    if (!listingId) {
      console.error("Invalid listing ID for image URL upload");
      throw new Error("Недопустимый ID объявления для загрузки ссылки на изображение");
    }
    
    try {
      // Создаем FormData и добавляем image_url как параметр
      const formData = new FormData();
      formData.append('image_url', imageUrl);
      
      console.log(`Sending image URL "${imageUrl}" to /api/listings/${listingId}/images`);
      
      const response = await api.post(`/api/listings/${listingId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("Upload image URL response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error uploading image URL:", error);
      throw error;
    }
  }

  async deleteImage(listingId: number, imageId: number) {
    const response = await api.delete(`/api/listings/${listingId}/images/${imageId}`);
    return response.data;
  }

  async setMainImage(listingId: number, imageId: number) {
    console.log(`Setting main image, listing ID: ${listingId}, image ID: ${imageId}`);
    try {
      const response = await api.put(`/api/listings/${listingId}/images/${imageId}/main`);
      console.log("Set main image response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error setting main image:", error);
      throw error;
    }
  }

  // Favorites
  async addToFavorites(listingId: number) {
    console.log("Adding to favorites, listing ID:", listingId);
    try {
      const response = await api.post(`/api/listings/${listingId}/favorite`);
      console.log("Add to favorites response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw error;
    }
  }

  async removeFromFavorites(listingId: number) {
    console.log("Removing from favorites, listing ID:", listingId);
    try {
      const response = await api.delete(`/api/listings/${listingId}/favorite`);
      console.log("Remove from favorites response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw error;
    }
  }

  async checkFavorite(listingId: number) {
    console.log("Checking favorite status, listing ID:", listingId);
    try {
      const response = await api.get(`/api/listings/${listingId}/favorite`);
      console.log("Check favorite response:", response.data);
      // Handle both field names for compatibility
      const isFavorite = response.data.is_favorite !== undefined ? 
        response.data.is_favorite : 
        response.data.isFavorite || false;
      return { isFavorite };
    } catch (error) {
      console.error("Error checking favorite status:", error);
      // Возвращаем объект с isFavorite: false в случае ошибки, вместо выброса исключения
      // Это поможет избежать ошибок отображения на странице продукта
      return { isFavorite: false };
    }
  }

  async getFavorites() {
    try {
      console.log("Fetching user favorites");
      const response = await api.get('/api/favorites');
      console.log("Get favorites response:", response.data);
      
      // Handle various response formats for compatibility
      if (response.data.favorites && Array.isArray(response.data.favorites)) {
        // New API format: extracts the listings from each favorite object
        const listings = response.data.favorites.map((favorite: any) => {
          return favorite.listing || favorite;
        }).filter(Boolean);
        
        return {
          favorites: listings,
          total_count: response.data.total_count || listings.length,
          current_page: response.data.current_page || 1,
          total_pages: response.data.total_pages || 1
        };
      }
      
      return response.data;
    } catch (error) {
      console.error("Error getting favorites:", error);
      throw error;
    }
  }

  async getUserListings() {
    try {
      console.log("Fetching user's listings");
      const response = await api.get('/api/listings/my');
      console.log("Get user listings response:", response.data);
      
      if (response.data && response.data.listings) {
        return {
          listings: response.data.listings || [],
          count: response.data.count || response.data.listings.length
        };
      }
      
      return { listings: [], count: 0 };
    } catch (error) {
      console.error("Error getting user listings:", error);
      throw error;
    }
  }
}

export default new ListingService();