// Model data Firestore (Sprint 2 / SRS-02).
//
// users/{uid}                      -> Profil (dibuat saat registrasi oleh modul Auth)
// kelas/{kelasId}                  -> Kelas  (pesertaUids = salinan uid peserta untuk query & rules)
// kelas/{kelasId}/peserta/{uid}    -> Peserta
// sesi/{sesiId}                    -> Sesi   (jadwal + status sesi dalam satu dokumen)
// sesi/{sesiId}/presensi/{uid}     -> Presensi (id dokumen = uid => satu presensi per praktikan per sesi)
export type Peran = 'praktikan' | 'asisten';
export type StatusSesi = 'belum_dibuka' | 'dibuka' | 'ditutup';

export type Profil = { uid: string; nama: string; nim?: string; role: Peran };
export type Kelas = { id: string; nama: string; keterangan: string; pesertaUids: string[] };
export type Peserta = { uid: string; nama: string; nim: string };

export type InputSesi = {
  kelasId: string;
  namaPraktikum: string;
  tanggal: string; // YYYY-MM-DD
  jamMulai: string; // HH:MM
  jamSelesai: string; // HH:MM
  ruang: string;
};
export type Sesi = InputSesi & { id: string; status: StatusSesi };

export type Presensi = {
  uid: string;
  nama: string;
  nim: string;
  kelasId: string;
  waktu: Date | null; // null sesaat sebelum timestamp server tiba
};
