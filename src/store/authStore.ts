import { create } from 'zustand';
import { User, AuthState } from '@/models/user';
import * as authService from '@/services/authService';

interface AuthStore extends AuthState {
  isAdminDevice: boolean;
  secretKey: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
  setUser: (user: User | null) => void;
  checkSecretKey: (params: URLSearchParams) => boolean;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdminDevice: localStorage.getItem('rbu_admin_device') === 'true',
  secretKey: localStorage.getItem('rbu_admin_key'),

  login: async (email: string, password: string) => {
    const user = await authService.signIn(email, password);
    authService.setMockUser(user);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.signOut();
    authService.setMockUser(null);
    set({ user: null, isAuthenticated: false });
  },

  initialize: () => {
    set({ isLoading: true });

    const unsubscribe = authService.onAuthStateChanged((user) => {
      set({ user, isAuthenticated: !!user, isLoading: false });
    });

    // Check for existing mock user
    const existingUser = authService.getCurrentUser();
    if (existingUser) {
      set({ user: existingUser, isAuthenticated: true, isLoading: false });
    } else {
      set({ isLoading: false });
    }

    return unsubscribe;
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  checkSecretKey: (params: URLSearchParams) => {
    const key = params.get('admin_key');
    // For demo purposes, the secret key is 'RBU2026'
    // In production, this could be more complex or fetched from config
    if (key === 'RBU2026') {
      localStorage.setItem('rbu_admin_device', 'true');
      localStorage.setItem('rbu_admin_key', key);
      set({ isAdminDevice: true, secretKey: key });
      return true;
    }
    return false;
  },
}));
