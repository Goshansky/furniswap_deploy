import api from './api';
import listingService from './listing.service';

export interface Sale {
  id: number;
  listing_id: number;
  buyer_id: number;
  title: string;
  price: number;
  image?: string;
  images?: Array<string | { id?: number; listing_id?: number; image_path?: string; is_main?: boolean; }>;
  buyer_name: string;
  category?: string;
  sale_date?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

interface ImageObject {
  id?: number;
  listing_id?: number;
  image_path?: string;
  is_main?: boolean;
  created_at?: string;
  url?: string;
  path?: string;
}

class SaleService {
  async getSales() {
    try {
      const response = await api.get('/api/sales');
      console.log("Get sales response:", response.data);
      
      const sales = response.data?.sales || [];
      
      // Fetch listing details for each sale to get images
      const salesWithImages = await Promise.all(
        sales.map(async (sale: Sale) => {
          if (sale.listing_id) {
            try {
              // Get listing details to get images
              const { listing } = await listingService.getListing(sale.listing_id);
              
              if (listing) {
                // Find main image or use first image
                let mainImage = '';
                if (listing.images && listing.images.length > 0) {
                  // Check if we have an array of objects or strings
                  if (typeof listing.images[0] === 'string') {
                    mainImage = listing.images[0];
                  } else {
                    // Look for main image
                    const mainImageObj = listing.images.find((img: any) => img && img.is_main) as ImageObject | undefined;
                    if (mainImageObj && mainImageObj.image_path) {
                      mainImage = mainImageObj.image_path || '';
                    } else if (listing.images[0] && typeof listing.images[0] !== 'string' && (listing.images[0] as ImageObject).image_path) {
                      mainImage = ((listing.images[0] as ImageObject).image_path || '');
                    }
                  }
                }
                
                // Get category name if available
                const category = listing.category || '';
                
                return {
                  ...sale,
                  title: sale.title || listing.title || '',
                  images: listing.images,
                  image: mainImage,
                  category
                };
              }
            } catch (error) {
              console.error(`Error fetching listing details for sale ${sale.id}:`, error);
            }
          }
          
          return sale;
        })
      );
      
      return salesWithImages;
    } catch (error) {
      console.error("Error fetching sales history:", error);
      return [];
    }
  }

  async getSaleDetails(id: number) {
    try {
      const response = await api.get(`/api/sales/${id}`);
      const sale = response.data?.sale;
      
      if (sale && sale.listing_id) {
        try {
          // Get listing details to get images
          const { listing } = await listingService.getListing(sale.listing_id);
          
          if (listing) {
            // Find main image or use first image
            let mainImage = '';
            if (listing.images && listing.images.length > 0) {
              // Check if we have an array of objects or strings
              if (typeof listing.images[0] === 'string') {
                mainImage = listing.images[0];
              } else {
                // Look for main image
                const mainImageObj = listing.images.find((img: any) => img && img.is_main) as ImageObject | undefined;
                if (mainImageObj && mainImageObj.image_path) {
                  mainImage = mainImageObj.image_path || '';
                } else if (listing.images[0] && typeof listing.images[0] !== 'string' && (listing.images[0] as ImageObject).image_path) {
                  mainImage = ((listing.images[0] as ImageObject).image_path || '');
                }
              }
            }
            
            // Get category name if available
            const category = listing.category || '';
            
            return {
              ...sale,
              title: sale.title || listing.title || '',
              images: listing.images,
              image: mainImage,
              category
            };
          }
        } catch (error) {
          console.error(`Error fetching listing details for sale ${id}:`, error);
        }
      }
      
      return sale;
    } catch (error) {
      console.error(`Error fetching sale details for ID ${id}:`, error);
      return null;
    }
  }
}

export default new SaleService(); 