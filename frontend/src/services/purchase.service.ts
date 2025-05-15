import api from './api';
import listingService from './listing.service';

export interface Purchase {
  id: number;
  listing_id: number;
  title: string;
  price: number;
  image?: string;
  images?: Array<string | { id?: number; listing_id?: number; image_path?: string; is_main?: boolean; }>;
  seller_name: string;
  seller_id?: number;
  category?: string;
  purchase_date?: string;
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

class PurchaseService {
  async getPurchases() {
    try {
      const response = await api.get('/api/purchases');
      console.log("Get purchases response:", response.data);
      
      const purchases = response.data?.purchases || [];
      
      // Fetch listing details for each purchase to get images
      const purchasesWithImages = await Promise.all(
        purchases.map(async (purchase: Purchase) => {
          if (purchase.listing_id) {
            try {
              // Get listing details to get images
              const { listing } = await listingService.getListing(purchase.listing_id);
              
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
                  ...purchase,
                  title: purchase.title || listing.title || '',
                  images: listing.images,
                  image: mainImage,
                  category
                };
              }
            } catch (error) {
              console.error(`Error fetching listing details for purchase ${purchase.id}:`, error);
            }
          }
          
          return purchase;
        })
      );
      
      return purchasesWithImages;
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      return [];
    }
  }

  async getPurchaseDetails(id: number) {
    try {
      const response = await api.get(`/api/purchases/${id}`);
      const purchase = response.data?.purchase;
      
      if (purchase && purchase.listing_id) {
        try {
          // Get listing details to get images
          const { listing } = await listingService.getListing(purchase.listing_id);
          
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
              ...purchase,
              title: purchase.title || listing.title || '',
              images: listing.images,
              image: mainImage,
              category
            };
          }
        } catch (error) {
          console.error(`Error fetching listing details for purchase ${id}:`, error);
        }
      }
      
      return purchase;
    } catch (error) {
      console.error(`Error fetching purchase details for ID ${id}:`, error);
      return null;
    }
  }
}

export default new PurchaseService(); 