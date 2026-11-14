// Hook listener real-time untuk SRS-03 (Pengajuan & Pemeriksaan Izin).
// Mengikuti pola `Live<T>` pada `src/hooks/use-praktikum.ts`.
import { useEffect, useMemo, useState } from 'react';

import type { Izin } from '@/data/izin-types';
import type { Live } from '@/hooks/use-praktikum';
import {
  pesanErrorIzin,
  subscribeIzinById,
  subscribeIzinSaya,
  subscribeSemuaIzin,
} from '@/services/izin';
import type { Subscribe } from '@/services/praktikum';

const KOSONG_IZIN: Izin[] = [];

function useLiveIzin<T>(subscribe: Subscribe<T> | null, initial: T): Live<T> {
  const [state, setState] = useState<Live<T> & { src: unknown }>({
    src: null,
    data: initial,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!subscribe) return;
    return subscribe(
      (data) => setState({ src: subscribe, data, loading: false, error: null }),
      (e) => setState({ src: subscribe, data: initial, loading: false, error: pesanErrorIzin(e) }),
    );
  }, [subscribe, initial]);

  if (subscribe && state.src === subscribe) return state;
  return { data: initial, loading: subscribe !== null, error: null };
}

/**
 * Daftar izin milik praktikan yang sedang login (real-time).
 * Sekaligus menyediakan `sudahIzinIds` (Set ID sesi yang sudah diajukan izin)
 * tanpa perlu melakukan `getDoc` ke dokumen izin yang belum ada.
 */
export function useIzinSaya(uid: string | null) {
  const sub = useMemo(() => (uid ? subscribeIzinSaya(uid) : null), [uid]);
  const live = useLiveIzin(sub, KOSONG_IZIN);
  const sudahIzinIds = useMemo(
    () => new Set(live.data.map((item) => item.sesiId)),
    [live.data],
  );
  const bySesiId = useMemo(
    () => Object.fromEntries(live.data.map((item) => [item.sesiId, item])) as Record<string, Izin>,
    [live.data],
  );

  return {
    ...live,
    sudahIzinIds,
    bySesiId,
  };
}

/**
 * Daftar seluruh pengajuan izin untuk asisten (real-time).
 */
export function useSemuaIzin() {
  return useLiveIzin(subscribeSemuaIzin, KOSONG_IZIN);
}

/**
 * Detail satu dokumen izin berdasarkan ID (`{sesiId}_{uid}`).
 * Gunakan hanya untuk dokumen izin yang sudah ada di daftar.
 */
export function useIzinDetail(id: string | null) {
  const sub = useMemo(() => (id ? subscribeIzinById(id) : null), [id]);
  return useLiveIzin<Izin | null>(sub, null);
}
