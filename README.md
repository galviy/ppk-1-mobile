# Aplikasi Praktikum PPK

Aplikasi mobile presensi dan manajemen kegiatan praktikum berbasis React Native dan Expo untuk **Praktikan** dan **Asisten**. Mendukung pengelolaan kelas, peserta, jadwal/sesi, pencatatan presensi real-time, serta pengajuan izin dengan analisis sentimen lokal. Pada Sprint 3, aplikasi dikembangkan dengan validasi lokasi presensi, peta laboratorium interaktif, dan push notification.

---

## Status Pengembangan per Sprint

- **Sprint 1 (Selesai — UI & Data Dummy)**: Antarmuka alur praktikum untuk praktikan dan asisten (jadwal, detail sesi, buka/tutup sesi, presensi, rekap kehadiran) menggunakan state lokal/dummy.
- **Sprint 2 (Selesai — Firebase & Analisis Sentimen Lokal)**:
  - **SRS-01**: Autentikasi Firebase (login, registrasi praktikan, logout, persistensi sesi) dan `NavigationGuard` berbasis peran.
  - **SRS-02**: CRUD kelas, peserta, jadwal/sesi, serta presensi atomik (`runTransaction`, anti presensi ganda) secara real-time di Cloud Firestore.
  - **SRS-03**: Pengajuan izin praktikan, pemeriksaan izin asisten (terima/tolak sekali), dan analisis sentimen lokal berbasis `ai/model-edom.json` + `ai/sentiment.js` (tanpa API eksternal; hasil AI tidak menentukan keputusan izin).
  - **SRS-04**: Firebase Security Rules berbasis UID dan peran, mekanisme `retry()` + tombol **Coba lagi** untuk error koneksi, unit test lokal, dan skenario pengujian integrasi.
- **Sprint 3 (Dalam Pengerjaan — Lokasi, Peta, & Notifikasi)**:
  - Halaman presensi khusus terpisah dari detail sesi dengan validasi radius lokasi laboratorium.
  - Pengelolaan lokasi & radius laboratorium oleh asisten, peta laboratorium interaktif, dan info aktivitas praktikum (sedang berlangsung & berikutnya) secara real-time.
  - Push notification untuk perubahan status sesi (dibuka), perubahan jadwal, dan keputusan izin, serta penanganan kondisi izin/perangkat.

---

## Teknologi

### Terpasang saat ini (`package.json`)
- **Expo**: `~57.0.31` (Expo Router `~57.0.29`, `expo-constants` `~57.0.22`, `expo-device` `~57.0.2`, `expo-linking` `~57.0.13`)
- **React Native**: `0.86.3` / **React**: `19.2.3`
- **TypeScript**: `~6.0.3` (path alias `@/*` → `./src/*`)
- **Firebase JS SDK**: `^13.2.0` (Authentication & Cloud Firestore)
- **Pengujian Rules**: `@firebase/rules-unit-testing` `^6.0.0` (devDependency)

### Direncanakan untuk Sprint 3 (belum terpasang)
- `expo-location` (akses GPS & pemantauan lokasi perangkat)
- `expo-notifications` (izin notifikasi, Expo Push Token, handler foreground & deep link)
- `react-native-maps` (peta native Android/iOS; web menggunakan fallback non-peta)
- `expo-dev-client` & `eas.json` (Android Development Build via EAS)

---

## Menjalankan Proyek

### Prasyarat
- Node.js dan npm
- Akun/akses proyek Firebase (`ppk-kel2-2026`, paket Spark)
- Java (opsional, hanya diperlukan untuk menjalankan Firebase Firestore Emulator pada `npm run test:rules`)

### Langkah Instalasi
1. Pasang dependensi:
   ```bash
   npm install
   ```
2. Buat file `.env` di root proyek berdasarkan `.env.example` dengan nama variabel berikut (isi nilainya dari Firebase Console, **jangan pernah commit `.env`**):
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
3. Jalankan server pengembangan:
   ```bash
   npx expo start
   ```
   Skrip lain yang tersedia di `package.json`: `npm run android`, `npm run ios`, `npm run web`.

### Catatan Lingkungan Uji
- **Sprint 1–2** dapat diuji menggunakan Expo Go.
- **Sprint 3 membutuhkan Android Development Build** (dibangun via EAS) karena remote push notification pada `expo-notifications` tidak tersedia di Expo Go Android sejak Expo SDK 53, sekaligus untuk menguji `react-native-maps` dan GPS fisik.
- **Web** hanya berfungsi sebagai fallback tanpa komponen peta (`react-native-maps` tidak mendukung web).
- Proyek mengaktifkan `experiments.typedRoutes` di `app.json`. Setelah menambah file rute baru di `src/app/`, jalankan `npx expo start` sebentar agar tipe rute di `.expo/types` ter-generate sebelum menjalankan `npx tsc --noEmit`.

---

## Struktur Folder

```text
ppk-1-mobile/
├── ai/                 # Model sentimen EDOM lokal (model-edom.json, sentiment.js)
├── docs/
│   ├── srs/            # Dokumen SRS Sprint 1 dan Sprint 2
│   └── pengujian/      # Panduan & laporan hasil pengujian SRS-04
├── src/
│   ├── app/            # Rute Expo Router: (auth), praktikan, asisten, sesi, izin
│   ├── components/     # Komponen UI bersama, form, presensi, dan izin
│   ├── config/         # Inisialisasi Firebase Auth & Cloud Firestore
│   ├── constants/      # Konfigurasi tema dan spasi
│   ├── context/        # AuthContext (sesi login & profil pengguna)
│   ├── data/           # Tipe model Firestore, tipe izin, dan state pendukung
│   ├── hooks/          # Hook listener real-time Firestore (use-praktikum, use-izin)
│   ├── lib/            # Validasi input, pemetaan error, format tanggal, aturan izin
│   └── services/       # Lapisan akses Firebase Auth, Firestore, dan sentimen lokal
├── tests/              # Unit test AI, validasi input, dan Firestore Security Rules
├── AGENTS.md           # Pedoman pengembangan Expo/React Native untuk agent
├── app.json            # Konfigurasi Expo (package Android, google-services.json, EAS)
├── firebase.json       # Konfigurasi rules, indexes, dan emulator Firestore
├── firestore.rules     # Aturan keamanan Cloud Firestore
└── firestore.indexes.json
```

---

## Data dan Keamanan

### Koleksi Cloud Firestore Saat Ini
- `users/{uid}`: profil pengguna (`uid`, `email`, `nama`, `role`, `nim`/`kelas`/`nip`, `createdAt`, `updatedAt`). Registrasi mandiri dibatasi hanya untuk `role: 'praktikan'`.
- `kelas/{kelasId}` & subkoleksi `kelas/{kelasId}/peserta/{uid}`: data kelas, `pesertaUids`, dan daftar peserta.
- `sesi/{sesiId}` & subkoleksi `sesi/{sesiId}/presensi/{uid}`: jadwal/status sesi (`belum_dibuka`, `dibuka`, `ditutup`) dan catatan presensi dengan ID dokumen `= uid` (anti presensi ganda).
- `izin/{sesiId}_{uid}`: pengajuan izin praktikan, hasil sentimen lokal (`model-edom`), dan keputusan asisten sekali jalan (`menunggu` → `diterima`/`ditolak`).

### Perluasan Data Direncanakan (Sprint 3)
- Koleksi baru `laboratorium/{labId}` (nama, kode, deskripsi, koordinat `latitude`/`longitude`, `radiusMeter`).
- Field `laboratoriumId` pada dokumen `sesi/{sesiId}`.
- Field metadata lokasi (`laboratoriumId`, koordinat, jarak, akurasi) pada `sesi/{sesiId}/presensi/{uid}`.
- Field `expoPushToken` pada `users/{uid}`.

### Security Rules & Skrip Firebase
Aturan keamanan dikelola di [firestore.rules](firestore.rules) dan diverifikasi memakai emulator lokal:
```bash
npm run test:rules     # Menjalankan tests/rules di Firestore Emulator (port 8080)
npm run deploy:rules   # Deploy firestore.rules ke project ppk-kel2-2026
```

---

## Tim dan Pembagian Sprint 3

Koordinasi proyek dipimpin oleh **Project Manager**.

| Programmer | GitHub | SRS Sprint 3 | Fokus |
| --- | --- | --- | --- |
| P1 | husein avicenna | SRS-01 | Fondasi native (paket, `app.json`, `eas.json`, APK development), push notification sisi klien (izin, token di `users/{uid}`, deep link), komponen kondisi perangkat (`PermissionNotice`) |
| P2 | biyaniandarisky | SRS-02 | Presensi berbasis lokasi: `geo.ts`, `use-location.ts`, halaman `/presensi/[sesiId]`, validasi radius di transaksi presensi, pemilih lab di form sesi |
| P3 | [ovisucira-afk](https://github.com/ovisucira-afk) | SRS-03 | Laboratorium (koleksi + CRUD asisten), halaman Maps (marker lab + posisi pengguna), info aktivitas lab |
| P4 | galviyy (Galvin) | SRS-04 | Security Rules (laboratorium, presensi lokasi, token), `lab-activity.ts` (logika "sedang berlangsung / berikutnya"), `push-sender.ts` + pemasangan di tiga kejadian (sesi dibuka, jadwal berubah, izin diputuskan), uji E2E |

### Keputusan Teknis Sprint 3
- **Paket Firebase**: tetap **Spark**; pengiriman push dilakukan dari perangkat asisten lewat Expo Push API secara *best-effort* (tanpa Cloud Functions).
- **Platform demo**: perangkat fisik **Android** dengan EAS Development Build; web hanya sebagai fallback tanpa peta.
- **Ruang lingkup**: presensi QR dikeluarkan dari scope inti (menjadi stretch goal).
- **Konfigurasi domain**: radius default laboratorium **100 m**; satu `expoPushToken` per pengguna; tab praktikan menjadi **4 tab (+Peta)** dan asisten **5 tab (+Peta)**.
- **Kredensial & rahasia**: Google Maps API key, akses EAS, dan kunci FCM dipegang oleh **P1**; tidak ada rahasia yang boleh masuk ke repositori.
- **Tenggat sprint**: ditentukan PM.

### Status Kemajuan Sprint 3
- [ ] **SRS-01 (P1)**: Fondasi native, `eas.json`, APK development, push client & `PermissionNotice`
- [ ] **SRS-02 (P2)**: Utilitas lokasi, halaman `/presensi/[sesiId]`, validasi radius, pemilih lab di form sesi
- [ ] **SRS-03 (P3)**: Koleksi & CRUD laboratorium, halaman Maps (native + fallback web), tampilan aktivitas lab
- [ ] **SRS-04 (P4)**: Security Rules Sprint 3, `lab-activity.ts`, `push-sender.ts` + wiring 3 event, pengujian E2E

---

## Alur Kerja Kontribusi

- **Penamaan branch**: mengikuti pola `srs-NN-deskripsi-kebab-case` (Sprint 3 memakai awalan `sprint3-`, mis. `sprint3-01-push-client-token`). Semua perubahan digabungkan lewat Pull Request ke `main`.
- **Kepemilikan file**: setiap file/folder memiliki satu pemilik untuk meminimalkan konflik. Titik panas konflik (`package.json`, `package-lock.json`, `app.json`, `eas.json`, `src/app/_layout.tsx`, `src/data/models.ts`, `src/services/praktikum.ts`, `firestore.rules`) hanya boleh diubah oleh pemiliknya sesuai fase.
- **Aturan dependensi**: hanya **P1** yang menambahkan/mengubah paket npm (`npx expo install`) pada PR fondasi awal; anggota lain melakukan `npm install` setelah PR tersebut masuk ke `main`.
- **Urutan merge Sprint 3**: Fondasi native (P1) → P1 (push client) & utilitas lokasi P2 → P2 (presensi lokasi) & P3 (lab + Maps) → P4 (Security Rules, wiring event push, pengujian E2E).
- **Definition of Done**: `npx tsc --noEmit` menghasilkan 0 error, `npx expo lint` tidak menambah error baru di luar baseline, fitur Sprint 2 tetap berjalan normal, dan tidak ada rahasia/kredensial dalam commit.

---

## Pengujian

```bash
npx tsc --noEmit       # Typecheck TypeScript (baseline: 0 error)
npx expo lint          # Lint proyek
npm test               # Unit test AI sentimen lokal dan validasi input (tests/ai, tests/lib)
npm run test:rules     # Unit test Firestore Security Rules di emulator lokal
```

**Catatan baseline lint**: `npx expo lint` saat ini melaporkan **251 error** (0 warning) yang seluruhnya berasal dari aturan `import/no-unresolved` untuk path alias `@/*` (termasuk 7 error dari file lokal untracked jika ada). Pengembang tidak boleh menambah error lint jenis lain.

Panduan dan laporan pengujian sebelumnya tersedia di:
- [Panduan & Skenario Pengujian SRS-04](docs/pengujian/SRS-04-integrasi-keamanan.md)
- [Laporan Hasil Pengujian SRS-04](docs/pengujian/hasil-pengujian.md)

---

## Dokumentasi

Dokumen SRS yang tersedia di repositori:
- Sprint 1: [SRS-01 Fondasi Aplikasi](docs/srs/SRS-01-fondasi-aplikasi.md), [SRS-02 Jadwal & Detail Sesi](docs/srs/SRS-02-jadwal-detail-sesi.md), [SRS-03 Sesi & Rekap Asisten](docs/srs/SRS-03-sesi-rekap-asisten.md), [SRS-04 Presensi Praktikan](docs/srs/SRS-04-presensi-praktikan.md)
- Sprint 2: [SRS-01 Autentikasi & Manajemen Pengguna](docs/srs/SRS-01-autentikasi-manajemen-pengguna.md)
- Sprint 3: SRS-01 s.d. SRS-04 Sprint 3 (akan ditambahkan)
- Pedoman pengembangan Expo: [AGENTS.md](AGENTS.md)

---

## Lisensi

Proyek ini menggunakan lisensi MIT. Lihat berkas [LICENSE](LICENSE) untuk rincian lengkap.
