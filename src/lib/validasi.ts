// Validasi input dan penerjemahan error ke pesan yang ramah pengguna.
import type { InputSesi } from '@/data/models';

/** Error domain: pesannya aman ditampilkan langsung ke pengguna. */
export class AppError extends Error {}

/** Praktikan sudah presensi pada sesi ini. */
export class DuplikatError extends AppError {}

const REGEX_JAM = /^([01]\d|2[0-3]):[0-5]\d$/;

function tanggalValid(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function cekKelas(i: { nama: string }): string | null {
  const nama = i.nama.trim();
  if (nama.length < 2) return 'Nama kelas minimal 2 karakter.';
  if (nama.length > 60) return 'Nama kelas maksimal 60 karakter.';
  return null;
}

export function cekPeserta(i: { nama: string; nim: string }): string | null {
  if (i.nama.trim().length < 2) return 'Nama peserta minimal 2 karakter.';
  if (!/^[A-Za-z0-9]{5,20}$/.test(i.nim.trim())) return 'NIM harus 5–20 huruf/angka.';
  return null;
}

export function cekSesi(i: InputSesi): string | null {
  if (!i.kelasId) return 'Pilih kelas terlebih dahulu.';
  if (i.namaPraktikum.trim().length < 3) return 'Nama praktikum minimal 3 karakter.';
  if (!tanggalValid(i.tanggal.trim())) return 'Tanggal harus berformat YYYY-MM-DD dan valid.';
  if (!REGEX_JAM.test(i.jamMulai.trim()) || !REGEX_JAM.test(i.jamSelesai.trim()))
    return 'Jam harus berformat HH:MM (00:00–23:59).';
  if (i.jamSelesai.trim() <= i.jamMulai.trim()) return 'Jam selesai harus setelah jam mulai.';
  return null;
}

export function pesanError(e: unknown): string {
  if (e instanceof AppError) return e.message;
  const code = (e as { code?: string } | null)?.code ?? '';
  if (code.includes('permission-denied'))
    return 'Anda tidak memiliki izin untuk tindakan ini. Pastikan sudah login dengan peran yang sesuai.';
  if (code.includes('unavailable') || code.includes('deadline-exceeded') || code.includes('network'))
    return 'Koneksi bermasalah. Periksa internet Anda lalu coba lagi.';
  if (code.includes('unauthenticated')) return 'Sesi login berakhir. Silakan login kembali.';
  if (code.includes('not-found')) return 'Data tidak ditemukan (mungkin sudah dihapus).';
  if (code.includes('resource-exhausted')) return 'Kuota layanan habis. Coba lagi nanti.';
  return 'Terjadi kesalahan tak terduga. Coba lagi.';
}
