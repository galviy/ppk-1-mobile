import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolvePaymentUpdate } from '../src/lib/payment-state';

test('tagihan unpaid + pembayaran success -> lunas dan kirim notifikasi berhasil', () => {
  const hasil = resolvePaymentUpdate(
    { transaksiStatus: 'pending', tagihanStatus: 'unpaid' },
    'success',
  );
  assert.deepEqual(hasil.next, { transaksiStatus: 'success', tagihanStatus: 'success' });
  assert.equal(hasil.changed, true);
  assert.equal(hasil.notify, 'pembayaran_berhasil');
});

test('webhook success yang dikirim ulang tidak mengirim notifikasi ganda', () => {
  const hasil = resolvePaymentUpdate(
    { transaksiStatus: 'success', tagihanStatus: 'success' },
    'success',
  );
  assert.equal(hasil.changed, false);
  assert.equal(hasil.notify, null);
});

test('tagihan failed + pembayaran failed -> kirim notifikasi gagal sekali', () => {
  const pertama = resolvePaymentUpdate(
    { transaksiStatus: 'pending', tagihanStatus: 'unpaid' },
    'failed',
  );
  assert.equal(pertama.notify, 'pembayaran_gagal');

  const ulang = resolvePaymentUpdate(pertama.next, 'failed');
  assert.equal(ulang.changed, false);
  assert.equal(ulang.notify, null);
});

test('pembayaran ulang setelah failed boleh menjadi success', () => {
  const hasil = resolvePaymentUpdate(
    { transaksiStatus: 'failed', tagihanStatus: 'failed' },
    'success',
  );
  assert.equal(hasil.next.tagihanStatus, 'success');
  assert.equal(hasil.notify, 'pembayaran_berhasil');
});

test('status success tidak pernah diturunkan kembali', () => {
  const hasil = resolvePaymentUpdate(
    { transaksiStatus: 'success', tagihanStatus: 'success' },
    'failed',
  );
  assert.deepEqual(hasil.next, { transaksiStatus: 'success', tagihanStatus: 'success' });
  assert.equal(hasil.changed, false);
  assert.equal(hasil.notify, null);
});

test('pending tidak mengirim notifikasi', () => {
  const hasil = resolvePaymentUpdate(
    { transaksiStatus: 'pending', tagihanStatus: 'unpaid' },
    'pending',
  );
  assert.deepEqual(hasil.next, { transaksiStatus: 'pending', tagihanStatus: 'pending' });
  assert.equal(hasil.changed, true);
  assert.equal(hasil.notify, null);
});
