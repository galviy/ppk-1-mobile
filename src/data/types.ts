export type Role = 'praktikan' | 'asisten';

export type UserProfile = {
  uid: string;
  email: string;
  nama: string;
  role: Role;
  nim?: string;
  kelas?: 'A' | 'B';
  nip?: string;
  expoPushToken?: string | null;
  pushTokenUpdatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PushNotificationEvent = 'sesi_dibuka' | 'jadwal_berubah' | 'izin_diputuskan';

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
