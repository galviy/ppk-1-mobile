# SRS-03 — Pengelolaan Sesi & Rekap Presensi (Asisten)

| | |
|---|---|
| **Sprint** | 1 — Antarmuka dan Alur Praktikum |
| **Modul** | Sisi asisten (dimiliki Programmer 3) |
| **Penanggung jawab** | **Programmer 3** |
| **Proyek** | Aplikasi Praktikum PPK (React Native + Expo Router, SDK 57) |

---

## 1. Pendahuluan

### 1.1 Tujuan
Memfasilitasi asisten untuk **membuka/menutup sesi** dan **melihat rekap presensi** (daftar praktikan yang hadir beserta waktu kehadiran). Seluruh perubahan status harus langsung terlihat pada antarmuka yang memakai state global dari SRS-01.

### 1.2 Ruang lingkup
- Tab/rute **Kelola Sesi** (asisten): tombol buka & tutup sesi.
- Modal konfirmasi setelah buka/tutup.
- Tab/rute **Rekap** per sesi: daftar praktikan + waktu kehadiran.
- **Empty state** rekap: belum ada yang hadir.

### 1.3 Di luar ruang lingkup
- Daftar jadwal/detail sesi (SRS-02 menyediakan rute & slot tombol; P3 mengimplementasikan aksinya).
- Form presensi praktikan (SRS-04).

---

## 2. Dependensi

- `setSesiStatus(sesiId, status)`, `presensi` dari `useApp()` (SRS-01 § 2.2).
- Slot tombol pada detail sesi `/sesi/[id]` (SRS-02 § FR-2.5).
- Komponen bersama SRS-01 § 2.3 (`Card`, `EmptyState`, `StatusBadge`, `PrimaryButton`).

---

## 3. Kebutuhan fungsional

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-3.1 | Asisten dapat **membuka sesi** dari halaman detail sesi (atau kartu sesi di tab Kelola): mengubah status `belum_dibuka → dibuka` melalui `setSesiStatus`. | Wajib |
| FR-3.2 | Asisten dapat **menutup sesi**: mengubah status `dibuka → ditutup`. Setelah ditutup, tombol presensi praktikan dinonaktifkan (terlihat pada sisi SRS-04). | Wajib |
| FR-3.3 | Setiap aksi buka/tutup memunculkan **Modal konfirmasi** ("Yakin buka sesi? / Tutup sesi X?") dengan tombol Batal/Lanjut. | Wajib |
| FR-3.4 | Perubahan status tersimpan ke state global dan **secara otomatis memperbarui** badge di daftar & detail sesi (SRS-02 tanpa ada aksi manual). | Wajib |
| FR-3.5 | **Rekap presensi**: menampilkan daftar praktikan yang sudah presensi + **waktu kehadiran** (format `HH:MM:SS` atau `HH:MM`) terkini (terurut waktu). | Wajib |
| FR-3.6 | Rekap menampilkan jumlah total hadir (mis. "15/28 praktikan") bila jumlah praktikan kelas diketahui dari dummy SRS-01; minimal total hadir ditampilkan. | Wajib |
| FR-3.7 | Rekap saat belum ada presensi → `EmptyState` ("Belum ada yang hadir"). | Wajib |
| FR-3.8 | Rekap dapat diakses asisten untuk setiap sesi (pilih sesi → daftar hadir). | Wajib |

## 4. Spesifikasi antarmuka

Rute:
```
src/app/asisten/index.tsx      → tab: kelola sesi (ringkas seluruh sesi)
src/app/asisten/rekap.tsx      → tab: pilih sesi → rekap
```

Modal konfirmasi (FR-3.3):
```
[Yakin buka sesi Modul 1 — Kelas A?]
  [Batal]  [Ya, Buka]
```
Modal ditutup dengan informasi pendukung. Boleh memakai `Modal` bawaan RN; jika tim memilih bottom sheet lib, asal tetap diimplementasi konsisten.

Garis besar layar rekap:
```
[ Header rekap: nama modul • kelas ]
[ Card ringkasan total hadir ]
[ FlatList hadir:
   ┌──────────────────────────────┐
   │ 10123010 • Budi Santoso      │
   │ Kelas A • masuk 13:02:11     │
   └──────────────────────────────┘ ]
```

## 5. Kriteria penerimaan
1. **Alur demo utama tercapai di sisi asisten**: buka sesi → badge "Dibuka" terlihat di daftar & detail; tutup sesi → "Ditutup".
2. Modal konfirmasi terlihat & tidak memicu efek jika dibatalkan.
3. Rekap memunculkan entri yang masuk melalui `tambahPresensi` (bisa didemokan: asisten buka sesi, lalu tulis/panggil fungsi dummy untuk menambah entri, atau langsung diuji bersama SRS-04).
4. Empty state rekap tampil ketika belum ada presensi.
5. `npx expo lint` & `npx tsc --noEmit` bersih.
