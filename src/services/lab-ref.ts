// SEMENTARA (P2): pembacaan laboratorium/{labId} untuk presensi dan pemilih lab di form sesi.
// SRS-03 (P3) menyediakan services/laboratorium.ts + hooks/use-laboratorium.ts; setelah PR P3 masuk,
// ganti pemakai useLabRef/useLabRefList dengan useLaboratoriumDetail/useLaboratoriumList lalu hapus berkas ini.
import { collection, doc, onSnapshot, type DocumentData, type DocumentSnapshot } from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { LabRef } from '@/data/models';
import type { Subscribe } from '@/services/praktikum';

const mapLab = (d: DocumentSnapshot<DocumentData>): LabRef => ({
  id: d.id,
  nama: d.get('nama') ?? '',
  kode: d.get('kode') ?? '',
  latitude: d.get('latitude'),
  longitude: d.get('longitude'),
  radiusMeter: d.get('radiusMeter') ?? 100,
});

export const subscribeLabRef = (id: string): Subscribe<LabRef | null> => (ok, err) =>
  onSnapshot(doc(db, 'laboratorium', id), (d) => ok(d.exists() ? mapLab(d) : null), err);

export const subscribeLabRefList: Subscribe<LabRef[]> = (ok, err) =>
  onSnapshot(
    collection(db, 'laboratorium'),
    (s) => ok(s.docs.map(mapLab).sort((a, b) => a.nama.localeCompare(b.nama))),
    err,
  );
