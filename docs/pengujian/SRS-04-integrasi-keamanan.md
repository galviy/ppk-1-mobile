# SRS-04 — Integrasi Sistem, Keamanan, dan Pengujian

Dokumen ini mencatat cakupan, cara menjalankan pengujian, dan skenario uji manual untuk
SRS-04 (Programmer 4). Hasil eksekusi dan daftar bug ada di
[`hasil-pengujian.md`](./hasil-pengujian.md).

## 1. Cakupan

| FR | Implementasi |
| --- | --- |
| FR-04.1 | Firebase Authentication + Cloud Firestore diinisialisasi di `src/config/firebase.ts`; profil pengguna disimpan di `users/{uid}`. |
| FR-04.2 | Modul autentikasi, kelas/peserta/sesi, presensi, dan izin memakai satu instance Firestore (`src/services/*`). |
| FR-04.3 | `firestore.rules`: akses per UID dan peran (`users`, `kelas`, `sesi`, `presensi`, `izin`). |
| FR-04.4 | `kelas` dan `sesi` hanya dapat ditulis asisten; registrasi mandiri hanya boleh `role: 'praktikan'`. |
| FR-04.5 | Praktikan hanya membaca kelas/sesi tempat ia menjadi peserta dan presensinya sendiri. |
| FR-04.6 | `izin` hanya dapat diubah asisten, sekali, dari status `menunggu`. |
| FR-04.7 | `izin` tidak dapat di-update oleh praktikan; field `sentimen` dan `alasan` tidak dapat diubah asisten (hanya `status`, `diputuskanOleh`, `diputuskanPada`). |
| FR-04.8 | `NavigationGuard` mengalihkan pengguna tanpa sesi ke `/(auth)/login`; mode identitas dummy dikunci. |
| FR-04.9 | `LoadingRow`/`ActivityIndicator` pada setiap layar data. |
| FR-04.10 | `EmptyState` untuk daftar kosong (kelas, sesi, peserta, presensi, izin). |
| FR-04.11 | Pesan error Firestore dipetakan di `pesanError` dan `pesanErrorIzin`. |
| FR-04.12 | Tombol **Coba lagi** pada banner error; listener Firestore dibuat ulang (`retry()` pada `use-praktikum`/`use-izin`) dan tombol **Coba Lagi** pada modal presensi gagal. |
| FR-04.13 | Skenario uji multi-perangkat (Bagian 5). |
| FR-04.14 | Skenario uji alur presensi dan izin end-to-end (Bagian 4). |
| FR-04.15 | Unit test Security Rules dengan Firebase Emulator (Bagian 3). |

## 2. Deploy Security Rules

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
```

Atau tempel `firestore.rules` di Firebase Console → Firestore Database → Rules → Publish.

Catatan bootstrap: akun asisten pertama dibuat manual di Authentication, lalu dokumen
`users/{uid}` dengan `role: 'asisten'` dibuat di Firestore. Registrasi mandiri hanya
menghasilkan praktikan.

## 3. Menjalankan unit test Security Rules

Prasyarat: Java (untuk emulator) dan Node.js.

```bash
npm run test:rules
```

Perintah tersebut menjalankan emulator Firestore pada port `8080` dan unit test
`tests/rules/firestore.rules.test.mjs` dengan `node --test`.

Cakupan test:

- akses tanpa login;
- praktikan hanya membaca profil/kelas/sesi/presensi/izin miliknya;
- registrasi mandiri sebagai asisten ditolak;
- praktikan tidak dapat mengelola kelas/sesi;
- presensi ganda dan presensi pada sesi ditutup ditolak;
- praktikan tidak dapat mengubah hasil AI atau keputusan izin;
- asisten hanya dapat mengubah field keputusan izin.

## 4. Skenario uji manual alur utama

### 4.1 Alur presensi

1. Asisten membuka aplikasi, membuat kelas, menambahkan praktikan sebagai peserta.
2. Asisten membuat sesi, lalu membuka sesi (`status: dibuka`).
3. Praktikan login di perangkat lain → sesi tampil pada tab Jadwal.
4. Praktikan menekan **Presensi Sekarang** → konfirmasi → berhasil.
5. Asisten membuka tab Rekap → praktikan muncul sebagai hadir tanpa refresh.
6. Praktikan menekan presensi lagi → tombol nonaktif / ditolak sebagai duplikat.
7. Asisten menutup sesi → praktikan tidak dapat presensi lagi.

### 4.2 Alur pengajuan izin

1. Praktikan membuka tab Izin → **+ Ajukan Izin**, memilih sesi, mengisi alasan.
2. Hasil analisis sentimen tampil (lokal, tanpa jaringan).
3. Pengajuan tersimpan dengan status `menunggu`.
4. Asisten membuka tab Izin → detail → **Terima/Tolak**.
5. Praktikan melihat status berubah secara real-time.
6. Asisten mencoba memutuskan ulang → ditolak (`sudah diputuskan`).
7. Praktikan mencoba mengubah hasil AI/keputusan lewat aplikasi → tidak ada jalur UI; aturan Firestore menolak update.

### 4.3 Uji akses tidak sesuai peran

| Aktor | Aksi | Hasil yang diharapkan |
| --- | --- | --- |
| Tanpa login | Buka `/praktikan`, `/asisten`, `/sesi/*`, `/izin/*`, `/pilih-identitas` | Dialihkan ke halaman login |
| Praktikan | Buka `/asisten` | Dialihkan ke `/praktikan` |
| Asisten | Buka `/praktikan` | Dialihkan ke `/asisten` |
| Praktikan | Tulis `kelas`/`sesi` | `permission-denied` |
| Praktikan lain | Baca kelas/sesi/izin bukan miliknya | `permission-denied` |
| Praktikan | Update dokumen `izin` | `permission-denied` |
| Asisten | Ubah `alasan`/`sentimen` izin | `permission-denied` |

## 5. Uji konsistensi antarperangkat

Siapkan dua perangkat/perangkat + emulator:

1. Login sebagai asisten di perangkat A dan praktikan di perangkat B pada kelas yang sama.
2. Buka sesi di A → status sesi berubah di B tanpa refresh.
3. Presensi di B → daftar rekap di A bertambah tanpa refresh.
4. Ajukan izin di B → daftar izin di A menampilkan pengajuan baru.
5. Putuskan izin di A → status di B berubah tanpa refresh.
6. Matikan koneksi B → lakukan aksi tulis → muncul pesan koneksi dan tombol
   **Coba lagi**; setelah koneksi pulih, tekan **Coba lagi**.

## 6. Catatan

- Semua listener memakai `onSnapshot`, sehingga perubahan dari perangkat lain langsung
  tersinkron selama koneksi tersedia.
- Analisis sentimen berjalan lokal di perangkat (`ai/model-edom.json`), bukan API; hasilnya
  tidak pernah menentukan status izin.
- Error `permission-denied` pada koleksi `izin` biasanya berarti rules belum di-deploy.
