import api from './api';

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  text: string;
  createdAt: string;
}

export interface Chat {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  created_at: string;
  listing_title: string;
  image_url?: string;
  last_message?: string;
  last_message_time?: string;
  other_user_id?: number;
  other_user_name?: string;
  unread_count?: number;
  // Fields from new API response format
  user1_id?: number;
  user2_id?: number;
  user1_name?: string;
  user2_name?: string;
  last_message_at?: string;
  // Backward compatibility fields
  users?: {
    id: number;
    name: string;
    avatar: string | null;
  }[];
  lastMessage?: {
    text: string;
    createdAt: string;
    senderId: number;
  } | null;
  listingId?: number;
  listingTitle?: string;
  listingImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateChatData {
  listing_id: number;
  message: string;
  recipient_id?: number;
}

export interface SendMessageData {
  content: string;
}

class ChatService {
  isTokenAvailable() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  async getChats() {
    try {
      if (!this.isTokenAvailable()) {
        console.warn("No authentication token available for chat service");
        return { chats: [] };
      }

      console.log("Fetching user chats");
      try {
        const response = await api.get('/api/chats');
        console.log("Chats response:", response.data);
        
        // Проверяем структуру ответа и обеспечиваем совместимость
        let chats: Chat[] = [];
        
        if (response.data && response.data.chats && Array.isArray(response.data.chats)) {
          // If API returned an array of chats in the expected format
          chats = response.data.chats;
        } else if (Array.isArray(response.data)) {
          // If API returned just an array of chats
          chats = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If API returned some other object format
          chats = Array.isArray(response.data.chats) ? response.data.chats : 
                 Array.isArray(response.data.data) ? response.data.data : 
                 [];
        }
        
        // Transform the chat data to add the expected 'users' array for backward compatibility
        const currentUserId = this.getCurrentUserId();
        const transformedChats = chats.map(chat => {
          if (!chat) return null;
          
          // Skip if already has the expected format
          if (chat.users && Array.isArray(chat.users) && chat.users.length > 0) {
            // Ensure we have at least 2 users
            const hasCurrentUser = chat.users.some(user => user && user.id === currentUserId);
            const hasOtherUser = chat.users.some(user => user && user.id !== currentUserId);
            
            if (hasCurrentUser && hasOtherUser) {
              return chat; // Chat already has all needed users
            }
            
            // Add missing users if needed
            const updatedUsers = [...chat.users];
            
            if (!hasCurrentUser) {
              updatedUsers.push({
                id: currentUserId,
                name: 'Вы',
                avatar: null
              });
            }
            
            if (!hasOtherUser) {
              // Create other user based on available information
              const otherUserId = chat.other_user_id || 
                                 (chat.buyer_id === currentUserId ? chat.seller_id : chat.buyer_id);
              
              updatedUsers.push({
                id: otherUserId || 0,
                name: chat.other_user_name || 'Пользователь',
                avatar: null
              });
            }
            
            return {
              ...chat,
              users: updatedUsers
            };
          }
          
          // Create users array from buyer/seller information
          let otherUserId: number;
          
          // Try to determine the other user based on buyer/seller IDs
          if (chat.buyer_id !== undefined && chat.seller_id !== undefined) {
            const isCurrentUserBuyer = chat.buyer_id === currentUserId;
            otherUserId = isCurrentUserBuyer ? chat.seller_id : chat.buyer_id;
          } else if (chat.other_user_id !== undefined) {
            // Use other_user_id if available
            otherUserId = chat.other_user_id;
          } else {
            // Fallback to 0 if we can't determine
            otherUserId = 0;
          }
          
          return {
            ...chat,
            // Create users array with other user and current user
            users: [
              {
                id: otherUserId,
                name: chat.other_user_name || 'Пользователь',
                avatar: null
              },
              {
                id: currentUserId,
                name: 'Вы',
                avatar: null
              }
            ],
            // Map to common fields for backward compatibility
            listingId: chat.listing_id,
            listingTitle: chat.listing_title,
            listingImage: chat.image_url,
            lastMessage: chat.last_message ? {
              text: chat.last_message,
              createdAt: chat.last_message_time || chat.created_at,
              senderId: otherUserId // Assuming the last message is from the other user
            } : null,
            createdAt: chat.created_at
          };
        }).filter(Boolean);
        
        return { chats: transformedChats };
      } catch (error: any) {
        // If server returns 500 error, return empty chats instead of throwing
        console.error("Server error when fetching chats:", error.message);
        return { chats: [] };
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      // Return empty chats array instead of throwing
      return { chats: [] };
    }
  }

  // Get the current user ID from localStorage
  getCurrentUserId(): number {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || 0;
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
    return 0;
  }

  async getChat(id: number) {
    try {
      if (!this.isTokenAvailable()) {
        console.warn("No authentication token available for chat service");
        return { messages: [] };
      }

      console.log("Fetching chat details, ID:", id);
      try {
        const response = await api.get(`/api/chats/${id}`);
        console.log("Chat detail response:", response.data);
        
        // Проверяем структуру ответа и обеспечиваем совместимость
        let messages: any[] = [];
        
        if (response.data && response.data.messages && Array.isArray(response.data.messages)) {
          messages = response.data.messages;
        } else if (Array.isArray(response.data)) {
          messages = response.data;
        } else if (response.data && typeof response.data === 'object') {
          messages = Array.isArray(response.data.messages) ? response.data.messages : 
                    Array.isArray(response.data.data) ? response.data.data : 
                    [];
        }
        
        // Transform the messages to ensure they have the expected format
        const transformedMessages: Message[] = messages.map(message => {
          if (!message) return null;
          
          // If already has expected format, return as is
          if (message.id && message.chatId && message.text) {
            return message as Message;
          }
          
          // Transform message to expected format
          return {
            id: message.id || Math.random() * 10000,
            chatId: Number(id),
            senderId: message.sender_id || message.user_id || 0,
            text: message.content || message.text || message.message || '',
            createdAt: message.created_at || message.createdAt || new Date().toISOString()
          };
        }).filter(Boolean) as Message[];
        
        return { messages: transformedMessages };
      } catch (error: any) {
        console.error("Error fetching chat details:", error);
        return { messages: [] };
      }
    } catch (error) {
      console.error("Error fetching chat details:", error);
      // Return empty messages array instead of throwing
      return { messages: [] };
    }
  }

  async createChat(data: CreateChatData) {
    try {
      if (!this.isTokenAvailable()) {
        console.warn("No authentication token available for chat service");
        throw new Error("Authentication required");
      }

      console.log("Creating chat with data:", data);
      try {
        const response = await api.post('/api/chats', {
          listing_id: data.listing_id,
          message: data.message,
          recipient_id: data.recipient_id
        });
        console.log("Create chat response:", response.data);
        
        // Проверка и адаптация ответа
        if (response.data && response.data.chat && response.data.chat.id) {
          return response.data;
        } else if (response.data && response.data.id) {
          // Если API вернул напрямую объект чата
          return { 
            success: true,
            chat: response.data 
          };
        } else {
          console.warn("Unexpected chat creation response format:", response.data);
          return { 
            success: false,
            chat: { id: null } 
          };
        }
      } catch (error: any) {
        console.error("Error creating chat:", error);
        // Return a default structure to avoid UI errors
        return { 
          success: false,
          chat: { id: null } 
        };
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      // Return a default structure to avoid UI errors
      return { 
        success: false,
        chat: { id: null } 
      };
    }
  }

  async sendMessage(chatId: number, data: SendMessageData) {
    try {
      if (!this.isTokenAvailable()) {
        console.warn("No authentication token available for chat service");
        throw new Error("Authentication required");
      }

      console.log(`Sending message to chat ID: ${chatId}, data:`, data);
      try {
        const response = await api.post(`/api/chats/${chatId}/messages`, {
          content: data.content
        });
        console.log("Send message response:", response.data);
        
        // Проверка и адаптация ответа
        if (response.data && response.data.message) {
          return response.data;
        } else if (response.data && response.data.id) {
          // Transform API response to expected message format
          const transformedMessage = {
            id: response.data.id,
            chatId: Number(chatId),
            senderId: this.getCurrentUserId(),
            text: data.content,
            createdAt: response.data.created_at || response.data.createdAt || new Date().toISOString()
          };
          
          return { 
            success: true,
            message: transformedMessage 
          };
        } else {
          console.warn("Unexpected message creation response format:", response.data);
          return { 
            success: false,
            message: null 
          };
        }
      } catch (error: any) {
        console.error("Error sending message:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
}

export default new ChatService(); 