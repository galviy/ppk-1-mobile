import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMidtransSignature, verifyMidtransSignature } from '../src/lib/signature';

const SERVER_KEY = 'SB-Mid-server-uji';
const dasar = {
  order_id: 'ORD-123',
  status_code: '200',
  gross_amount: '10000.00',
  transaction_status: 'settlement',
};

test('signature SHA-512 mengikuti rumus resmi Midtrans', () => {
  const signature = createMidtransSignature('ORD-123', '200', '10000.00', SERVER_KEY);
  assert.match(signature, /^[0-9a-f]{128}$/);
  assert.equal(verifyMidtransSignature({ ...dasar, signature_key: signature }, SERVER_KEY), true);
});

test('signature sah diterima meski huruf besar', () => {
  const signature = createMidtransSignature('ORD-123', '200', '10000.00', SERVER_KEY).toUpperCase();
  assert.equal(verifyMidtransSignature({ ...dasar, signature_key: signature }, SERVER_KEY), true);
});

test('payload yang dimodifikasi 1 karakter ditolak', () => {
  const signature = createMidtransSignature('ORD-123', '200', '10000.00', SERVER_KEY);
  assert.equal(
    verifyMidtransSignature({ ...dasar, gross_amount: '10000.01', signature_key: signature }, SERVER_KEY),
    false,
  );
  assert.equal(
    verifyMidtransSignature({ ...dasar, order_id: 'ORD-124', signature_key: signature }, SERVER_KEY),
    false,
  );
});

test('server key berbeda ditolak', () => {
  const signature = createMidtransSignature('ORD-123', '200', '10000.00', SERVER_KEY);
  assert.equal(verifyMidtransSignature({ ...dasar, signature_key: signature }, 'kunci-lain'), false);
});

test('format signature tidak valid ditolak tanpa melempar error', () => {
  assert.equal(verifyMidtransSignature({ ...dasar, signature_key: 'bukan-hex' }, SERVER_KEY), false);
  assert.equal(verifyMidtransSignature({ ...dasar, signature_key: undefined }, SERVER_KEY), false);
});
