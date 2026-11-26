// Hook real-time pembayaran (FR-S4-04.6, 04.9) memakai useLive yang sama dengan modul praktikum.
import { useMemo } from 'react';

import { useLive } from '@/hooks/use-praktikum';
import {
  subscribeTagihanById,
  subscribeTagihanSaya,
  subscribeTransaksiSaya,
  subscribeTransaksiTagihan,
  type Tagihan,
  type Transaksi,
} from '@/services/pembayaran';

const TANPA_TAGIHAN: Tagihan[] = [];
const TANPA_TRANSAKSI: Transaksi[] = [];

export function useTagihanSaya(uid: string | null) {
  const sub = useMemo(() => (uid ? subscribeTagihanSaya(uid) : null), [uid]);
  return useLive(sub, TANPA_TAGIHAN);
}

export function useTagihanDetail(id: string | null) {
  const sub = useMemo(() => (id ? subscribeTagihanById(id) : null), [id]);
  return useLive<Tagihan | null>(sub, null);
}

export function useTransaksiSaya(uid: string | null) {
  const sub = useMemo(() => (uid ? subscribeTransaksiSaya(uid) : null), [uid]);
  return useLive(sub, TANPA_TRANSAKSI);
}

export function useTransaksiTagihan(tagihanId: string | null, uid: string | null) {
  const sub = useMemo(
    () => (tagihanId && uid ? subscribeTransaksiTagihan(tagihanId, uid) : null),
    [tagihanId, uid],
  );
  return useLive(sub, TANPA_TRANSAKSI);
}
