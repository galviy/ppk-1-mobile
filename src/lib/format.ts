// Simpan di: src/lib/format.ts
const pad = (n: number) => String(n).padStart(2, '0');

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** "13:02:11" */
export const jamDetik = (d: Date = new Date()) =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

/** "13:02" */
export const jamMenit = (d: Date = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** "22 Okt 2026" dari objek Date */
export const tanggalPendek = (d: Date = new Date()) =>
  `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;

/** "22 Okt 2026" dari string ISO "2026-10-22" */
export const tanggalDariIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN[m - 1]} ${y}`;
};