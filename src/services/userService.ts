import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { UserProfile } from '@/data/types';

const USERS_COLLECTION = 'users';

/**
 * Menyimpan profil pengguna ke Cloud Firestore berdasarkan UID (FR-01.4, FR-01.5)
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, profile.uid);
  const now = new Date().toISOString();

  const dataToSave = {
    ...profile,
    createdAt: profile.createdAt || now,
    updatedAt: now,
  };

  await setDoc(userRef, dataToSave, { merge: true });
}

/**
 * Mengambil profil pengguna dari Cloud Firestore berdasarkan UID (FR-01.7)
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Gagal mengambil profil pengguna dari Firestore:', error);
    throw error;
  }
}

/**
 * Memperbarui profil pengguna di Cloud Firestore
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

