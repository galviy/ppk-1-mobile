import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const {
  isSafeRouteId,
  resolveAppDeepLinkRoute,
  resolveNotificationRoute,
} = await import('../../src/lib/notification-route.ts');

describe('FR-S4-01.6 routing payload push notification (6 event)', () => {
  it('memetakan 3 event Sprint 3 secara akurat', () => {
    assert.equal(
      resolveNotificationRoute({
        event: 'sesi_dibuka',
        sesiId: 'sesi_01',
        kelasId: 'kelas_a',
      }),
      '/presensi/sesi_01',
    );
    assert.equal(
      resolveNotificationRoute({
        event: 'jadwal_berubah',
        sesiId: 'sesi_02',
        kelasId: 'kelas_a',
      }),
      '/sesi/sesi_02',
    );
    assert.equal(
      resolveNotificationRoute({
        event: 'izin_diputuskan',
        izinId: 'sesi_01_uid1',
        status: 'diterima',
      }),
      '/izin/sesi_01_uid1',
    );
  });

  it('memetakan 3 event pembayaran Sprint 4 ke /pembayaran/[tagihanId]', () => {
    assert.equal(
      resolveNotificationRoute({
        event: 'tagihan_dibuat',
        tagihanId: 'sesi1_uid1',
        sesiId: 'sesi1',
        nominal: 10000,
      }),
      '/pembayaran/sesi1_uid1',
    );
    assert.equal(
      resolveNotificationRoute({
        event: 'pembayaran_berhasil',
        tagihanId: 'sesi1_uid1',
        orderId: 'ORD-123',
        status: 'success',
      }),
      '/pembayaran/sesi1_uid1',
    );
    assert.equal(
      resolveNotificationRoute({
        event: 'pembayaran_gagal',
        tagihanId: 'sesi1_uid1',
        orderId: 'ORD-124',
        status: 'failed',
      }),
      '/pembayaran/sesi1_uid1',
    );
  });

  it('menolak payload kosong, ID hilang, dan ID tidak aman (traversal)', () => {
    assert.equal(resolveNotificationRoute(null), null);
    assert.equal(resolveNotificationRoute(undefined), null);
    assert.equal(
      resolveNotificationRoute({ event: 'tagihan_dibuat' }),
      null,
    );
    assert.equal(
      resolveNotificationRoute({ event: 'tagihan_dibuat', tagihanId: '' }),
      null,
    );
    assert.equal(
      resolveNotificationRoute({
        event: 'pembayaran_berhasil',
        tagihanId: '../admin',
      }),
      null,
    );
    assert.equal(
      resolveNotificationRoute({
        event: 'sesi_dibuka',
        sesiId: 'a/b',
      }),
      null,
    );
    assert.equal(isSafeRouteId('sesi1_uid1'), true);
    assert.equal(isSafeRouteId('../evil'), false);
    assert.equal(isSafeRouteId(''), false);
  });

  it('mendukung fallback route dan url untuk deep link internal', () => {
    assert.equal(
      resolveNotificationRoute({ route: '/pembayaran/sesi1_u2' }),
      '/pembayaran/sesi1_u2',
    );
    assert.equal(
      resolveNotificationRoute({ url: 'ppk1://pembayaran/sesi1_u2?status=pending' }),
      '/pembayaran/sesi1_u2',
    );
    assert.equal(
      resolveNotificationRoute({ url: '//evil.example.com/phishing' }),
      null,
    );
  });
});

describe('FR-S4-01.7 parser deep link return URL Midtrans', () => {
  it('mem-parse berbagai format URL scheme ppk1 ke rute detail tagihan', () => {
    assert.equal(
      resolveAppDeepLinkRoute('ppk1://pembayaran/sesi1_uid1'),
      '/pembayaran/sesi1_uid1',
    );
    assert.equal(
      resolveAppDeepLinkRoute(
        'ppk1://pembayaran/sesi1_uid1?order_id=PPK-1&status_code=200&transaction_status=settlement',
      ),
      '/pembayaran/sesi1_uid1',
    );
    assert.equal(
      resolveAppDeepLinkRoute('ppk1:///pembayaran/sesi1_uid1/'),
      '/pembayaran/sesi1_uid1',
    );
    assert.equal(
      resolveAppDeepLinkRoute('ppk1://presensi/sesi_99'),
      '/presensi/sesi_99',
    );
  });

  it('menolak scheme eksternal, path terlarang, atau ID tidak valid', () => {
    assert.equal(resolveAppDeepLinkRoute(null), null);
    assert.equal(resolveAppDeepLinkRoute(''), null);
    assert.equal(
      resolveAppDeepLinkRoute('https://evil.example/pembayaran/sesi1_uid1'),
      null,
    );
    assert.equal(
      resolveAppDeepLinkRoute('ppk1://aslab/hapus'),
      null,
    );
    assert.equal(
      resolveAppDeepLinkRoute('ppk1://pembayaran/sesi1/extra'),
      null,
    );
    assert.equal(
      resolveAppDeepLinkRoute('ppk1://pembayaran/..'),
      null,
    );
  });
});
