// SEMENTARA (P2): lihat catatan di services/lab-ref.ts.
import { useMemo } from 'react';

import type { LabRef } from '@/data/models';
import { useLive } from '@/hooks/use-praktikum';
import { subscribeLabRef, subscribeLabRefList } from '@/services/lab-ref';

const KOSONG: LabRef[] = [];

export const useLabRefList = () => useLive(subscribeLabRefList, KOSONG);

export function useLabRef(id: string | null) {
  const sub = useMemo(() => (id ? subscribeLabRef(id) : null), [id]);
  return useLive<LabRef | null>(sub, null);
}
