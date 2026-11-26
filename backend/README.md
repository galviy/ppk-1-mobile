# Backend Pembayaran — Midtrans Sandbox

Layanan Node.js + TypeScript untuk memproses pembayaran denda praktikum pada
Aplikasi Praktikum PPK (Sprint 4, SRS-S4-04). Semua kredensial rahasia hanya
berada di environment server — **tidak pernah** di aplikasi React Native.

## Arsitektur

```
App (Expo) --ID Token--> Backend --Server Key--> Midtrans Snap
                            |                       |
                            |<---- Webhook (SHA-512)--
                            v
                 Firestore (Admin SDK)
                 - transaksi/{orderId}
                 - tagihan/{sesiId}_{uid}
                 - users/{uid}.expoPushToken -> Expo Push API
```

## Endpoint

| Method | Endpoint | Autentikasi | Keterangan |
| --- | --- | --- | --- |
| GET | `/health` | — | Health check, `200 OK`. |
| POST | `/api/payments/create` | Bearer Firebase ID Token | Membuat Snap transaction, menulis `transaksi/{orderId}` status `pending`. |
| POST | `/api/payments/webhook` | Signature SHA-512 Midtrans | Memperbarui `transaksi` + `tagihan`, mengirim push status pembayaran. |
| GET | `/api/payments/:orderId/status` | Bearer Firebase ID Token | Sinkronisasi status langsung ke Midtrans Status API. |
| POST | `/api/notifications/tagihan` | Bearer Firebase ID Token | Mengirim push `tagihan_dibuat` ke pemilik tagihan. |

### `POST /api/payments/create`

Request:

```json
{ "tagihanId": "{sesiId}_{uid}" }
```

Respons sukses:

```json
{ "orderId": "ORD-...", "snapToken": "...", "redirectUrl": "https://app.sandbox.midtrans.com/snap/v4/redirection/..." }
```

Penolakan: `401` token tidak valid, `403` tagihan milik user lain, `404` tagihan
tidak ditemukan, `409` tagihan sudah lunas, `502` Midtrans menolak permintaan.

## Environment

Salin `backend/.env.example` menjadi `backend/.env` lalu isi:

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `PORT` | tidak | Default `3000`. |
| `CORS_ORIGINS` | tidak | Daftar origin dipisah koma. Kosong = semua. |
| `MIDTRANS_SERVER_KEY` | ya | Server Key Sandbox. **Jangan commit.** |
| `MIDTRANS_CLIENT_KEY` | tidak | Client Key Sandbox (untuk referensi). |
| `MIDTRANS_IS_PRODUCTION` | tidak | Default `false` (Sandbox). |
| `MIDTRANS_SNAP_BASE_URL` | tidak | Override endpoint Snap. |
| `MIDTRANS_API_BASE_URL` | tidak | Override endpoint Status API. |
| `FIREBASE_SERVICE_ACCOUNT` | salah satu | Isi JSON service account dalam satu baris. |
| `GOOGLE_APPLICATION_CREDENTIALS` | salah satu | Path file service account. |
| `EXPO_ACCESS_TOKEN` | tidak | Jika proyek Expo mengaktifkan enhanced push security. |
| `EXPO_PUSH_URL` | tidak | Default `https://exp.host/--/api/v2/push/send`. |

## Menjalankan lokal

```bash
cd backend
npm install
cp .env.example .env   # lalu isi nilai asli
npm run dev            # http://localhost:3000/health
```

Build produksi:

```bash
npm run build
npm start
```

## Deploy ke hosting HTTPS

Backend harus dapat diakses publik agar webhook Midtrans bisa menjangkau server
(localhost tidak bisa). Contoh Vercel:

1. Import folder `backend/` sebagai project.
2. Build command: `npm run build`; output: `dist`.
3. Tambahkan seluruh environment variable dari tabel di atas.
4. Setelah deploy, buka `https://<domain>/health` → harus `200 OK`.

Alternatif: Render atau Railway dengan start command `npm start`.

## Konfigurasi Midtrans Sandbox

1. Login ke [dashboard.sandbox.midtrans.com](https://dashboard.sandbox.midtrans.com).
2. **Settings → Payment Notification URL** → isi
   `https://<domain-backend>/api/payments/webhook`.
3. Pastikan metode pembayaran Sandbox aktif (QRIS, Virtual Account, GoPay).
4. Ambil **Server Key** dari **Settings → Access Keys**, simpan hanya di env backend.

## Menguji webhook

Setelah server berjalan dan ada dokumen `transaksi/{orderId}`:

```bash
cd backend
ORDER_ID=ORD-xxxx TRANSACTION_STATUS=settlement npm run webhook:sample
```

Skrip akan membuat `signature_key` SHA-512 yang sah dari
`order_id + status_code + gross_amount + server_key`, lalu memanggil webhook.
Untuk menguji penolakan signature, ubah satu karakter `signature_key` secara manual.

## Unit test

```bash
cd backend
npm test
```

Mencakup verifikasi signature SHA-512, pemetaan status Midtrans, dan idempotensi
perubahan status pembayaran (webhook berulang tidak memicu push ganda).

## Aturan keamanan

- `MIDTRANS_SERVER_KEY` dan service account Firebase **hanya** di environment
  server. Jangan pernah menaruhnya di `app.json`, `.env` Expo, `src/`, atau Git.
- Status `success`/`failed` hanya ditulis backend setelah signature webhook valid.
- Webhook bersifat idempoten: status tagihan yang sudah `success` tidak pernah
  diturunkan kembali.
- Pembayaran **tidak pernah** mengubah `sesi/{sesiId}/presensi/{uid}`; status
  kehadiran tetap `terlambat`.
