import { Linking, Platform } from 'react-native';

/**
 * Jenis kondisi perangkat sesuai kontrak Sprint 3 (Bagian 6 & S3-01.7)
 */
export type DeviceConditionType =
  | 'lokasi'
  | 'notifikasi'
  | 'gps'
  | 'lokasi-belum-ada'
  | 'offline';

export interface DeviceConditionInfo {
  jenis: DeviceConditionType;
  judul: string;
  pesan: string;
  canOpenSettings: boolean;
  canRetry: boolean;
  severity: 'error' | 'warning' | 'info';
}

const DEVICE_CONDITIONS: Record<DeviceConditionType, DeviceConditionInfo> = {
  lokasi: {
    jenis: 'lokasi',
    judul: 'Izin Lokasi Ditolak',
    pesan:
      'Akses lokasi diperlukan untuk memeriksa jarak Anda dengan laboratorium dan menampilkan peta. Silakan izinkan akses lokasi melalui pengaturan perangkat.',
    canOpenSettings: true,
    canRetry: true,
    severity: 'error',
  },
  gps: {
    jenis: 'gps',
    judul: 'Layanan Lokasi (GPS) Nonaktif',
    pesan:
      'Layanan lokasi atau GPS pada perangkat Anda sedang mati. Aktifkan layanan lokasi di pengaturan perangkat, lalu coba lagi.',
    canOpenSettings: true,
    canRetry: true,
    severity: 'error',
  },
  'lokasi-belum-ada': {
    jenis: 'lokasi-belum-ada',
    judul: 'Lokasi Belum Tersedia',
    pesan:
      'Koordinat lokasi perangkat belum berhasil didapatkan. Pastikan sinyal GPS memadai lalu tekan Coba lagi.',
    canOpenSettings: false,
    canRetry: true,
    severity: 'warning',
  },
  offline: {
    jenis: 'offline',
    judul: 'Tidak Ada Koneksi Internet',
    pesan:
      'Perangkat sedang offline atau gagal terhubung ke server. Periksa koneksi Wi-Fi atau data seluler Anda, lalu coba lagi.',
    canOpenSettings: false,
    canRetry: true,
    severity: 'error',
  },
  notifikasi: {
    jenis: 'notifikasi',
    judul: 'Notifikasi Nonaktif',
    pesan:
      'Izin notifikasi tidak diberikan. Aplikasi tetap berjalan normal, tetapi Anda tidak akan menerima push notification saat sesi dibuka, jadwal berubah, atau izin diputuskan.',
    canOpenSettings: true,
    canRetry: true,
    severity: 'warning',
  },
};

/**
 * Mengambil informasi lengkap (judul, pesan, opsi aksi) untuk jenis kondisi perangkat (S3-01.7)
 */
export function getDeviceConditionInfo(jenis: DeviceConditionType): DeviceConditionInfo {
  return DEVICE_CONDITIONS[jenis] ?? DEVICE_CONDITIONS.offline;
}

/**
 * Mengambil teks pesan ramah pengguna untuk jenis kondisi perangkat (S3-01.7)
 */
export function getDeviceErrorMessage(jenis: DeviceConditionType): string {
  return getDeviceConditionInfo(jenis).pesan;
}

/**
 * Memeriksa apakah error disebabkan oleh kondisi jaringan/offline
 */
export function isOfflineError(error: unknown): boolean {
  if (!error) return false;
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code ?? '').toLowerCase()
      : '';
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message ?? '').toLowerCase()
        : String(error).toLowerCase();

  return (
    code === 'unavailable' ||
    code === 'auth/network-request-failed' ||
    code === 'firestore/unavailable' ||
    message.includes('offline') ||
    message.includes('network request failed') ||
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    message.includes('client is offline')
  );
}

/**
 * Mengklasifikasikan error menjadi salah satu jenis kondisi perangkat
 */
export function classifyDeviceError(
  error: unknown,
  fallback: DeviceConditionType = 'offline'
): DeviceConditionType {
  if (isOfflineError(error)) {
    return 'offline';
  }

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof error === 'string'
        ? error.toLowerCase()
        : '';

  if (
    message.includes('permission') &&
    (message.includes('notification') || message.includes('notifikasi'))
  ) {
    return 'notifikasi';
  }

  if (message.includes('permission') || message.includes('izin lokasi') || message.includes('denied')) {
    return 'lokasi';
  }

  if (
    message.includes('location services') ||
    message.includes('provider') ||
    message.includes('gps') ||
    message.includes('disabled')
  ) {
    return 'gps';
  }

  if (message.includes('timeout') || message.includes('unavailable') || message.includes('belum tersedia')) {
    return 'lokasi-belum-ada';
  }

  return fallback;
}

/**
 * Membuka halaman pengaturan aplikasi di perangkat memakai Linking.openSettings() (S3-01.7)
 */
export async function openDeviceSettings(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  try {
    await Linking.openSettings();
    return true;
  } catch (error) {
    console.warn('Gagal membuka pengaturan perangkat:', error);
    return false;
  }
}
