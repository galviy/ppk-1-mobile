import 'dotenv/config';
import { createMidtransSignature } from '../src/lib/signature';

async function main(): Promise<void> {
  const serverKey = (process.env.MIDTRANS_SERVER_KEY ?? '').trim();
  if (!serverKey) {
    console.error('MIDTRANS_SERVER_KEY belum diatur. Isi backend/.env terlebih dahulu.');
    process.exit(1);
  }

  const baseUrl = (
    process.env.BACKEND_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  ).replace(/\/+$/, '');
  const orderId = process.env.ORDER_ID ?? 'ORD-contoh';
  const statusCode = process.env.STATUS_CODE ?? '200';
  const grossAmount = process.env.GROSS_AMOUNT ?? '10000.00';
  const transactionStatus = process.env.TRANSACTION_STATUS ?? 'settlement';

  const payload = {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    transaction_status: transactionStatus,
    transaction_id: `TRX-${Date.now()}`,
    payment_type: 'qris',
    signature_key: createMidtransSignature(orderId, statusCode, grossAmount, serverKey),
  };

  const response = await fetch(`${baseUrl}/api/payments/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  console.log('Payload:', payload);
  console.log('HTTP', response.status, await response.text());
}

void main();
