// Klien pembayaran denda (FR-S4-04.6–04.10, 04.14).
// Tagihan & transaksi dibaca real-time dari Firestore; pembuatan transaksi Midtrans
// dan sinkronisasi status dilakukan oleh backend (kredensial tidak pernah di klien).
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';

import { auth, db } from '@/config/firebase';
import { AppError } from '@/lib/validasi';
import type { Subscribe } from '@/services/praktikum';

export type StatusPembayaran = 'unpaid' | 'pending' | 'success' | 'failed';
export type StatusTransaksi = 'pending' | 'success' | 'failed';

export type Tagihan = {
  id: string;
  uid: string;
  nama: string;
  nim: string;
  sesiId: string;
  kelasId: string;
  namaPraktikum: string;
  tanggalSesi: string;
  laboratoriumId: string;
  namaLab: string;
  presensiUid: string;
  waktuPresensi: Date | null;
  terlambatMenit: number;
  nominal: number;
  statusPembayaran: StatusPembayaran;
  lastOrderId: string | null;
  dibuatPada: Date | null;
  dibayarPada: Date | null;
};

export type Transaksi = {
  orderId: string;
  tagihanId: string;
  uid: string;
  status: StatusTransaksi;
  snapToken: string;
  redirectUrl: string;
  paymentType: string | null;
  nominal: number;
  dibuatPada: Date | null;
  diperbaruiPada: Date | null;
};

export type HasilBuatPembayaran = {
  orderId: string;
  snapToken: string;
  redirectUrl: string;
};

const API_URL = (process.env.EXPO_PUBLIC_PAYMENT_API_URL ?? '').trim().replace(/\/+$/, '');

function keTanggal(nilai: unknown): Date | null {
  if (nilai instanceof Date) return nilai;
  const kandidat = nilai as { toDate?: () => Date } | null;
  return kandidat && typeof kandidat.toDate === 'function' ? kandidat.toDate() : null;
}

function keString(nilai: unknown, fallback = ''): string {
  return typeof nilai === 'string' ? nilai : fallback;
}

function keNomor(nilai: unknown, fallback = 0): number {
  return typeof nilai === 'number' && Number.isFinite(nilai) ? nilai : fallback;
}

export function mapTagihan(id: string, data: Record<string, unknown>): Tagihan {
  return {
    id,
    uid: keString(data.uid),
    nama: keString(data.nama),
    nim: keString(data.nim),
    sesiId: keString(data.sesiId),
    kelasId: keString(data.kelasId),
    namaPraktikum: keString(data.namaPraktikum),
    tanggalSesi: keString(data.tanggalSesi),
    laboratoriumId: keString(data.laboratoriumId),
    namaLab: keString(data.namaLab),
    presensiUid: keString(data.presensiUid, id),
    waktuPresensi: keTanggal(data.waktuPresensi),
    terlambatMenit: keNomor(data.terlambatMenit),
    nominal: keNomor(data.nominal),
    statusPembayaran: (keString(data.statusPembayaran, 'unpaid') as StatusPembayaran) || 'unpaid',
    lastOrderId: typeof data.lastOrderId === 'string' ? data.lastOrderId : null,
    dibuatPada: keTanggal(data.dibuatPada),
    dibayarPada: keTanggal(data.dibayarPada),
  };
}

export function mapTransaksi(orderId: string, data: Record<string, unknown>): Transaksi {
  return {
    orderId,
    tagihanId: keString(data.tagihanId),
    uid: keString(data.uid),
    status: (keString(data.status, 'pending') as StatusTransaksi) || 'pending',
    snapToken: keString(data.snapToken),
    redirectUrl: keString(data.redirectUrl),
    paymentType: typeof data.paymentType === 'string' ? data.paymentType : null,
    nominal: keNomor(data.nominal),
    dibuatPada: keTanggal(data.dibuatPada),
    diperbaruiPada: keTanggal(data.diperbaruiPada),
  };
}

function urutTerbaru<T extends { dibuatPada: Date | null }>(daftar: T[]): T[] {
  return [...daftar].sort(
    (a, b) => (b.dibuatPada?.getTime() ?? 0) - (a.dibuatPada?.getTime() ?? 0),
  );
}

/** Tagihan milik satu praktikan, terbaru lebih dulu (FR-04.6). */
export function subscribeTagihanSaya(uid: string): Subscribe<Tagihan[]> {
  return (next, error) =>
    onSnapshot(
      query(collection(db, 'tagihan'), where('uid', '==', uid)),
      (snap) => next(urutTerbaru(snap.docs.map((d) => mapTagihan(d.id, d.data())))),
      error,
    );
}

/** Satu tagihan untuk halaman checkout (FR-04.7). */
export function subscribeTagihanById(id: string): Subscribe<Tagihan | null> {
  return (next, error) =>
    onSnapshot(
      doc(db, 'tagihan', id),
      (snap) => next(snap.exists() ? mapTagihan(snap.id, snap.data()) : null),
      error,
    );
}

/** Riwayat transaksi milik praktikan (FR-04.9). */
export function subscribeTransaksiSaya(uid: string): Subscribe<Transaksi[]> {
  return (next, error) =>
    onSnapshot(
      query(collection(db, 'transaksi'), where('uid', '==', uid)),
      (snap) => next(urutTerbaru(snap.docs.map((d) => mapTransaksi(d.id, d.data())))),
      error,
    );
}

/** Transaksi untuk satu tagihan; filter uid agar lolos Security Rules. */
export function subscribeTransaksiTagihan(tagihanId: string, uid: string): Subscribe<Transaksi[]> {
  return (next, error) =>
    onSnapshot(
      query(
        collection(db, 'transaksi'),
        where('tagihanId', '==', tagihanId),
        where('uid', '==', uid),
      ),
      (snap) => next(urutTerbaru(snap.docs.map((d) => mapTransaksi(d.id, d.data())))),
      error,
    );
}

function apiBase(): string {
  if (!API_URL) {
    throw new AppError(
      'Alamat server pembayaran belum dikonfigurasi. Hubungi aslab (EXPO_PUBLIC_PAYMENT_API_URL).',
    );
  }
  return API_URL;
}

async function ambilToken(): Promise<string> {
  const pengguna = auth.currentUser;
  if (!pengguna) throw new AppError('Sesi login berakhir. Silakan login kembali.');
  return pengguna.getIdToken();
}

async function bacaJson(res: Response): Promise<{ error?: string } & Record<string, unknown>> {
  try {
    return (await res.json()) as { error?: string } & Record<string, unknown>;
  } catch {
    return {};
  }
}

async function mintaJson(path: string, init: RequestInit): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, init);
  } catch {
    throw new AppError('Tidak dapat menghubungi server pembayaran. Periksa koneksi Anda.');
  }
  const body = await bacaJson(res);
  if (!res.ok) {
    throw new AppError(body.error || 'Server pembayaran menolak permintaan.');
  }
  return body;
}

/** Minta backend membuat transaksi Midtrans Snap (FR-04.7, 04.8). */
export async function buatPembayaran(tagihanId: string): Promise<HasilBuatPembayaran> {
  const token = await ambilToken();
  const body = await mintaJson('/api/payments/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tagihanId }),
  });

  const orderId = keString(body.orderId);
  const redirectUrl = keString(body.redirectUrl);
  const snapToken = keString(body.snapToken);
  if (!orderId || !redirectUrl) {
    throw new AppError('Server tidak mengembalikan tautan pembayaran yang valid.');
  }
  return { orderId, snapToken, redirectUrl };
}

/** Sinkronkan status langsung ke Midtrans bila webhook belum masuk (FR-04.10). */
export async function cekStatusPembayaran(orderId: string): Promise<StatusTransaksi> {
  const token = await ambilToken();
  const body = await mintaJson(`/api/payments/${encodeURIComponent(orderId)}/status`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const status = keString(body.status);
  if (status !== 'pending' && status !== 'success' && status !== 'failed') {
    throw new AppError('Status pembayaran tidak dikenali.');
  }
  return status;
}
