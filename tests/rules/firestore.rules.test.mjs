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
    await setDoc(doc(db, 'users', 'asisten1'), {
      uid: 'asisten1',
      email: 'asisten@example.com',
      nama: 'Asisten Satu',
      role: 'asisten',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'users', 'praktikan1'), {
      uid: 'praktikan1',
      email: 'p1@example.com',
      nama: 'Praktikan Satu',
      role: 'praktikan',
      nim: '001',
      kelas: 'A',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'users', 'praktikan2'), {
      uid: 'praktikan2',
      email: 'p2@example.com',
      nama: 'Praktikan Dua',
      role: 'praktikan',
      nim: '002',
      kelas: 'A',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    await setDoc(doc(db, 'kelas', 'kelasA'), {
      nama: 'Kelas A',
      keterangan: 'Kelas uji',
      pesertaUids: ['praktikan1'],
    });
    await setDoc(doc(db, 'sesi', 'sesi1'), {
      kelasId: 'kelasA',
      namaPraktikum: 'Praktikum Uji',
      tanggal: '2026-11-20',
      jamMulai: '08:00',
      jamSelesai: '10:00',
      ruang: 'Lab',
      status: 'dibuka',
    });
    await setDoc(doc(db, 'sesi', 'sesiTutup'), {
      kelasId: 'kelasA',
      namaPraktikum: 'Praktikum Tutup',
      tanggal: '2026-11-21',
      jamMulai: '08:00',
      jamSelesai: '10:00',
      ruang: 'Lab',
      status: 'ditutup',
    });
  });
});

describe('FR-04.3 akses tanpa login', () => {
  it('menolak membaca kelas tanpa sesi login', async () => {
    await assertFails(getDoc(doc(dbAnon(), 'kelas', 'kelasA')));
  });

  it('menolak membaca profil tanpa sesi login', async () => {
    await assertFails(getDoc(doc(dbAnon(), 'users', 'praktikan1')));
  });
});

describe('FR-04.3 / FR-04.4 profil dan peran', () => {
  it('praktikan hanya dapat membaca profilnya sendiri', async () => {
    await assertSucceeds(getDoc(doc(dbAs('praktikan1'), 'users', 'praktikan1')));
    await assertFails(getDoc(doc(dbAs('praktikan1'), 'users', 'praktikan2')));
  });

  it('asisten dapat membaca profil praktikan', async () => {
    await assertSucceeds(getDoc(doc(dbAs('asisten1'), 'users', 'praktikan1')));
  });

  it('registrasi mandiri sebagai asisten ditolak', async () => {
    await assertFails(
      setDoc(doc(dbAs('baru1'), 'users', 'baru1'), {
        uid: 'baru1',
        email: 'baru@example.com',
        nama: 'Baru',
        role: 'asisten',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
    );
  });

  it('registrasi mandiri sebagai praktikan diterima', async () => {
    await assertSucceeds(
      setDoc(doc(dbAs('baru2'), 'users', 'baru2'), {
        uid: 'baru2',
        email: 'baru2@example.com',
        nama: 'Baru Dua',
        role: 'praktikan',
        nim: '003',
        kelas: 'A',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
    );
  });

  it('praktikan tidak dapat mengubah perannya sendiri', async () => {
    await assertFails(updateDoc(doc(dbAs('praktikan1'), 'users', 'praktikan1'), { role: 'asisten' }));
  });

  it('asisten dapat mempromosikan praktikan menjadi asisten', async () => {
    await assertSucceeds(updateDoc(doc(dbAs('asisten1'), 'users', 'praktikan2'), { role: 'asisten' }));
  });
});

describe('FR-04.4 pengelolaan data praktikum hanya asisten', () => {
  it('asisten dapat membuat kelas', async () => {
    await assertSucceeds(
      setDoc(doc(dbAs('asisten1'), 'kelas', 'kelasB'), {
        nama: 'Kelas B',
        keterangan: '',
        pesertaUids: [],
      }),
    );
  });

  it('praktikan tidak dapat membuat kelas', async () => {
    await assertFails(
      setDoc(doc(dbAs('praktikan1'), 'kelas', 'kelasB'), {
        nama: 'Kelas B',
        keterangan: '',
        pesertaUids: [],
      }),
    );
  });

  it('praktikan tidak dapat membuat sesi', async () => {
    await assertFails(
      setDoc(doc(dbAs('praktikan1'), 'sesi', 'sesiBaru'), {
        kelasId: 'kelasA',
        namaPraktikum: 'X',
        tanggal: '2026-11-22',
        jamMulai: '08:00',
        jamSelesai: '10:00',
        ruang: 'Lab',
        status: 'dibuka',
      }),
    );
  });
});

describe('FR-04.5 akses praktikan sesuai identitas', () => {
  it('peserta kelas dapat membaca kelas dan sesinya', async () => {
    await assertSucceeds(getDoc(doc(dbAs('praktikan1'), 'kelas', 'kelasA')));
    await assertSucceeds(getDoc(doc(dbAs('praktikan1'), 'sesi', 'sesi1')));
  });

  it('praktikan di luar kelas tidak dapat membaca kelas dan sesinya', async () => {
    await assertFails(getDoc(doc(dbAs('praktikan2'), 'kelas', 'kelasA')));
    await assertFails(getDoc(doc(dbAs('praktikan2'), 'sesi', 'sesi1')));
  });

  it('praktikan hanya membaca presensinya sendiri', async () => {
    await assertSucceeds(getDoc(doc(dbAs('praktikan1'), 'sesi', 'sesi1', 'presensi', 'praktikan1')));
    await assertFails(getDoc(doc(dbAs('praktikan1'), 'sesi', 'sesi1', 'presensi', 'praktikan2')));
  });
});

describe('FR-04.14 alur presensi', () => {
  it('praktikan dapat presensi pada sesi yang dibuka', async () => {
    await assertSucceeds(
      setDoc(doc(dbAs('praktikan1'), 'sesi', 'sesi1', 'presensi', 'praktikan1'), {
        uid: 'praktikan1',
        nama: 'Praktikan Satu',
        nim: '001',
        kelasId: 'kelasA',
        waktu: serverTimestamp(),
      }),
    );
  });

  it('presensi ganda ditolak karena update tidak diizinkan', async () => {
    const db = dbAs('praktikan1');
    await assertSucceeds(
      setDoc(doc(db, 'sesi', 'sesi1', 'presensi', 'praktikan1'), {
        uid: 'praktikan1',
        nama: 'Praktikan Satu',
        nim: '001',
        kelasId: 'kelasA',
        waktu: serverTimestamp(),
      }),
    );
    await assertFails(
      updateDoc(doc(db, 'sesi', 'sesi1', 'presensi', 'praktikan1'), { nama: 'Diubah' }),
    );
  });

  it('presensi pada sesi ditutup ditolak', async () => {
    await assertFails(
      setDoc(doc(dbAs('praktikan1'), 'sesi', 'sesiTutup', 'presensi', 'praktikan1'), {
        uid: 'praktikan1',
        nama: 'Praktikan Satu',
        nim: '001',
        kelasId: 'kelasA',
        waktu: serverTimestamp(),
      }),
    );
  });

  it('bukan peserta kelas tidak dapat presensi', async () => {
    await assertFails(
      setDoc(doc(dbAs('praktikan2'), 'sesi', 'sesi1', 'presensi', 'praktikan2'), {
        uid: 'praktikan2',
        nama: 'Praktikan Dua',
        nim: '002',
        kelasId: 'kelasA',
        waktu: serverTimestamp(),
      }),
    );
  });
});

describe('FR-04.6 / FR-04.7 alur izin dan keputusan asisten', () => {
  it('praktikan peserta dapat mengajukan izin', async () => {
    await assertSucceeds(
      setDoc(doc(dbAs('praktikan1'), 'izin', 'sesi1_praktikan1'), validIzin()),
    );
  });

  it('praktikan tidak dapat mengajukan izin untuk identitas lain', async () => {
    await assertFails(
      setDoc(
        doc(dbAs('praktikan1'), 'izin', 'sesi1_praktikan2'),
        validIzin({ uid: 'praktikan2', nama: 'Praktikan Dua' }),
      ),
    );
  });

  it('praktikan tidak dapat mengajukan status selain menunggu', async () => {
    await assertFails(
      setDoc(doc(dbAs('praktikan1'), 'izin', 'sesi1_praktikan1'), validIzin({ status: 'diterima' })),
    );
  });

  it('praktikan tidak dapat mengubah hasil AI atau keputusan', async () => {
    const db = dbAs('praktikan1');
    await assertSucceeds(setDoc(doc(db, 'izin', 'sesi1_praktikan1'), validIzin()));
    await assertFails(
      updateDoc(doc(db, 'izin', 'sesi1_praktikan1'), {
        sentimen: { label: 'positif', status: 'predicted', source: 'model-edom', experimental: true },
      }),
    );
  });

  it('asisten dapat menerima izin dan mengubah hanya field keputusan', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'izin', 'sesi1_praktikan1'), {
        ...validIzin(),
        diajukanPada: new Date(),
      });
    });
    await assertSucceeds(
      updateDoc(doc(dbAs('asisten1'), 'izin', 'sesi1_praktikan1'), {
        status: 'diterima',
        diputuskanOleh: 'asisten1',
        diputuskanPada: serverTimestamp(),
      }),
    );
  });

  it('asisten tidak dapat mengubah alasan atau hasil AI', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'izin', 'sesi1_praktikan1'), {
        ...validIzin(),
        diajukanPada: new Date(),
      });
    });
    await assertFails(
      updateDoc(doc(dbAs('asisten1'), 'izin', 'sesi1_praktikan1'), { alasan: 'Alasan baru' }),
    );
  });

  it('praktikan hanya membaca izin miliknya, asisten membaca semua', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'izin', 'sesi1_praktikan1'), {
        ...validIzin(),
        diajukanPada: new Date(),
      });
    });
    await assertSucceeds(getDoc(doc(dbAs('praktikan1'), 'izin', 'sesi1_praktikan1')));
    await assertFails(getDoc(doc(dbAs('praktikan2'), 'izin', 'sesi1_praktikan1')));
    await assertSucceeds(getDoc(doc(dbAs('asisten1'), 'izin', 'sesi1_praktikan1')));
    await assertSucceeds(
      getDocs(query(collection(dbAs('praktikan1'), 'izin'), where('uid', '==', 'praktikan1'))),
    );
  });

  it('praktikan tidak dapat menghapus izin', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'izin', 'sesi1_praktikan1'), {
        ...validIzin(),
        diajukanPada: new Date(),
      });
    });
    await assertFails(deleteDoc(doc(dbAs('praktikan1'), 'izin', 'sesi1_praktikan1')));
  });
});

describe('FR-04.17 operasi CRUD Firestore', () => {
  it('asisten dapat mengubah dan menghapus kelas', async () => {
    await assertSucceeds(updateDoc(doc(dbAs('asisten1'), 'kelas', 'kelasA'), { keterangan: 'Baru' }));
    await assertSucceeds(deleteDoc(doc(dbAs('asisten1'), 'kelas', 'kelasA')));
  });

  it('praktikan tidak dapat mengubah atau menghapus kelas', async () => {
    await assertFails(updateDoc(doc(dbAs('praktikan1'), 'kelas', 'kelasA'), { keterangan: 'Baru' }));
    await assertFails(deleteDoc(doc(dbAs('praktikan1'), 'kelas', 'kelasA')));
  });

  it('asisten dapat menambah dan menghapus peserta kelas', async () => {
    const db = dbAs('asisten1');
    await assertSucceeds(
      setDoc(doc(db, 'kelas', 'kelasA', 'peserta', 'praktikan2'), {
        nama: 'Praktikan Dua',
        nim: '002',
      }),
    );
    await assertSucceeds(deleteDoc(doc(db, 'kelas', 'kelasA', 'peserta', 'praktikan2')));
  });

  it('asisten dapat mengubah status sesi, praktikan tidak', async () => {
    await assertSucceeds(updateDoc(doc(dbAs('asisten1'), 'sesi', 'sesi1'), { status: 'ditutup' }));
    await assertFails(updateDoc(doc(dbAs('praktikan1'), 'sesi', 'sesi1'), { status: 'ditutup' }));
  });

  it('asisten dapat membuat dan menghapus sesi', async () => {
    const db = dbAs('asisten1');
    await assertSucceeds(
      setDoc(doc(db, 'sesi', 'sesiBaru'), {
        kelasId: 'kelasA',
        namaPraktikum: 'Praktikum Baru',
        tanggal: '2026-11-22',
        jamMulai: '08:00',
        jamSelesai: '10:00',
        ruang: 'Lab',
        status: 'belum_dibuka',
      }),
    );
    await assertSucceeds(deleteDoc(doc(db, 'sesi', 'sesiBaru')));
  });

  it('praktikan dapat mengubah profilnya sendiri selain peran', async () => {
    await assertSucceeds(
      updateDoc(doc(dbAs('praktikan1'), 'users', 'praktikan1'), { nama: 'Nama Baru' }),
    );
  });

  it('praktikan tidak dapat menghapus profil pengguna', async () => {
    await assertFails(deleteDoc(doc(dbAs('praktikan1'), 'users', 'praktikan1')));
  });
});
