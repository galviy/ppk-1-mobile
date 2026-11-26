import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const {
  getHomeRouteForRole,
  normalizeCanonicalRole,
  resolveLegacyAsistenRedirect,
  resolveRoleGuardRedirect,
} = await import('../../src/lib/role-routing.ts');

describe('FR-S4-01.4 helper rute dan guard RBAC 3 peran', () => {
  it('menentukan rute dashboard utama sesuai 3 peran + legacy asisten', () => {
    assert.equal(normalizeCanonicalRole('aslab'), 'aslab');
    assert.equal(normalizeCanonicalRole('asprak'), 'asprak');
    assert.equal(normalizeCanonicalRole('asisten'), 'asprak');
    assert.equal(normalizeCanonicalRole('praktikan'), 'praktikan');
    assert.equal(normalizeCanonicalRole('lainnya'), null);

    assert.equal(getHomeRouteForRole('aslab'), '/aslab');
    assert.equal(getHomeRouteForRole('asprak'), '/asprak');
    assert.equal(getHomeRouteForRole('asisten'), '/asprak');
    assert.equal(getHomeRouteForRole('praktikan'), '/praktikan');
    assert.equal(getHomeRouteForRole(null), '/praktikan');
  });

  it('mengarahkan pengguna belum login dari segmen terproteksi ke login', () => {
    for (const segment of [
      'aslab',
      'asprak',
      'asisten',
      'praktikan',
      'izin',
      'presensi',
      'maps',
      'sesi',
      'pembayaran',
      'pilih-identitas',
    ]) {
      assert.equal(resolveRoleGuardRedirect(null, segment), '/(auth)/login');
    }

    assert.equal(resolveRoleGuardRedirect(null, '(auth)'), null);
    assert.equal(resolveRoleGuardRedirect(null, 'index'), null);
    assert.equal(resolveRoleGuardRedirect(null, undefined), null);
  });

  it('mengarahkan pasca-login dari auth/index/pilih-identitas ke dashboard peran sah', () => {
    for (const seg of [undefined, 'index', '(auth)', 'pilih-identitas']) {
      assert.equal(resolveRoleGuardRedirect('aslab', seg), '/aslab');
      assert.equal(resolveRoleGuardRedirect('asprak', seg), '/asprak');
      assert.equal(resolveRoleGuardRedirect('asisten', seg), '/asprak');
      assert.equal(resolveRoleGuardRedirect('praktikan', seg), '/praktikan');
    }
  });

  it('memblokir akses lintas peran termasuk proteksi /pembayaran/* untuk praktikan', () => {
    // Asprak (dan legacy asisten) dilarang masuk /aslab, /praktikan, /pembayaran
    assert.equal(resolveRoleGuardRedirect('asprak', 'aslab'), '/asprak');
    assert.equal(resolveRoleGuardRedirect('asprak', 'praktikan'), '/asprak');
    assert.equal(resolveRoleGuardRedirect('asprak', 'pembayaran'), '/asprak');
    assert.equal(resolveRoleGuardRedirect('asisten', 'aslab'), '/asprak');
    assert.equal(resolveRoleGuardRedirect('asprak', 'asprak'), null);
    assert.equal(resolveRoleGuardRedirect('asisten', 'asisten'), null);

    // Praktikan dilarang masuk /aslab, /asprak, /asisten; boleh /pembayaran & /praktikan
    assert.equal(resolveRoleGuardRedirect('praktikan', 'aslab'), '/praktikan');
    assert.equal(resolveRoleGuardRedirect('praktikan', 'asprak'), '/praktikan');
    assert.equal(resolveRoleGuardRedirect('praktikan', 'asisten'), '/praktikan');
    assert.equal(resolveRoleGuardRedirect('praktikan', 'praktikan'), null);
    assert.equal(resolveRoleGuardRedirect('praktikan', 'pembayaran'), null);

    // Aslab dilarang masuk /asprak, /asisten, /praktikan, /pembayaran; boleh /aslab
    assert.equal(resolveRoleGuardRedirect('aslab', 'asprak'), '/aslab');
    assert.equal(resolveRoleGuardRedirect('aslab', 'asisten'), '/aslab');
    assert.equal(resolveRoleGuardRedirect('aslab', 'praktikan'), '/aslab');
    assert.equal(resolveRoleGuardRedirect('aslab', 'pembayaran'), '/aslab');
    assert.equal(resolveRoleGuardRedirect('aslab', 'aslab'), null);
  });

  it('memetakan rute /asisten/* lama ke target baru tanpa broken link', () => {
    assert.equal(resolveLegacyAsistenRedirect(), '/asprak');
    assert.equal(resolveLegacyAsistenRedirect(['rekap']), '/asprak/rekap');
    assert.equal(resolveLegacyAsistenRedirect(['izin']), '/asprak/izin');
    assert.equal(resolveLegacyAsistenRedirect(['maps']), '/asprak/maps');
    assert.equal(resolveLegacyAsistenRedirect(['laboratorium']), '/aslab/laboratorium');
    assert.equal(resolveLegacyAsistenRedirect(['kelas']), '/asprak');
    assert.equal(resolveLegacyAsistenRedirect(['peserta', 'k1']), '/asprak');
  });
});
