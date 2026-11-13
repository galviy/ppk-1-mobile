// Hook listener real-time: state { data, loading, error } yang selalu mengikuti Firestore.
import { useEffect, useMemo, useState } from 'react';

import type { Kelas, Peserta, Presensi, Profil, Sesi } from '@/data/models';
import { pesanError } from '@/lib/validasi';
import {
  subscribeKelasAsisten,
  subscribeKelasSaya,
  subscribePeserta,
  subscribePraktikanTerdaftar,
  subscribePresensiSaya,
  subscribePresensiSesi,
  subscribeKelasById,
  subscribeSesiAsisten,
  subscribeSesiById,
  subscribeSesiKelasList,
  type Subscribe,
} from '@/services/praktikum';

export type Live<T> = { data: T; loading: boolean; error: string | null };

const KOSONG = { kelas: [] as Kelas[], sesi: [] as Sesi[], peserta: [] as Peserta[],
  presensi: [] as Presensi[], profil: [] as Profil[], map: {} as Record<string, Presensi> };

/** `subscribe` harus stabil (modul-level atau useMemo); null = belum perlu berlangganan. */
function useLive<T>(subscribe: Subscribe<T> | null, initial: T): Live<T> {
  const [state, setState] = useState<Live<T> & { src: unknown }>({
    src: null, data: initial, loading: true, error: null,
  });

  useEffect(() => {
    if (!subscribe) return;
    return subscribe(
      (data) => setState({ src: subscribe, data, loading: false, error: null }),
      (e) => setState({ src: subscribe, data: initial, loading: false, error: pesanError(e) }),
    );
  }, [subscribe, initial]);

  if (subscribe && state.src === subscribe) return state;
  return { data: initial, loading: subscribe !== null, error: null };
}

export const useKelasAsisten = () => useLive(subscribeKelasAsisten, KOSONG.kelas);
export const useSesiAsisten = () => useLive(subscribeSesiAsisten, KOSONG.sesi);
export const usePraktikanTerdaftar = () => useLive(subscribePraktikanTerdaftar, KOSONG.profil);

export function usePeserta(kelasId: string | null) {
  const sub = useMemo(() => (kelasId ? subscribePeserta(kelasId) : null), [kelasId]);
  return useLive(sub, KOSONG.peserta);
}

export function usePresensiSesi(sesiId: string | null) {
  const sub = useMemo(() => (sesiId ? subscribePresensiSesi(sesiId) : null), [sesiId]);
  return useLive(sub, KOSONG.presensi);
}

/** Jadwal praktikan: kelas yang diikuti + sesi di kelas tersebut. */
export function useJadwalPraktikan(uid: string) {
  const subKelas = useMemo(() => subscribeKelasSaya(uid), [uid]);
  const kelas = useLive(subKelas, KOSONG.kelas);
  const idsKey = kelas.data.map((k) => k.id).sort().join(',');
  const subSesi = useMemo(
    () => (kelas.loading ? null : subscribeSesiKelasList(idsKey ? idsKey.split(',') : [])),
    [kelas.loading, idsKey],
  );
  const sesi = useLive(subSesi, KOSONG.sesi);
  return {
    kelas: kelas.data,
    sesi: sesi.data,
    loading: kelas.loading || sesi.loading,
    error: kelas.error ?? sesi.error,
  };
}

export function usePresensiSaya(sesiIds: string[], uid: string | null) {
  const key = sesiIds.join(',');
  const sub = useMemo(
    () => (uid ? subscribePresensiSaya(key ? key.split(',') : [], uid) : null),
    [key, uid],
  );
  return useLive(sub, KOSONG.map);
}

export function useSesiDetail(id: string | null) {
  const sub = useMemo(() => (id ? subscribeSesiById(id) : null), [id]);
  return useLive<Sesi | null>(sub, null);
}

export function useKelasDetail(id: string | null) {
  const sub = useMemo(() => (id ? subscribeKelasById(id) : null), [id]);
  return useLive<Kelas | null>(sub, null);
}
