import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Laboratorium } from '@/data/lab-types';
import { pesanError } from '@/lib/validasi';
import { subscribeLabById, subscribeLabList } from '@/services/laboratorium';
import type { Subscribe } from '@/services/praktikum';

export type LiveLab<T> = { data: T; loading: boolean; error: string | null; retry: () => void };

const KOSONG: Laboratorium[] = []; // referensi stabil agar efek tidak berulang

function useLiveLab<T>(subscribe: Subscribe<T> | null, initial: T): LiveLab<T> {
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
        if (aktif) setState({ src: subscribe, attempt, data: initial, loading: false, error: pesanError(e) });
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

export const useLaboratoriumList = () => useLiveLab(subscribeLabList, KOSONG);

export function useLaboratoriumDetail(id: string | null) {
  const sub = useMemo(() => (id ? subscribeLabById(id) : null), [id]);
  return useLiveLab<Laboratorium | null>(sub, null);
}