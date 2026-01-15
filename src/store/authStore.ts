import { create } from 'zustand';
import { User, AuthState } from '@/models/user';
import * as authService from '@/services/authService';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
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
}));
