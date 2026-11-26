# Hasil Pengujian Sprint 4 — SRS-04: Pembayaran Midtrans, Rules 3 Peran, dan E2E

Status dokumen: **draf**. Bagian yang bergantung pada P1/P2/P3 masih menunggu integrasi.

Acuan: `Sprint-4-Pembagian-Tugas-Tim.pdf` (SRS-S4-04) dan kontrak bersama Sprint 4.

## 1. Cakupan SRS-S4-04

| Kebutuhan | Artefak | Status |
| --- | --- | --- |
| FR-04.1 Endpoint backend membuat transaksi Midtrans | `backend/src/routes/payments.ts` (`POST /api/payments/create`) | Selesai |
| FR-04.2 Verifikasi signature webhook SHA-512 | `backend/src/lib/signature.ts`, `backend/src/routes/webhook.ts` | Selesai |
| FR-04.3 Pemetaan status Midtrans | `backend/src/lib/status.ts` | Selesai |
| FR-04.4 Idempotensi dan anti-regresi status | `backend/src/lib/payment-state.ts`, `backend/src/services/firestore-payments.ts` | Selesai |
| FR-04.5 Update atomik `transaksi` + `tagihan` | `backend/src/services/firestore-payments.ts` | Selesai |
| FR-04.6 UI daftar tagihan denda | `src/app/praktikan/pembayaran.tsx`, `src/hooks/use-pembayaran.ts`, `src/services/pembayaran.ts` | Selesai (menunggu tab P1) |
| FR-04.7 UI checkout dan tombol bayar | `src/app/pembayaran/[tagihanId].tsx`, `src/components/pembayaran/*` | Selesai (menunggu rute P1) |
| FR-04.8 Membuka Snap redirect | `expo-web-browser` di halaman checkout | Selesai |
| FR-04.9 Riwayat transaksi | halaman daftar + detail pembayaran | Selesai |
| FR-04.10 Sinkronisasi status manual | `GET /api/payments/:orderId/status` + tombol cek status | Selesai |
| FR-04.11 Rules 3 peran (aslab/asprak/praktikan) | `firestore.rules` | Selesai (draf, belum deploy) |
| FR-04.12 Rules presensi 13 field + anti-tamper tagihan/transaksi | `firestore.rules`, `tests/rules/firestore.rules.test.mjs` | Selesai (draf, belum deploy) |
| FR-04.13 Uji E2E dan regresi | dokumen ini | **Menunggu APK P1 dan merge P2/P3** |
| FR-04.14 Notifikasi hasil pembayaran | `backend/src/services/expo-push.ts`, `backend/src/services/firestore-payments.ts` | Selesai |

## 2. Kontrak backend pembayaran

Base URL dikonfigurasi di aplikasi melalui `EXPO_PUBLIC_PAYMENT_API_URL` (tanpa garis miring di akhir). Kredensial Midtrans hanya berada di environment backend.

| Metode | Path | Auth | Fungsi |
| --- | --- | --- | --- |
| `POST` | `/api/payments/create` | Bearer Firebase ID token | Membuat transaksi `pending` lalu meminta Snap token/redirect URL |
| `GET` | `/api/payments/:orderId/status` | Bearer Firebase ID token | Menanyakan status ke Midtrans dan menyinkronkan Firestore |
| `POST` | `/api/payments/webhook` | Signature SHA-512 | Menerima notifikasi pembayaran dari Midtrans |
| `POST` | `/api/notifications/tagihan` | Bearer Firebase ID token | Mengirim notifikasi tagihan baru (dipanggil P2) |
| `GET` | `/health` | — | Health check |

Environment backend (contoh di `backend/.env.example`):

- `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION=false`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `EXPO_ACCESS_TOKEN` (opsional untuk Expo Push API)
- `PORT` (default `3000`)

## 3. Perintah pengujian

```bash
# aplikasi
npm test
npm run test:rules
npx tsc --noEmit
npx expo lint

# backend
cd backend
npm run build
npm test
npm run webhook:sample   # contoh payload webhook ke server lokal
```

## 4. Hasil eksekusi

| Perintah | Hasil | Tanggal |
| --- | --- | --- |
| `backend: npm run build` | Lulus (0 error) | 26 November 2026 |
| `backend: npm test` | **16 lulus, 0 gagal** | 26 November 2026 |
| `backend: GET /health` | HTTP 200 | 26 November 2026 |
| `npm run test:rules` | **42 lulus, 0 gagal** pada Firebase Emulator | 26 November 2026 |
| `npx tsc --noEmit` | Lulus (0 error) | 26 November 2026 |
| `npx expo lint` | 2 error + 2 peringatan **pra-ada** di `src/components/maps/*` (tidak diubah Sprint 4) | 26 November 2026 |
| `npm test` | 1 gagal **pra-ada** di `tests/lib/validasi.test.mjs` (`sesiDasar` belum memuat `laboratoriumId`) | 26 November 2026 |

Catatan: kegagalan lint dan tes unit di atas sudah ada pada `origin/main` sebelum pekerjaan Sprint 4 dan bukan berasal dari berkas Sprint 4.

## 5. Cakupan tes Security Rules (42 kasus)

- 3 peran: `aslab`, `asprak` (termasuk nilai lama `asisten`), dan `praktikan`; `users.role` tidak dapat diubah sendiri.
- `laboratorium`: baca untuk pengguna login; tulis/hapus hanya `aslab`; validasi koordinat dan radius.
- `kelas`/`sesi`: `aslab` dan `asprak` yang ditugaskan; praktikan hanya membaca kelas/sesi yang diikuti.
- Presensi 13 field: radius, grace period, konsistensi status/`terlambatMenit`, blokir bila izin diterima, dan penolakan presensi ganda.
- Izin: pemilik mengajukan; `aslab`/`asprak` penanggung jawab memutuskan; `excusedAbsence`/`bebasDenda` hanya untuk izin diterima.
- Tagihan: praktikan hanya membaca miliknya; `statusPembayaran` tidak dapat diubah klien; ID harus `sesiId_uid`; nominal harus sama dengan `sesi.nominalDenda`; hapus ditolak.
- Transaksi: klien tidak dapat menulis; hanya pemilik dan `aslab` yang dapat membaca.

## 6. Skenario uji E2E (dijalankan setelah APK P1 dan merge P2/P3)

### 6.1 Alur A — pembayaran sukses

1. Praktikan terlambat presensi di luar grace period sehingga P2 membuat `tagihan` berstatus `unpaid`.
2. Praktikan membuka tab Tagihan, melihat nominal denda, lalu membuka halaman checkout.
3. Menekan **Bayar Sekarang**; aplikasi memanggil backend dan membuka Snap redirect.
4. Pembayaran diselesaikan dengan metode sandbox (mis. QRIS/VA).
5. Webhook Midtrans diterima, signature valid, `transaksi` menjadi `success`, `tagihan` menjadi `success`, dan praktikan menerima notifikasi.
6. Halaman checkout berubah menjadi **Lunas** tanpa refresh; transaksi tampil di riwayat.

### 6.2 Alur B — pending, gagal, dan bayar ulang

1. Transaksi dibiarkan `pending`; praktikan menekan **Cek Status Pembayaran**.
2. Setelah kedaluwarsa, status menjadi `failed` dan tombol **Bayar Sekarang** muncul kembali.
3. Pembayaran ulang membuat `orderId` baru; riwayat menampilkan kedua transaksi.
4. Webhook ganda dengan status lebih lama tidak menurunkan status `success` (idempotensi).

### 6.3 Alur C — anti-tamper

1. Klien mencoba mengubah `nominal`, `statusPembayaran`, atau menghapus `tagihan` → ditolak Rules.
2. Klien mencoba menulis `transaksi` → ditolak Rules.
3. Klien memanggil backend dengan `tagihanId` milik pengguna lain → HTTP 403.
4. Webhook dengan signature salah → HTTP 401 dan tidak ada perubahan data.

### 6.4 Regresi 3 peran dan fitur Sprint 2/3

- `aslab` mengelola lab, kelas, sesi, dan memutuskan izin.
- `asprak` hanya mengelola kelas/sesi yang ditugaskan.
- `praktikan` hanya melihat data miliknya.
- Login/logout, jadwal, presensi radius, rekap, izin, peta, dan notifikasi tetap berjalan.

## 7. Bug dan tindak lanjut

| ID | Temuan | Dampak | Perbaikan |
| --- | --- | --- | --- |
| S4-01 | Tab **Tagihan** dan proteksi rute `/pembayaran/[tagihanId]` milik P1 belum ada | Halaman belum dapat diakses dari UI | P1 menambahkan tab dan memasukkan `pembayaran` ke `NavigationGuard` |
| S4-02 | `firestore.rules` Sprint 4 belum di-deploy | Rules lama masih aktif | Deploy setelah P1/P2/P3 merge dan data presensi 13 field siap |
| S4-03 | Lint `src/components/maps/*` gagal (`set-state-in-effect`) | `npx expo lint` merah | Perbaiki di Sprint terkait peta (bukan Sprint 4) |
| S4-04 | Tes unit `tests/lib/validasi.test.mjs` gagal karena `sesiDasar` tanpa `laboratoriumId` | `npm test` merah | Perbarui fixture tes validasi sesi |
| S4-05 | `EXPO_PUBLIC_PAYMENT_API_URL` belum diisi di build | Tombol bayar menampilkan pesan konfigurasi | Isi env saat build APK/dev client |

Catatan:

- Snap redirect memakai `expo-web-browser`; tidak ada `serverKey` di aplikasi.
- Status pembayaran tetap diperbarui lewat webhook; tombol cek status hanya jaring pengaman bila webhook terlambat.
- Notifikasi pembayaran bersifat best-effort: kegagalan Expo Push API tidak menggagalkan update Firestore.
