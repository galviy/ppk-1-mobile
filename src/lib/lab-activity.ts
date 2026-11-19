import type { Sesi } from '@/data/models';

export type SesiAktivitas = Sesi & { laboratoriumId?: string };

export type AktivitasLab = {
  berlangsung: SesiAktivitas | null;
  berikutnya: SesiAktivitas | null;
};

type Rentang = {
  sesi: SesiAktivitas;
  mulai: number;
  selesai: number;
};

const POLA_TANGGAL = /^(\d{4})-(\d{2})-(\d{2})$/;
const POLA_JAM = /^([01]\d|2[0-3]):([0-5]\d)$/;

function tanggalLokal(date: Date): string {
  const tahun = String(date.getFullYear()).padStart(4, '0');
  const bulan = String(date.getMonth() + 1).padStart(2, '0');
  const hari = String(date.getDate()).padStart(2, '0');
  return `${tahun}-${bulan}-${hari}`;
}

function waktuLokal(tanggal: string, jam: string): number | null {
  const t = POLA_TANGGAL.exec(tanggal);
  const j = POLA_JAM.exec(jam);
  if (!t || !j) return null;

  const tahun = Number(t[1]);
  const bulan = Number(t[2]);
  const hari = Number(t[3]);
  const jamKe = Number(j[1]);
  const menit = Number(j[2]);

  const date = new Date(tahun, bulan - 1, hari, jamKe, menit, 0, 0);
  if (
    date.getFullYear() !== tahun ||
    date.getMonth() !== bulan - 1 ||
    date.getDate() !== hari
  ) {
    return null;
  }
  return date.getTime();
}

function urutkan(a: Rentang, b: Rentang): number {
  return a.mulai - b.mulai || a.selesai - b.selesai || a.sesi.id.localeCompare(b.sesi.id);
}

export function getAktivitasLab(
  labId: string,
  sesi: readonly SesiAktivitas[],
  now: Date = new Date(),
): AktivitasLab {
  if (!labId) return { berlangsung: null, berikutnya: null };

  const sekarang = now.getTime();
  const hariIni = tanggalLokal(now);
  const kandidat: Rentang[] = [];

  for (const s of sesi) {
    if (s.laboratoriumId !== labId) continue;
    if (s.status === 'ditutup') continue;

    const mulai = waktuLokal(s.tanggal, s.jamMulai);
    const selesai = waktuLokal(s.tanggal, s.jamSelesai);
    if (mulai === null || selesai === null || selesai <= mulai) continue;

    kandidat.push({ sesi: s, mulai, selesai });
  }

  const berlangsung =
    kandidat
      .filter((k) => k.sesi.tanggal === hariIni && k.mulai <= sekarang && sekarang < k.selesai)
      .sort(urutkan)[0] ?? null;

  const berikutnya = kandidat.filter((k) => k.mulai > sekarang).sort(urutkan)[0] ?? null;

  return {
    berlangsung: berlangsung?.sesi ?? null,
    berikutnya: berikutnya?.sesi ?? null,
  };
}
