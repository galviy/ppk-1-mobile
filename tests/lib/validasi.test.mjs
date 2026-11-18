import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const { AppError, DuplikatError, cekKelas, cekPeserta, cekSesi, pesanError } = await import(
  '../../src/lib/validasi.ts'
);
const { validateReason, checkSessionLeaveEligibility, isSessionEligibleForLeave } = await import(
  '../../src/lib/leave-rules.ts'
);

const sesiDasar = {
  id: 'sesi1',
  kelasId: 'kelasA',
  namaPraktikum: 'Praktikum Uji',
  tanggal: '2026-11-20',
  jamMulai: '08:00',
  jamSelesai: '10:00',
  ruang: 'Lab',
  status: 'dibuka',
};

describe('FR-04.24 validasi input kelas dan peserta', () => {
  it('menolak nama kelas terlalu pendek atau terlalu panjang', () => {
    assert.equal(cekKelas({ nama: 'A' }), 'Nama kelas minimal 2 karakter.');
    assert.equal(cekKelas({ nama: 'A'.repeat(61) }), 'Nama kelas maksimal 60 karakter.');
    assert.equal(cekKelas({ nama: 'Kelas A' }), null);
  });

  it('memvalidasi nama dan NIM peserta', () => {
    assert.equal(cekPeserta({ nama: 'A', nim: '12345' }), 'Nama peserta minimal 2 karakter.');
    assert.equal(cekPeserta({ nama: 'Budi', nim: '12' }), 'NIM harus 5–20 huruf/angka.');
    assert.equal(cekPeserta({ nama: 'Budi', nim: '21120120140001' }), null);
  });
});

describe('FR-04.24 validasi sesi', () => {
  it('menerima sesi yang valid', () => {
    assert.equal(cekSesi(sesiDasar), null);
  });

  it('menolak tanggal, jam, dan urutan jam yang salah', () => {
    assert.match(cekSesi({ ...sesiDasar, tanggal: '2026-02-30' }), /Tanggal/);
    assert.match(cekSesi({ ...sesiDasar, jamMulai: '25:00' }), /Jam/);
    assert.match(cekSesi({ ...sesiDasar, jamMulai: '10:00', jamSelesai: '08:00' }), /setelah/);
    assert.match(cekSesi({ ...sesiDasar, kelasId: '' }), /kelas/);
  });
});

describe('FR-04.24 validasi alasan izin', () => {
  it('menolak alasan kosong dan terlalu pendek', () => {
    assert.deepEqual(validateReason('   '), { valid: false, error: 'Alasan tidak boleh kosong.' });
    assert.equal(validateReason('ab').valid, false);
  });

  it('menolak alasan melebihi 500 karakter', () => {
    assert.equal(validateReason('a'.repeat(501)).valid, false);
  });

  it('menormalisasi spasi dan menerima alasan valid', () => {
    const hasil = validateReason('  sakit   demam  ');
    assert.deepEqual(hasil, { valid: true, value: 'sakit demam' });
  });
});

describe('FR-04.24 kelayakan sesi untuk izin', () => {
  it('sesi ditutup tidak eligibel', () => {
    assert.equal(isSessionEligibleForLeave({ ...sesiDasar, status: 'ditutup' }), false);
    assert.equal(checkSessionLeaveEligibility({ ...sesiDasar, status: 'ditutup' }).eligible, false);
  });

  it('menolak bila sudah presensi atau sudah mengajukan izin', () => {
    assert.equal(checkSessionLeaveEligibility(sesiDasar, { sudahPresensi: true }).eligible, false);
    assert.equal(checkSessionLeaveEligibility(sesiDasar, { sudahIzin: true }).eligible, false);
    assert.equal(checkSessionLeaveEligibility(sesiDasar).eligible, true);
  });
});

describe('FR-04.24 pemetaan error Firestore', () => {
  it('memakai pesan domain untuk AppError', () => {
    assert.equal(pesanError(new AppError('Pesan domain.')), 'Pesan domain.');
    assert.equal(pesanError(new DuplikatError('Sudah ada.')), 'Sudah ada.');
  });

  it('memetakan kode error Firestore ke pesan yang ramah', () => {
    assert.match(pesanError({ code: 'permission-denied' }), /izin/i);
    assert.match(pesanError({ code: 'unavailable' }), /Koneksi/i);
    assert.match(pesanError({ code: 'unauthenticated' }), /login/i);
    assert.match(pesanError({ code: 'not-found' }), /tidak ditemukan/i);
    assert.match(pesanError({ code: 'resource-exhausted' }), /Kuota/i);
    assert.match(pesanError(new Error('aneh')), /kesalahan/i);
  });
});
