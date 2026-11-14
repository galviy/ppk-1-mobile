// Lapisan akses Cloud Firestore untuk SRS-03: pengajuan izin praktikan, analisis sentimen lokal,
// pemeriksaan asisten (terima/tolak), dan listener real-time.
import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import type {
  InputIzin,
  Izin,
  ReasonSentiment,
  SentimentLabel,
  SentimentStatus,
  StatusIzin,
} from '@/data/izin-types';
import type { Profil } from '@/data/models';
import { validateReason } from '@/lib/leave-rules';
import { AppError, DuplikatError } from '@/lib/validasi';
import type { Subscribe } from '@/services/praktikum';
import { analyzeReason } from '@/services/sentiment-service';

const IZIN_COLLECTION = 'izin';

export function buatIzinId(sesiId: string, uid: string): string {
  return `${sesiId}_${uid}`;
}

// ---------- pemetaan error khusus SRS-03 ----------
export function pesanErrorIzin(e: unknown): string {
  if (e instanceof AppError) return e.message;
  const code = (e as { code?: string } | null)?.code ?? '';
  const msg = (e as { message?: string } | null)?.message?.toLowerCase() ?? '';

  if (
    code.includes('unavailable') ||
    code.includes('deadline-exceeded') ||
    code.includes('network') ||
    msg.includes('offline') ||
    msg.includes('network') ||
    msg.includes('timed out')
  ) {
    return 'Koneksi bermasalah, coba lagi.';
  }
  if (code.includes('permission-denied')) {
    return 'Akses ditolak oleh Firestore. Kemungkinan Security Rules koleksi izin belum aktif, Anda bukan peserta kelas pada sesi ini, Anda sudah pernah mengajukan izin untuk sesi ini, atau peran akun tidak sesuai.';
  }
  if (code.includes('already-exists')) {
    return 'Anda sudah mengajukan izin untuk sesi ini.';
  }
  if (code.includes('aborted')) {
    return 'Terjadi benturan data, coba lagi.';
  }
  if (code.includes('unauthenticated')) {
    return 'Sesi login berakhir. Silakan login kembali.';
  }
  if (code.includes('not-found')) {
    return 'Data izin atau sesi tidak ditemukan.';
  }
  if (code.includes('resource-exhausted')) {
    return 'Kuota layanan habis. Coba lagi nanti.';
  }
  return 'Terjadi kesalahan saat memproses izin. Silakan coba lagi.';
}

// ---------- pemetaan dokumen ----------
const VALID_LABELS = new Set<SentimentLabel>(['negatif', 'netral', 'positif']);
const VALID_SENTIMENT_STATUS = new Set<SentimentStatus>([
  'predicted',
  'empty_input',
  'unknown_vocabulary',
  'error',
]);
const VALID_STATUS_IZIN = new Set<StatusIzin>(['menunggu', 'diterima', 'ditolak']);

function mapSentimen(raw: unknown): ReasonSentiment | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const rawLabel = obj.label;
  const label: SentimentLabel | null =
    typeof rawLabel === 'string' && VALID_LABELS.has(rawLabel as SentimentLabel)
      ? (rawLabel as SentimentLabel)
      : null;
  const rawStatus = obj.status;
  const status: SentimentStatus =
    typeof rawStatus === 'string' && VALID_SENTIMENT_STATUS.has(rawStatus as SentimentStatus)
      ? (rawStatus as SentimentStatus)
      : label
        ? 'predicted'
        : 'unknown_vocabulary';

  return {
    label,
    status,
    source: 'model-edom',
    experimental: true,
  };
}

function mapIzin(d: DocumentSnapshot<DocumentData>): Izin {
  const rawStatus = d.get('status');
  const status: StatusIzin =
    typeof rawStatus === 'string' && VALID_STATUS_IZIN.has(rawStatus as StatusIzin)
      ? (rawStatus as StatusIzin)
      : 'menunggu';

  return {
    id: d.id,
    uid: d.get('uid') ?? '',
    nama: d.get('nama') ?? '',
    kelasId: d.get('kelasId') ?? '',
    sesiId: d.get('sesiId') ?? '',
    alasan: d.get('alasan') ?? '',
    sentimen: mapSentimen(d.get('sentimen')),
    status,
    diajukanPada: d.get('diajukanPada', { serverTimestamps: 'estimate' })?.toDate?.() ?? null,
    diputuskanOleh: d.get('diputuskanOleh') ?? null,
    diputuskanPada: d.get('diputuskanPada', { serverTimestamps: 'estimate' })?.toDate?.() ?? null,
  };
}

const urutIzinTerbaru = (a: Izin, b: Izin): number => {
  const ta = a.diajukanPada?.getTime() ?? 0;
  const tb = b.diajukanPada?.getTime() ?? 0;
  if (tb !== ta) return tb - ta;
  return a.id.localeCompare(b.id);
};

const urutIzinAsisten = (a: Izin, b: Izin): number => {
  // Prioritaskan status 'menunggu' di atas yang sudah diputuskan
  const pa = a.status === 'menunggu' ? 0 : 1;
  const pb = b.status === 'menunggu' ? 0 : 1;
  if (pa !== pb) return pa - pb;
  return urutIzinTerbaru(a, b);
};

// ---------- listener real-time ----------
/**
 * Daftar izin milik praktikan yang sedang login.
 * Memakai filter `where('uid', '==', uid)` agar sesuai dengan Security Rules:
 * `allow read: if isAsisten() || (signedIn() && resource.data.uid == request.auth.uid);`
 */
export const subscribeIzinSaya =
  (uid: string): Subscribe<Izin[]> =>
  (ok, err) =>
    onSnapshot(
      query(collection(db, IZIN_COLLECTION), where('uid', '==', uid)),
      (s) => ok(s.docs.map(mapIzin).sort(urutIzinTerbaru)),
      err,
    );

/**
 * Daftar seluruh pengajuan izin untuk diperiksa oleh asisten.
 */
export const subscribeSemuaIzin: Subscribe<Izin[]> = (ok, err) =>
  onSnapshot(
    collection(db, IZIN_COLLECTION),
    (s) => ok(s.docs.map(mapIzin).sort(urutIzinAsisten)),
    err,
  );

/**
 * Detail satu dokumen izin berdasarkan ID (`{sesiId}_{uid}`).
 * CATATAN PENTING: Hanya panggil untuk dokumen izin yang sudah ada (mis. dipilih dari daftar).
 * Jangan panggil untuk mengecek keberadaan dokumen yang belum ada sebagai praktikan,
 * karena Security Rules mengevaluasi `resource.data.uid == request.auth.uid` yang akan
 * ditolak (`permission-denied`) bila `resource == null`.
 */
export const subscribeIzinById =
  (id: string): Subscribe<Izin | null> =>
  (ok, err) =>
    onSnapshot(
      doc(db, IZIN_COLLECTION, id),
      (d) => ok(d.exists() ? mapIzin(d) : null),
      err,
    );

// ---------- operasi tulis atomik (transaksi) ----------
/**
 * Praktikan mengajukan izin untuk suatu sesi:
 * 1. Validasi alasan tidak kosong (3–500 karakter).
 * 2. Analisis sentimen dijalankan secara lokal di perangkat (`analyzeReason`).
 *    Kegagalan model menghasilkan `label: null` dan pengajuan tetap disimpan.
 *    Hasil AI tidak menyentuh `status` izin (selalu `'menunggu'`).
 * 3. Transaksi membaca `sesi/{sesiId}` dan `sesi/{sesiId}/presensi/{uid}` (tanpa membaca
 *    `izin/{sesiId}_{uid}` yang belum ada agar tidak melanggar Security Rules `resource.data.uid`),
 *    memastikan sesi belum ditutup dan praktikan belum presensi hadir.
 * 4. Menulis ke `izin/{sesiId}_{uid}`. Jika dokumen izin sudah ada, Security Rules (`allow create`
 *    vs `allow update`) akan menolak penulisan ulang sehingga mencegah pengajuan ganda.
 */
export async function ajukanIzin(
  input: InputIzin,
  profil: Profil,
  sudahIzinIds?: ReadonlySet<string>,
): Promise<{ id: string; sentimen: ReasonSentiment }> {
  if (!profil?.uid) {
    throw new AppError('Sesi pengguna tidak valid. Silakan login kembali.');
  }
  if (profil.role !== 'praktikan') {
    throw new AppError('Hanya praktikan yang dapat mengajukan izin.');
  }

  const sesiId = input.sesiId.trim();
  if (!sesiId) {
    throw new AppError('Pilih sesi terlebih dahulu.');
  }

  if (sudahIzinIds?.has(sesiId)) {
    throw new DuplikatError('Anda sudah mengajukan izin untuk sesi ini.');
  }

  const valid = validateReason(input.alasan);
  if (!valid.valid) {
    throw new AppError(valid.error);
  }

  // FR-03.8, FR-03.17, FR-03.18, FR-03.19: analisis lokal, tidak pernah throw, tidak menentukan status
  const sentimen = analyzeReason(valid.value);
  const izinId = buatIzinId(sesiId, profil.uid);
  const sesiRef = doc(db, 'sesi', sesiId);
  const presRef = doc(db, 'sesi', sesiId, 'presensi', profil.uid);
  const izinRef = doc(db, IZIN_COLLECTION, izinId);

  await runTransaction(db, async (tx) => {
    const sesiSnap = await tx.get(sesiRef);
    if (!sesiSnap.exists()) {
      throw new AppError('Sesi tidak ditemukan.');
    }

    const statusSesi = sesiSnap.get('status') ?? 'belum_dibuka';
    const kelasId = sesiSnap.get('kelasId') ?? '';
    if (statusSesi === 'ditutup') {
      throw new AppError('Sesi sudah ditutup, tidak dapat mengajukan izin.');
    }

    const presSnap = await tx.get(presRef);
    if (presSnap.exists()) {
      throw new AppError('Anda sudah tercatat hadir pada sesi ini.');
    }

    tx.set(izinRef, {
      uid: profil.uid,
      nama: profil.nama.trim(),
      kelasId,
      sesiId,
      alasan: valid.value,
      sentimen,
      status: 'menunggu',
      diajukanPada: serverTimestamp(),
    });
  });

  return { id: izinId, sentimen };
}

/**
 * Asisten memeriksa dan memutuskan pengajuan izin (`diterima` atau `ditolak`).
 * Menggunakan transaksi agar dua asisten tidak saling menimpa keputusan.
 * Keputusan hanya dapat diberikan satu kali dari status `'menunggu'`.
 */
export async function putuskanIzin(
  izinId: string,
  keputusan: 'diterima' | 'ditolak',
  profilAsisten: Profil,
): Promise<void> {
  if (!profilAsisten?.uid) {
    throw new AppError('Sesi pengguna tidak valid. Silakan login kembali.');
  }
  if (profilAsisten.role !== 'asisten') {
    throw new AppError('Hanya asisten yang dapat memberikan keputusan izin.');
  }
  if (keputusan !== 'diterima' && keputusan !== 'ditolak') {
    throw new AppError('Keputusan izin tidak valid.');
  }

  const izinRef = doc(db, IZIN_COLLECTION, izinId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(izinRef);
    if (!snap.exists()) {
      throw new AppError('Data pengajuan izin tidak ditemukan.');
    }
    const statusSaatIni = snap.get('status');
    if (statusSaatIni !== 'menunggu') {
      throw new AppError('Pengajuan izin ini sudah diputuskan sebelumnya.');
    }

    tx.update(izinRef, {
      status: keputusan,
      diputuskanOleh: profilAsisten.uid,
      diputuskanPada: serverTimestamp(),
    });
  });
}
