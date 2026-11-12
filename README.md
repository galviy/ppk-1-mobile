# Sprint 1 - Antarmuka dan Alur Praktikum

Kegiatan praktikum membutuhkan pencatatan kehadiran yang mudah digunakan oleh praktikan dan asisten. Asisten perlu melihat jadwal, membuka sesi ketika praktikum dimulai, memantau kehadiran, dan menutup sesi setelah selesai. Praktikan perlu mengetahui jadwal dan detail sesi, melakukan presensi, serta melihat catatan kehadirannya.

Pada sprint ini, bangun aplikasi React Native yang dapat mendemonstrasikan kegiatan tersebut melalui dua sudut pandang: praktikan dan asisten. Tentukan sendiri susunan halaman, navigasi, dan bentuk interaksi yang membantu masing-masing pengguna menyelesaikan kegiatannya.

Kebutuhan yang harus dipenuhi:

Jadwal dan detail sesi. Pengguna dapat melihat daftar jadwal serta informasi sesi, seperti nama praktikum, kelas, waktu, dan status sesi.
Pengelolaan sesi. Asisten dapat membuka dan menutup sesi. Perubahan status tersebut harus terlihat pada antarmuka yang berkaitan.
Pencatatan presensi. Praktikan dapat melakukan presensi ketika sesi dibuka. Aplikasi mencatat waktu kehadiran dan memberikan umpan balik bahwa presensi berhasil. Praktikan yang sama tidak dapat melakukan presensi dua kali pada sesi yang sama.
Rekap sederhana. Asisten dapat melihat daftar praktikan yang sudah melakukan presensi beserta waktu kehadirannya. Praktikan dapat melihat catatan kehadirannya sendiri.
Interaksi yang jelas. Gunakan form untuk menerima masukan atau pilihan pengguna, serta Modal atau Bottom Sheet untuk konfirmasi atau menampilkan informasi pendukung.
Gunakan data lokal/dummy untuk identitas pengguna, jadwal, dan sesi. Pemilihan peran dan identitas dapat dilakukan melalui pilihan sederhana di dalam aplikasi. Perubahan data cukup dikelola menggunakan state selama aplikasi berjalan.

Terapkan Flexbox untuk menyusun tata letak, navigasi untuk perpindahan halaman, dan state agar tampilan merespons tindakan pengguna. Perhatikan juga tampilan ketika daftar masih kosong, sesi belum dibuka, dan presensi sudah tercatat.

Hasil akhir: aplikasi dapat mendemonstrasikan alur asisten membuka sesi → praktikan melakukan presensi → asisten melihat rekap → asisten menutup sesi, dengan informasi yang konsisten pada kedua peran.

## Daftar SRS

| Kode | Deskripsi | Acceptance Criteria |
| :--- | :--- | :--- |
| **SRS-01** | **Fondasi Aplikasi & Navigasi (Programmer 1)**<br>Membuat fondasi aplikasi, alur navigasi, validasi peran/identitas, dan komponen UI bersama. | - Sistem menampilkan halaman pemilihan peran (praktikan/asisten) dan identitas dummy<br>- Validasi peran & identitas berjalan sebelum masuk dashboard<br>- Navigasi antarhalaman & tombol kembali berfungsi tanpa error<br>- Komponen UI bersama (tombol, kartu, indikator status) tersedia dan konsisten |
| **SRS-02** | **Antarmuka Praktikan (Programmer 2)**<br>Modul jadwal, detail sesi, presensi mandiri, dan pemantauan riwayat kehadiran praktikan. | - Dashboard & daftar jadwal praktikum dummy tampil dengan benar<br>- Tombol presensi aktif saat sesi dibuka dan menolak jika tertutup/ganda<br>- Waktu presensi tercatat otomatis dan riwayat kehadiran dapat dipantau<br>- Penanganan *empty state* tersedia saat jadwal/riwayat kosong |
| **SRS-03** | **Antarmuka Asisten (Programmer 3)**<br>Modul pengelolaan status sesi (buka/tutup) dan rekapitulasi kehadiran praktikan. | - Dashboard asisten menampilkan daftar jadwal & detail sesi<br>- Modal/Bottom Sheet konfirmasi tersedia untuk membuka/menutup sesi<br>- Status sesi berubah secara *real-time* (DIBUKA/DITUTUP)<br>- Rekap dummy (nama, NIM, waktu hadir, jumlah total) ditampilkan dengan benar |
| **SRS-04** | **Data Dummy, State & QA (Programmer 4)**<br>Penyediaan dataset lokal, fungsi bantu logika presensi, pengujian integrasi, dan dokumentasi bug. | - Dataset dummy (identitas, jadwal, sesi, presensi) tersedia dan siap digunakan<br>- Fungsi validasi sesi & pencegahan presensi ganda berjalan akurat<br>- Skenario pengujian integrasi lintas modul terdokumentasi<br>- Aplikasi dapat didemonstrasikan dengan mulus tanpa kendala error |

# Sprint 2 — Data Dinamis dengan Firebase

Pada sprint sebelumnya, aplikasi telah memiliki antarmuka dan alur pengelolaan kegiatan praktikum menggunakan data lokal/dummy. Namun, data yang digunakan belum tersimpan secara permanen dan belum terhubung antar pengguna. Akibatnya, perubahan yang dilakukan oleh praktikan belum tentu terlihat oleh asisten, begitu pula sebaliknya.

Kini aplikasi perlu dikembangkan agar dapat digunakan oleh banyak pengguna dengan akun masing-masing. Praktikan dan asisten harus dapat mengakses data yang sama secara real-time, dengan informasi dan tindakan yang disesuaikan berdasarkan peran pengguna. Selain itu, praktikan yang berhalangan mengikuti kegiatan praktikum membutuhkan fasilitas pengajuan izin yang dapat diperiksa oleh asisten dengan bantuan Artificial Intelligence (AI).

Pada sprint ini, kembangkan aplikasi React Native dari sprint sebelumnya dengan mengintegrasikan Firebase Authentication untuk pengelolaan akun, Cloud Firestore untuk penyimpanan dan sinkronisasi data, serta model AI yang disediakan pengajar melalui API. Tentukan sendiri penyesuaian antarmuka, struktur data, dan alur interaksi yang diperlukan untuk memenuhi kebutuhan tersebut.

Kebutuhan yang harus dipenuhi:

1. Autentikasi pengguna. Pengguna dapat melakukan registrasi, login, dan logout menggunakan Firebase Authentication. Setiap akun memiliki identitas dan peran sebagai praktikan atau asisten. Aplikasi harus menampilkan informasi dan menyediakan tindakan sesuai peran pengguna.

2. Pengelolaan data praktikum. Data kelas, peserta, jadwal, dan sesi praktikum disimpan menggunakan Cloud Firestore. Asisten dapat melakukan operasi tambah, lihat, ubah, dan hapus (CRUD) terhadap data praktikum sesuai kebutuhan aplikasi. Praktikan dapat melihat jadwal dan informasi sesi yang berkaitan dengan dirinya.

3. Presensi terintegrasi. Praktikan dapat melakukan presensi ketika sesi dibuka oleh asisten. Data kehadiran disimpan di Firestore berdasarkan identitas praktikan dan sesi yang diikuti. Praktikan tidak dapat melakukan presensi lebih dari satu kali pada sesi yang sama.

4. Sinkronisasi data real-time. Perubahan status sesi, pencatatan presensi, dan rekap kehadiran harus dapat terlihat oleh pengguna terkait tanpa perlu menjalankan ulang aplikasi. Data yang tersimpan harus tetap tersedia setelah aplikasi ditutup dan dibuka kembali.

5. Pengajuan izin. Praktikan dapat mengajukan izin untuk sesi tertentu dengan mengisi alasan ketidakhadiran. Setiap pengajuan disimpan di Firestore dan memiliki status yang dapat dipantau oleh praktikan.

6. Integrasi AI. Aplikasi mengirimkan alasan izin ke API model AI yang disediakan pengajar untuk mendapatkan prediksi kategori alasan. Hasil klasifikasi ditampilkan sebagai informasi pendukung dan disimpan bersama pengajuan. Model AI tidak menentukan apakah izin diterima atau ditolak.

7. Pemeriksaan izin. Asisten dapat melihat daftar pengajuan izin beserta alasan dan hasil klasifikasinya, kemudian menerima atau menolak pengajuan. Keputusan tersebut tersimpan di Firestore dan dapat dilihat oleh praktikan.

8. Validasi dan keamanan data. Aplikasi harus menangani input yang tidak valid, kegagalan autentikasi, serta kesalahan komunikasi dengan Firestore atau API AI. Akses dan perubahan data harus dibatasi sesuai identitas serta peran pengguna, termasuk melalui Firebase Security Rules.

Gunakan Firebase Authentication sebagai sumber identitas pengguna dan Cloud Firestore sebagai penyimpanan utama data aplikasi. Terapkan operasi CRUD, real-time listener, dan pengelolaan state agar perubahan data dapat tercermin secara konsisten pada antarmuka.

Perhatikan juga kondisi ketika pengguna belum login, data masih dimuat, daftar data kosong, koneksi mengalami gangguan, atau layanan AI tidak memberikan respons. Pengajuan izin tidak boleh otomatis diterima atau ditolak berdasarkan hasil prediksi model.

Hasil akhir: aplikasi dapat mendemonstrasikan dua alur utama:

- Asisten login → membuka sesi → praktikan login dan melakukan presensi → data tersimpan di Firestore → asisten melihat rekap kehadiran secara real-time → asisten menutup sesi.
- Praktikan login → mengajukan izin → AI mengklasifikasikan alasan → asisten memeriksa dan memberikan keputusan → praktikan melihat status pengajuannya.

Seluruh perubahan data harus tersimpan secara persisten, konsisten antar pengguna, dan hanya dapat diakses atau dimodifikasi sesuai kewenangan masing-masing peran.

## Daftar SRS

| Kode | Deskripsi | Acceptance Criteria |
| :--- | :--- | :--- |
| **SRS-01** | **Autentikasi & Manajemen Pengguna (Programmer 1)**<br>Pengembangan sistem autentikasi Firebase, manajemen profil Cloud Firestore, dan navigasi berbasis *role* (praktikan/asisten). | - Pengguna dapat melakukan registrasi, login (Firebase Auth), dan logout dengan mulus<br>- Sistem menyimpan profil dan role (`praktikan`/`asisten`) ke Cloud Firestore dengan UID unik<br>- Sesi login dipertahankan otomatis dan halaman dibatasi aksesnya sesuai peran pengguna<br>- Pesan kesalahan interaktif muncul jika proses autentikasi gagal |
| **SRS-02** | **Pengelolaan Data Praktikum & Presensi (Programmer 2)**<br>Implementasi CRUD kelas, jadwal, sesi, presensi *real-time*, dan pencegahan presensi ganda berbasis Firestore. | - Asisten dapat mengelola data kelas, peserta, jadwal, dan sesi praktikum secara lengkap<br>- Praktikan dapat melihat jadwal dan melakukan presensi saat sesi berstatus DIBUKA<br>- Sistem mencegah presensi ganda menggunakan mekanisme penulisan atomik/transaksi<br>- Rekap kehadiran dan perubahan data diperbarui secara *real-time* via Firestore listener |
| **SRS-03** | **Pengajuan Izin & Analisis Sentimen AI Lokal (Programmer 3)**<br>Pengembangan form pengajuan izin praktikan dan integrasi model analisis sentimen EDOM secara lokal (JavaScript) tanpa API eksternal, serta panel pemeriksaan oleh asisten. | - Praktikan dapat mengisi dan mengirimkan pengajuan izin dengan validasi alasan tidak kosong<br>- Sistem memuat model lokal dari `ai/model-edom.json` dan membuat classifier via `sentiment.js` satu kali di luar komponen<br>- Teks alasan izin dianalisis secara lokal (tanpa koneksi jaringan/API eksternal) dan hasilnya (`prediction.label`) ditampilkan pada layar<br>- Pengajuan beserta hasil analisis sentimen tersimpan permanen ke Firestore<br>- Asisten dapat melihat rekap alasan/analisis AI serta memberikan keputusan (Diterima/Ditolak), dan praktikan dapat memantau status keputusannya |
| **SRS-04** | **Integrasi Sistem, Keamanan & QA (Programmer 4)**<br>Penyusunan Firebase Security Rules, integrasi antar-modul, penanganan error/loading, dan pengujian akses berbasis peran. | - Firebase Security Rules aktif dan membatasi akses data secara ketat berdasarkan UID & peran<br>- Aplikasi menangani kondisi *loading*, *empty state*, koneksi internet gagal, dan unauthenticated user<br>- Pengujian konsistensi data antarperangkat dan simulasi *security rules* berjalan sukses<br>- Seluruh alur utama (presensi & izin) berhasil diintegrasikan dan didemonstrasikan tanpa kendala |
