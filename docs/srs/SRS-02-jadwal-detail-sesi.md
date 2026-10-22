# SRS-02 — Jadwal & Detail Sesi

| | |
|---|---|
| **Sprint** | 1 — Antarmuka dan Alur Praktikum |
| **Modul** | Jadwal & detail sesi (dimiliki Programmer 2) |
| **Penanggung jawab** | **Programmer 2** |
| **Proyek** | Aplikasi Praktikum PPK (React Native + Expo Router, SDK 57) |

---

## 1. Pendahuluan

### 1.1 Tujuan
Menyediakan halaman jadwal dan halaman detail sesi yang dapat dilihat **praktikan maupun asisten**, menampilkan nama praktikum, kelas, waktu, dan **status sesi** yang selalu ikut berubah saat asisten membuka/menutup sesi (konsumsi state dari SRS-01).

### 1.2 Ruang lingkup
- Halaman **daftar jadwal** (berbeda tampilan/CTA sesuai peran).
- Halaman **detail sesi**.
- Penanganan **empty state** dan **state status sesi** di antarmuka.

### 1.3 Di luar ruang lingkup
- Tombol buka/tutup sesi milik SRS-03.
- Form/mekanisme presensi milik SRS-04.

---

## 2. Dependensi (dari SRS-01)

- Data `Sesi[]` & `useApp()` (lihat § 2.2 SRS-01).
- Komponen bersama: `StatusBadge`, `Card`, `EmptyState`, `PrimaryButton` (lihat § 2.3 SRS-01).

---

## 3. Kebutuhan fungsional

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-2.1 | Daftar jadwal menampilkan **seluruh sesi** untuk kelas relevan dengan **nama praktikum, kelas, tanggal, jam**, dan `StatusBadge`. | Wajib |
| FR-2.2 | Untuk **praktikan**, sesi yang ditampilkan adalah **kelas praktikan itu** (filter dari identitas dummy). Untuk **asisten**, tampil semua kelas dengan filter pilihan (Chips: Semua / A / B). | Wajib |
| FR-2.3 | Tap entri jadwal navigasi ke **halaman detail sesi** (expo-router: `/jadwal/[id]`). | Wajib |
| FR-2.4 | Detail sesi menampilkan ringkasan lengkap (nama, kelas, tanggal, jam, status) dan **status otomatis mengikuti** perubahan di `daftarSesi` (karena berasal dari state global). | Wajib |
| FR-2.5 | Pada detail sesi untuk **asisten** muncul slot kontrol buka/tutup (tombol yang **implemented oleh SRS-03**, P2 cukup menyediakan slot/kontainer). Untuk **praktikan**, muncul slot tombol presensi (implemented oleh SRS-04). | Wajib |
| FR-2.6 | Jika daftar jadwal kosong → tampilkan `EmptyState` ("Belum ada jadwal"). | Wajib |
| FR-2.7 | Jika sesi berstatus `ditutup`/`belum_dibuka`, label dan warna badge berbeda dari `dibuka`. | Wajib |

## 4. Spesifikasi antarmuka

Rute:
```
src/app/sesi/index.tsx     → daftar jadwal (dipakai kedua peran)
src/app/sesi/[id].tsx      → detail sesi
```

Garis besar layar daftar (Flexbox kolom):
```
[ Header: "Jadwal Praktikum" ]
[ Chips kelas (hanya asisten): Semua | A | B ]
[ FlatList kartu sesi:
   ┌─────────────────────────┐
   │ Modul 1 — Siklus Hidup  │
   │ Kelas A • 22 Okt • 13–15 │
   │ [Dibuka]                │  ← StatusBadge
   └─────────────────────────┘ ]
```

Layar detail:
```
[ Header: nama modul ]
[ Card ringkasan: kelas/tanggal/jam/status ]
[ PrimaryButton: kontekstual (Buka/Tutup utk asisten, Presensi utk praktikan) ]
```

## 5. Kriteria penerimaan
1. Dengan dummy dari SRS-01, kedua peran melihat daftar sesi yang benar & filter kelas bekerja (asisten).
2. Saat SRS-03 mengubah status (dibuka → ditutup), badge di daftar & detail berubah otomatis tanpa refresh manual.
3. Tap kartu sesi navigasi ke detail dengan parameter id sesuai.
4. State kosong teruji (contoh: set `daftarSesi = []` sementara untuk demo).
5. `npx expo lint` & `npx tsc --noEmit` bersih.
