# SRS-01 — Autentikasi dan Manajemen Pengguna

| Informasi | Keterangan |
|---|---|
| **Sprint** | 2 — Integrasi Backend & Firebase |
| **Modul** | Autentikasi dan Manajemen Pengguna |
| **Penanggung Jawab** | **Programmer 1** |
| **Teknologi** | React Native, Expo Router (SDK 57), Firebase Authentication, Cloud Firestore |

---

## 1. Pendahuluan

### 1.1 Tujuan
Mengembangkan sistem autentikasi menggunakan Firebase Authentication dan pengelolaan identitas pengguna berdasarkan peran (Praktikan dan Asisten). Sistem ini memastikan integritas identitas pengguna unik (UID), keamanan sesi pengguna, dan pembatasan akses navigasi berdasarkan status login serta peran aktif pengguna.

### 1.2 Ruang Lingkup
- Registrasi akun baru (email & password) dengan penentuan peran (*Praktikan* atau *Asisten*) serta atribut profil (Nama, NIM, Kelas untuk Praktikan; NIP/Kode Asisten untuk Asisten).
- Login akun menggunakan Firebase Authentication.
- Logout akun dan pembersihan sesi aktif.
- Penyimpanan profil dan role pengguna ke Cloud Firestore (`users/{uid}`).
- Pengambilan profil pengguna secara otomatis setelah login.
- Mempertahankan sesi login ketika aplikasi ditutup dan dibuka kembali via persistensi AsyncStorage.
- Pengalihan (*redirection*) otomatis ke dashboard sesuai peran: `/praktikan` untuk Praktikan dan `/asisten` untuk Asisten.
- Penanganan dan penerjemahan pesan kesalahan autentikasi Firebase.
- Pembatasan rute (*Route Guarding*) berdasarkan status login dan role.

---

## 2. Kebutuhan Fungsional (Functional Requirements)

| Kode | Deskripsi Kebutuhan | Status Implementasi |
|---|---|---|
| **FR-01.1** | Sistem menyediakan halaman registrasi akun. | ✅ Selesai (`src/app/(auth)/register.tsx`) |
| **FR-01.2** | Sistem menyediakan halaman login menggunakan Firebase Authentication. | ✅ Selesai (`src/app/(auth)/login.tsx`) |
| **FR-01.3** | Sistem menyediakan fitur logout. | ✅ Selesai (`src/components/ui/role-header.tsx`) |
| **FR-01.4** | Sistem menyimpan informasi profil pengguna ke Cloud Firestore setelah registrasi. | ✅ Selesai (`src/services/userService.ts`) |
| **FR-01.5** | Setiap akun memiliki identitas unik berupa UID Firebase. | ✅ Selesai (`users/{uid}`) |
| **FR-01.6** | Setiap akun memiliki peran sebagai praktikan atau asisten. | ✅ Selesai (`role: 'praktikan' \| 'asisten'`) |
| **FR-01.7** | Sistem mengambil informasi profil dan peran pengguna setelah login. | ✅ Selesai (`src/context/AuthContext.tsx`) |
| **FR-01.8** | Sistem mengarahkan pengguna ke dashboard sesuai perannya. | ✅ Selesai (`NavigationGuard` di `src/app/_layout.tsx`) |
| **FR-01.9** | Sistem mempertahankan status login ketika aplikasi dibuka kembali sesuai sesi autentikasi Firebase. | ✅ Selesai (`getReactNativePersistence` + `onAuthStateChanged`) |
| **FR-01.10** | Sistem menampilkan pesan kesalahan jika registrasi atau login gagal. | ✅ Selesai (`getAuthErrorMessage` di `authService.ts`) |
| **FR-01.11** | Sistem membatasi halaman yang dapat diakses berdasarkan status login dan peran pengguna. | ✅ Selesai (`NavigationGuard`) |

---

## 3. Spesifikasi Arsitektur dan Data

### 3.1 Skema Koleksi Firestore (`users`)
Dokumen disimpan pada path `users/{uid}`:

```json
{
  "uid": "FIREBASE_AUTH_UID",
  "email": "mahasiswa@example.com",
  "nama": "Budi Santoso",
  "role": "praktikan",
  "nim": "21120120140001",
  "kelas": "A",
  "nip": null,
  "createdAt": "2026-11-12T10:00:00.000Z",
  "updatedAt": "2026-11-12T10:00:00.000Z"
}
```

### 3.2 Struktur Berkas Modul SRS-01
```text
src/
├── config/
│   └── firebase.ts            # Inisialisasi Firebase App, Auth (AsyncStorage persistence), & Firestore
├── services/
│   ├── authService.ts         # Layanan register, login, logout, & penerjemah error Firebase
│   └── userService.ts         # Layanan CRUD dokumen profil Firestore koleksi 'users'
├── context/
│   └── AuthContext.tsx        # AuthProvider & useAuth (state session, login, register, logout)
├── components/ui/
│   ├── input-field.tsx        # Komponen TextInput modular dengan validasi & password toggle
│   └── role-header.tsx        # Header profil dengan role badge dan tombol Logout (FR-01.3)
└── app/
    ├── _layout.tsx            # NavigationGuard untuk proteksi rute & pengalihan dashboard
    ├── index.tsx              # Gateway aplikasi: auto-redirect ke dashboard atau login
    └── (auth)/
        ├── _layout.tsx        # Stack layout grup autentikasi
        ├── login.tsx          # Halaman Login
        └── register.tsx       # Halaman Registrasi
```

---

## 4. Kriteria Pengujian dan Verifikasi
1. **Pendaftaran Akun:**
   - Registrasi Praktikan (Nama, Email, Kata Sandi, NIM, Kelas) -> berhasil membuat akun di Firebase Auth dan dokumen di Firestore `users/{uid}` -> otomatis diarahkan ke `/praktikan`.
   - Registrasi Asisten (Nama, Email, Kata Sandi, Kode Asisten) -> berhasil membuat akun -> otomatis diarahkan ke `/asisten`.
2. **Login:**
   - Login dengan kredensial salah -> memunculkan pesan kesalahan berbahasa Indonesia yang jelas.
   - Login berhasil -> mengambil profil & role dari Firestore -> diarahkan ke dashboard sesuai role.
3. **Persistensi Sesi:**
   - Saat aplikasi ditutup dan dibuka kembali, pengguna tetap dalam keadaan login tanpa perlu memasukkan kredensial ulang.
4. **Logout:**
   - Menekan tombol "Keluar" di header -> konfirmasi modal -> sesi dihapus -> kembali ke halaman login.
5. **Proteksi Akses (Route Guarding):**
   - Pengguna belum login mencoba membuka `/praktikan` atau `/asisten` -> langsung dialihkan ke login.
   - Pengguna Praktikan mencoba membuka rute `/asisten` -> ditolak dan diarahkan ke `/praktikan`.
   - Pengguna Asisten mencoba membuka rute `/praktikan` -> ditolak dan diarahkan ke `/asisten`.

