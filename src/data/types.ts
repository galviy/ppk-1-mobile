export type CanonicalRole = 'aslab' | 'asprak' | 'praktikan';

/** @deprecated Gunakan CanonicalRole ('asprak'). Dipertahankan selama masa transisi Sprint 4. */
export type LegacyRole = 'asisten';

export type Role = CanonicalRole | LegacyRole;

/** Memetakan peran lama `'asisten'` ke `'asprak'` selama transisi Sprint 4. */
export function normalizeRole(role: Role): CanonicalRole;
export function normalizeRole(role: string | null | undefined): CanonicalRole | null;
export function normalizeRole(role: string | null | undefined): CanonicalRole | null {
  if (role === 'asisten' || role === 'asprak') return 'asprak';
  if (role === 'aslab') return 'aslab';
  if (role === 'praktikan') return 'praktikan';
  return null;
}

export function isAslabRole(role: string | null | undefined): boolean {
  return normalizeRole(role) === 'aslab';
}

/** Bernilai true untuk `'asprak'` maupun `'asisten'` legacy. */
export function isAsprakRole(role: string | null | undefined): boolean {
  return normalizeRole(role) === 'asprak';
}

export type UserProfile = {
  uid: string;
  email: string;
  nama: string;
  role: Role;
  nim?: string;
  kelas?: 'A' | 'B';
  nip?: string;
  mataKuliahKode?: string;
  expoPushToken?: string | null;
  pushTokenUpdatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PushNotificationEvent =
  | 'sesi_dibuka'
  | 'jadwal_berubah'
  | 'izin_diputuskan'
  | 'tagihan_dibuat'
  | 'pembayaran_berhasil'
  | 'pembayaran_gagal';

export type PushNotificationPayload =
  | {
      event: 'sesi_dibuka';
      sesiId: string;
      kelasId?: string;
    }
  | {
      event: 'jadwal_berubah';
      sesiId: string;
      kelasId?: string;
    }
  | {
      event: 'izin_diputuskan';
      izinId: string;
      status?: string;
    }
  | {
      event: 'tagihan_dibuat';
      tagihanId: string;
      sesiId: string;
      nominal: number | string;
    }
  | {
      event: 'pembayaran_berhasil';
      tagihanId: string;
      orderId: string;
      status: 'success';
    }
  | {
      event: 'pembayaran_gagal';
      tagihanId: string;
      orderId: string;
      status: 'failed';
    };

export type RegisterPayload = {
  email: string;
  password: string;
  nama: string;
  role: Role;
  nim?: string;
  kelas?: 'A' | 'B';
  nip?: string;
};

export type Praktikan = {
  id: string;
  nama: string;
  kelas: 'A' | 'B';
};

export type Asisten = {
  id: string;
  nama: string;
};

export type Sesi = {
  id: string;
  namaPraktikum: string; // contoh: "Modul 1 — Siklus Hidup"
  kelas: 'A' | 'B';
  tanggal: string; // "2026-10-22"
  jamMulai: string; // "13:00"
  jamSelesai: string; // "15:00"
  status: 'belum_dibuka' | 'dibuka' | 'ditutup';
};

export type PresensiEntry = {
  praktikanId: string;
  nama: string;
  kelas: 'A' | 'B';
  waktu: string; // "HH:MM:SS"
};

export type UserIdentitas = {
  id: string;
  nama: string;
  kelas?: 'A' | 'B';
  email?: string;
  role?: Role;
};
