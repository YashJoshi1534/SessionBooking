import { create } from 'zustand';
import api from '../lib/axios';
import { toast } from 'sonner';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'USER' | 'CREATOR';
  avatar_url?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  checkAuth: async () => {
    try {
      if (!localStorage.getItem('access_token')) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const res = await api.get('/users/profile/');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch (e) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  loginWithGoogle: async (credential) => {
    const res = await api.post('/users/auth/google/', { access_token: credential });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    set({ user: res.data.user, isAuthenticated: true });
    toast.success(`Welcome back, ${res.data.user.first_name || res.data.user.username}!`);
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  }
}));

export default useAuthStore;
