// Model data Firestore (Sprint 2 / SRS-02).
//
// users/{uid}                      -> Profil (dibuat saat registrasi oleh modul Auth)
// kelas/{kelasId}                  -> Kelas  (pesertaUids = salinan uid peserta untuk query & rules)
// kelas/{kelasId}/peserta/{uid}    -> Peserta
// sesi/{sesiId}                    -> Sesi   (jadwal + status sesi dalam satu dokumen)
// sesi/{sesiId}/presensi/{uid}     -> Presensi (id dokumen = uid => satu presensi per praktikan per sesi)
import type { Role } from './types';

export type Peran = Role;
export type StatusSesi = 'belum_dibuka' | 'dibuka' | 'ditutup';
export type StatusKehadiran = 'tepat_waktu' | 'terlambat';
export type StatusPembayaran = 'unpaid' | 'pending' | 'success' | 'failed';
export type StatusTransaksi = Exclude<StatusPembayaran, 'unpaid'>;

export type Profil = {
  uid: string;
  nama: string;
  nim?: string;
  role: Peran;
  mataKuliahKode?: string;
};
export type Kelas = {
  id: string;
  nama: string;
  keterangan: string;
  pesertaUids: string[];
  laboratoriumId?: string;
  mataKuliahKode?: string;
  asprakUids?: string[];
};
export type Peserta = {
  uid: string;
  nama: string;
  nim: string;
  email?: string;
  dipindahkanPada?: Date | null;
};

/** Data laboratorium sementara; akan diganti kontrak resmi P3 setelah merge. */
export type LabRef = {
  id: string;
  nama: string;
  kode: string;
  latitude: number;
  longitude: number;
  radiusMeter: number;
};

export type InputSesi = {
  kelasId: string;
  namaPraktikum: string;
  tanggal: string; // YYYY-MM-DD
  jamMulai: string; // HH:MM
  jamSelesai: string; // HH:MM
  ruang: string;
  /** Wajib untuk sesi baru; opsional saat membaca data sesi lama. */
  laboratoriumId: string;
};
export type Sesi = Omit<InputSesi, 'laboratoriumId'> & {
  id: string;
  status: StatusSesi;
  laboratoriumId?: string;
  dibukaPada?: Date | null;
  ditutupPada?: Date | null;
  dibukaOleh?: string | null;
  gracePeriodMenit?: number;
  nominalDenda?: number;
};

export type Presensi = {
  uid: string;
  nama: string;
  nim: string;
  kelasId: string;
  waktu: Date | null; // null sesaat sebelum timestamp server tiba
  // Opsional hanya untuk kompatibilitas dokumen presensi Sprint 2.
  laboratoriumId?: string;
  latitude?: number;
  longitude?: number;
  jarakMeter?: number;
  akurasiMeter?: number;
  statusKehadiran?: StatusKehadiran;
  terlambatMenit?: number;
  gracePeriodMenit?: number;
};

export type TagihanDenda = {
  id: string; // `${sesiId}_${uid}`
  uid: string;
  nama: string;
  nim: string;
  sesiId: string;
  namaPraktikum: string;
  tanggalSesi: string;
  laboratoriumId: string;
  namaLab: string;
  kelasId: string;
  presensiUid: string;
  waktuPresensi: Date | null;
  terlambatMenit: number;
  nominal: number;
  statusPembayaran: StatusPembayaran;
  lastOrderId: string | null;
  dibuatPada: Date | null;
  dibayarPada: Date | null;
  updatedAt: Date | null;
};

export type TransaksiPembayaran = {
  orderId: string;
  tagihanId: string;
  uid: string;
  nama: string;
  nim: string;
  sesiId: string;
  namaPraktikum: string;
  laboratoriumId: string;
  nominal: number;
  status: StatusTransaksi;
  paymentType?: string;
  midtransTransactionId?: string;
  midtransTransactionStatus?: string;
  snapToken: string;
  redirectUrl: string;
  dibuatPada: Date | null;
  waktuTransaksi?: Date | null;
  updatedAt: Date | null;
};

export type { Izin } from './izin-types';
export type { Laboratorium } from './lab-types';
