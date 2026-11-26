import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const { isAslabRole, isAsprakRole, normalizeRole } = await import('../../src/data/types.ts');

describe('SRS-S4-01 normalisasi & helper 3 peran', () => {
  it('memetakan role kanonik dan legacy asisten ke asprak', () => {
    assert.equal(normalizeRole('aslab'), 'aslab');
    assert.equal(normalizeRole('asprak'), 'asprak');
    assert.equal(normalizeRole('praktikan'), 'praktikan');
    assert.equal(normalizeRole('asisten'), 'asprak');
  });

  it('mengembalikan null untuk nilai kosong atau tidak dikenal', () => {
    assert.equal(normalizeRole(null), null);
    assert.equal(normalizeRole(undefined), null);
    assert.equal(normalizeRole(''), null);
    assert.equal(normalizeRole('admin'), null);
  });

  it('mengidentifikasi aslab dan asprak termasuk asisten legacy', () => {
    assert.equal(isAslabRole('aslab'), true);
    assert.equal(isAslabRole('asprak'), false);
    assert.equal(isAslabRole('asisten'), false);
    assert.equal(isAslabRole('praktikan'), false);

    assert.equal(isAsprakRole('asprak'), true);
    assert.equal(isAsprakRole('asisten'), true);
    assert.equal(isAsprakRole('aslab'), false);
    assert.equal(isAsprakRole('praktikan'), false);
    assert.equal(isAsprakRole(null), false);
  });
});
