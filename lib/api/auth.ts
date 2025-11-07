import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  last_login: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

class AuthService {
  private getAuthHeaders() {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  setTokens(access: string, refresh: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/register/`, data);
    this.setTokens(response.data.tokens.access, response.data.tokens.refresh);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await axios.post(`${API_URL}/auth/login/`, credentials);
    this.setTokens(response.data.access, response.data.refresh);
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await axios.post(
          `${API_URL}/auth/logout/`,
          { refresh_token: refreshToken },
          { headers: this.getAuthHeaders() }
        );
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.clearTokens();
  }

  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_URL}/auth/refresh/`, {
      refresh: refreshToken,
    });

    this.setTokens(response.data.access, response.data.refresh);
    return response.data.access;
  }

  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${API_URL}/auth/me/`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axios.patch(`${API_URL}/auth/me/update/`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data.user;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await axios.post(
      `${API_URL}/auth/me/change-password/`,
      {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword,
      },
      { headers: this.getAuthHeaders() }
    );
  }
}

export const authService = new AuthService();
