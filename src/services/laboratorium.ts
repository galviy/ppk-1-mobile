
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { InputLab, Laboratorium } from '@/data/lab-types';
import { cekLab } from '@/lib/validasi-lab';
import { AppError } from '@/lib/validasi';
import type { Subscribe } from '@/services/praktikum';

const mapLab = (
  d: DocumentSnapshot<DocumentData>
): Laboratorium => ({
  id: d.id,
  nama: d.get('nama') ?? '',
  kode: d.get('kode') ?? '',
  deskripsi: d.get('deskripsi') ?? '',
  latitude: Number(d.get('latitude') ?? 0),
  longitude: Number(d.get('longitude') ?? 0),
  radiusMeter: Number(d.get('radiusMeter') ?? 100),
});

const bersihkan = (i: InputLab): InputLab => ({
  nama: i.nama.trim(),
  kode: i.kode.trim(),
  deskripsi: i.deskripsi.trim(),
  latitude: i.latitude,
  longitude: i.longitude,
  radiusMeter: i.radiusMeter,
});

// Listener real-time
export const subscribeLabList: Subscribe<Laboratorium[]> = (
  ok,
  err
) =>
  onSnapshot(
    collection(db, 'laboratorium'),
    (s) =>
      ok(
        s.docs
          .map(mapLab)
          .sort((a, b) => a.nama.localeCompare(b.nama))
      ),
    err
  );

export const subscribeLabById =
  (id: string): Subscribe<Laboratorium | null> =>
  (ok, err) =>
    onSnapshot(
      doc(db, 'laboratorium', id),
      (d) => ok(d.exists() ? mapLab(d) : null),
      err
    );

// Tambah laboratorium
export async function tambahLab(i: InputLab) {
  const msg = cekLab(i);
  if (msg) throw new AppError(msg);

  await addDoc(collection(db, 'laboratorium'), {
    ...bersihkan(i),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Ubah laboratorium
export async function ubahLab(id: string, i: InputLab) {
  const msg = cekLab(i);
  if (msg) throw new AppError(msg);

  await updateDoc(doc(db, 'laboratorium', id), {
    ...bersihkan(i),
    updatedAt: serverTimestamp(),
  });
}

// Hapus laboratorium yang tidak digunakan sesi
export async function hapusLab(id: string) {
  const dipakai = await getDocs(
    query(
      collection(db, 'sesi'),
      where('laboratoriumId', '==', id),
      limit(1)
    )
  );

  if (!dipakai.empty) {
    throw new AppError(
      'Laboratorium masih dipakai oleh sesi praktikum. Ubah atau hapus sesinya terlebih dahulu.'
    );
  }

  await deleteDoc(doc(db, 'laboratorium', id));
}
