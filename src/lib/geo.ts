// Perhitungan jarak dan evaluasi lokasi presensi (Sprint 3 / S3-02.1).
// Murni (tanpa dependensi React Native) supaya dipakai bersama oleh UI dan transaksi presensi,
// serta bisa dites dengan `node --test`.

export type Koordinat = { latitude: number; longitude: number };
export type LokasiInput = Koordinat & { akurasiMeter: number | null; mocked?: boolean };
export type LabGeo = Koordinat & { radiusMeter: number };

/** Presensi ditolak bila akurasi GPS lebih buruk dari ini (usulan, final disepakati dengan P4). */
export const AKURASI_MAKS_METER = 100;

const R_BUMI_METER = 6_371_000;
const rad = (derajat: number) => (derajat * Math.PI) / 180;

/** Jarak dua titik di permukaan bumi (rumus Haversine), dalam meter. */
export function hitungJarakMeter(a: Koordinat, b: Koordinat): number {
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_BUMI_METER * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function koordinatValid(k: Koordinat): boolean {
  return (
    Number.isFinite(k.latitude) &&
    Number.isFinite(k.longitude) &&
    Math.abs(k.latitude) <= 90 &&
    Math.abs(k.longitude) <= 180
  );
}

export type HasilLokasi = {
  jarakMeter: number;
  dalamRadius: boolean;
  akurasiOk: boolean;
  mocked: boolean;
  /** true bila semua syarat lokasi terpenuhi */
  boleh: boolean;
  /** alasan penolakan untuk ditampilkan ke pengguna (null bila boleh) */
  alasan: string | null;
};

/** Menilai apakah lokasi perangkat sah untuk presensi di laboratorium `lab`. */
export function evaluasiLokasi(lokasi: LokasiInput, lab: LabGeo): HasilLokasi {
  const mocked = lokasi.mocked === true;
  const koordinatOk = koordinatValid(lokasi) && koordinatValid(lab);
  const radiusOk = Number.isFinite(lab.radiusMeter) && lab.radiusMeter > 0;
  const jarakMeter = koordinatOk ? hitungJarakMeter(lokasi, lab) : Infinity;
  const akurasiOk =
    lokasi.akurasiMeter !== null &&
    Number.isFinite(lokasi.akurasiMeter) &&
    lokasi.akurasiMeter >= 0 &&
    lokasi.akurasiMeter <= AKURASI_MAKS_METER;
  const dalamRadius = radiusOk && jarakMeter <= lab.radiusMeter;

  let alasan: string | null = null;
  if (!koordinatOk || !radiusOk) {
    alasan = 'Data koordinat atau radius laboratorium tidak valid. Hubungi asisten.';
  } else if (mocked) {
    alasan = 'Lokasi palsu (mock location) terdeteksi. Matikan aplikasi lokasi palsu lalu coba lagi.';
  } else if (!akurasiOk) {
    alasan =
      lokasi.akurasiMeter === null
        ? 'Akurasi lokasi tidak diketahui. Pindah ke area terbuka lalu tekan Coba lagi.'
        : `Akurasi GPS terlalu rendah (±${Math.round(lokasi.akurasiMeter)} m, maksimal ${AKURASI_MAKS_METER} m). Pindah ke area terbuka lalu coba lagi.`;
  } else if (!dalamRadius) {
    alasan = `Anda berada ${Math.round(jarakMeter)} m dari laboratorium, di luar radius ${Math.round(lab.radiusMeter)} m.`;
  }

  return { jarakMeter, dalamRadius, akurasiOk, mocked, boleh: alasan === null, alasan };
}
