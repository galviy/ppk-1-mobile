import type { PaymentStatus } from './status';

export type TagihanStatus = 'unpaid' | 'pending' | 'success' | 'failed';
export type PaymentNotificationEvent = 'pembayaran_berhasil' | 'pembayaran_gagal';

export type PaymentState = {
  transaksiStatus: PaymentStatus;
  tagihanStatus: TagihanStatus;
};

export type PaymentUpdate = {
  next: PaymentState;
  changed: boolean;
  notify: PaymentNotificationEvent | null;
};

/**
 * Menentukan perubahan status pembayaran secara idempoten.
 *
 * Aturan penting:
 * - Tagihan yang sudah `success` tidak pernah diturunkan lagi (anti-regresi).
 * - Notifikasi hanya dikirim saat status benar-benar berubah, sehingga webhook
 *   yang dikirim ulang Midtrans tidak memicu push ganda.
 * - Pembayaran sukses setelah `failed` tetap boleh menaikkan status menjadi success.
 */
export function resolvePaymentUpdate(
  current: PaymentState,
  mapped: PaymentStatus,
): PaymentUpdate {
  if (current.tagihanStatus === 'success') {
    return { next: current, changed: false, notify: null };
  }

  let tagihanStatus: TagihanStatus;
  let notify: PaymentNotificationEvent | null = null;

  if (mapped === 'success') {
    tagihanStatus = 'success';
    notify = 'pembayaran_berhasil';
  } else if (mapped === 'failed') {
    tagihanStatus = 'failed';
    notify = 'pembayaran_gagal';
  } else {
    tagihanStatus = 'pending';
  }

  const next: PaymentState = { transaksiStatus: mapped, tagihanStatus };
  const changed =
    next.transaksiStatus !== current.transaksiStatus ||
    next.tagihanStatus !== current.tagihanStatus;

  return { next, changed, notify: changed ? notify : null };
}
