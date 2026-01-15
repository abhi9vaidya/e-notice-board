export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'faculty' | 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
