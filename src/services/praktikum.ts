// Lapisan akses Cloud Firestore untuk SRS-02: CRUD kelas/peserta/sesi, presensi, dan listener real-time.
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import type {
  InputSesi,
  Kelas,
  Peserta,
  Presensi,
  Profil,
  Sesi,
  StatusSesi,
} from '@/data/models';
import { db } from '@/config/firebase';
import { AppError, DuplikatError, cekKelas, cekPeserta, cekSesi } from '@/lib/validasi';

export type OnData<T> = (data: T) => void;
export type OnError = (e: unknown) => void;
export type Subscribe<T> = (onData: OnData<T>, onError: OnError) => Unsubscribe;

// ---------- pemetaan dokumen ----------
const mapKelas = (d: DocumentSnapshot<DocumentData>): Kelas => ({
  id: d.id,
  nama: d.get('nama') ?? '',
  keterangan: d.get('keterangan') ?? '',
  pesertaUids: d.get('pesertaUids') ?? [],
});

const mapSesi = (d: DocumentSnapshot<DocumentData>): Sesi => ({
  id: d.id,
  kelasId: d.get('kelasId') ?? '',
  namaPraktikum: d.get('namaPraktikum') ?? '',
  tanggal: d.get('tanggal') ?? '',
  jamMulai: d.get('jamMulai') ?? '',
  jamSelesai: d.get('jamSelesai') ?? '',
  ruang: d.get('ruang') ?? '',
  status: d.get('status') ?? 'belum_dibuka',
});

const mapPresensi = (d: DocumentSnapshot<DocumentData>): Presensi => ({
  uid: d.id,
  nama: d.get('nama') ?? '',
  nim: d.get('nim') ?? '',
  kelasId: d.get('kelasId') ?? '',
  // 'estimate' agar tulisan lokal yang menunggu timestamp server tetap tampil
  waktu: d.get('waktu', { serverTimestamps: 'estimate' })?.toDate?.() ?? null,
});

const urutSesi = (a: Sesi, b: Sesi) =>
  `${a.tanggal} ${a.jamMulai}`.localeCompare(`${b.tanggal} ${b.jamMulai}`);
const urutNama = <T extends { nama: string }>(a: T, b: T) => a.nama.localeCompare(b.nama);

// ---------- listener real-time ----------
export const subscribeKelasAsisten: Subscribe<Kelas[]> = (ok, err) =>
  onSnapshot(
    collection(db, 'kelas'),
    (s) => ok(s.docs.map(mapKelas).sort(urutNama)),
    err,
  );

export const subscribeKelasSaya = (uid: string): Subscribe<Kelas[]> => (ok, err) =>
  onSnapshot(
    query(collection(db, 'kelas'), where('pesertaUids', 'array-contains', uid)),
    (s) => ok(s.docs.map(mapKelas).sort(urutNama)),
    err,
  );

export const subscribePeserta = (kelasId: string): Subscribe<Peserta[]> => (ok, err) =>
  onSnapshot(
    collection(db, 'kelas', kelasId, 'peserta'),
    (s) =>
      ok(
        s.docs
          .map((d) => ({ uid: d.id, nama: d.get('nama') ?? '', nim: d.get('nim') ?? '' }))
          .sort(urutNama),
      ),
    err,
  );

/** Praktikan yang sudah registrasi (dibaca asisten untuk memilih peserta kelas). */
export const subscribePraktikanTerdaftar: Subscribe<Profil[]> = (ok, err) =>
  onSnapshot(
    query(collection(db, 'users'), where('role', '==', 'praktikan')),
    (s) =>
      ok(
        s.docs
          .map((d) => ({
            uid: d.id,
            nama: d.get('nama') ?? '',
            nim: d.get('nim') ?? '',
            role: 'praktikan' as const,
          }))
          .sort(urutNama),
      ),
    err,
  );

export const subscribeSesiById = (id: string): Subscribe<Sesi | null> => (ok, err) =>
  onSnapshot(doc(db, 'sesi', id), (d) => ok(d.exists() ? mapSesi(d) : null), err);

export const subscribeKelasById = (id: string): Subscribe<Kelas | null> => (ok, err) =>
  onSnapshot(doc(db, 'kelas', id), (d) => ok(d.exists() ? mapKelas(d) : null), err);

export const subscribeSesiAsisten: Subscribe<Sesi[]> = (ok, err) =>
  onSnapshot(collection(db, 'sesi'), (s) => ok(s.docs.map(mapSesi).sort(urutSesi)), err);

/** Satu listener per kelas (filter kesetaraan) agar sesuai Security Rules; hasil digabung. */
export const subscribeSesiKelasList = (kelasIds: string[]): Subscribe<Sesi[]> => (ok, err) => {
  if (kelasIds.length === 0) {
    queueMicrotask(() => ok([]));
    return () => {};
  }
  const per = new Map<string, Sesi[]>();
  const unsubs = kelasIds.map((id) =>
    onSnapshot(
      query(collection(db, 'sesi'), where('kelasId', '==', id)),
      (s) => {
        per.set(id, s.docs.map(mapSesi));
        if (per.size === kelasIds.length) ok([...per.values()].flat().sort(urutSesi));
      },
      err,
    ),
  );
  return () => unsubs.forEach((u) => u());
};

export const subscribePresensiSesi = (sesiId: string): Subscribe<Presensi[]> => (ok, err) =>
  onSnapshot(
    collection(db, 'sesi', sesiId, 'presensi'),
    (s) =>
      ok(
        s.docs
          .map(mapPresensi)
          .sort((a, b) => (b.waktu?.getTime() ?? Infinity) - (a.waktu?.getTime() ?? Infinity)),
      ),
    err,
  );

/** Presensi milik praktikan pada banyak sesi: { [sesiId]: Presensi } (hanya sesi yang sudah dihadiri). */
export const subscribePresensiSaya =
  (sesiIds: string[], uid: string): Subscribe<Record<string, Presensi>> =>
  (ok, err) => {
    if (sesiIds.length === 0) {
      queueMicrotask(() => ok({}));
      return () => {};
    }
    const hasil = new Map<string, Presensi | null>();
    const unsubs = sesiIds.map((id) =>
      onSnapshot(
        doc(db, 'sesi', id, 'presensi', uid),
        (d) => {
          hasil.set(id, d.exists() ? mapPresensi(d) : null);
          if (hasil.size === sesiIds.length) {
            const out: Record<string, Presensi> = {};
            hasil.forEach((p, k) => {
              if (p) out[k] = p;
            });
            ok(out);
          }
        },
        err,
      ),
    );
    return () => unsubs.forEach((u) => u());
  };

// ---------- CRUD kelas ----------
export async function tambahKelas(i: { nama: string; keterangan: string }) {
  const msg = cekKelas(i);
  if (msg) throw new AppError(msg);
  await addDoc(collection(db, 'kelas'), {
    nama: i.nama.trim(),
    keterangan: i.keterangan.trim(),
    pesertaUids: [],
    createdAt: serverTimestamp(),
  });
}

export async function ubahKelas(id: string, i: { nama: string; keterangan: string }) {
  const msg = cekKelas(i);
  if (msg) throw new AppError(msg);
  await updateDoc(doc(db, 'kelas', id), { nama: i.nama.trim(), keterangan: i.keterangan.trim() });
}

export async function hapusKelas(id: string) {
  const masihAda = await getDocs(query(collection(db, 'sesi'), where('kelasId', '==', id), limit(1)));
  if (!masihAda.empty) throw new AppError('Kelas masih memiliki sesi. Hapus sesinya terlebih dahulu.');
  const peserta = await getDocs(collection(db, 'kelas', id, 'peserta'));
  const batch = writeBatch(db);
  peserta.forEach((p) => batch.delete(p.ref));
  batch.delete(doc(db, 'kelas', id));
  await batch.commit();
}

// ---------- CRUD peserta ----------
export async function tambahPeserta(kelasId: string, p: Peserta) {
  const msg = cekPeserta(p);
  if (msg) throw new AppError(msg);
  const batch = writeBatch(db);
  batch.set(doc(db, 'kelas', kelasId, 'peserta', p.uid), {
    nama: p.nama.trim(),
    nim: p.nim.trim(),
  });
  batch.update(doc(db, 'kelas', kelasId), { pesertaUids: arrayUnion(p.uid) });
  await batch.commit();
}

export async function ubahPeserta(kelasId: string, uid: string, i: { nama: string; nim: string }) {
  const msg = cekPeserta(i);
  if (msg) throw new AppError(msg);
  await updateDoc(doc(db, 'kelas', kelasId, 'peserta', uid), {
    nama: i.nama.trim(),
    nim: i.nim.trim(),
  });
}

export async function hapusPeserta(kelasId: string, uid: string) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'kelas', kelasId, 'peserta', uid));
  batch.update(doc(db, 'kelas', kelasId), { pesertaUids: arrayRemove(uid) });
  await batch.commit();
}

// ---------- CRUD jadwal/sesi ----------
const bersihkan = (i: InputSesi): InputSesi => ({
  kelasId: i.kelasId,
  namaPraktikum: i.namaPraktikum.trim(),
  tanggal: i.tanggal.trim(),
  jamMulai: i.jamMulai.trim(),
  jamSelesai: i.jamSelesai.trim(),
  ruang: i.ruang.trim(),
});

export async function tambahSesi(i: InputSesi) {
  const msg = cekSesi(i);
  if (msg) throw new AppError(msg);
  await addDoc(collection(db, 'sesi'), {
    ...bersihkan(i),
    status: 'belum_dibuka',
    createdAt: serverTimestamp(),
  });
}

export async function ubahSesi(id: string, i: InputSesi) {
  const msg = cekSesi(i);
  if (msg) throw new AppError(msg);
  await updateDoc(doc(db, 'sesi', id), bersihkan(i));
}

export async function hapusSesi(id: string) {
  const presensi = await getDocs(collection(db, 'sesi', id, 'presensi'));
  const batch = writeBatch(db); // batas 500 operasi per batch; cukup untuk satu kelas praktikum
  presensi.forEach((p) => batch.delete(p.ref));
  batch.delete(doc(db, 'sesi', id));
  await batch.commit();
}

export async function setStatusSesi(id: string, status: StatusSesi) {
  await updateDoc(doc(db, 'sesi', id), { status });
}

// ---------- presensi (atomik) ----------
/**
 * Dokumen presensi memakai UID praktikan sebagai ID, dan penulisan dilakukan di dalam transaksi:
 * sesi harus 'dibuka' dan dokumen belum ada. Security Rules menolak create di atas dokumen
 * yang sudah ada, sehingga presensi ganda tertolak meski dua perangkat menulis bersamaan.
 */
export async function catatPresensi(sesiId: string, profil: Profil) {
  const sesiRef = doc(db, 'sesi', sesiId);
  const presRef = doc(db, 'sesi', sesiId, 'presensi', profil.uid);
  await runTransaction(db, async (tx) => {
    const sesi = await tx.get(sesiRef);
    if (!sesi.exists()) throw new AppError('Sesi tidak ditemukan.');
    if (sesi.get('status') !== 'dibuka') throw new AppError('Sesi belum dibuka atau sudah ditutup.');
    if ((await tx.get(presRef)).exists()) throw new DuplikatError('Anda sudah presensi pada sesi ini.');
    tx.set(presRef, {
      uid: profil.uid,
      nama: profil.nama,
      nim: profil.nim ?? '',
      kelasId: sesi.get('kelasId'),
      waktu: serverTimestamp(),
    });
  });
}
