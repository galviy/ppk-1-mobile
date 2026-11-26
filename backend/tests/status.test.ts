import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapMidtransStatus } from '../src/lib/status';

test('settlement menjadi success', () => {
  assert.equal(mapMidtransStatus('settlement'), 'success');
});

test('capture accept menjadi success, challenge menjadi pending', () => {
  assert.equal(mapMidtransStatus('capture', 'accept'), 'success');
  assert.equal(mapMidtransStatus('capture', 'challenge'), 'pending');
});

test('pending tetap pending', () => {
  assert.equal(mapMidtransStatus('pending'), 'pending');
});

test('deny, cancel, expire, dan failure menjadi failed', () => {
  for (const status of ['deny', 'cancel', 'expire', 'failure']) {
    assert.equal(mapMidtransStatus(status), 'failed');
  }
});

test('status tidak dikenal tidak dianggap lunas', () => {
  assert.equal(mapMidtransStatus('sesuatu-baru'), 'pending');
  assert.equal(mapMidtransStatus(undefined), 'pending');
});
