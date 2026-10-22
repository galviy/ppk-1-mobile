import { Asisten, Praktikan, PresensiEntry, Sesi } from './types';

export const DUMMY_PRAKTIKAN: Praktikan[] = [
  { id: 'p1', nama: 'Budi Santoso', kelas: 'A' },
  { id: 'p2', nama: 'Siti Rahmawati', kelas: 'A' },
  { id: 'p3', nama: 'Ahmad Fauzi', kelas: 'A' },
  { id: 'p4', nama: 'Dewi Lestari', kelas: 'B' },
  { id: 'p5', nama: 'Rian Pratama', kelas: 'B' },
  { id: 'p6', nama: 'Anisa Maharani', kelas: 'B' },
];

export const DUMMY_ASISTEN: Asisten[] = [
  { id: 'a1', nama: 'Kak Arya Pratama (Koordinator)' },
  { id: 'a2', nama: 'Kak Nabila Putri (Asisten Lab)' },
  { id: 'a3', nama: 'Kak Fajar Hidayat (Asisten Lab)' },
];

export const DUMMY_SESI: Sesi[] = [
  {
    id: 's1',
    namaPraktikum: 'Modul 1 — Siklus Hidup & State',
    kelas: 'A',
    tanggal: '2026-10-22',
    jamMulai: '13:00',
    jamSelesai: '15:00',
    status: 'dibuka',
  },
  {
    id: 's2',
    namaPraktikum: 'Modul 1 — Siklus Hidup & State',
    kelas: 'B',
    tanggal: '2026-10-22',
    jamMulai: '15:30',
    jamSelesai: '17:30',
    status: 'belum_dibuka',
  },
  {
    id: 's3',
    namaPraktikum: 'Modul 2 — Komponen UI Bersama',
    kelas: 'A',
    tanggal: '2026-10-29',
    jamMulai: '13:00',
    jamSelesai: '15:00',
    status: 'belum_dibuka',
  },
  {
    id: 's4',
    namaPraktikum: 'Modul 0 — Pengenalan Laboratorium',
    kelas: 'B',
    tanggal: '2026-10-15',
    jamMulai: '10:00',
    jamSelesai: '12:00',
    status: 'ditutup',
  },
];

export const INITIAL_PRESENSI: Record<string, PresensiEntry[]> = {
  s4: [
    { praktikanId: 'p4', nama: 'Dewi Lestari', kelas: 'B', waktu: '10:05:22' },
    { praktikanId: 'p5', nama: 'Rian Pratama', kelas: 'B', waktu: '10:12:01' },
  ],
  s1: [
    { praktikanId: 'p1', nama: 'Budi Santoso', kelas: 'A', waktu: '13:02:15' },
  ],
};
