# SRS-01 — Fondasi Aplikasi: Pemilihan Peran, Identitas, dan Struktur Navigasi

| | |
|---|---|
| **Sprint** | 1 — Antarmuka dan Alur Praktikum |
| **Modul** | Fondasi aplikasi (dimiliki Programmer 1) |
| **Penanggung jawab** | **Programmer 1** |
| **Proyek** | Aplikasi Praktikum PPK (React Native + Expo Router, SDK 57) |

---

## 1. Pendahuluan

### 1.1 Tujuan
Membangun fondasi aplikasi yang menjadi tempat seluruh modul anggota tim bekerja: pemilihan peran (praktikan/asisten), identitas pengguna dummy, struktur navigasi Expo Router, dan komponen UI bersama.

### 1.2 Ruang lingkup
- Halaman **pilih peran & identitas** (halaman pertama aplikasi).
- **Struktur navigasi** per peran (Expo Router: Stack + Tabs per role).
- **Data dummy global** (daftar praktikan, asisten/dummy identitas, jadwal, sesi) dan state global sederhana via Context/Store.
- **Komponen UI bersama** yang dipakai modul lain (ThemedText, Card, Badge status, EmptyState,!)

### 1.3 Di luar ruang lingkup
- Halaman jadwal/detail sesi (→ SRS-02).
- Aksi buka/tutup sesi & rekap asisten (→ SRS-03).
- Form presensi & riwayat praktikan (→ SRS-04).
- Persistensi database (pada sprint ini data cukup hidup di state selama aplikasi berjalan).

---

## 2. Kontrak yang wajib dipenuhi (dipakai SRS-02/03/04)

### 2.1 Tipe data dummy (`src/data/types.ts`)

```ts
export type Role = "praktikan" | "asisten";

export type Praktikan = { id: string; nama: string; kelas: "A" | "B" };

export type Sesi = {
  id: string;
  namaPraktikum: string;   // contoh: "Modul 1 — Siklus Hidup"
  kelas: "A" | "B";
  tanggal: string;         // "2026-10-22"
  jamMulai: string;        // "13:00"
  jamSelesai: string;      // "15:00"
  status: "belum_dibuka" | "dibuka" | "ditutup";
};
```

### 2.2 State global (`src/data/store.tsx`)
Programmer 1 menyediakan **Context Provider** bernama `AppProvider` dengan konsumsi hook `useApp()` yang minimal meng-ekspos:

| Field/Fungsi | Tipe | Keterangan |
|---|---|---|
| `role` / `setRole` | `Role \| null` / setter | peran aktif untuk sesi berjalan |
| `identitas` | `{ id: string; nama: string } \| null` | identitas dummy yang dipilih |
| `daftarSesi` | `Sesi[]` | jadwal dummy (≥ 2 sesi, kelas A & B, status campuran) |
| `setSesiStatus(sesiId, status)` | fungsi | dipakai SRS-03 untuk buka/tutup sesi |
| `presensi` | `Record<sesiId, { praktikanId, nama, kelas, waktu: string }[]>` | catatan presensi; dipakai SRS-03 (rekap) & SRS-04 (tulis) |
| `tambahPresensi(sesiId, entri)` | fungsi | menolak jika `praktikanId` sudah ada di sesi tersebut |

> **Catatan (sesi tunjuk):** karena belum menyentuh database, kehadiran praktikan **belum ter-sinkron** dengan rekap asisten pada demo lintas peran di device berbeda; yang penting basis dummy dan tampilan UI responsif & benar dalam satu arah alur demo.

### 2.3 Komponen bersama (`src/components/ui/`)
| Komponen | Properti minimal | Dipakai oleh |
|---|---|---|
| `StatusBadge` | `status: Sesi["status"]` → label "Belum Dibuka / Dibuka / Ditutup" + warna | 02, 03, 04 |
| `Card` | `children` | 02, 03, 04 |
| `EmptyState` | `title, message, icon?` | 02, 03, 04 |
| `PrimaryButton` | `label, onPress, disabled?` | 02, 03, 04 |

---

## 3. Kebutuhan fungsional

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-1.1 | Aplikasi membuka **layar pilih peran**: tombol lain pilihan "Saya Praktikan" dan "Saya Asisten". | Wajib |
| FR-1.2 | Setelah memilih peran **Praktikan**, tampil pilihan identitas dummy (berisi form: pilih praktikan, mis. `picklist` nama, pilih kelas tertera otomatis) lalu lanjut ke grup tab praktikan. | Wajib |
| FR-1.3 | Setelah memilih peran **Asisten**, pilih identitas dummy asisten lalu lanjut ke grup tab asisten. | Wajib |
| FR-1.4 | Identitas peran tampil di setiap halaman (mis. pojok atas) dan dapat **ganti peran** kembali ke layar pilih peran. | Wajib |
| FR-1.5 | Navigasi per peran dibuat rapi (mis. Tab "Jadwal" untuk praktikan, Tab "Sesi" & "Rekap" untuk asisten). | Wajib |
| FR-1.6 | Menyediakan sekurang-kurangnya **2 jadwal dummy** (kelas A & B) dengan status campuran (`belum_dibuka`, `dibuka`) agar modul lain dapat didemokan. | Wajib |
| FR-1.7 | Menyediakan **komponen bersama** & state global sesi § 2.2/2.3. | Wajib |

## 4. Spesifikasi antarmuka (halaman milik P1)

Rute Expo Router (maks. rute yang jelas, hidup di `src/app/`):

```
src/app/_layout.tsx            → bungkus AppProvider (P1)
src/app/index.tsx              → pilih peran (P1)
src/app/pilih-identitas.tsx    → pilih identitas dummy sesuai role (P1)
```

- Layout memakai Flexbox: header (identitas) → konten → (opsional) tombol bawah.
- Menampilkan state kosong bila data belum ada (mis. `daftarSesi` kosong).

## 5. Kriteria penerimaan
1. Dari cold start, flow **pilih peran → pilih identitas → masuk tab peran** mulus tanpa jank.
2. Ganti peran mengembalikan user ke layar pilih peran; state identitas terisi benar di header.
3. `useApp()` dapat dipakai 3 modul lain (02/03/04) tanpa perubahan kontrak.
4. `npx expo lint` & `npx tsc --noEmit` bersih.
