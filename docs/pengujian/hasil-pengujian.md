# Hasil Pengujian SRS-04 — Integrasi, Keamanan, dan Pengujian

Tanggal: 18 November 2026
Lingkungan: Node.js 26.12.1, Expo SDK 57, Firebase JS SDK 13

## 1. Ringkasan eksekusi

| Perintah | Cakupan | Hasil |
| --- | --- | --- |
| `npm test` | Model EDOM lokal, klasifikasi sentimen, validasi input, pemetaan error | **18 lulus, 0 gagal** |
| `npm run test:rules` | Security Rules pada Firebase Emulator | Belum dijalankan (emulator perlu diunduh) |
| `npx tsc --noEmit` | Typecheck seluruh proyek | Lulus |
| `npx expo lint` | Lint | Lulus |

## 2. Kriteria pengujian

| No | Pengujian | Kriteria | Status | Bukti |
| --- | --- | --- | --- | --- |
| 1 | Authentication | Login/logout normal | Manual | `AuthContext`, `authService`, `login.tsx`, `role-header.tsx` |
| 2 | Authorization | Hak akses sesuai role | Otomatis (rules) + manual | `tests/rules`, `NavigationGuard` |
| 3 | Firestore CRUD | Data dikelola sesuai izin | Otomatis (rules) | `tests/rules` — describe FR-04.17 |
| 4 | Security Rules | Akses ilegal ditolak | Otomatis (rules) | `tests/rules` — seluruh describe |
| 5 | Presensi | Tersimpan dan ditampilkan | Otomatis (rules) + manual | `tests/rules` FR-04.14, skenario 4.1 |
| 6 | Pengajuan izin | Tersimpan dengan benar | Otomatis (rules) + manual | `tests/rules` FR-04.6/04.7, skenario 4.2 |
| 7 | AI EDOM | Model dimuat dan klasifikasi | **Otomatis — lulus** | `tests/ai/sentiment.test.mjs` |
| 8 | AI lokal | Tanpa API eksternal | **Otomatis — lulus** | `tests/ai/sentiment.test.mjs` FR-04.21 |
| 9 | Integrasi | Seluruh fitur dapat dipakai bersama | Manual | `docs/pengujian/SRS-04-integrasi-keamanan.md` bagian 4–5 |
| 10 | Error handling | Pesan kesalahan sesuai | **Otomatis — lulus** | `tests/lib/validasi.test.mjs` |

Status *manual* berarti skenario sudah tersedia dan dijalankan di aplikasi; hasil per
perangkat diisi saat demonstrasi.

## 3. Hasil pengujian AI EDOM lokal

| Uji | Hasil |
| --- | --- |
| `ai/model-edom.json` dimuat, `schema_version = 1`, label `negatif/netral/positif` | Lulus |
| `createSentimentClassifier(model)` menghasilkan fungsi | Lulus |
| Klasifikasi alasan izin menghasilkan label valid + `decision_margin` | Lulus |
| Input kosong → `empty_input`, label `null` | Lulus |
| Kata di luar kosakata → `unknown_vocabulary` | Lulus |
| Tidak ada `fetch`/`XMLHttpRequest`/URL pada classifier dan service | Lulus |
| Hasil klasifikasi deterministik (dua pemanggilan sama) | Lulus |

## 4. Hasil pengujian validasi dan error handling

- Nama kelas, nama/NIM peserta, tanggal, format jam, urutan jam: tervalidasi.
- Alasan izin: kosong, terlalu pendek, terlalu panjang, normalisasi spasi.
- Kelayakan sesi izin: sesi ditutup, sudah presensi, sudah mengajukan izin.
- Pemetaan error Firestore: `permission-denied`, `unavailable`, `unauthenticated`,
  `not-found`, `resource-exhausted`, error tak dikenal.

## 5. Daftar bug dan perbaikan

| ID | Temuan | Dampak | Perbaikan |
| --- | --- | --- | --- |
| BUG-01 | Repo `firestore.rules` belum memuat aturan koleksi `izin` | Seluruh alur izin `permission-denied` | Blok `izin` disinkronkan ke `firestore.rules` |
| BUG-02 | Self-register mengizinkan `role: 'asisten'` | Eskalasi hak akses | `users` create hanya `praktikan`; UI register tidak menawarkan asisten |
| BUG-03 | Mode demo di beranda dapat masuk tanpa login | Bypass autentikasi | Mode demo dihapus; `/pilih-identitas` dialihkan ke login |
| BUG-04 | Grup rute `/izin` tidak dijaga `NavigationGuard` | Akses tanpa login | Guard ditambahkan untuk `izin`, `sesi`, `pilih-identitas` |
| BUG-05 | Error listener Firestore tidak dapat diulang | Pengguna harus restart aplikasi | `retry()` pada hook + tombol **Coba lagi**/**Coba Lagi** |
| BUG-06 | Rules di repo berbeda dengan Console | Risiko saling menimpa saat deploy | Rules repo disamakan; `firebase.json` + `.firebaserc` ditambahkan |
| BUG-07 | `izin` create memakai `signedIn()` dan nilai `sentimen` tidak divalidasi; `users` create tidak mengecek field `uid` | Izin bisa dibuat aktor salah, label AI bisa dipalsukan, UID dokumen tidak konsisten | Create izin dibatasi `isPraktikan()` + validasi nilai `source`/`status`/`experimental`/`label`; create user mengecek `request.resource.data.uid == uid` |

## 6. Keterbatasan / tindak lanjut

- Unit test Security Rules belum dieksekusi pada sesi ini karena emulator Firestore harus
  diunduh lebih dulu. Jalankan `npm run test:rules` dan simpan keluarannya di bagian 1.
- Uji multi-perangkat dan uji manual peran perlu dijalankan saat demonstrasi; isi hasil
  pada tabel kriteria.
- Firestore tidak dikonfigurasi dengan cache persisten; saat offline, operasi baca/tulis
  Firebase akan gagal dan ditangani dengan pesan + tombol coba lagi. Klasifikasi sentimen
  tetap berjalan lokal.
