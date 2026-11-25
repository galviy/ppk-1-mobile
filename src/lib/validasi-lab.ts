
import type { FormLab, InputLab } from '@/data/lab-types';

export const LAT_MIN = -90;
export const LAT_MAX = 90;
export const LNG_MIN = -180;
export const LNG_MAX = 180;
export const RADIUS_MIN = 10;
export const RADIUS_MAX = 500;

/** Menerima "-6,99" maupun "-6.99". */
export function parseAngka(s: string): number {
  const t = s.trim().replace(',', '.');
  if (t === '') return NaN;
  return Number(t);
}

export function cekLab(i: InputLab): string | null {
  const nama = i.nama.trim();
  const kode = i.kode.trim();

  if (nama.length < 2) return 'Nama laboratorium minimal 2 karakter.';
  if (nama.length > 80) return 'Nama laboratorium maksimal 80 karakter.';

  if (!/^[A-Za-z0-9-]{2,20}$/.test(kode)) {
    return 'Kode harus 2–20 huruf/angka/tanda hubung (-).';
  }

  if (i.deskripsi.trim().length > 300) {
    return 'Deskripsi maksimal 300 karakter.';
  }

  if (
    !Number.isFinite(i.latitude) ||
    i.latitude < LAT_MIN ||
    i.latitude > LAT_MAX
  ) {
    return `Latitude harus berupa angka antara ${LAT_MIN} dan ${LAT_MAX}.`;
  }

  if (
    !Number.isFinite(i.longitude) ||
    i.longitude < LNG_MIN ||
    i.longitude > LNG_MAX
  ) {
    return `Longitude harus berupa angka antara ${LNG_MIN} dan ${LNG_MAX}.`;
  }

  if (
    !Number.isFinite(i.radiusMeter) ||
    i.radiusMeter < RADIUS_MIN ||
    i.radiusMeter > RADIUS_MAX
  ) {
    return `Radius harus berupa angka antara ${RADIUS_MIN} dan ${RADIUS_MAX} meter.`;
  }

  return null;
}

/** Form string -> InputLab angka. */
export function parseInputLab(
  f: FormLab
): { input: InputLab; error: string | null } {
  const input: InputLab = {
    nama: f.nama.trim(),
    kode: f.kode.trim(),
    deskripsi: f.deskripsi.trim(),
    latitude: parseAngka(f.latitude),
    longitude: parseAngka(f.longitude),
    radiusMeter: parseAngka(f.radiusMeter),
  };

  return { input, error: cekLab(input) };
}