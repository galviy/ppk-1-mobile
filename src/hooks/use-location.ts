// Hook lokasi perangkat (Sprint 3 / S3-02.1): izin, layanan lokasi (GPS), akurasi, dan lokasi palsu.
//   useCurrentLocation()              -> sekali ambil
//   useCurrentLocation({ watch: true }) -> terus diperbarui selama komponen terpasang
import * as Location from 'expo-location';
import { AppState } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

import type { LokasiInput } from '@/lib/geo';

export type StatusIzin = 'belum' | 'diberikan' | 'ditolak' | 'ditolak-permanen';
export type LokasiPerangkat = LokasiInput & { mocked: boolean; timestamp: number };

export type UseLocationResult = {
  lokasi: LokasiPerangkat | null;
  statusIzin: StatusIzin;
  /** null = belum diketahui */
  gpsAktif: boolean | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

type Snapshot = {
  attempt: number;
  lokasi: LokasiPerangkat | null;
  statusIzin: StatusIzin;
  gpsAktif: boolean | null;
  error: string | null;
};

const BATAS_WAKTU_MS = 15_000;
const PESAN_BELUM_ADA =
  'Lokasi belum dapat diperoleh. Pastikan GPS aktif dan Anda berada di area terbuka, lalu coba lagi.';

const awal = (attempt: number): Snapshot => ({
  attempt,
  lokasi: null,
  statusIzin: 'belum',
  gpsAktif: null,
  error: null,
});

function keLokasi(pos: Location.LocationObject): LokasiPerangkat {
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    akurasiMeter: pos.coords.accuracy ?? null,
    mocked: pos.mocked === true, // `mocked` hanya tersedia di Android
    timestamp: pos.timestamp,
  };
}

function denganBatasWaktu<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export function useCurrentLocation({ watch = false }: { watch?: boolean } = {}): UseLocationResult {
  const [attempt, setAttempt] = useState(0);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const refresh = useCallback(() => setAttempt((n) => n + 1), []);

  // Periksa ulang izin dan status layanan lokasi ketika aplikasi kembali aktif.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  useEffect(() => {
    let aktif = true;
    let langganan: Location.LocationSubscription | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const ubah = (patch: Partial<Snapshot>) => {
      if (!aktif) return;
      setSnap((prev) => ({ ...(prev && prev.attempt === attempt ? prev : awal(attempt)), ...patch }));
    };

    (async () => {
      try {
        let izin = await Location.getForegroundPermissionsAsync();
        if (izin.status !== 'granted' && izin.canAskAgain) {
          izin = await Location.requestForegroundPermissionsAsync();
        }
        const statusIzin: StatusIzin =
          izin.status === 'granted' ? 'diberikan' : izin.canAskAgain ? 'ditolak' : 'ditolak-permanen';
        ubah({ statusIzin });
        if (izin.status !== 'granted') return;

        const gpsAktif = await Location.hasServicesEnabledAsync();
        ubah({ gpsAktif });
        if (!gpsAktif) return;

        if (watch) {
          // jika fix pertama tak kunjung datang, beri tahu pengguna
          timer = setTimeout(() => {
            if (!aktif) return;
            setSnap((prev) =>
              prev && prev.attempt === attempt && prev.lokasi ? prev : { ...(prev ?? awal(attempt)), error: PESAN_BELUM_ADA },
            );
          }, BATAS_WAKTU_MS);
          langganan = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 2 },
            (pos) => {
              if (timer) clearTimeout(timer);
              ubah({ lokasi: keLokasi(pos), error: null });
            },
          );
          if (!aktif) langganan.remove();
        } else {
          const pos = await denganBatasWaktu(
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
            BATAS_WAKTU_MS,
          );
          ubah({ lokasi: keLokasi(pos), error: null });
        }
      } catch {
        ubah({ error: PESAN_BELUM_ADA });
      }
    })();

    return () => {
      aktif = false;
      if (timer) clearTimeout(timer);
      langganan?.remove();
    };
  }, [attempt, watch]);

  const s = snap && snap.attempt === attempt ? snap : null;
  const loading = !s || (s.statusIzin === 'diberikan' && s.gpsAktif !== false && !s.lokasi && !s.error);

  return {
    lokasi: s?.lokasi ?? null,
    statusIzin: s?.statusIzin ?? 'belum',
    gpsAktif: s?.gpsAktif ?? null,
    loading,
    error: s?.error ?? null,
    refresh,
  };
}
