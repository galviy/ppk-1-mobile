import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { PushNotificationPayload } from '@/data/types';
import {
  classifyDeviceError,
  DeviceConditionType,
  isOfflineError,
} from '@/lib/device-errors';
import { updateUserPushToken } from '@/services/userService';

export const DEFAULT_NOTIFICATION_CHANNEL_ID = 'default';

export type PushRegistrationStatus =
  | 'granted'
  | 'denied'
  | 'emulator'
  | 'unsupported'
  | 'offline'
  | 'error';

export interface PushRegistrationResult {
  status: PushRegistrationStatus;
  token: string | null;
  condition: DeviceConditionType | null;
  message?: string;
}

let handlerConfigured = false;

/**
 * Mengatur perilaku notifikasi saat aplikasi berada di foreground (banner, list, suara) (S3-01.5)
 */
export function configureForegroundNotifications(): void {
  if (Platform.OS === 'web' || handlerConfigured) {
    return;
  }

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    handlerConfigured = true;
  } catch (error) {
    console.warn('Gagal mengonfigurasi foreground notification handler:', error);
  }
}

// Inisialisasi handler saat modul dimuat di native
configureForegroundNotifications();

/**
 * Membuat notification channel default pada Android (wajib sebelum meminta token di Android 13+) (S3-01.3)
 */
export async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    DEFAULT_NOTIFICATION_CHANNEL_ID,
    {
      name: 'Notifikasi Praktikum PPK',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#208AEF',
    }
  );
}

/**
 * Mengambil EAS projectId dari konfigurasi app.json (S3-01.3)
 */
export function getEasProjectId(): string | undefined {
  const fromExpoConfig = Constants?.expoConfig?.extra?.eas?.projectId as
    | string
    | undefined;
  const fromEasConfig = Constants?.easConfig?.projectId as string | undefined;
  return fromExpoConfig || fromEasConfig;
}

/**
 * Meminta izin notifikasi, menyiapkan channel Android, dan mengambil Expo Push Token (S3-01.3)
 * Hanya berjalan di perangkat fisik.
 */
export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
  if (Platform.OS === 'web') {
    return {
      status: 'unsupported',
      token: null,
      condition: null,
      message: 'Push notification tidak didukung pada platform web.',
    };
  }

  try {
    await ensureAndroidNotificationChannel();
  } catch (channelErr) {
    console.warn('Gagal membuat channel notifikasi Android:', channelErr);
  }

  // S3-01.3: Hanya mengambil Expo push token di perangkat fisik
  if (!Device.isDevice) {
    return {
      status: 'emulator',
      token: null,
      condition: null,
      message:
        'Push notification jarak jauh hanya tersedia pada perangkat fisik.',
    };
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return {
        status: 'denied',
        token: null,
        condition: 'notifikasi',
        message: 'Izin notifikasi belum diaktifkan pada perangkat ini.',
      };
    }

    const projectId = getEasProjectId();
    if (!projectId) {
      return {
        status: 'error',
        token: null,
        condition: null,
        message: 'Project ID EAS tidak ditemukan di app.json.',
      };
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return {
      status: 'granted',
      token: tokenData.data,
      condition: null,
    };
  } catch (error) {
    if (isOfflineError(error)) {
      return {
        status: 'offline',
        token: null,
        condition: 'offline',
        message:
          'Tidak dapat mengambil token notifikasi karena perangkat sedang offline.',
      };
    }

    console.warn('Gagal mendapatkan Expo push token:', error);
    return {
      status: 'error',
      token: null,
      condition: null,
      message:
        error instanceof Error
          ? error.message
          : 'Gagal mendapatkan token notifikasi dari layanan perangkat.',
    };
  }
}

/**
 * Mengambil Expo push token perangkat dan menyimpannya ke users/{uid} bila baru atau berubah (S3-01.3, S3-01.4)
 */
export async function syncUserPushToken(
  uid: string,
  currentSavedToken?: string | null
): Promise<PushRegistrationResult> {
  const result = await registerForPushNotificationsAsync();

  if (result.status !== 'granted' || !result.token) {
    return result;
  }

  // S3-01.4: Perbarui di Firestore hanya jika belum ada atau berubah
  if (currentSavedToken && currentSavedToken === result.token) {
    return result;
  }

  try {
    await updateUserPushToken(uid, result.token);
    return result;
  } catch (error) {
    console.warn('Gagal menyimpan expoPushToken ke Firestore:', error);
    if (isOfflineError(error)) {
      return {
        status: 'offline',
        token: result.token,
        condition: 'offline',
        message:
          'Gagal menyimpan token notifikasi karena perangkat sedang offline.',
      };
    }

    return {
      status: 'error',
      token: result.token,
      condition: classifyDeviceError(error),
      message: 'Gagal menyimpan token notifikasi ke profil pengguna.',
    };
  }
}

/**
 * Menghapus (set null) expoPushToken dari dokumen users/{uid} saat pengguna logout (S3-01.4)
 * Harus dipanggil selagi sesi Firebase Auth masih aktif sebelum signOut().
 */
export async function clearUserPushToken(uid: string): Promise<void> {
  if (!uid) return;
  try {
    await updateUserPushToken(uid, null);
  } catch (error) {
    console.warn('Gagal menghapus expoPushToken saat logout:', error);
  }
}

/**
 * Mengekstrak payload data dari objek NotificationResponse
 */
export function extractNotificationData(
  response: Notifications.NotificationResponse | null | undefined
): Record<string, unknown> | null {
  const rawData = response?.notification?.request?.content?.data;
  if (!rawData || typeof rawData !== 'object') {
    return null;
  }

  const dataRecord = rawData as Record<string, unknown>;
  if (typeof dataRecord.dataString === 'string') {
    try {
      const parsed = JSON.parse(dataRecord.dataString);
      if (parsed && typeof parsed === 'object') {
        return { ...dataRecord, ...(parsed as Record<string, unknown>) };
      }
    } catch {
      // Abaikan jika dataString bukan JSON valid
    }
  }

  return dataRecord;
}

/**
 * Menerjemahkan payload notifikasi menjadi rute Expo Router sesuai kontrak Bagian 6 (S3-01.5):
 * - { event: 'sesi_dibuka', sesiId, kelasId } -> /presensi/{sesiId}
 * - { event: 'jadwal_berubah', sesiId, kelasId } -> /sesi/{sesiId}
 * - { event: 'izin_diputuskan', izinId, status } -> /izin/{izinId}
 */
export function resolveNotificationRoute(
  data: Record<string, unknown> | PushNotificationPayload | null | undefined
): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const payload = data as Record<string, unknown>;
  const event = typeof payload.event === 'string' ? payload.event.trim() : '';
  const sesiId =
    typeof payload.sesiId === 'string' ? payload.sesiId.trim() : '';
  const izinId =
    typeof payload.izinId === 'string' ? payload.izinId.trim() : '';

  switch (event) {
    case 'sesi_dibuka':
      return sesiId ? `/presensi/${sesiId}` : null;
    case 'jadwal_berubah':
      return sesiId ? `/sesi/${sesiId}` : null;
    case 'izin_diputuskan':
      return izinId ? `/izin/${izinId}` : null;
    default:
      if (typeof payload.route === 'string' && payload.route.startsWith('/')) {
        return payload.route;
      }
      if (typeof payload.url === 'string' && payload.url.startsWith('/')) {
        return payload.url;
      }
      return null;
  }
}
