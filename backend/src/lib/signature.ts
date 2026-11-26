import { createHash, timingSafeEqual } from 'node:crypto';

export type MidtransNotification = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  transaction_id?: string;
  payment_type?: string;
};

/**
 * Signature resmi Midtrans: SHA-512(order_id + status_code + gross_amount + server_key).
 * Nilai `gross_amount` dipakai apa adanya seperti yang dikirim Midtrans (mis. "10000.00").
 */
export function createMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
): string {
  return createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`, 'utf8')
    .digest('hex');
}

export function verifyMidtransSignature(
  notification: MidtransNotification,
  serverKey: string,
): boolean {
  const received = String(notification.signature_key ?? '').toLowerCase();
  if (!/^[0-9a-f]{128}$/.test(received)) return false;

  const expected = createMidtransSignature(
    String(notification.order_id ?? ''),
    String(notification.status_code ?? ''),
    String(notification.gross_amount ?? ''),
    serverKey,
  );

  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(received, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
