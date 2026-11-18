// Hook listener real-time untuk SRS-03 (Pengajuan & Pemeriksaan Izin).
// Mengikuti pola `Live<T>` pada `src/hooks/use-praktikum.ts`.
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    src: unknown;
    attempt: number;
    data: T;
    loading: boolean;
    error: string | null;
  }>({ src: null, attempt: -1, data: initial, loading: true, error: null });

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    if (!subscribe) return;
    let aktif = true;

    const unsubscribe = subscribe(
      (data) => {
        if (aktif) setState({ src: subscribe, attempt, data, loading: false, error: null });
      },
      (e) => {
        if (aktif) {
          setState({
            src: subscribe,
            attempt,
            data: initial,
            loading: false,
            error: pesanErrorIzin(e),
          });
        }
      },
    );

    return () => {
      aktif = false;
      unsubscribe();
    };
  }, [subscribe, initial, attempt]);

  if (!subscribe) return { data: initial, loading: false, error: null, retry };
  if (state.src === subscribe && state.attempt === attempt) {
    return { data: state.data, loading: state.loading, error: state.error, retry };
  }
  return { data: initial, loading: true, error: null, retry };
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
