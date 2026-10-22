# SRS-04 — Presensi & Riwayat Kehadiran (Praktikan)

| | |
|---|---|
| **Sprint** | 1 — Antarmuka dan Alur Praktikum |
| **Modul** | Sisi praktikan (dimiliki Programmer 4) |
| **Penanggung jawab** | **Programmer 4** |
| **Proyek** | Aplikasi Praktikum PPK (React Native + Expo Router, SDK 57) |

---

## 1. Pendahuluan

### 1.1 Tujuan
Memfasilitasi praktikan untuk **melakukan presensi** pada sesi yang dibuka, mendapatkan **umpan balik keberhasilan**, terjaga dari **presensi ganda** pada sesi yang sama, dan melihat **catatan kehadiran pribadi**.

### 1.2 Ruang lingkup
- Slot tombol & alur presensi pada halaman detail sesi (slot disediakan SRS-02).
- Form/konfirmasi presensi dengan Modal/Bottom Sheet.
- Catatan waktu kehadiran (timestamp saat menekan tombol).
- Tab/rute **Riwayat** kehadiran pribadi praktikan.

### 1.3 Di luar ruang lingkup
- Buka/tutup sesi & rekap asisten (SRS-03).
- Sekuransi waktu server/NTP — waktu mengacu jam device.

---

## 2. Dependensi

- `tambahPresensi(sesiId, entri)` dan `presensi` dari `useApp()` (SRS-01 § 2.2).
- `identitas` praktikan aktif (dari SRS-01 FR-1.2).
- Slot tombol presensi di `/sesi/[id]` (SRS-02 § FR-2.5).
- Komponen bersama SRS-01 § 2.3.

---

## 3. Kebutuhan fungsional

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-4.1 | Tombol presensi **hanya aktif** ketika status sesi adalah `dibuka`. Jika `belum_dibuka` → tombol nonaktif + teks "Sesi belum dibuka". Jika `ditutup` → nonaktif + "Sesi sudah ditutup". | Wajib |
| FR-4.2 | Menekan tombol presensi membuka **Modal/Bottom Sheet konfirmasi** yang menampilkan identitas praktikan, sesi, dan waktu dahulu ("Presensi pada 13:02?"), tombol Batal/Kirim. | Wajib |
| FR-4.3 | Setelah konfirmasi, panggil `tambahPresensi` mencatat `{ praktikanId, nama, kelas, waktu: HH:MM:SS }` dari `new Date()` saat itu. | Wajib |
| FR-4.4 | **Umpan balik berhasil**: Modal/sheet sukses ("Presensi berhasil tercatat 13:02:11") yang dapat ditutup. | Wajib |
| FR-4.5 | **Cegah ganda**: jika `praktikanId` sudah ada pada sesi tersebut, tombol berubah menjadi "Sudah presensi" (nonaktif); percobaan `tambahPresensi` duplikat **ditolak** oleh store (SRS-01 § 2.2) dan UI menampilkan info "Kamu sudah tercatat hadir pada sesi ini". | Wajib |
| FR-4.6 | **Riwayat pribadi**: daftar sesi yang pernah dihadiri praktikan ini, tampil nama modul, kelas, tanggal, dan waktu kehadirannya. | Wajib |
| FR-4.7 | Riwayat kosong → `EmptyState` ("Belum ada catatan kehadiran"). | Wajib |

## 4. Spesifikasi antarmuka

Rute:
```
src/app/praktikan/index.tsx    → tab: jadwal milik kelasnya (link ke detail sesi SRS-02)
src/app/praktikan/riwayat.tsx  → tab: catatan kehadiran pribadi
```

Alur Modal presensi:
```
[Detail sesi — status Dibuka]
  Tombol [Presensi Sekarang]
    └─ Bottom Sheet konfirmasi:
       Budi Santoso • Kelas A
       Modul 1 — Siklus Hidup
       Waktu: 22 Okt 2026, 13:02
       [Batal]  [Kirim Presensi]
    └─ Sheet sukses:
       ✓ "Presensi tercatat 13:02:11"  [Tutup]
```

## 5. Kriteria penerimaan
1. **Alur demo utama di sisi praktikan**: sesi dibuka SRS-03 → praktikan menekan presensi → konfirmasi → sheet sukses.
2. Menekan tombol kedua kali **tidak** menambah entri baru; tombol menjadi "Sudah presensi".
3. Riwayat segera memuat entri yang baru saja dibuat.
4. Waktu kehadiran yang tampil pada rekap asisten (SRS-03) sama dengan yang tercatat di sini (waktu `tambahPresensi`).
5. `npx expo lint` & `npx tsc --noEmit` bersih.
