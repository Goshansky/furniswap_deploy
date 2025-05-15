import api from './api';

export interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  city: string;
  avatar: string;
  created_at: string;
}

export interface UpdateProfileData {
  name?: string;
  city?: string;
}

// Кэш пользователей для оптимизации запросов
const userCache: Record<number, { user: User; timestamp: number }> = {};
const CACHE_LIFETIME = 5 * 60 * 1000; // 5 минут

class UserService {
  async getUserById(userId: number): Promise<User | null> {
    try {
      // Проверяем кэш
      const cachedUser = userCache[userId];
      const now = Date.now();
      
      if (cachedUser && (now - cachedUser.timestamp < CACHE_LIFETIME)) {
        console.log(`Using cached user data for userId=${userId}`);
        return cachedUser.user;
      }
      
      console.log(`Fetching user data for userId=${userId}`);
      const response = await api.get(`/users/${userId}`);
      
      if (response.data) {
        // Кэшируем результат
        userCache[userId] = {
          user: response.data,
          timestamp: now
        };
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }
  
  // Очистить кэш пользователя
  clearUserCache(userId?: number) {
    if (userId) {
      delete userCache[userId];
    } else {
      // Очистить весь кэш
      Object.keys(userCache).forEach(key => {
        delete userCache[Number(key)];
      });
    }
  }

  async getProfile() {
    const response = await api.get('/api/profile');
    const userData = response.data;
    
    // Сохраняем информацию о пользователе в localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  }

  async updateProfile(data: UpdateProfileData) {
    const response = await api.put('/api/profile', data);
    
    // Обновляем информацию о пользователе в localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data }));
    
    return response.data;
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/api/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Обновляем информацию о пользователе в localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...currentUser, avatar: response.data.avatar }));
    
    return response.data;
  }
}

export default new UserService(); 