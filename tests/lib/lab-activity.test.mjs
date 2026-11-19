import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const { getAktivitasLab } = await import('../../src/lib/lab-activity.ts');

const sesi = (overrides = {}) => ({
  id: 'sesi1',
  kelasId: 'kelasA',
  namaPraktikum: 'Praktikum Uji',
  tanggal: '2026-11-19',
  jamMulai: '08:00',
  jamSelesai: '10:00',
  ruang: 'Lab Komputer',
  status: 'dibuka',
  laboratoriumId: 'lab1',
  ...overrides,
});

const now = new Date(2026, 10, 19, 9, 0, 0);

describe('FR-04.25 getAktivitasLab', () => {
  it('mengembalikan sesi yang berlangsung dan sesi berikutnya di lab yang sama', () => {
    const hasil = getAktivitasLab(
      'lab1',
      [
        sesi({ id: 'berlangsung', jamMulai: '08:00', jamSelesai: '10:00' }),
        sesi({ id: 'berikutnya', jamMulai: '13:00', jamSelesai: '15:00' }),
        sesi({ id: 'labLain', laboratoriumId: 'lab2', jamMulai: '09:00', jamSelesai: '11:00' }),
      ],
      now,
    );

    assert.equal(hasil.berlangsung?.id, 'berlangsung');
    assert.equal(hasil.berikutnya?.id, 'berikutnya');
  });

  it('mengabaikan sesi milik laboratorium lain', () => {
    const hasil = getAktivitasLab(
      'lab1',
      [sesi({ id: 'labDua', laboratoriumId: 'lab2' })],
      now,
    );

    assert.equal(hasil.berlangsung, null);
    assert.equal(hasil.berikutnya, null);
  });

  it('mengabaikan sesi yang sudah ditutup', () => {
    const hasil = getAktivitasLab(
      'lab1',
      [
        sesi({ id: 'tutupSekarang', status: 'ditutup' }),
        sesi({ id: 'tutupNanti', status: 'ditutup', jamMulai: '13:00', jamSelesai: '15:00' }),
      ],
      now,
    );

    assert.equal(hasil.berlangsung, null);
    assert.equal(hasil.berikutnya, null);
  });

  it('memakai batas mulai inklusif dan batas selesai eksklusif', () => {
    const mulai = sesi({ id: 'tepatMulai' });
    assert.equal(
      getAktivitasLab('lab1', [mulai], new Date(2026, 10, 19, 8, 0, 0)).berlangsung?.id,
      'tepatMulai',
    );

    const selesai = sesi({ id: 'tepatSelesai' });
    assert.equal(
      getAktivitasLab('lab1', [selesai], new Date(2026, 10, 19, 10, 0, 0)).berlangsung,
      null,
    );
  });

  it('tidak memilih sesi sebagai berikutnya jika jadwal mulai sudah lewat', () => {
    const hasil = getAktivitasLab('lab1', [sesi({ id: 'lewat' })], new Date(2026, 10, 19, 11, 0, 0));

    assert.equal(hasil.berlangsung, null);
    assert.equal(hasil.berikutnya, null);
  });

  it('memilih sesi berikutnya terdekat meskipun ada sesi lain yang lebih jauh', () => {
    const hasil = getAktivitasLab(
      'lab1',
      [
        sesi({ id: 'jauh', tanggal: '2026-11-21', jamMulai: '08:00', jamSelesai: '10:00' }),
        sesi({ id: 'dekat', jamMulai: '13:00', jamSelesai: '15:00' }),
      ],
      now,
    );

    assert.equal(hasil.berikutnya?.id, 'dekat');
  });

  it('memilih sesi berlangsung paling awal jika ada lebih dari satu', () => {
    const hasil = getAktivitasLab(
      'lab1',
      [
        sesi({ id: 'kedua', jamMulai: '08:30', jamSelesai: '10:00' }),
        sesi({ id: 'pertama', jamMulai: '08:00', jamSelesai: '09:30' }),
      ],
      now,
    );

    assert.equal(hasil.berlangsung?.id, 'pertama');
  });

  it('mengabaikan sesi lama tanpa laboratoriumId dan data jam tidak valid', () => {
    const hasil = getAktivitasLab(
      'lab1',
      [
        sesi({ id: 'tanpaLab', laboratoriumId: undefined }),
        sesi({ id: 'jamRusak', jamMulai: '25:00' }),
        sesi({ id: 'tanggalRusak', tanggal: '2026-02-30' }),
      ],
      now,
    );

    assert.equal(hasil.berlangsung, null);
    assert.equal(hasil.berikutnya, null);
  });

  it('mengembalikan null jika daftar sesi kosong atau labId kosong', () => {
    assert.deepEqual(getAktivitasLab('lab1', [], now), { berlangsung: null, berikutnya: null });
    assert.deepEqual(getAktivitasLab('', [sesi()], now), { berlangsung: null, berikutnya: null });
  });
});
