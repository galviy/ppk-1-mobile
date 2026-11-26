import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, it } from 'node:test';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

const PROJECT_ID = 'ppk-kel2-2026';

let testEnv;

const dbAnon = () => testEnv.unauthenticatedContext().firestore();
const dbAs = (uid) => testEnv.authenticatedContext(uid).firestore();

const validPresensi = (overrides = {}) => ({
  uid: 'praktikan1',
  nama: 'Praktikan Satu',
  nim: '001',
  kelasId: 'kelasA',
  waktu: serverTimestamp(),
  laboratoriumId: 'lab1',
  latitude: -6.9,
  longitude: 107.6,
  jarakMeter: 5,
  akurasiMeter: 10,
  statusKehadiran: 'tepat_waktu',
  terlambatMenit: 0,
  gracePeriodMenit: 15,
  ...overrides,
});

const validLab = (overrides = {}) => ({
  nama: 'Lab Baru',
  kode: 'LAB2',
  deskripsi: 'Laboratorium baru',
  latitude: -6.9,
  longitude: 107.6,
  radiusMeter: 100,
  gracePeriodMenit: 15,
  nominalDenda: 10000,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

const validIzin = (overrides = {}) => ({
  uid: 'praktikan1',
  nama: 'Praktikan Satu',
  kelasId: 'kelasA',
  sesiId: 'sesi1',
  alasan: 'Sakit demam dan tidak bisa hadir',
  sentimen: { label: 'netral', status: 'predicted', source: 'model-edom', experimental: true },
  status: 'menunggu',
  diajukanPada: serverTimestamp(),
  ...overrides,
});

const validTagihan = (overrides = {}) => ({
  id: 'sesi1_praktikan1',
  uid: 'praktikan1',
  nama: 'Praktikan Satu',
  nim: '001',
  sesiId: 'sesi1',
  namaPraktikum: 'Praktikum Uji',
  tanggalSesi: '2026-11-20',
  laboratoriumId: 'lab1',
  namaLab: 'Lab Komputer',
  kelasId: 'kelasA',
  presensiUid: 'praktikan1',
  waktuPresensi: serverTimestamp(),
  terlambatMenit: 5,
  nominal: 10000,
  statusPembayaran: 'unpaid',
  lastOrderId: null,
  dibuatPada: serverTimestamp(),
  dibayarPada: null,
  updatedAt: serverTimestamp(),
  ...overrides,
});

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

after(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();

    await setDoc(doc(db, 'users', 'aslab1'), {
      uid: 'aslab1',
      email: 'aslab@example.com',
      nama: 'Aslab Satu',
      role: 'aslab',
      nip: '100',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'users', 'asprak1'), {
      uid: 'asprak1',
      email: 'asprak1@example.com',
      nama: 'Asprak Satu',
      role: 'asprak',
      nip: '200',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'users', 'asprak2'), {
      uid: 'asprak2',
      email: 'asprak2@example.com',
      nama: 'Asprak Dua',
      role: 'asprak',
      nip: '201',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'users', 'asisten1'), {
      uid: 'asisten1',
      email: 'asisten@example.com',
      nama: 'Asisten Legacy',
      role: 'asisten',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'users', 'praktikan1'), {
      uid: 'praktikan1',
      email: 'p1@example.com',
      nama: 'Praktikan Satu',
      role: 'praktikan',
      nim: '001',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'users', 'praktikan2'), {
      uid: 'praktikan2',
      email: 'p2@example.com',
      nama: 'Praktikan Dua',
      role: 'praktikan',
      nim: '002',
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    await setDoc(doc(db, 'laboratorium', 'lab1'), {
      nama: 'Lab Komputer',
      kode: 'LAB1',
      deskripsi: 'Laboratorium uji',
      latitude: -6.9,
      longitude: 107.6,
      radiusMeter: 100,
      gracePeriodMenit: 15,
      nominalDenda: 10000,
      aslabUid: 'aslab1',
      asprakUids: ['asprak1', 'asisten1'],
      praktikanUids: ['praktikan1'],
      updatedAt: new Date(),
    });
    await setDoc(doc(db, 'laboratorium', 'lab2'), {
      nama: 'Lab Jaringan',
      kode: 'LAB2',
      deskripsi: 'Laboratorium kedua',
      latitude: -6.91,
      longitude: 107.61,
      radiusMeter: 100,
      gracePeriodMenit: 10,
      nominalDenda: 5000,
      aslabUid: 'aslab1',
      asprakUids: ['asprak2'],
      praktikanUids: ['praktikan2'],
      updatedAt: new Date(),
    });

    await setDoc(doc(db, 'kelas', 'kelasA'), {
      nama: 'Kelas A',
      keterangan: 'Kelas uji',
      laboratoriumId: 'lab1',
      asprakUids: ['asprak1', 'asisten1'],
      pesertaUids: ['praktikan1'],
    });
    await setDoc(doc(db, 'kelas', 'kelasB'), {
      nama: 'Kelas B',
      keterangan: 'Kelas uji dua',
      laboratoriumId: 'lab2',
      asprakUids: ['asprak2'],
      pesertaUids: ['praktikan2'],
    });

    await setDoc(doc(db, 'sesi', 'sesi1'), {
      kelasId: 'kelasA',
      laboratoriumId: 'lab1',
      namaPraktikum: 'Praktikum Uji',
      tanggal: '2026-11-20',
      jamMulai: '08:00',
      jamSelesai: '10:00',
      ruang: 'Lab Komputer',
      status: 'dibuka',
      gracePeriodMenit: 15,
      nominalDenda: 10000,
    });
    await setDoc(doc(db, 'sesi', 'sesi2'), {
      kelasId: 'kelasB',
      laboratoriumId: 'lab2',
      namaPraktikum: 'Praktikum Dua',
      tanggal: '2026-11-21',
      jamMulai: '08:00',
      jamSelesai: '10:00',
      ruang: 'Lab Jaringan',
      status: 'dibuka',
      gracePeriodMenit: 10,
      nominalDenda: 5000,
    });
    await setDoc(doc(db, 'sesi', 'sesiTutup'), {
      kelasId: 'kelasA',
      laboratoriumId: 'lab1',
      namaPraktikum: 'Praktikum Tutup',
      tanggal: '2026-11-21',
      jamMulai: '08:00',
      jamSelesai: '10:00',
      ruang: 'Lab Komputer',
      status: 'ditutup',
      gracePeriodMenit: 15,
      nominalDenda: 10000,
    });
    await setDoc(doc(db, 'sesi', 'sesiLama'), {
      kelasId: 'kelasA',
      namaPraktikum: 'Praktikum Lama',
      tanggal: '2026-11-22',
      jamMulai: '08:00',
      jamSelesai: '10:00',
      ruang: 'Lab Lama',
      status: 'dibuka',
    });

    await setDoc(doc(db, 'transaksi', 'ORD-1'), {
      orderId: 'ORD-1',
      tagihanId: 'sesi1_praktikan1',
      uid: 'praktikan1',
      status: 'pending',
    });
  });
});

describe('FR-S4-04.10 akses tanpa login', () => {
  it('menolak membaca kelas dan profil tanpa sesi login', async () => {
    await assertFails(getDoc(doc(dbAnon(), 'kelas', 'kelasA')));
    await assertFails(getDoc(doc(dbAnon(), 'users', 'praktikan1')));
    await assertFails(getDoc(doc(dbAnon(), 'laboratorium', 'lab1')));
  });
});

describe('FR-S4-04.10 RBAC 3 peran pada users', () => {
  it('praktikan hanya membaca profilnya sendiri', async () => {
    await assertSucceeds(getDoc(doc(dbAs('praktikan1'), 'users', 'praktikan1')));
    await assertFails(getDoc(doc(dbAs('praktikan1'), 'users', 'praktikan2')));
  });

  it('aslab dan asprak dapat membaca profil praktikan', async () => {
    await assertSucceeds(getDoc(doc(dbAs('aslab1'), 'users', 'praktikan1')));
    await assertSucceeds(getDoc(doc(dbAs('asprak1'), 'users', 'praktikan1')));
    await assertSucceeds(getDoc(doc(dbAs('asisten1'), 'users', 'praktikan1')));
  });

  it('registrasi mandiri hanya boleh sebagai praktikan', async () => {
    await assertSucceeds(
      setDoc(doc(dbAs('baru1'), 'users', 'baru1'), {
        uid: 'baru1',
        nama: 'Baru',
        role: 'praktikan',
      }),
    );
    await assertFails(
      setDoc(doc(dbAs('baru2'), 'users', 'baru2'), {
        uid: 'baru2',
        nama: 'Baru Dua',
        role: 'aslab',
      }),
    );
    await assertFails(
      setDoc(doc(dbAs('baru3'), 'users', 'baru3'), {
        uid: 'baru3',
        nama: 'Baru Tiga',
        role: 'asprak',
      }),
    );
  });

  it('pengguna tidak dapat mengubah perannya sendiri', async () => {
    await assertFails(updateDoc(doc(dbAs('praktikan1'), 'users', 'praktikan1'), { role: 'asprak' }));
  });

  it('hanya aslab yang dapat menugaskan peran', async () => {
    await assertSucceeds(updateDoc(doc(dbAs('aslab1'), 'users', 'praktikan2'), { role: 'asprak' }));
    await assertFails(updateDoc(doc(dbAs('asprak1'), 'users', 'praktikan2'), { role: 'asprak' }));
    await assertFails(updateDoc(doc(dbAs('praktikan1'), 'users', 'praktikan2'), { role: 'aslab' }));
  });

  it('token push divalidasi dan tidak boleh mengubah peran', async () => {
    await assertSucceeds(
      updateDoc(doc(dbAs('praktikan1'), 'users', 'praktikan1'), {
        expoPushToken: 'ExponentPushToken[abc_DEF-123]',
        pushTokenUpdatedAt: '2026-11-19T00:00:00.000Z',
      }),
    );
    await assertSucceeds(
      updateDoc(doc(dbAs('praktikan1'), 'users', 'praktikan1'), { expoPushToken: null }),
    );
    await assertFails(
      updateDoc(doc(dbAs('praktikan1'), 'users', 'praktikan1'), { expoPushToken: 'bukan-token' }),
    );
    await assertFails(
      updateDoc(doc(dbAs('praktikan1'), 'users', 'praktikan1'), {
        role: 'asprak',
        expoPushToken: 'ExponentPushToken[abc]',
      }),
    );
  });
});

describe('FR-S4-04.10 laboratorium hanya Aslab', () => {
  it('aslab dapat menambah, mengubah, dan menghapus laboratorium', async () => {
    const db = dbAs('aslab1');
    await assertSucceeds(setDoc(doc(db, 'laboratorium', 'lab3'), validLab()));
    await assertSucceeds(updateDoc(doc(db, 'laboratorium', 'lab3'), { radiusMeter: 150 }));
    await assertSucceeds(deleteDoc(doc(db, 'laboratorium', 'lab3')));
  });

  it('asprak dan praktikan tidak dapat menulis laboratorium', async () => {
    for (const uid of ['asprak1', 'asisten1', 'praktikan1']) {
      const db = dbAs(uid);
      await assertFails(setDoc(doc(db, 'laboratorium', 'labX'), validLab()));
      await assertFails(updateDoc(doc(db, 'laboratorium', 'lab1'), { radiusMeter: 150 }));
      await assertFails(deleteDoc(doc(db, 'laboratorium', 'lab1')));
    }
  });

  it('menolak koordinat, radius, grace period, dan denda di luar rentang', async () => {
    const db = dbAs('aslab1');
    await assertFails(setDoc(doc(db, 'laboratorium', 'lab3'), validLab({ latitude: -91 })));
    await assertFails(setDoc(doc(db, 'laboratorium', 'lab4'), validLab({ longitude: 181 })));
    await assertFails(setDoc(doc(db, 'laboratorium', 'lab5'), validLab({ radiusMeter: 9 })));
    await assertFails(setDoc(doc(db, 'laboratorium', 'lab6'), validLab({ radiusMeter: 501 })));
    await assertFails(setDoc(doc(db, 'laboratorium', 'lab7'), validLab({ gracePeriodMenit: 121 })));
    await assertFails(setDoc(doc(db, 'laboratorium', 'lab8'), validLab({ nominalDenda: -1 })));
  });
});

describe('FR-S4-04.10 kelas dan distribusi hanya Aslab', () => {
  it('aslab dapat menulis kelas, asprak dan praktikan tidak', async () => {
    await assertSucceeds(
      setDoc(doc(dbAs('aslab1'), 'kelas', 'kelasC'), {
        nama: 'Kelas C',
        keterangan: '',
        pesertaUids: [],
        asprakUids: [],
      }),
    );
    await assertSucceeds(
      updateDoc(doc(dbAs('aslab1'), 'kelas', 'kelasA'), { keterangan: 'Baru' }),
    );
    await assertFails(
      updateDoc(doc(dbAs('asprak1'), 'kelas', 'kelasA'), { keterangan: 'Baru' }),
    );
    await assertFails(
      updateDoc(doc(dbAs('praktikan1'), 'kelas', 'kelasA'), { keterangan: 'Baru' }),
    );
    await assertFails(
      setDoc(doc(dbAs('asprak1'), 'kelas', 'kelasC'), {
        nama: 'Kelas C',
        keterangan: '',
        pesertaUids: [],
      }),
    );
  });

  it('praktikan hanya membaca kelas yang diikuti', async () => {
    await assertSucceeds(getDoc(doc(dbAs('praktikan1'), 'kelas', 'kelasA')));
    await assertFails(getDoc(doc(dbAs('praktikan2'), 'kelas', 'kelasA')));
  });

  it('asprak hanya membaca kelas yang ditugaskan', async () => {
    await assertSucceeds(getDoc(doc(dbAs('asprak1'), 'kelas', 'kelasA')));
    await assertSucceeds(getDoc(doc(dbAs('asisten1'), 'kelas', 'kelasA')));
    await assertFails(getDoc(doc(dbAs('asprak2'), 'kelas', 'kelasA')));
    await assertSucceeds(getDoc(doc(dbAs('asprak2'), 'kelas', 'kelasB')));
  });

  it('hanya aslab yang dapat menambah dan menghapus peserta', async () => {
    await assertSucceeds(
      setDoc(doc(dbAs('aslab1'), 'kelas', 'kelasA', 'peserta', 'praktikan2'), {
        nama: 'Praktikan Dua',
        nim: '002',
      }),
    );
    await assertFails(
      setDoc(doc(dbAs('asprak1'), 'kelas', 'kelasA', 'peserta', 'praktikan2'), {
        nama: 'Praktikan Dua',
        nim: '002',
      }),
    );
  });
});

describe('FR-S4-04.10 sesi dibatasi kelas/lab Asprak', () => {
  it('aslab dan asprak penanggung jawab dapat mengubah sesi', async () => {
    await assertSucceeds(
      updateDoc(doc(dbAs('aslab1'), 'sesi', 'sesi1'), { status: 'ditutup' }),
    );
    await assertSucceeds(
      updateDoc(doc(dbAs('asprak1'), 'sesi', 'sesi1'), { status: 'ditutup' }),
    );
    await assertSucceeds(
      updateDoc(doc(dbAs('asisten1'), 'sesi', 'sesi1'), { status: 'ditutup' }),
    );
  });

  it('asprak lain dan praktikan tidak dapat mengubah sesi', async () => {
    await assertFails(updateDoc(doc(dbAs('asprak2'), 'sesi', 'sesi1'), { status: 'ditutup' }));
    await assertFails(updateDoc(doc(dbAs('asprak1'), 'sesi', 'sesi2'), { status: 'ditutup' }));
    await assertFails(updateDoc(doc(dbAs('praktikan1'), 'sesi', 'sesi1'), { status: 'ditutup' }));
  });

  it('praktikan tidak dapat membuat sesi', async () => {
    await assertFails(
      setDoc(doc(dbAs('praktikan1'), 'sesi', 'sesiBaru'), {
        kelasId: 'kelasA',
        laboratoriumId: 'lab1',
        namaPraktikum: 'X',
        tanggal: '2026-11-22',
        jamMulai: '08:00',
        jamSelesai: '10:00',
        ruang: 'Lab',
        status: 'dibuka',
      }),
    );
  });

  it('asprak penanggung jawab dapat membuat sesi di kelasnya', async () => {
    await assertSucceeds(
      setDoc(doc(dbAs('asprak1'), 'sesi', 'sesiBaru'), {
        kelasId: 'kelasA',
        laboratoriumId: 'lab1',
        namaPraktikum: 'Sesi Baru',
        tanggal: '2026-11-22',
        jamMulai: '08:00',
        jamSelesai: '10:00',
        ruang: 'Lab Komputer',
        status: 'belum_dibuka',
      }),
    );
  });

  it('praktikan hanya membaca sesi kelasnya', async () => {
    await assertSucceeds(getDoc(doc(dbAs('praktikan1'), 'sesi', 'sesi1')));
    await assertFails(getDoc(doc(dbAs('praktikan2'), 'sesi', 'sesi1')));
  });
});

describe('FR-S4-04.11 presensi + grace period + anti-tamper', () => {
  it('presensi tepat waktu di dalam radius diterima', async () => {
    await assertSucceeds(
      setDoc(doc(dbAs('praktikan1'), 'sesi', 'sesi1', 'presensi', 'praktikan1'), validPresensi()),
    );
  });

  it('presensi terlambat di dalam radius diterima', async () => {
    await assertSucceeds(
      setDoc(
        doc(dbAs('praktikan1'), 'sesi', 'sesi1', 'presensi', 'praktikan1'),
        validPresensi({ statusKehadiran: 'terlambat', terlambatMenit: 5 }),
      ),
    );
  });

  it('presensi ganda ditolak karena immutabel', async () => {
    const db = dbAs('praktikan1');
    await assertSucceeds(setDoc(doc(db, 'sesi', 'sesi1', 'presensi', 'praktikan1'), validPresensi()));
    await assertFails(
      updateDoc(doc(db, 'sesi', 'sesi1', 'presensi', 'praktikan1'), { nama: 'Diubah' }),
    );
  });

  it('presensi pada sesi ditutup dan sesi lama tanpa lab ditolak', async () => {
    await assertFails(
      setDoc(doc(dbAs('praktikan1'), 'sesi', 'sesiTutup', 'presensi', 'praktikan1'), validPresensi()),
    );
    await assertFails(
      setDoc(doc(dbAs('praktikan1'), 'sesi', 'sesiLama', 'presensi', 'praktikan1'), validPresensi()),
    );
  });

  it('bukan peserta kelas tidak dapat presensi', async () => {
    await assertFails(
      setDoc(
        doc(dbAs('praktikan2'), 'sesi', 'sesi1', 'presensi', 'praktikan2'),
        validPresensi({ uid: 'praktikan2', nama: 'Praktikan Dua', nim: '002' }),
      ),
    );
  });

  it('menolak lokasi di luar radius, koordinat tidak valid, akurasi buruk, dan lab salah', async () => {
    const db = dbAs('praktikan1');
    await assertFails(
      setDoc(
        doc(db, 'sesi', 'sesi1', 'presensi', 'praktikan1'),
        validPresensi({ latitude: -6.91, longitude: 107.61, jarakMeter: 1500 }),
      ),
    );
    await assertFails(
      setDoc(doc(db, 'sesi', 'sesi1', 'presensi', 'praktikan1'), validPresensi({ latitude: -91 })),
    );
    await assertFails(
      setDoc(doc(db, 'sesi', 'sesi1', 'presensi', 'praktikan1'), validPresensi({ akurasiMeter: 101 })),
    );
    await assertFails(
      setDoc(
        doc(db, 'sesi', 'sesi1', 'presensi', 'praktikan1'),
        validPresensi({ laboratoriumId: 'lab2' }),
      ),
    );
  });

  it('menolak status kehadiran yang tidak konsisten dengan terlambatMenit', async () => {
    await assertFails(
      setDoc(
        doc(dbAs('praktikan1'), 'sesi', 'sesi1', 'presensi', 'praktikan1'),
        validPresensi({ statusKehadiran: 'tepat_waktu', terlambatMenit: 5 }),
      ),
    );
    await assertFails(
      setDoc(
        doc(dbAs('praktikan1'), 'sesi', 'sesi1', 'presensi', 'praktikan1'),
        validPresensi({ statusKehadiran: 'terlambat', terlambatMenit: 0 }),
      ),
    );
  });

  it('menolak presensi tanpa data lokasi lengkap', async () => {
    await assertFails(
      setDoc(doc(dbAs('praktikan1'), 'sesi', 'sesi1', 'presensi', 'praktikan1'), {
        uid: 'praktikan1',
        nama: 'Praktikan Satu',
        nim: '001',
        kelasId: 'kelasA',
        waktu: serverTimestamp(),
        laboratoriumId: 'lab1',
        latitude: -6.9,
        longitude: 107.6,
      }),
    );
  });

  it('presensi diblokir bila izin sudah diterima (excused absence)', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'izin', 'sesi1_praktikan1'), {
        ...validIzin(),
        status: 'diterima',
        excusedAbsence: true,
        bebasDenda: true,
        diajukanPada: new Date(),
      });
    });
    await assertFails(
      setDoc(doc(dbAs('praktikan1'), 'sesi', 'sesi1', 'presensi', 'praktikan1'), validPresensi()),
    );
  });

  it('praktikan hanya membaca presensinya sendiri', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(
        doc(ctx.firestore(), 'sesi', 'sesi1', 'presensi', 'praktikan1'),
        { ...validPresensi(), waktu: new Date() },
      );
    });
    await assertSucceeds(getDoc(doc(dbAs('praktikan1'), 'sesi', 'sesi1', 'presensi', 'praktikan1')));
    await assertFails(getDoc(doc(dbAs('praktikan1'), 'sesi', 'sesi1', 'presensi', 'praktikan2')));
    await assertSucceeds(getDoc(doc(dbAs('asprak1'), 'sesi', 'sesi1', 'presensi', 'praktikan1')));
    await assertFails(getDoc(doc(dbAs('asprak2'), 'sesi', 'sesi1', 'presensi', 'praktikan1')));
  });
});

describe('FR-S4-04.11 izin dan excused absence', () => {
  it('praktikan peserta dapat mengajukan izin', async () => {
    await assertSucceeds(
      setDoc(doc(dbAs('praktikan1'), 'izin', 'sesi1_praktikan1'), validIzin()),
    );
  });

  it('praktikan tidak dapat mengajukan izin untuk identitas lain atau status final', async () => {
    await assertFails(
      setDoc(
        doc(dbAs('praktikan1'), 'izin', 'sesi1_praktikan2'),
        validIzin({ uid: 'praktikan2', nama: 'Praktikan Dua' }),
      ),
    );
    await assertFails(
      setDoc(
        doc(dbAs('praktikan1'), 'izin', 'sesi1_praktikan1'),
        validIzin({ status: 'diterima' }),
      ),
    );
  });

  it('asprak penanggung jawab dapat menerima izin sebagai excused absence', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'izin', 'sesi1_praktikan1'), {
        ...validIzin(),
        diajukanPada: new Date(),
      });
    });
    await assertSucceeds(
      updateDoc(doc(dbAs('asprak1'), 'izin', 'sesi1_praktikan1'), {
        status: 'diterima',
        excusedAbsence: true,
        bebasDenda: true,
        diputuskanOleh: 'asprak1',
        diputuskanPada: serverTimestamp(),
      }),
    );
  });

  it('keputusan tanpa field excused/bebasDenda ditolak', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'izin', 'sesi1_praktikan1'), {
        ...validIzin(),
        diajukanPada: new Date(),
      });
    });
    await assertFails(
      updateDoc(doc(dbAs('asprak1'), 'izin', 'sesi1_praktikan1'), {
        status: 'diterima',
        diputuskanOleh: 'asprak1',
        diputuskanPada: serverTimestamp(),
      }),
    );
  });

  it('asprak di luar kelas tidak dapat memutuskan izin', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'izin', 'sesi1_praktikan1'), {
        ...validIzin(),
        diajukanPada: new Date(),
      });
    });
    await assertFails(
      updateDoc(doc(dbAs('asprak2'), 'izin', 'sesi1_praktikan1'), {
        status: 'ditolak',
        excusedAbsence: false,
        bebasDenda: false,
        diputuskanOleh: 'asprak2',
        diputuskanPada: serverTimestamp(),
      }),
    );
  });

  it('praktikan tidak dapat mengubah alasan maupun keputusan', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'izin', 'sesi1_praktikan1'), {
        ...validIzin(),
        diajukanPada: new Date(),
      });
    });
    await assertFails(
      updateDoc(doc(dbAs('praktikan1'), 'izin', 'sesi1_praktikan1'), { alasan: 'Alasan baru' }),
    );
    await assertFails(deleteDoc(doc(dbAs('praktikan1'), 'izin', 'sesi1_praktikan1')));
  });

  it('izin hanya dibaca pemilik, asprak penanggung jawab, dan aslab', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'izin', 'sesi1_praktikan1'), {
        ...validIzin(),
        diajukanPada: new Date(),
      });
    });
    await assertSucceeds(getDoc(doc(dbAs('praktikan1'), 'izin', 'sesi1_praktikan1')));
    await assertFails(getDoc(doc(dbAs('praktikan2'), 'izin', 'sesi1_praktikan1')));
    await assertSucceeds(getDoc(doc(dbAs('asprak1'), 'izin', 'sesi1_praktikan1')));
    await assertFails(getDoc(doc(dbAs('asprak2'), 'izin', 'sesi1_praktikan1')));
    await assertSucceeds(getDoc(doc(dbAs('aslab1'), 'izin', 'sesi1_praktikan1')));
  });
});

describe('FR-S4-04.11 tagihan denda anti-tamper', () => {
  it('praktikan dapat membuat tagihan unpaid miliknya dengan ID dan nominal benar', async () => {
    await assertSucceeds(
      setDoc(doc(dbAs('praktikan1'), 'tagihan', 'sesi1_praktikan1'), validTagihan()),
    );
  });

  it('menolak ID tagihan salah, nominal tidak cocok, status success, dan uid lain', async () => {
    const db = dbAs('praktikan1');
    await assertFails(
      setDoc(doc(db, 'tagihan', 'bebas'), validTagihan({ id: 'bebas' })),
    );
    await assertFails(
      setDoc(doc(db, 'tagihan', 'sesi1_praktikan1'), validTagihan({ nominal: 1 })),
    );
    await assertFails(
      setDoc(
        doc(db, 'tagihan', 'sesi1_praktikan1'),
        validTagihan({ statusPembayaran: 'success' }),
      ),
    );
    await assertFails(
      setDoc(
        doc(db, 'tagihan', 'sesi1_praktikan1'),
        validTagihan({ uid: 'praktikan2', presensiUid: 'praktikan2' }),
      ),
    );
  });

  it('klien tidak dapat mengubah status pembayaran atau menghapus tagihan', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(
        doc(ctx.firestore(), 'tagihan', 'sesi1_praktikan1'),
        { ...validTagihan(), dibuatPada: new Date(), updatedAt: new Date(), waktuPresensi: new Date() },
      );
    });
    const db = dbAs('praktikan1');
    await assertFails(
      updateDoc(doc(db, 'tagihan', 'sesi1_praktikan1'), { statusPembayaran: 'success' }),
    );
    await assertFails(deleteDoc(doc(db, 'tagihan', 'sesi1_praktikan1')));
  });

  it('tagihan hanya dibaca pemilik, aslab, dan asprak penanggung jawab', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(
        doc(ctx.firestore(), 'tagihan', 'sesi1_praktikan1'),
        { ...validTagihan(), dibuatPada: new Date(), updatedAt: new Date(), waktuPresensi: new Date() },
      );
    });
    await assertSucceeds(getDoc(doc(dbAs('praktikan1'), 'tagihan', 'sesi1_praktikan1')));
    await assertFails(getDoc(doc(dbAs('praktikan2'), 'tagihan', 'sesi1_praktikan1')));
    await assertSucceeds(getDoc(doc(dbAs('aslab1'), 'tagihan', 'sesi1_praktikan1')));
    await assertSucceeds(getDoc(doc(dbAs('asprak1'), 'tagihan', 'sesi1_praktikan1')));
    await assertFails(getDoc(doc(dbAs('asprak2'), 'tagihan', 'sesi1_praktikan1')));
  });
});

describe('FR-S4-04.11 transaksi pembayaran hanya backend', () => {
  it('klien tidak dapat menulis transaksi', async () => {
    await assertFails(
      setDoc(doc(dbAs('praktikan1'), 'transaksi', 'ORD-2'), {
        orderId: 'ORD-2',
        tagihanId: 'sesi1_praktikan1',
        uid: 'praktikan1',
        status: 'success',
      }),
    );
    await assertFails(
      updateDoc(doc(dbAs('praktikan1'), 'transaksi', 'ORD-1'), { status: 'success' }),
    );
  });

  it('transaksi hanya dibaca pemilik dan aslab', async () => {
    await assertSucceeds(getDoc(doc(dbAs('praktikan1'), 'transaksi', 'ORD-1')));
    await assertFails(getDoc(doc(dbAs('praktikan2'), 'transaksi', 'ORD-1')));
    await assertSucceeds(getDoc(doc(dbAs('aslab1'), 'transaksi', 'ORD-1')));
  });
});
