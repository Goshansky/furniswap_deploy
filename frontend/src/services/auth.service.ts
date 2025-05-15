import api from './api';

interface RegisterData {
  name: string;
  last_name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface VerifyEmailData {
  email: string;
  code: string;
}

interface Verify2FAData {
  email: string;
  code: string;
}

class AuthService {
  async register(data: RegisterData) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('last_name', data.last_name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    
    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Log the 2FA code if it exists in the response
    if (response.data && response.data.code) {
      console.log('2FA Code from registration:', response.data.code);
    }
    
    return response.data;
  }

  async verify(data: VerifyEmailData) {
    const response = await api.post('/auth/verify', data);
    return response.data;
  }

  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    
    // Log the 2FA code if it exists in the response
    if (response.data && response.data.code) {
      console.log('2FA Code from login:', response.data.code);
    }
    
    return response.data;
  }

  async verify2fa(data: Verify2FAData) {
    const response = await api.post('/auth/verify-2fa', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

export default new AuthService(); 