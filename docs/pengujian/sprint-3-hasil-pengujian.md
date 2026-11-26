# Hasil Pengujian Sprint 3 — SRS-04: Rules, Notifikasi, dan E2E

Status dokumen: **draf**. Bagian yang bergantung pada P1/P2/P3 masih menunggu integrasi.

Acuan: `todo.pdf` bagian 6 (kontrak bersama) dan bagian 11 (SRS-04).

## 1. Cakupan SRS-04

| Kebutuhan | Artefak | Status |
| --- | --- | --- |
| S3-04.1 Rules `laboratorium` | `firestore.rules`, `tests/rules/firestore.rules.test.mjs` | Selesai (draf) |
| S3-04.2 Rules presensi 10 field + validasi radius | `firestore.rules`, `tests/rules/firestore.rules.test.mjs` | Selesai (draf) |
| S3-04.3 Rules `users.expoPushToken` | `firestore.rules`, `tests/rules/firestore.rules.test.mjs` | Selesai (draf) |
| S3-04.4 Tes Rules dan deploy | `tests/rules/firestore.rules.test.mjs` | Tes lulus di emulator; **deploy menunggu skema P2/P3 final** |
| S3-04.5 `getAktivitasLab` + tes unit | `src/lib/lab-activity.ts`, `tests/lib/lab-activity.test.mjs` | Selesai |
| S3-04.6 `push-sender.ts` | `src/lib/push.ts`, `src/services/push-sender.ts`, `tests/lib/push.test.mjs` | Selesai (draf) |
| S3-04.7 Pemasangan notifikasi di 3 kejadian | `src/services/praktikum.ts`, `src/services/izin.ts` | Selesai (kode); uji E2E menunggu APK P1 dan merge P2/P3 |
| S3-04.8 Uji E2E 3 alur + regresi Sprint 2 | dokumen ini | **Menunggu APK P1 dan merge P2/P3** |

### Semantik `getAktivitasLab`

- Hanya sesi dengan `laboratoriumId == labId` yang dihitung; data lama tanpa `laboratoriumId` diabaikan.
- `berlangsung`: tanggal sesi sama dengan tanggal perangkat, `jamMulai <= sekarang < jamSelesai`, dan status bukan `ditutup`.
- `berikutnya`: sesi dengan waktu mulai setelah `now`, status bukan `ditutup`, dipilih yang paling dekat.
- Jika ada beberapa sesi berlangsung, dipilih yang paling awal mulai; seri diurutkan berdasarkan jam selesai lalu `id`.

## 2. Perintah pengujian

```bash
npm test                                        # tes unit (AI, lib, lab-activity, push)
npm run test:rules                              # tes Security Rules (butuh Java + emulator)
npx tsc --noEmit                                # typecheck
npx expo lint                                   # lint
```

## 3. Hasil eksekusi

| Perintah | Hasil | Tanggal |
| --- | --- | --- |
| `npm test` | **34 lulus, 0 gagal** (termasuk 16 tes baru lab-activity dan push) | 19 November 2026 |
| `npm run test:rules` | **46 lulus, 0 gagal** pada Firebase Emulator | 19 November 2026 |
| `npx tsc --noEmit` | Lulus (0 error) | 19 November 2026 |
| `npx expo lint` | Lulus (0 error) | 19 November 2026 |

## 4. Cakupan tes Security Rules

Kasus baru yang diuji:

- `laboratorium`: baca hanya untuk pengguna login; tulis/hapus hanya asisten; validasi tipe dan rentang `latitude`, `longitude`, `radiusMeter`.
- `users`: `expoPushToken` harus `null` atau string berformat `ExponentPushToken[...]` / `ExpoPushToken[...]`; perubahan `role` tetap ditolak.
- presensi: 10 field wajib; `laboratoriumId` harus sama dengan milik sesi; koordinat harus berada dalam radius lab (jarak datar); presensi ganda, sesi ditutup, dan sesi lama tanpa `laboratoriumId` ditolak.

## 5. Skenario uji E2E (dijalankan setelah APK dan merge P1/P2/P3)

### 5.1 Alur A — presensi berbasis lokasi

1. Asisten membuat lab dengan koordinat dan radius, lalu membuat sesi yang menautkan lab tersebut.
2. Asisten membuka sesi.
3. Praktikan membuka `/presensi/{sesiId}` di dalam radius lab.
4. Presensi berhasil dan rekap asisten menampilkan hadir.
5. Praktikan mencoba presensi di luar radius, sesi ditutup, dan presensi kedua — semuanya ditolak dengan alasan jelas.

### 5.2 Alur B — peta dan aktivitas lab

1. Pengguna membuka tab Peta.
2. Marker lab dan posisi pengguna tampil.
3. Memilih marker menampilkan info lab serta praktikum berlangsung dan berikutnya.
4. Mengubah jadwal/status sesi membuat info aktivitas berubah real-time.
5. Web tidak crash (fallback daftar lab).

### 5.3 Alur C — notifikasi

1. Asisten membuka sesi → praktikan di kelas tersebut menerima notifikasi `sesi_dibuka` dan mengetuknya membuka `/presensi/{sesiId}`.
2. Asisten mengubah tanggal/jam/lab sesi → peserta menerima notifikasi `jadwal_berubah` dan mengetuknya membuka `/sesi/{sesiId}`.
3. Asisten memutuskan izin → pemilik izin menerima notifikasi `izin_diputuskan` dan mengetuknya membuka `/izin/{izinId}`.
4. Praktikan kelas lain tidak menerima notifikasi sesi/jadwal.
5. Pengguna tanpa token dilewati tanpa menggagalkan operasi utama.

## 6. Regresi Sprint 2

- Login/logout, jadwal, presensi, rekap, dan izin tetap berjalan.
- Token push terisi setelah login dan menjadi `null` setelah logout.
- Error `permission-denied`, `unavailable`, dan offline menampilkan pesan + tombol coba lagi.

## 7. Bug dan tindak lanjut

| ID | Temuan | Dampak | Perbaikan |
| --- | --- | --- | --- |
| — | Belum ada temuan pada sesi ini | — | — |

Catatan:

- Rules presensi versi 10 field hanya boleh di-deploy setelah P2 merge; jika dideploy lebih awal, presensi Sprint 2 yang masih menulis 5 field akan ditolak.
- Koordinat perangkat tidak dapat dibuktikan asli oleh Rules; mitigasi tetap di klien (tolak lokasi `mocked`) dan validasi jarak di Rules.
- `push-sender` bersifat best-effort: kegagalan Expo Push API tidak menggagalkan operasi Firestore.
