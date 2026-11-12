import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { RegisterPayload, UserProfile } from '@/data/types';
import { loginUser, logoutUser, registerUser } from '@/services/authService';
import { getUserProfile } from '@/services/userService';

export interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Listener sesi autentikasi Firebase untuk mempertahankan status login (FR-01.9)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          // Ambil profil dan peran pengguna dari Firestore (FR-01.7)
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setUser(profile);
          } else {
            // Jika akun ada di Auth tapi profil Firestore belum lengkap
            const fallbackProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              nama: fbUser.displayName || 'Pengguna',
              role: 'praktikan',
              createdAt: new Date().toISOString(),
            };
            setUser(fallbackProfile);
          }
        } catch (error) {
          console.error('Error saat mengambil profil Firestore di auth state changed:', error);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const { user: fbUser, profile } = await loginUser(email, password);
      setFirebaseUser(fbUser);
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const { user: fbUser, profile } = await registerUser(payload);
      setFirebaseUser(fbUser);
      setUser(profile);
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setFirebaseUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!firebaseUser) return null;
    try {
      const profile = await getUserProfile(firebaseUser.uid);
      if (profile) {
        setUser(profile);
      }
      return profile;
    } catch (err) {
      console.error('Gagal merefresh profil:', err);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

