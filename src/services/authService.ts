import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';
import { User } from '@/models/user';

const MOCK_USER: User = {
  uid: 'mock-user-123',
  email: 'faculty@university.edu',
  displayName: 'Faculty User',
  role: 'faculty',
};

const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  // Support both 'displayName' (Firebase default) and 'name' (README)
  displayName: firebaseUser.displayName || (firebaseUser as any).name || undefined,
  role: 'faculty',
});

export const signIn = async (email: string, password: string): Promise<User> => {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase auth not initialized');

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(userCredential.user);
  }

  // Mock login - simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock validation
  if (!email.includes('@') || password.length < 4) {
    throw new Error('Invalid credentials');
  }

  return { ...MOCK_USER, email };
};

export const signOut = async (): Promise<void> => {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    if (auth) {
      await firebaseSignOut(auth);
    }
    return;
  }

  // Mock sign out
  await new Promise((resolve) => setTimeout(resolve, 300));
};

export const getCurrentUser = (): User | null => {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    if (auth?.currentUser) {
      return mapFirebaseUser(auth.currentUser);
    }
    return null;
  }

  // Check session storage for mock user
  const storedUser = sessionStorage.getItem('mockUser');
  return storedUser ? JSON.parse(storedUser) : null;
};

export const onAuthStateChanged = (
  callback: (user: User | null) => void
): (() => void) => {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth();
    if (auth) {
      return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
        callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
      });
    }
  }

  // Mock auth state - check session storage
  const storedUser = sessionStorage.getItem('mockUser');
  callback(storedUser ? JSON.parse(storedUser) : null);

  // Return no-op unsubscribe for mock
  return () => { };
};

export const setMockUser = (user: User | null): void => {
  if (user) {
    sessionStorage.setItem('mockUser', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('mockUser');
  }
};
