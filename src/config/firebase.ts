import { initializeApp, getApps, getApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Konfigurasi Firebase dari Environment Variables atau konfigurasi google-services.json
const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    'AIzaSyBUhkxRSwT0ief47PMyEQHrBNQ9NFMx_IM',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'ppk-kel2-2026.firebaseapp.com',
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'ppk-kel2-2026',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'ppk-kel2-2026.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '465565235976',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    '1:465565235976:android:631b6340bd5929d3fc4abd',
};

// Inisialisasi Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inisialisasi Firebase Auth dengan persistensi React Native AsyncStorage
const getReactNativePersistence = (FirebaseAuth as unknown as {
  getReactNativePersistence?: (storage: typeof AsyncStorage) => FirebaseAuth.Persistence;
}).getReactNativePersistence;

let auth: FirebaseAuth.Auth;
try {
  auth = FirebaseAuth.getAuth(app);
} catch {
  if (Platform.OS !== 'web' && getReactNativePersistence) {
    auth = FirebaseAuth.initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } else {
    auth = FirebaseAuth.getAuth(app);
  }
}

// Inisialisasi Cloud Firestore
export const db = getFirestore(app);
export { app, auth };
