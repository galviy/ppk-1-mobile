import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const { buatPesanPush, chunk, isExpoPushToken, tokenUnik } = await import(
  '../../src/lib/push.ts'
);

describe('FR-04.26 validasi token Expo Push', () => {
  it('menerima format token ExponentPushToken dan ExpoPushToken', () => {
    assert.equal(isExpoPushToken('ExponentPushToken[abc_DEF-123]'), true);
    assert.equal(isExpoPushToken('ExpoPushToken[abc_DEF-123]'), true);
  });

  it('menolak token kosong, format salah, dan nilai bukan string', () => {
    assert.equal(isExpoPushToken(''), false);
    assert.equal(isExpoPushToken('ExponentPushToken[]'), false);
    assert.equal(isExpoPushToken('Token[abc]'), false);
    assert.equal(isExpoPushToken('ExponentPushToken[abc] '), false);
    assert.equal(isExpoPushToken(123), false);
    assert.equal(isExpoPushToken(null), false);
  });
});

describe('FR-04.26 utilitas pengiriman push', () => {
  it('memecah daftar menjadi batch maksimal 100', () => {
    const items = Array.from({ length: 250 }, (_, i) => i);
    assert.deepEqual(
      chunk(items).map((bagian) => bagian.length),
      [100, 100, 50],
    );
    assert.deepEqual(chunk([]), []);
  });

  it('menolak ukuran batch tidak valid', () => {
    assert.throws(() => chunk([1, 2], 0), RangeError);
    assert.throws(() => chunk([1, 2], 1.5), RangeError);
  });

  it('menyaring token tidak valid dan menghapus duplikat', () => {
    const token = 'ExponentPushToken[abc]';
    assert.deepEqual(
      tokenUnik([token, token, 'bukan-token', null, 'ExpoPushToken[def]']),
      [token, 'ExpoPushToken[def]'],
    );
  });

  it('membuat pesan push dengan data payload dan prioritas tinggi', () => {
    const pesan = buatPesanPush('ExponentPushToken[abc]', {
      title: 'Sesi dibuka',
      body: 'Praktikum dimulai.',
      data: { event: 'sesi_dibuka', sesiId: 'sesi1', kelasId: 'kelasA' },
    });

    assert.deepEqual(pesan, {
      to: 'ExponentPushToken[abc]',
      title: 'Sesi dibuka',
      body: 'Praktikum dimulai.',
      data: { event: 'sesi_dibuka', sesiId: 'sesi1', kelasId: 'kelasA' },
      sound: 'default',
      priority: 'high',
    });
  });

  it('tidak membuat pesan untuk token tidak valid', () => {
    assert.equal(buatPesanPush('bukan-token', { title: 'X', body: 'Y', data: {} }), null);
  });
});
