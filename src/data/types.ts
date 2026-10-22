export type Role = "praktikan" | "asisten";

export type Praktikan = {
  id: string;
  nama: string;
  kelas: "A" | "B";
};

export type Asisten = {
  id: string;
  nama: string;
};

export type Sesi = {
  id: string;
  namaPraktikum: string;   // contoh: "Modul 1 — Siklus Hidup"
  kelas: "A" | "B";
  tanggal: string;         // "2026-10-22"
  jamMulai: string;        // "13:00"
  jamSelesai: string;      // "15:00"
  status: "belum_dibuka" | "dibuka" | "ditutup";
};

export type PresensiEntry = {
  praktikanId: string;
  nama: string;
  kelas: "A" | "B";
  waktu: string;           // "HH:MM:SS"
};

export type UserIdentitas = {
  id: string;
  nama: string;
  kelas?: "A" | "B";
};
