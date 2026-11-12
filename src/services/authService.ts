import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { RegisterPayload, UserProfile } from '@/data/types';
import { getUserProfile, saveUserProfile } from './userService';

/**
 * Mendaftarkan akun baru menggunakan Firebase Authentication dan menyimpan profil ke Cloud Firestore (FR-01.1, FR-01.4, FR-01.5, FR-01.6)
 */
export async function registerUser(payload: RegisterPayload): Promise<{
  user: User;
  profile: UserProfile;
}> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    payload.email.trim(),
    payload.password
  );

  const firebaseUser = userCredential.user;

  // Update displayName pada Firebase Auth
  if (payload.nama) {
    try {
      await updateProfile(firebaseUser, {
        displayName: payload.nama.trim(),
      });
    } catch (e) {
      console.warn('Gagal memperbarui displayName di Firebase Auth:', e);
    }
  }

  // Siapkan data profil pengguna untuk Firestore (FR-01.4 & FR-01.5)
  const profile: UserProfile = {
    uid: firebaseUser.uid,
    email: payload.email.trim(),
    nama: payload.nama.trim(),
    role: payload.role,
    ...(payload.nim ? { nim: payload.nim.trim() } : {}),
    ...(payload.kelas ? { kelas: payload.kelas } : {}),
    ...(payload.nip ? { nip: payload.nip.trim() } : {}),
    createdAt: new Date().toISOString(),
  };

  // Simpan ke Cloud Firestore
  await saveUserProfile(profile);

  return { user: firebaseUser, profile };
}

/**
 * Melakukan proses login dengan Firebase Authentication dan mengambil data profil dari Firestore (FR-01.2, FR-01.7)
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{
  user: User;
  profile: UserProfile;
}> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  const firebaseUser = userCredential.user;

  // Ambil data profil dari Firestore (FR-01.7)
  let profile = await getUserProfile(firebaseUser.uid);

  // Fallback jika dokumen profil di Firestore belum ada
  if (!profile) {
    profile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || email.trim(),
      nama: firebaseUser.displayName || email.split('@')[0],
      role: 'praktikan', // Default role
      createdAt: new Date().toISOString(),
    };
    try {
      await saveUserProfile(profile);
    } catch (err) {
      console.warn('Gagal menyimpan profil fallback:', err);
    }
  }

  return { user: firebaseUser, profile };
}

/**
 * Melakukan logout dari sesi autentikasi Firebase (FR-01.3)
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Menerjemahkan kode error Firebase Auth ke pesan berbahasa Indonesia yang ramah pengguna (FR-01.10)
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return 'Terjadi kesalahan sistem.';

  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid.';
    case 'auth/user-not-found':
      return 'Akun dengan email ini tidak ditemukan.';
    case 'auth/wrong-password':
      return 'Kata sandi yang Anda masukkan salah.';
    case 'auth/invalid-credential':
      return 'Email atau kata sandi yang Anda masukkan salah.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter.';
    case 'auth/network-request-failed':
      return 'Koneksi jaringan gagal. Periksa koneksi internet Anda.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Silakan coba lagi beberapa saat lagi.';
    case 'auth/user-disabled':
      return 'Akun pengguna ini telah dinonaktifkan.';
    case 'auth/operation-not-allowed':
      return 'Metode login ini belum diaktifkan di konsol Firebase.';
    default:
      if (message.includes('network') || message.includes('offline')) {
        return 'Gagal terhubung ke server Firebase. Pastikan perangkat Anda terhubung ke internet.';
      }
      return message || 'Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.';
  }
}

